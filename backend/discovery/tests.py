import datetime
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import User
from learning.models import CareerRole, Enrollment, ItemProgress, LiveSession, Playlist, PlaylistItem
from pages.models import CaseStudy, TechArticle, Tender, Testimonial, Topic, UserVideoPost, VideoItem

from .models import SearchQuery, ViewEvent

TODAY = datetime.date(2026, 10, 1)


def make_user(username, **kwargs):
    return User.objects.create_user(username=username, email=f"{username}@example.org", password="Passw0rd!x", **kwargs)


class DiscoveryTestBase(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.solar = Topic.objects.get(name="Solar PV")
        self.scada = Topic.objects.get(name="SCADA & Monitoring")
        self.pro = make_user("pro", account_type="professional", company_other="Acme", display_name="Priya Rao")
        self.learner = make_user("learner")

        self.article = TechArticle.objects.create(title="Reading an SLD", difficulty="Beginner",
                                                  read_time="8 min", date=TODAY, excerpt="Single-line diagrams.")
        self.article.topics.add(self.solar)
        self.study = CaseStudy.objects.create(title="SCADA retrofit results", excerpt="Downtime before and after.", date=TODAY - datetime.timedelta(days=3))
        self.study.topics.add(self.scada)

        self.video = VideoItem.objects.create(title="Alarm management", date=TODAY,
                                              duration="12 min", excerpt="SCADA alarms.")
        self.long_video = VideoItem.objects.create(title="Commissioning walkthrough", date=TODAY,
                                                   duration="45 min", excerpt="Inverters.", access="paid", price=Decimal("199"))
        UserVideoPost.objects.create(author=self.pro, title="Alarm management", excerpt="e", video_url="https://v.example/x",
                                     duration="12 min", status="published", published_video=self.video)

        self.course = Playlist.objects.create(owner=self.pro, title="SCADA Fundamentals", description="From basics.",
                                              status=Playlist.STATUS_PUBLISHED, level="beginner")
        self.course.topics.add(self.scada)
        self.item1 = PlaylistItem.objects.create(playlist=self.course, video=self.video, position=0)
        self.draft = Playlist.objects.create(owner=self.pro, title="Draft course", status=Playlist.STATUS_DRAFT)


class TrackViewTests(DiscoveryTestBase):
    def test_anonymous_view_is_recorded(self):
        res = self.api.post("/api/discovery/views/", {"type": "research", "id": self.study.pk}, format="json")
        self.assertEqual(res.status_code, 204)
        event = ViewEvent.objects.get()
        self.assertIsNone(event.user)
        self.assertEqual((event.content_type.model, event.object_id), ("casestudy", self.study.pk))

    def test_signed_in_repeat_view_refreshes_instead_of_adding(self):
        self.api.force_authenticate(self.learner)
        for _ in range(3):
            self.api.post("/api/discovery/views/", {"type": "course", "id": self.course.pk}, format="json")
        self.assertEqual(ViewEvent.objects.filter(user=self.learner).count(), 1)

    def test_unknown_or_hidden_content_is_rejected(self):
        self.assertEqual(self.api.post("/api/discovery/views/", {"type": "nope", "id": 1}, format="json").status_code, 400)
        self.assertEqual(self.api.post("/api/discovery/views/", {"type": "research", "id": 999}, format="json").status_code, 404)
        self.assertEqual(self.api.post("/api/discovery/views/", {"type": "course", "id": self.draft.pk}, format="json").status_code, 404)


class SearchTests(DiscoveryTestBase):
    def search(self, **params):
        return self.api.get("/api/discovery/search/", params).json()

    def test_query_matches_titles_text_and_topics(self):
        data = self.search(q="scada")
        found = {(r["type"], r["title"]) for r in data["results"]}
        self.assertIn(("research", "SCADA retrofit results"), found)
        self.assertIn(("course", "SCADA Fundamentals"), found)
        self.assertIn(("video", "Alarm management"), found)  # excerpt match
        self.assertEqual(data["results"][0]["title"].lower().count("scada"), 1)  # title matches first
        self.assertEqual(data["counts"]["research"], 1)

    def test_filters(self):
        self.assertEqual([r["title"] for r in self.search(topic="solar")["results"]], ["Reading an SLD"])
        levels = {(r["type"], r["title"]) for r in self.search(level="beginner")["results"]}
        self.assertEqual(levels, {("geacademy", "Reading an SLD"), ("course", "SCADA Fundamentals")})
        self.assertEqual([r["title"] for r in self.search(access="paid")["results"]], ["Commissioning walkthrough"])
        self.assertEqual([r["title"] for r in self.search(max_minutes=20)["results"]], ["Alarm management"])
        self.assertEqual({r["type"] for r in self.search(type="research")["results"]}, {"research"})

    def test_searches_are_logged_and_trend(self):
        for _ in range(2):
            self.search(q="SCADA ")
        self.search(q="no such thing at all")
        self.search(q="x")  # too short to log
        self.assertEqual(SearchQuery.objects.count(), 3)
        self.assertEqual(self.api.get("/api/discovery/search/trending/").json(), ["scada"])


class PublicHomeTests(DiscoveryTestBase):
    def home(self):
        return self.api.get("/api/discovery/home/").json()

    def test_leading_professionals_are_featured_professionals_in_order(self):
        second = make_user("pro2", account_type="professional", company_other="Acme", display_name="Arun",
                           is_featured=True, featured_order=2)
        self.pro.is_featured, self.pro.featured_order, self.pro.gelearn_rating = True, 1, Decimal("4.8")
        self.pro.save()
        people = self.home()["professionals"]
        self.assertEqual([p["username"] for p in people], ["pro", "pro2"])
        self.assertEqual(people[0]["rating"], "4.8")
        self.assertIsNone(people[1]["rating"])
        second.is_active = False
        second.save()
        self.assertEqual(len(self.home()["professionals"]), 1)

    def test_course_cards_carry_stats_and_byline(self):
        Enrollment.objects.create(user=self.learner, playlist=self.course)
        card = self.home()["popular_courses"][0]
        self.assertEqual((card["title"], card["lessons"], card["enrolled"], card["video_minutes"]), ("SCADA Fundamentals", 1, 1, 12))
        self.assertEqual(card["author"]["display_name"], "Priya Rao")
        self.assertEqual([t["name"] for t in card["topics"]], ["SCADA & Monitoring"])
        self.assertNotIn("Draft course", [c["title"] for c in self.home()["popular_courses"]])

    def test_courses_by_role(self):
        role = CareerRole.objects.get(slug="scada-engineer")
        self.course.roles.add(role)
        row = next(r for r in self.home()["roles"] if r["slug"] == "scada-engineer")
        self.assertEqual((row["course_count"], [c["title"] for c in row["courses"]]), (1, ["SCADA Fundamentals"]))

    def test_trending_ranks_by_views_then_tops_up(self):
        for _ in range(3):
            self.api.post("/api/discovery/views/", {"type": "research", "id": self.study.pk}, format="json")
        self.api.post("/api/discovery/views/", {"type": "geacademy", "id": self.article.pk}, format="json")
        trending = self.home()["trending"]
        self.assertEqual([(c["type"], c["id"]) for c in trending[:2]], [("research", self.study.pk), ("geacademy", self.article.pk)])
        self.assertIn(("video", self.video.pk), [(c["type"], c["id"]) for c in trending])

    def test_testimonials_hidden_until_three(self):
        for i in range(2):
            Testimonial.objects.create(quote=f"Quote {i}", name=f"Person {i}")
        self.assertEqual(self.home()["testimonials"], [])
        Testimonial.objects.create(quote="Quote 3", name="Person 3")
        Testimonial.objects.create(quote="Hidden", name="Off", is_active=False)
        self.assertEqual(len(self.home()["testimonials"]), 3)

    def test_only_upcoming_live_sessions(self):
        now = timezone.now()
        LiveSession.objects.create(title="Past", starts_at=now - datetime.timedelta(days=1), speaker_name="A",
                                   registration_url="https://example.org/a")
        LiveSession.objects.create(title="Running now", starts_at=now - datetime.timedelta(minutes=30), duration_minutes=60,
                                   speaker=self.pro, registration_url="https://example.org/b")
        LiveSession.objects.create(title="Next week", starts_at=now + datetime.timedelta(days=7), speaker_name="B",
                                   registration_url="https://example.org/c")
        LiveSession.objects.create(title="Unpublished", starts_at=now + datetime.timedelta(days=2), speaker_name="C",
                                   registration_url="https://example.org/d", is_published=False)
        sessions = self.home()["live_sessions"]
        self.assertEqual([s["title"] for s in sessions], ["Running now", "Next week"])
        self.assertEqual(sessions[0]["speaker"]["display_name"], "Priya Rao")
        self.assertEqual(sessions[1]["speaker"]["display_name"], "B")

    def test_topic_groups_and_stats(self):
        data = self.home()
        self.assertEqual(data["topic_groups"][0]["name"], "Solar & Renewables")
        self.assertEqual(data["topic_groups"][0]["topics"][0]["name"], "Solar PV")
        self.assertEqual(data["stats"]["courses"], 1)


class PersonalHomeTests(DiscoveryTestBase):
    def setUp(self):
        super().setUp()
        self.api.force_authenticate(self.learner)

    def me(self):
        return self.api.get("/api/discovery/home/me/").json()

    def test_requires_sign_in(self):
        self.assertEqual(APIClient().get("/api/discovery/home/me/").status_code, 401)

    def test_continue_learning_and_week(self):
        post_video = VideoItem.objects.create(title="Event logs", date=TODAY, duration="9 min", excerpt="e")
        PlaylistItem.objects.create(playlist=self.course, video=post_video, position=1)
        Enrollment.objects.create(user=self.learner, playlist=self.course)
        ItemProgress.objects.create(user=self.learner, item=self.item1)
        data = self.me()
        self.assertEqual(data["continue"]["course"]["title"], "SCADA Fundamentals")
        self.assertEqual((data["continue"]["completed"], data["continue"]["total"], data["continue"]["percent"]), (1, 2, 50))
        self.assertEqual(data["continue"]["next_item"]["title"], "Event logs")
        self.assertEqual(data["week"]["total"], 1)
        self.assertEqual(len(data["week"]["days"]), 7)

    def test_finished_course_is_not_continued(self):
        Enrollment.objects.create(user=self.learner, playlist=self.course)
        ItemProgress.objects.create(user=self.learner, item=self.item1)
        self.assertIsNone(self.me()["continue"])

    def test_because_and_similar_use_shared_topics(self):
        other = Playlist.objects.create(owner=self.pro, title="IEC 104 in practice", status=Playlist.STATUS_PUBLISHED)
        other.topics.add(self.scada)
        Enrollment.objects.create(user=self.learner, playlist=self.course)
        data = self.me()
        self.assertEqual(data["because"]["course"]["title"], "SCADA Fundamentals")
        self.assertEqual([c["title"] for c in data["because"]["courses"]], ["IEC 104 in practice"])
        self.assertIn("SCADA retrofit results", [c["title"] for c in data["similar"]])

    def test_recently_viewed_newest_first(self):
        self.api.post("/api/discovery/views/", {"type": "research", "id": self.study.pk}, format="json")
        self.api.post("/api/discovery/views/", {"type": "geacademy", "id": self.article.pk}, format="json")
        self.assertEqual([c["title"] for c in self.me()["recently_viewed"]], ["Reading an SLD", "SCADA retrofit results"])

    def test_closing_tenders_and_quick_videos(self):
        today = timezone.localdate()
        Tender.objects.create(title="Soon", authority="SECI", deadline=today + datetime.timedelta(days=6), value="v",
                              sector="Solar", description="d")
        Tender.objects.create(title="Past", authority="SECI", deadline=today - datetime.timedelta(days=1), value="v",
                              sector="Solar", description="d")
        data = self.me()
        self.assertEqual([(t["title"], t["days_left"]) for t in data["closing_tenders"]], [("Soon", 6)])
        self.assertEqual([v["title"] for v in data["quick_videos"]], ["Alarm management"])

    def test_career_goal_is_set_through_account_and_suggests_courses(self):
        role = CareerRole.objects.get(slug="scada-engineer")
        self.course.roles.add(role)
        res = self.api.patch("/api/accounts/me/", {"career_goal": role.pk}, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        data = self.me()
        self.assertEqual(data["career_goal"]["name"], "SCADA Engineer")
        self.assertEqual([c["title"] for c in data["goal_courses"]], ["SCADA Fundamentals"])


class HomeLayoutTests(DiscoveryTestBase):
    """Sections arranged in the CMS (GeLearn index page) come back as `layout`."""

    def setUp(self):
        super().setUp()
        from wagtail.models import Page
        from pages.models import GeLearnIndexPage
        self.course.access = "free"
        self.course.save()
        role = CareerRole.objects.get(slug="scada-engineer")
        self.course.roles.add(role)
        paid = Playlist.objects.create(owner=self.pro, title="Paid course", status=Playlist.STATUS_PUBLISHED,
                                       access="paid", price=Decimal("499"))
        paid.topics.add(self.solar)
        root = Page.objects.get(depth=1)
        self.page = root.add_child(instance=GeLearnIndexPage(
            title="GeLearn", slug="gelearn-layout-test",
            home_sections=[
                ("hero", {"slides": [{"kicker": "K", "heading": "Learn the grid", "body": "", "cta_label": "Go",
                                      "cta_url": {"link_type": "page", "page": "courses"}, "tone": "sky", "image": None}]}),
                ("course_rail", {"heading": "Free", "source": "free", "limit": 4, "style": "band"}),
                ("course_rail", {"heading": "Solar", "source": "topic", "topic": self.solar, "limit": 4}),
                ("course_rail", {"heading": "SCADA role", "source": "role", "topic": None, "role": role, "limit": 4}),
                ("content_rail", {"heading": "Short videos", "content_type": "video", "max_minutes": 20, "limit": 4}),
                ("content_rail", {"heading": "Solar reading", "content_type": "geacademy", "topic": self.solar, "limit": 4}),
                ("faq", {"heading": "FAQ", "items": [{"question": "Q?", "answer": "A."}]}),
            ],
            member_sections=[("welcome", {"goal_prompt": "Pick a goal"}), ("topic_chips", {"heading": "Topics"})],
        ))

    def test_visitor_layout_keeps_order_and_fills_rails(self):
        layout = self.api.get("/api/discovery/home/").json()["layout"]
        self.assertEqual([s["type"] for s in layout],
                         ["hero", "course_rail", "course_rail", "course_rail", "content_rail", "content_rail", "faq"])
        self.assertEqual(layout[0]["value"]["slides"][0]["heading"], "Learn the grid")
        self.assertEqual(layout[0]["value"]["slides"][0]["cta_url"], "/courses")  # picked link → address
        titles = [[i["title"] for i in s["items"]] for s in layout[1:6]]
        self.assertEqual(titles, [
            ["SCADA Fundamentals"],          # free only
            ["Paid course"],                 # topic: Solar PV
            ["SCADA Fundamentals"],          # role: SCADA Engineer
            ["Alarm management"],            # videos up to 20 min
            ["Reading an SLD"],              # GeAcademy on Solar PV
        ])
        self.assertNotIn("items", layout[6])
        self.assertEqual(layout[6]["value"]["items"][0]["question"], "Q?")

    def test_member_layout(self):
        self.api.force_authenticate(self.learner)
        layout = self.api.get("/api/discovery/home/me/").json()["layout"]
        self.assertEqual([s["type"] for s in layout], ["welcome", "topic_chips"])

    def test_unpublished_page_gives_empty_layout(self):
        self.page.unpublish()
        self.assertEqual(self.api.get("/api/discovery/home/").json()["layout"], [])

    def test_cms_editor_opens(self):
        admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        self.client.force_login(admin)
        res = self.client.get(f"/cms/pages/{self.page.pk}/edit/")
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "Home page for visitors")


class ExploreMenuTests(DiscoveryTestBase):
    def test_explore_menu_lists_groups_roles_and_companies(self):
        from organizations.models import Company
        Company.objects.create(name="Genex Technocrats", slug="genex")
        Company.objects.create(name="Dormant Co", slug="dormant", is_active=False)
        data = self.api.get("/api/discovery/explore/").json()
        self.assertEqual(data["topic_groups"][0]["name"], "Solar & Renewables")
        self.assertEqual(data["roles"][0]["name"], "Solar O&M Engineer")
        self.assertEqual(data["companies"], [{"name": "Genex Technocrats", "slug": "genex"}])


class BrowsePagesTests(DiscoveryTestBase):
    """Phase 7: topic, role, Professionals, companies, live sessions, landing pages."""

    def test_topic_page(self):
        data = self.api.get("/api/discovery/topics/solar/").json()
        self.assertEqual((data["name"], data["group"]), ("Solar PV", "Solar & Renewables"))
        self.assertTrue(data["description"])
        self.assertEqual([c["title"] for c in data["reading"]], ["Reading an SLD"])
        self.assertIn("Wind Energy", [t["name"] for t in data["related"]])
        self.assertEqual(self.api.get("/api/discovery/topics/no-such-topic/").status_code, 404)

    def test_topic_experts_and_professional_filter(self):
        self.pro.expertise.add(self.solar)
        other = make_user("pro2", account_type="professional", company_other="Acme", display_name="Arun",
                          is_featured=True, featured_order=1)
        self.assertEqual([p["username"] for p in self.api.get("/api/discovery/topics/solar/").json()["experts"]], ["pro"])
        everyone = [p["username"] for p in self.api.get("/api/discovery/professionals/").json()]
        self.assertEqual(everyone[0], "pro2")  # featured first
        self.assertEqual([p["username"] for p in self.api.get("/api/discovery/professionals/?topic=solar").json()], ["pro"])
        self.assertTrue(other.is_featured)

    def test_role_page_groups_courses_by_level(self):
        role = CareerRole.objects.get(slug="scada-engineer")
        self.course.roles.add(role)
        data = self.api.get("/api/discovery/roles/scada-engineer/").json()
        self.assertTrue(data["duties"])
        self.assertIn("SCADA & Monitoring", [s["name"] for s in data["skills"]])
        beginner = next(g for g in data["courses_by_level"] if g["level"] == "beginner")
        self.assertEqual([c["title"] for c in beginner["courses"]], ["SCADA Fundamentals"])
        self.assertEqual(data["starting_level"], "beginner")
        self.assertNotIn("scada-engineer", [r["slug"] for r in data["other_roles"]])
        self.assertEqual(len(self.api.get("/api/discovery/roles/").json()), 6)

    def test_companies_and_live_sessions(self):
        from organizations.models import Company
        genex = Company.objects.create(name="Genex Technocrats", slug="genex-technocrats", description="Monitoring software.")
        self.study.company = genex
        self.study.save()
        row = self.api.get("/api/discovery/companies/").json()[0]
        self.assertEqual((row["name"], row["counts"]["reading"]), ("Genex Technocrats", 1))
        now = timezone.now()
        LiveSession.objects.create(title="Soon", starts_at=now + datetime.timedelta(days=2), speaker_name="A",
                                   registration_url="https://example.org/a")
        LiveSession.objects.create(title="Later", starts_at=now + datetime.timedelta(days=20), speaker_name="B",
                                   registration_url="https://example.org/b")
        titles = lambda when: [s["title"] for s in self.api.get(f"/api/discovery/live-sessions/{when}").json()]
        self.assertEqual(titles(""), ["Soon", "Later"])
        self.assertEqual(titles("?when=week"), ["Soon"])

    def test_landing_pages_come_from_the_cms(self):
        from wagtail.models import Page
        from pages.models import GeLearnIndexPage
        Page.objects.get(depth=1).add_child(instance=GeLearnIndexPage(
            title="GeLearn", slug="gelearn-landing-test",
            for_professionals=[("landing_hero", {"heading": "Share what you know", "primary_label": "Sign up",
                                                 "primary_link": {"link_type": "page", "page": "register"}, "stats": ["courses"]})],
        ))
        data = self.api.get("/api/discovery/landing/professionals/").json()
        self.assertEqual(data["layout"][0]["type"], "landing_hero")
        self.assertEqual(data["layout"][0]["value"]["primary_link"], "/register")  # a picked link, as an address
        self.assertIn("courses", data["stats"])
        self.assertEqual(self.api.get("/api/discovery/landing/nobody/").status_code, 404)


class SearchFacetTests(DiscoveryTestBase):
    def test_facets_count_each_group_without_its_own_filter(self):
        data = self.api.get("/api/discovery/search/", {"level": "beginner"}).json()
        levels = {f["value"]: f["count"] for f in data["facets"]["level"]}
        self.assertEqual(levels["beginner"], 2)  # the course and the GeAcademy article
        self.assertEqual(data["count"], 2)
        topics = {f["value"]: f["count"] for f in data["facets"]["topic"]}
        self.assertEqual(topics, {"solar": 1, "scada": 1})

    def test_publisher_filter_and_sort(self):
        from organizations.models import Company
        Company.objects.create(name="Genex Technocrats", slug="genex-technocrats")
        data = self.api.get("/api/discovery/search/", {"q": "scada"}).json()
        publishers = {f["value"] for f in data["facets"]["publisher"]}
        self.assertIn("genex-technocrats", publishers)  # editorial content files under Genex
        newest = self.api.get("/api/discovery/search/", {"sort": "newest"}).json()["results"]
        self.assertEqual(newest, sorted(newest, key=lambda c: c["date"] or "", reverse=True))

    def test_highest_rated_sort_and_card_rating(self):
        from learning.models import CourseReview, Enrollment
        second = Playlist.objects.create(owner=self.pro, title="Grid basics", status=Playlist.STATUS_PUBLISHED)
        PlaylistItem.objects.create(playlist=second, video=self.video, position=0)

        def review(course, ratings):
            for rating in ratings:
                user = make_user(f"reviewer{User.objects.count()}")
                Enrollment.objects.create(user=user, playlist=course)
                CourseReview.objects.create(user=user, playlist=course, rating=rating)

        review(self.course, [4, 4, 5])      # 4.3 from 3 reviews: rated
        review(second, [5, 5])              # 2 reviews: no rating shown yet
        results = self.api.get("/api/discovery/search/", {"sort": "rated"}).json()["results"]
        self.assertEqual((results[0]["title"], results[0]["rating"]), ("SCADA Fundamentals", {"average": 4.3, "count": 3}))
        grid = next(r for r in results if r["title"] == "Grid basics")
        self.assertIsNone(grid["rating"])
        rest = results[1:]
        self.assertEqual(rest, sorted(rest, key=lambda c: c["date"] or "", reverse=True))  # unrated: newest first

        review(second, [5])                 # 5.0 from 3 now outranks 4.3
        titles = [r["title"] for r in self.api.get("/api/discovery/search/", {"sort": "rated", "type": "course"}).json()["results"]]
        self.assertEqual(titles, ["Grid basics", "SCADA Fundamentals"])
