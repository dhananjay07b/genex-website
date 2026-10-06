import datetime
from decimal import Decimal

from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory, TestCase
from rest_framework.test import APIClient

from accounts.models import User
from engagement.models import Notification
from pages.models import BlogPost, UserBlogPost, UserVideoPost, VideoItem

from .admin import PlaylistAdmin
from .models import Enrollment, Playlist

TODAY = datetime.date(2026, 9, 30)


def make_user(username, **kwargs):
    return User.objects.create_user(username=username, email=f"{username}@example.org", password="Passw0rd!x", **kwargs)


def publish_video(author, title="Video", **kwargs):
    video = VideoItem.objects.create(title=title, date=TODAY, duration="5 min", excerpt="e", video_url="https://v.example/x", **kwargs)
    UserVideoPost.objects.create(author=author, title=title, excerpt="e", video_url="https://v.example/x",
                                 duration="5 min", status="published", published_video=video)
    return video


def publish_post(author, title="Post", **kwargs):
    post = BlogPost.objects.create(title=title, date=TODAY, excerpt="e", **kwargs)
    UserBlogPost.objects.create(author=author, title=title, excerpt="e", body="<p>b</p>", status="published", published_post=post)
    return post


class CourseBuilderTests(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng", display_name="Priya")
        self.other_pro = make_user("other", account_type="professional", company_other="Acme", role_title="Eng")
        self.learner = make_user("learner")
        self.video = publish_video(self.pro, "Intro to SCADA")
        self.post = publish_post(self.pro, "SCADA field notes")
        self.foreign_video = publish_video(self.other_pro, "Not mine")
        self.api.force_authenticate(self.pro)

    def _create(self, **extra):
        payload = {"title": "SCADA Foundations", "description": "From basics to field practice."}
        payload.update(extra)
        return self.api.post("/api/learning/me/courses/", payload, format="json")

    def test_only_professionals_build_courses(self):
        self.api.force_authenticate(self.learner)
        self.assertEqual(self._create().status_code, 403)
        self.assertEqual(self.api.get("/api/learning/me/library/").status_code, 403)

    def test_library_is_own_live_content_only(self):
        library = self.api.get("/api/learning/me/library/").json()
        self.assertEqual(sorted((i["kind"], i["title"]) for i in library), [("post", "SCADA field notes"), ("video", "Intro to SCADA")])

    def test_build_order_and_submit(self):
        course = self._create().json()
        self.assertEqual((course["status"], course["slug"]), ("draft", "scada-foundations"))
        cid = course["id"]

        self.assertEqual(self.api.post(f"/api/learning/me/courses/{cid}/submit/").status_code, 400)  # no items yet

        bad = self.api.put(f"/api/learning/me/courses/{cid}/items/", [{"kind": "video", "id": self.foreign_video.pk}], format="json")
        self.assertEqual(bad.status_code, 400)
        dup = self.api.put(f"/api/learning/me/courses/{cid}/items/", [{"kind": "video", "id": self.video.pk}] * 2, format="json")
        self.assertEqual(dup.status_code, 400)

        res = self.api.put(f"/api/learning/me/courses/{cid}/items/", [
            {"kind": "post", "id": self.post.pk}, {"kind": "video", "id": self.video.pk},
        ], format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual([i["title"] for i in res.json()["items"]], ["SCADA field notes", "Intro to SCADA"])

        res = self.api.post(f"/api/learning/me/courses/{cid}/submit/")
        self.assertEqual(res.json()["status"], "pending")

    def test_paid_course_needs_price(self):
        self.assertIn("price", self._create(access="paid").json())
        self.assertEqual(self._create(access="paid", price="999").json()["price"], "999.00")

    def test_owners_cannot_touch_each_others_courses(self):
        cid = self._create().json()["id"]
        self.api.force_authenticate(self.other_pro)
        self.assertEqual(self.api.patch(f"/api/learning/me/courses/{cid}/", {"title": "Mine now"}, format="json").status_code, 404)

    def test_editing_a_live_course_sends_it_back_to_review_but_reordering_does_not(self):
        course = Playlist.objects.create(owner=self.pro, title="Live", status="published")
        self.api.put(f"/api/learning/me/courses/{course.pk}/items/", [{"kind": "video", "id": self.video.pk}], format="json")
        course.refresh_from_db()
        self.assertEqual(course.status, "published")
        self.api.patch(f"/api/learning/me/courses/{course.pk}/", {"price": None, "access": "members"}, format="json")
        course.refresh_from_db()
        self.assertEqual(course.status, "pending")


class CoursePublicAndEnrollmentTests(TestCase):
    def setUp(self):
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.learner = make_user("learner")
        self.video = publish_video(self.pro, "Free video")
        self.post = publish_post(self.pro, "Paid post", access="paid", price=Decimal("99"))
        self.course = Playlist.objects.create(owner=self.pro, title="Grid Ops", access="members", status="pending")
        self.course.items.create(video=self.video, position=0)
        self.item_post = self.course.items.create(post=self.post, position=1)
        admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        request = RequestFactory().post("/")
        request.user = admin
        PlaylistAdmin(Playlist, AdminSite()).approve(request, Playlist.objects.filter(pk=self.course.pk))

    def test_approval_publishes_and_notifies(self):
        self.course.refresh_from_db()
        self.assertEqual(self.course.status, "published")
        self.assertTrue(Notification.objects.filter(recipient=self.pro, kind="course_status").exists())

    def test_drafts_are_not_public(self):
        Playlist.objects.create(owner=self.pro, title="Secret draft")
        slugs = [c["slug"] for c in APIClient().get("/api/learning/courses/").json()["results"]]
        self.assertEqual(slugs, ["grid-ops"])
        self.assertEqual(APIClient().get("/api/learning/courses/secret-draft/").status_code, 404)

    def test_public_detail_locks_per_viewer(self):
        anon = APIClient().get("/api/learning/courses/grid-ops/").json()
        self.assertTrue(anon["is_locked"])
        self.assertIsNone(anon["enrollment"])
        self.assertEqual([(i["title"], i["is_locked"]) for i in anon["items"]], [("Free video", False), ("Paid post", True)])

    def test_enroll_and_progress(self):
        api = APIClient()
        self.assertEqual(api.post("/api/learning/courses/grid-ops/enroll/").status_code, 401)
        api.force_authenticate(self.learner)
        self.assertEqual(api.post(f"/api/learning/courses/grid-ops/items/{self.item_post.pk}/complete/").status_code, 403)  # not enrolled

        body = api.post("/api/learning/courses/grid-ops/enroll/").json()
        self.assertEqual(body["enrollment"]["percent"], 0)
        self.assertEqual(api.post(f"/api/learning/courses/grid-ops/items/{self.item_post.pk}/complete/").status_code, 204)
        detail = api.get("/api/learning/courses/grid-ops/").json()
        self.assertEqual((detail["enrollment"]["completed"], detail["enrollment"]["total"], detail["enrollment"]["percent"]), (1, 2, 50))
        self.assertEqual([c["slug"] for c in api.get("/api/learning/me/enrollments/").json()["results"]], ["grid-ops"])

        api.delete("/api/learning/courses/grid-ops/enroll/")
        self.assertFalse(Enrollment.objects.exists())

    def test_paid_course_cannot_be_enrolled_without_purchase(self):
        self.course.refresh_from_db()  # approved in setUp
        self.course.access, self.course.price = "paid", Decimal("499")
        self.course.save()
        api = APIClient()
        api.force_authenticate(self.learner)
        res = api.post("/api/learning/courses/grid-ops/enroll/")
        self.assertEqual(res.status_code, 403)
        self.assertIn("paid", res.json()["detail"])



class CourseMetadataTests(TestCase):
    """Level, topics and career roles on courses; the roles list; live sessions."""

    def setUp(self):
        from pages.models import Topic
        self.api = APIClient()
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng", display_name="Priya")
        self.api.force_authenticate(self.pro)
        self.topics = list(Topic.objects.filter(group__isnull=False)[:6])

    def test_roles_endpoint_lists_seeded_roles_in_order(self):
        names = [r["name"] for r in APIClient().get("/api/learning/roles/").json()]
        self.assertEqual(names[:2], ["Solar O&M Engineer", "SCADA Engineer"])
        self.assertEqual(len(names), 6)

    def test_builder_saves_level_topics_and_roles(self):
        from .models import CareerRole
        role = CareerRole.objects.get(slug="scada-engineer")
        res = self.api.post("/api/learning/me/courses/", {
            "title": "SCADA Foundations", "description": "d", "level": "beginner",
            "topics": [self.topics[0].pk, self.topics[1].pk], "roles": [role.pk],
        }, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        course = Playlist.objects.get()
        self.assertEqual(course.level, "beginner")
        self.assertEqual(set(course.topics.all()), {self.topics[0], self.topics[1]})
        self.assertEqual(list(course.roles.all()), [role])
        self.assertEqual(sorted(res.json()["topics"]), sorted([self.topics[0].pk, self.topics[1].pk]))

    def test_builder_limits_topics_and_rejects_unknown_level(self):
        res = self.api.post("/api/learning/me/courses/", {
            "title": "Too many topics", "topics": [t.pk for t in self.topics],
        }, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("topics", res.json())
        res = self.api.post("/api/learning/me/courses/", {"title": "Bad level", "level": "expert"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_builder_cannot_set_featured_or_company(self):
        from organizations.models import Company
        company = Company.objects.create(name="Genex", slug="genex")
        res = self.api.post("/api/learning/me/courses/", {
            "title": "Sneaky", "featured": True, "company": company.pk,
        }, format="json")
        self.assertEqual(res.status_code, 201)
        course = Playlist.objects.get()
        self.assertFalse(course.featured)
        self.assertIsNone(course.company)

    def test_live_session_needs_a_speaker(self):
        from django.core.exceptions import ValidationError
        from django.utils import timezone
        from .models import LiveSession
        session = LiveSession(title="GOOSE demo", starts_at=timezone.now(), registration_url="https://example.org/r")
        with self.assertRaises(ValidationError):
            session.full_clean()
        session.speaker_name = "Outside Speaker"
        session.full_clean()
        session.save()
        self.assertEqual(session.slug, "goose-demo")
        self.assertEqual(session.ends_at - session.starts_at, datetime.timedelta(minutes=60))


class CompanyCourseTests(TestCase):
    """Company Studio courses: built from the company's own published content."""

    def setUp(self):
        from organizations.models import Company
        from pages.models import CaseStudy, TechArticle, Whitepaper
        self.api = APIClient()
        self.genex = Company.objects.create(name="Genex", slug="genex")
        self.other = Company.objects.create(name="Other", slug="other")
        self.staff = make_user("staff", account_type="company", company=self.genex)
        self.colleague = make_user("staff2", account_type="company", company=self.genex)
        self.article = TechArticle.objects.create(title="Reading an SLD", read_time="8 min", date=TODAY,
                                                  excerpt="e", company=self.genex)
        self.study = CaseStudy.objects.create(title="SCADA retrofit", excerpt="e", date=TODAY, company=self.genex)
        self.paper = Whitepaper.objects.create(title="RMS architecture", date=TODAY, pages="12 pages", description="d", company=self.genex)
        self.foreign = TechArticle.objects.create(title="Not ours", read_time="1", date=TODAY, excerpt="e", company=self.other)
        self.api.force_authenticate(self.staff)

    def test_company_builds_a_course_from_its_content(self):
        res = self.api.post("/api/learning/me/courses/", {"title": "Remote Monitoring", "level": "intermediate"}, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        course = Playlist.objects.get()
        self.assertEqual((course.owner, course.company), (self.staff, self.genex))
        library = {(c["kind"], c["title"]) for c in self.api.get("/api/learning/me/library/").json()}
        self.assertEqual(library, {("article", "Reading an SLD"), ("research", "SCADA retrofit"), ("whitepaper", "RMS architecture")})
        res = self.api.put(f"/api/learning/me/courses/{course.pk}/items/", [
            {"kind": "whitepaper", "id": self.paper.pk}, {"kind": "article", "id": self.article.pk}, {"kind": "research", "id": self.study.pk},
        ], format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual([i["kind"] for i in res.json()["items"]], ["whitepaper", "article", "research"])
        self.assertEqual(res.json()["items"][1]["path"], f"/geacademy/{self.article.pk}")

    def test_cannot_add_another_companys_content(self):
        course = Playlist.objects.create(owner=self.staff, company=self.genex, title="Ours")
        res = self.api.put(f"/api/learning/me/courses/{course.pk}/items/", [{"kind": "article", "id": self.foreign.pk}], format="json")
        self.assertEqual(res.status_code, 400)

    def test_colleagues_share_company_courses(self):
        course = Playlist.objects.create(owner=self.staff, company=self.genex, title="Shared")
        self.api.force_authenticate(self.colleague)
        self.assertEqual([c["title"] for c in self.api.get("/api/learning/me/courses/").json()], ["Shared"])
        self.assertEqual(self.api.patch(f"/api/learning/me/courses/{course.pk}/", {"title": "Shared course"}, format="json").status_code, 200)

    def test_learner_opens_a_company_course(self):
        from learning.models import PlaylistItem
        course = Playlist.objects.create(owner=self.staff, company=self.genex, title="Live one", status="published")
        PlaylistItem.objects.create(playlist=course, article=self.article, position=0)
        learner = make_user("learner")
        self.api.force_authenticate(learner)
        data = self.api.get(f"/api/learning/courses/{course.slug}/").json()
        self.assertEqual(data["company"]["name"], "Genex")
        self.assertEqual((data["items"][0]["kind"], data["items"][0]["is_locked"]), ("article", False))
        self.assertIn(self.api.post(f"/api/learning/courses/{course.slug}/enroll/").status_code, (200, 201))
        item_id = data["items"][0]["item_id"]
        self.assertIn(self.api.post(f"/api/learning/courses/{course.slug}/items/{item_id}/complete/").status_code, (200, 201, 204))


class CourseDetailsPhaseTests(TestCase):
    """Course page redesign, Phase 1: details, modules, FAQs, instructors, progress-safe saves, owner preview."""

    def setUp(self):
        from organizations.models import Company
        from pages.models import TechArticle
        self.api = APIClient()
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.learner = make_user("learner")
        self.v1 = publish_video(self.pro, "Lesson one")
        self.v2 = publish_video(self.pro, "Lesson two")
        self.p1 = publish_post(self.pro, "Lesson three")
        self.course = Playlist.objects.create(owner=self.pro, title="SCADA", status="published")
        self.i1 = self.course.items.create(video=self.v1, position=0)
        self.i2 = self.course.items.create(video=self.v2, position=1)
        self.api.force_authenticate(self.pro)

        self.genex = Company.objects.create(name="Genex", slug="genex")
        self.staff = make_user("staff", account_type="company", company=self.genex)
        self.article = TechArticle.objects.create(title="SLD guide", read_time="8 min", date=TODAY, excerpt="e", company=self.genex)
        self.verified = make_user("verified", account_type="professional", company=self.genex)
        User.objects.filter(pk=self.verified.pk).update(company_verified=True)
        self.unverified = make_user("unverified", account_type="professional", company=self.genex)

    def _url(self, suffix="", course=None):
        return f"/api/learning/me/courses/{(course or self.course).pk}/{suffix}"

    def _tick(self, item):
        from .models import ItemProgress
        Enrollment.objects.get_or_create(user=self.learner, playlist=self.course)
        ItemProgress.objects.create(user=self.learner, item=item)

    def _status(self):
        self.course.refresh_from_db()
        return self.course.status

    # Progress is kept when the builder saves
    def test_saving_lessons_keeps_learners_progress(self):
        from .models import ItemProgress
        self._tick(self.i1)
        res = self.api.put(self._url("items/"), [{"kind": "video", "id": self.v2.pk}, {"kind": "video", "id": self.v1.pk},
                                                {"kind": "post", "id": self.p1.pk}], format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertTrue(ItemProgress.objects.filter(user=self.learner, item=self.i1).exists())
        self.assertEqual([i["title"] for i in res.json()["items"]], ["Lesson two", "Lesson one", "Lesson three"])

    def test_removing_a_lesson_removes_only_its_progress(self):
        from .models import ItemProgress
        self._tick(self.i1)
        self._tick(self.i2)
        self.api.put(self._url("items/"), [{"kind": "video", "id": self.v1.pk}], format="json")
        self.assertEqual(list(ItemProgress.objects.values_list("item_id", flat=True)), [self.i1.pk])

    # Outline with modules
    def test_outline_builds_modules_and_keeps_progress(self):
        from .models import ItemProgress
        self._tick(self.i2)
        res = self.api.put(self._url("outline/"), {
            "modules": [
                {"title": "Basics", "summary": "Start here", "items": [{"kind": "video", "id": self.v1.pk}]},
                {"title": "Empty for now", "items": []},
            ],
            "loose_items": [{"kind": "video", "id": self.v2.pk}, {"kind": "post", "id": self.p1.pk}],
        }, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        body = res.json()
        self.assertEqual([m["title"] for m in body["modules"]], ["Basics", "Empty for now"])
        basics = body["modules"][0]["id"]
        self.assertEqual([(i["title"], i["module_id"]) for i in body["items"]],
                         [("Lesson one", basics), ("Lesson two", None), ("Lesson three", None)])
        self.assertTrue(ItemProgress.objects.filter(item=self.i2).exists())
        self.assertEqual(self._status(), "pending")  # new module text goes to review

    def test_reordering_and_moving_lessons_stays_live_but_renaming_goes_to_review(self):
        from .models import CourseModule
        a = CourseModule.objects.create(playlist=self.course, title="A", position=0)
        b = CourseModule.objects.create(playlist=self.course, title="B", position=1)
        outline = {"modules": [
            {"id": b.pk, "title": "B", "items": [{"kind": "video", "id": self.v1.pk}]},
            {"id": a.pk, "title": "A", "items": [{"kind": "video", "id": self.v2.pk}]},
        ]}
        self.assertEqual(self.api.put(self._url("outline/"), outline, format="json").status_code, 200)
        self.assertEqual(self._status(), "published")
        outline["modules"][0]["title"] = "B, renamed"
        self.api.put(self._url("outline/"), outline, format="json")
        self.assertEqual(self._status(), "pending")

    def test_outline_drops_left_out_modules_and_rejects_foreign_ones(self):
        from .models import CourseModule
        gone = CourseModule.objects.create(playlist=self.course, title="Old", position=0)
        res = self.api.put(self._url("outline/"), {"loose_items": [{"kind": "video", "id": self.v1.pk}]}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertFalse(CourseModule.objects.filter(pk=gone.pk).exists())
        other = Playlist.objects.create(owner=self.pro, title="Other")
        foreign = CourseModule.objects.create(playlist=other, title="Not here")
        res = self.api.put(self._url("outline/"), {"modules": [{"id": foreign.pk, "title": "x", "items": []}]}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_outline_rejects_duplicates_and_foreign_content(self):
        stranger = make_user("stranger", account_type="professional", company_other="X")
        theirs = publish_video(stranger, "Theirs")
        dup = {"modules": [{"title": "M", "items": [{"kind": "video", "id": self.v1.pk}]}],
               "loose_items": [{"kind": "video", "id": self.v1.pk}]}
        self.assertEqual(self.api.put(self._url("outline/"), dup, format="json").status_code, 400)
        foreign = {"loose_items": [{"kind": "video", "id": theirs.pk}]}
        self.assertEqual(self.api.put(self._url("outline/"), foreign, format="json").status_code, 400)

    # Details and the review rule
    def test_outcomes_and_prerequisites_are_cleaned_and_limited(self):
        draft = Playlist.objects.create(owner=self.pro, title="Draft")
        res = self.api.patch(self._url(course=draft), {"outcomes": ["  Map Modbus registers ", "", "Build alarm lists"],
                                                      "prerequisites": ["Basic electrical"], "language": "  "}, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual(res.json()["outcomes"], ["Map Modbus registers", "Build alarm lists"])
        self.assertEqual(res.json()["language"], "English")
        self.assertEqual(self.api.patch(self._url(course=draft), {"outcomes": [f"o{i}" for i in range(9)]}, format="json").status_code, 400)
        self.assertEqual(self.api.patch(self._url(course=draft), {"outcomes": ["x" * 121]}, format="json").status_code, 400)

    def test_learner_facing_text_sends_live_course_to_review_but_language_does_not(self):
        self.api.patch(self._url(), {"language": "Hindi", "level": "beginner"}, format="json")
        self.assertEqual(self._status(), "published")
        self.api.patch(self._url(), {"summary": "A new promise"}, format="json")
        self.assertEqual(self._status(), "pending")

    def test_faqs_save_limit_and_review_rule(self):
        faqs = [{"question": "Do I need SCADA experience?", "answer": "No."}]
        res = self.api.put(self._url("faqs/"), faqs, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual([f["question"] for f in res.json()["faqs"]], ["Do I need SCADA experience?"])
        self.assertEqual(self._status(), "pending")
        self.course.status = "published"
        self.course.save()
        self.api.put(self._url("faqs/"), faqs, format="json")  # unchanged: stays live
        self.assertEqual(self._status(), "published")
        too_many = [{"question": f"Q{i}", "answer": "A"} for i in range(7)]
        self.assertEqual(self.api.put(self._url("faqs/"), too_many, format="json").status_code, 400)

    # Instructors: company courses only
    def test_company_course_lists_its_verified_professionals_as_instructors(self):
        self.api.force_authenticate(self.staff)
        people = self.api.get("/api/learning/me/company-professionals/").json()
        self.assertEqual([p["username"] for p in people], ["verified"])
        res = self.api.post("/api/learning/me/courses/", {"title": "Remote Monitoring", "instructors": [self.verified.pk]}, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(res.json()["instructors"], [self.verified.pk])
        cid = res.json()["id"]
        bad = self.api.patch(f"/api/learning/me/courses/{cid}/", {"instructors": [self.unverified.pk]}, format="json")
        self.assertEqual(bad.status_code, 400)
        self.assertEqual(self.api.patch(f"/api/learning/me/courses/{cid}/", {"instructors": []}, format="json").json()["instructors"], [])

    def test_professional_course_cannot_list_instructors(self):
        res = self.api.patch(self._url(), {"instructors": [self.verified.pk]}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(self.api.get("/api/learning/me/company-professionals/").status_code, 403)

    # Owner preview
    def test_owner_and_colleagues_preview_unpublished_courses(self):
        draft = Playlist.objects.create(owner=self.pro, title="Pro draft")
        res = self.api.get(f"/api/learning/courses/{draft.slug}/")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["is_preview"])
        self.assertFalse(self.api.get(f"/api/learning/courses/{self.course.slug}/").json()["is_preview"])
        for viewer in (None, self.learner, self.staff):
            client = APIClient()
            if viewer:
                client.force_authenticate(viewer)
            self.assertEqual(client.get(f"/api/learning/courses/{draft.slug}/").status_code, 404)

        company_draft = Playlist.objects.create(owner=self.staff, company=self.genex, title="Company draft")
        colleague = make_user("staff2", account_type="company", company=self.genex)
        client = APIClient()
        client.force_authenticate(colleague)
        self.assertEqual(client.get(f"/api/learning/courses/{company_draft.slug}/").status_code, 200)
        self.assertEqual(self.api.get(f"/api/learning/courses/{company_draft.slug}/").status_code, 404)

    def test_drafts_stay_out_of_public_lists(self):
        Playlist.objects.create(owner=self.pro, title="Pro draft")
        slugs = [c["slug"] for c in self.api.get("/api/learning/courses/").json()["results"]]
        self.assertEqual(slugs, ["scada"])


class CourseAdminSafetyTests(TestCase):
    """Rules Django admin must enforce on its own, so a slip there can't create a course the site can't handle."""

    def setUp(self):
        from organizations.models import Company
        self.genex = Company.objects.create(name="Genex", slug="genex")
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.staff = make_user("staff", account_type="company", company=self.genex)
        self.verified = make_user("verified", account_type="professional", company=self.genex)
        User.objects.filter(pk=self.verified.pk).update(company_verified=True)
        self.verified.refresh_from_db()
        self.unverified = make_user("unverified", account_type="professional", company=self.genex)
        self.own = Playlist.objects.create(owner=self.pro, title="Pro course")
        self.company_course = Playlist.objects.create(owner=self.staff, company=self.genex, title="Genex course")

    def _form(self, course, **changes):
        import json
        from .admin import PlaylistAdminForm
        course = Playlist.objects.get(pk=course.pk)  # fresh: a rejected form still writes onto its instance
        data = {
            "title": course.title, "summary": course.summary, "description": course.description,
            "outcomes": json.dumps(course.outcomes), "prerequisites": json.dumps(course.prerequisites),
            "language": course.language, "level": course.level, "access": course.access, "currency": course.currency,
            "rejection_reason": "", "instructors": [], "topics": [], "roles": [],
        }
        data.update(changes)
        admin_form = PlaylistAdmin(Playlist, AdminSite()).get_form(RequestFactory().get("/"), course)
        self.assertTrue(issubclass(admin_form, PlaylistAdminForm))
        return admin_form(data=data, instance=course)

    def test_professional_course_refuses_any_instructor(self):
        form = self._form(self.own, instructors=[self.pro.pk])
        self.assertFalse(form.is_valid())
        self.assertIn("instructors", form.errors)

    def test_company_course_accepts_only_verified_professionals_of_the_company(self):
        self.assertTrue(self._form(self.company_course, instructors=[self.verified.pk]).is_valid())
        for wrong in (self.staff, self.unverified, self.pro):
            form = self._form(self.company_course, instructors=[wrong.pk])
            self.assertFalse(form.is_valid(), wrong.username)
            self.assertIn("instructors", form.errors)

    def test_company_course_allows_at_most_three_instructors(self):
        people = [self.verified]
        for i in range(3):
            person = make_user(f"v{i}", account_type="professional", company=self.genex)
            User.objects.filter(pk=person.pk).update(company_verified=True)
            people.append(person)
        self.assertTrue(self._form(self.company_course, instructors=[p.pk for p in people[:3]]).is_valid())
        self.assertFalse(self._form(self.company_course, instructors=[p.pk for p in people]).is_valid())

    def test_outcome_and_prerequisite_limits_apply_in_admin(self):
        self.assertFalse(self._form(self.own, outcomes='["' + '", "'.join(f"o{i}" for i in range(9)) + '"]').is_valid())
        self.assertFalse(self._form(self.own, prerequisites='["' + "x" * 121 + '"]').is_valid())
        self.assertFalse(self._form(self.own, outcomes='"not a list"').is_valid())
        form = self._form(self.own, outcomes='["  Map registers  ", ""]')
        self.assertTrue(form.is_valid(), form.errors)
        self.assertEqual(form.save().outcomes, ["Map registers"])

    def test_topic_and_role_limits_apply_in_admin(self):
        from pages.models import Topic
        from .models import CareerRole
        topics = list(Topic.objects.values_list("pk", flat=True)[:6])
        self.assertFalse(self._form(self.own, topics=topics).is_valid())
        roles = list(CareerRole.objects.values_list("pk", flat=True)[:4])
        self.assertFalse(self._form(self.own, roles=roles).is_valid())

    def test_company_is_read_only_and_courses_are_not_created_in_admin(self):
        model_admin = PlaylistAdmin(Playlist, AdminSite())
        self.assertIn("company", model_admin.readonly_fields)
        self.assertFalse(model_admin.has_add_permission(RequestFactory().get("/")))

    def test_approve_skips_courses_with_no_lessons(self):
        from django.contrib.messages.storage.fallback import FallbackStorage
        self.own.status = "pending"
        self.own.save()
        request = RequestFactory().post("/")
        request.user = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        request.session = {}
        request._messages = FallbackStorage(request)
        PlaylistAdmin(Playlist, AdminSite()).approve(request, Playlist.objects.filter(pk=self.own.pk))
        self.own.refresh_from_db()
        self.assertEqual(self.own.status, "pending")

    def test_lesson_cannot_point_at_another_courses_module(self):
        from django.core.exceptions import ValidationError
        from .models import CourseModule, PlaylistItem
        video = publish_video(self.pro, "V")
        foreign = CourseModule.objects.create(playlist=self.company_course, title="Theirs")
        with self.assertRaises(ValidationError):
            PlaylistItem(playlist=self.own, video=video, module=foreign).full_clean()

    def test_instructor_is_removed_when_they_stop_qualifying(self):
        from accounts.verification import refresh_company_verification
        self.company_course.instructors.add(self.verified)
        refresh_company_verification(self.verified)  # no confirmed company email → loses verification
        self.assertFalse(self.company_course.instructors.exists())

        self.company_course.instructors.add(self.verified)  # (re-added directly, as stale data would be)
        User.objects.filter(pk=self.verified.pk).update(company_verified=True)
        self.verified.refresh_from_db()
        self.verified.company = None
        self.verified.company_other = "Elsewhere"
        self.verified.save()
        self.assertFalse(self.company_course.instructors.exists())

    def test_listed_instructors_hides_anyone_no_longer_eligible(self):
        self.company_course.instructors.add(self.verified, self.unverified)
        self.assertEqual(list(self.company_course.listed_instructors()), [self.verified])
        self.own.instructors.add(self.verified)
        self.assertFalse(self.own.listed_instructors().exists())

    def test_deleting_a_course_owner_is_blocked(self):
        from django.db.models import ProtectedError
        with self.assertRaises(ProtectedError):
            self.staff.delete()

    def test_professional_with_own_courses_cannot_change_account_type(self):
        from django.core.exceptions import ValidationError
        self.pro.account_type = "learner"
        self.pro.company_other = ""
        with self.assertRaises(ValidationError) as caught:
            self.pro.full_clean()
        self.assertIn("account_type", caught.exception.message_dict)
