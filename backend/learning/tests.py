import datetime
import io
from decimal import Decimal

from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory, TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import User
from engagement.models import Notification
from pages.models import BlogPost, UserBlogPost, UserVideoPost, VideoItem

from .admin import PlaylistAdmin
from .models import Certificate, CourseReview, CourseRevision, Enrollment, ItemProgress, Playlist, QuizAttempt

TODAY = datetime.date(2026, 9, 30)


def lessons(refs):
    """An outline payload with these lessons in one module (every lesson sits in a module)."""
    return {"modules": [{"title": "Module 1", "items": refs}]}


LESSON_FIELDS = {
    "text": {"body": "<p>Lesson text.</p>"},
    "video": {"video_url": "https://youtu.be/abc123", "duration": "10 min"},
    "quiz": {},
}


def add_lesson(course, title="Lesson", kind="text", position=0, module=None, **fields):
    """Put a lesson written in the course into its outline (the only thing an outline holds) and return the item."""
    lesson = course.lessons.create(kind=kind, title=title, approved=True, **{**LESSON_FIELDS[kind], **fields})
    return course.items.create(lesson=lesson, position=position, module=module)


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

        self.assertEqual(self.api.post(f"/api/learning/me/courses/{cid}/submit/").status_code, 400)  # no lessons yet

        own = Playlist.objects.get(pk=cid)
        notes = own.lessons.create(kind="text", title="SCADA field notes", body="<p>Notes</p>")
        intro = own.lessons.create(kind="video", title="Intro to SCADA", video_url="https://youtu.be/abc123", duration="5 min")
        elsewhere = Playlist.objects.create(owner=self.other_pro, title="Theirs").lessons.create(kind="text", title="Theirs", body="<p>x</p>")
        outline = f"/api/learning/me/courses/{cid}/outline/"

        for refs in (
            [{"kind": "lesson", "id": elsewhere.pk}],          # another course's lesson
            [{"kind": "video", "id": self.video.pk}],          # published content is Further reading, not a lesson
            [{"kind": "lesson", "id": intro.pk}] * 2,          # once each
        ):
            self.assertEqual(self.api.put(outline, lessons(refs), format="json").status_code, 400, refs)
        loose = self.api.put(outline, {"modules": [], "loose_items": [{"kind": "lesson", "id": intro.pk}]}, format="json")
        self.assertEqual(loose.json(), {"loose_items": ["Put every lesson in a module."]})

        res = self.api.put(outline, lessons([{"kind": "lesson", "id": notes.pk}, {"kind": "lesson", "id": intro.pk}]), format="json")
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

    def test_editing_a_live_course_holds_the_change_but_reordering_goes_live(self):
        course = Playlist.objects.create(owner=self.pro, title="Live", status="published")
        module = course.modules.create(title="Basics")
        one, two = add_lesson(course, "One", module=module), add_lesson(course, "Two", position=1, module=module)
        swapped = {"modules": [{"id": module.pk, "title": "Basics", "items": [
            {"kind": "lesson", "id": two.lesson_id}, {"kind": "lesson", "id": one.lesson_id}]}]}
        self.assertEqual(self.api.put(f"/api/learning/me/courses/{course.pk}/outline/", swapped, format="json").status_code, 200)
        course.refresh_from_db()
        self.assertEqual((course.status, [i.lesson.title for i in course.items.all()]), ("published", ["Two", "One"]))
        self.assertFalse(CourseRevision.objects.filter(playlist=course).exists())
        self.api.patch(f"/api/learning/me/courses/{course.pk}/", {"price": None, "access": "members"}, format="json")
        course.refresh_from_db()
        self.assertEqual((course.status, course.access), ("published", "free"))  # live version unchanged
        self.assertEqual(course.revision.changes, {"access": "members"})


class CoursePublicAndEnrollmentTests(TestCase):
    def setUp(self):
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.learner = make_user("learner")
        self.video = publish_video(self.pro, "Free video")
        self.post = publish_post(self.pro, "Paid post", access="paid", price=Decimal("99"))
        self.course = Playlist.objects.create(owner=self.pro, title="Grid Ops", access="members", status="pending")
        self.item_preview = add_lesson(self.course, "Preview video", "video", position=0, is_preview=True)
        self.item_post = add_lesson(self.course, "Members lesson", "text", position=1)
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
        self.assertEqual([(i["title"], i["is_locked"]) for i in anon["items"]], [("Preview video", False), ("Members lesson", True)])

    def test_enroll_and_progress(self):
        api = APIClient()
        self.assertEqual(api.post("/api/learning/courses/grid-ops/enroll/").status_code, 401)
        api.force_authenticate(self.learner)
        free_item = self.item_preview
        self.assertEqual(api.post(f"/api/learning/courses/grid-ops/items/{free_item.pk}/open/").status_code, 403)  # not enrolled

        body = api.post("/api/learning/courses/grid-ops/enroll/").json()
        self.assertEqual(body["enrollment"]["percent"], 0)
        res = api.post(f"/api/learning/courses/grid-ops/items/{free_item.pk}/open/")
        self.assertEqual((res.status_code, res.json()), (200, {"completed": 1, "certificate_code": None}))
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
    """Company Studio courses: lessons written in the course, with the company's published content as Further reading."""

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

    def test_company_adds_its_content_as_further_reading(self):
        res = self.api.post("/api/learning/me/courses/", {"title": "Remote Monitoring", "level": "intermediate"}, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        course = Playlist.objects.get()
        self.assertEqual((course.owner, course.company), (self.staff, self.genex))
        library = {(c["kind"], c["title"]) for c in self.api.get("/api/learning/me/library/").json()}
        self.assertEqual(library, {("article", "Reading an SLD"), ("research", "SCADA retrofit"), ("whitepaper", "RMS architecture")})
        res = self.api.put(f"/api/learning/me/courses/{course.pk}/reading/", {"items": [
            {"kind": "whitepaper", "id": self.paper.pk}, {"kind": "article", "id": self.article.pk}, {"kind": "research", "id": self.study.pk},
        ]}, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual([i["kind"] for i in res.json()["reading"]], ["whitepaper", "article", "research"])
        self.assertEqual(res.json()["reading"][1]["path"], f"/geacademy/{self.article.pk}")
        self.assertEqual(res.json()["items"], [])  # Further reading is never a lesson

    def test_cannot_add_another_companys_content(self):
        course = Playlist.objects.create(owner=self.staff, company=self.genex, title="Ours")
        url = f"/api/learning/me/courses/{course.pk}/reading/"
        self.assertEqual(self.api.put(url, {"items": [{"kind": "article", "id": self.foreign.pk}]}, format="json").status_code, 400)
        self.assertEqual(self.api.put(url, {"items": [{"kind": "article", "id": self.article.pk}] * 2}, format="json").status_code, 400)

    def test_colleagues_share_company_courses(self):
        course = Playlist.objects.create(owner=self.staff, company=self.genex, title="Shared")
        self.api.force_authenticate(self.colleague)
        self.assertEqual([c["title"] for c in self.api.get("/api/learning/me/courses/").json()], ["Shared"])
        self.assertEqual(self.api.patch(f"/api/learning/me/courses/{course.pk}/", {"title": "Shared course"}, format="json").status_code, 200)

    def test_learner_opens_a_company_course(self):
        from learning.models import PlaylistItem
        course = Playlist.objects.create(owner=self.staff, company=self.genex, title="Live one", status="published")
        add_lesson(course, self.article.title, "text", position=0)
        learner = make_user("learner")
        self.api.force_authenticate(learner)
        data = self.api.get(f"/api/learning/courses/{course.slug}/").json()
        self.assertEqual(data["company"]["name"], "Genex")
        self.assertEqual((data["items"][0]["kind"], data["items"][0]["is_locked"]), ("lesson", True))  # until enrolled
        self.assertIn(self.api.post(f"/api/learning/courses/{course.slug}/enroll/").status_code, (200, 201))
        item_id = data["items"][0]["item_id"]
        self.assertEqual(self.api.post(f"/api/learning/courses/{course.slug}/items/{item_id}/open/").status_code, 200)


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
        self.m = self.course.modules.create(title="Lessons", position=0)
        self.i1 = add_lesson(self.course, "Lesson one", "video", position=0, module=self.m)
        self.i2 = add_lesson(self.course, "Lesson two", "video", position=1, module=self.m)
        # Reviewed with the course but not in the outline yet, so adding it goes live straight away.
        self.l3 = self.course.lessons.create(kind="text", title="Lesson three", body="<p>x</p>", approved=True)
        self.L1, self.L2 = {"kind": "lesson", "id": self.i1.lesson_id}, {"kind": "lesson", "id": self.i2.lesson_id}
        self.L3 = {"kind": "lesson", "id": self.l3.pk}
        self.api.force_authenticate(self.pro)

        self.genex = Company.objects.create(name="Genex", slug="genex")
        self.staff = make_user("staff", account_type="company", company=self.genex)
        self.article = TechArticle.objects.create(title="SLD guide", read_time="8 min", date=TODAY, excerpt="e", company=self.genex)
        self.verified = make_user("verified", account_type="professional", company=self.genex)
        User.objects.filter(pk=self.verified.pk).update(company_verified=True)
        self.unverified = make_user("unverified", account_type="professional", company=self.genex)

    def _url(self, suffix="", course=None):
        return f"/api/learning/me/courses/{(course or self.course).pk}/{suffix}"

    def _outline(self, *refs):
        """The live module with these lessons (no module change, so it applies straight away)."""
        return {"modules": [{"id": self.m.pk, "title": "Lessons", "items": list(refs)}]}

    def _tick(self, item):
        from .models import ItemProgress
        Enrollment.objects.get_or_create(user=self.learner, playlist=self.course)
        ItemProgress.objects.create(user=self.learner, item=item)

    def _status(self):
        self.course.refresh_from_db()
        return self.course.status

    def _held(self):
        """What's waiting for review on the live course (keys of its revision), or None."""
        from .revisions import revision_of
        self.course.refresh_from_db()
        revision = revision_of(self.course)
        return sorted(revision.changes) if revision else None

    # Progress is kept when the builder saves
    def test_saving_lessons_keeps_learners_progress(self):
        from .models import ItemProgress
        self._tick(self.i1)
        res = self.api.put(self._url("outline/"), self._outline(self.L2, self.L1, self.L3), format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertTrue(ItemProgress.objects.filter(user=self.learner, item=self.i1).exists())
        self.assertEqual([i["title"] for i in res.json()["items"]], ["Lesson two", "Lesson one", "Lesson three"])

    def test_removing_a_lesson_removes_only_its_progress(self):
        from .models import ItemProgress
        self._tick(self.i1)
        self._tick(self.i2)
        self.api.put(self._url("outline/"), self._outline(self.L1), format="json")
        self.assertEqual(list(ItemProgress.objects.values_list("item_id", flat=True)), [self.i1.pk])

    # Outline with modules
    def test_outline_builds_modules_and_keeps_progress(self):
        from .models import ItemProgress
        self._tick(self.i2)
        res = self.api.put(self._url("outline/"), {
            "modules": [
                {"title": "Basics", "summary": "Start here", "items": [self.L1]},
                {"title": "Empty for now", "items": []},
                {"title": "More", "items": [self.L2, self.L3]},
            ],
        }, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        body = res.json()
        # The builder shows the held outline (new modules numbered below zero) ...
        self.assertEqual([m["title"] for m in body["modules"]], ["Basics", "Empty for now", "More"])
        basics, more = body["modules"][0]["id"], body["modules"][2]["id"]
        self.assertLess(basics, 0)
        self.assertEqual([(i["title"], i["module_id"]) for i in body["items"]],
                         [("Lesson one", basics), ("Lesson two", more), ("Lesson three", more)])
        # ... while the live course keeps its lessons until Genex approves.
        self.assertEqual((self._status(), self._held()), ("published", ["outline"]))
        self.assertEqual(list(self.course.modules.values_list("title", flat=True)), ["Lessons"])
        self.assertEqual(self.course.items.count(), 2)
        self.assertTrue(ItemProgress.objects.filter(item=self.i2).exists())

    def test_reordering_and_moving_lessons_goes_live_but_renaming_is_held(self):
        from .models import CourseModule
        a = CourseModule.objects.create(playlist=self.course, title="A", position=0)
        b = CourseModule.objects.create(playlist=self.course, title="B", position=1)
        outline = {"modules": [
            {"id": b.pk, "title": "B", "items": [self.L1]},
            {"id": a.pk, "title": "A", "items": [self.L2]},
        ]}
        self.assertEqual(self.api.put(self._url("outline/"), outline, format="json").status_code, 200)
        self.assertEqual((self._status(), self._held()), ("published", None))
        self.assertEqual(list(self.course.modules.values_list("title", flat=True)), ["B", "A"])
        outline["modules"][0]["title"] = "B, renamed"
        self.api.put(self._url("outline/"), outline, format="json")
        self.assertEqual((self._status(), self._held()), ("published", ["outline"]))
        self.assertEqual(list(self.course.modules.values_list("title", flat=True)), ["B", "A"])

    def test_outline_drops_left_out_modules_and_rejects_foreign_ones(self):
        from .models import CourseModule
        gone = CourseModule.objects.create(playlist=self.course, title="Old", position=0)
        res = self.api.put(self._url("outline/"), self._outline(self.L1), format="json")
        self.assertEqual(res.status_code, 200)
        self.assertFalse(CourseModule.objects.filter(pk=gone.pk).exists())
        other = Playlist.objects.create(owner=self.pro, title="Other")
        foreign = CourseModule.objects.create(playlist=other, title="Not here")
        res = self.api.put(self._url("outline/"), {"modules": [{"id": foreign.pk, "title": "x", "items": []}]}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_outline_rejects_duplicates_and_foreign_content(self):
        stranger = make_user("stranger", account_type="professional", company_other="X")
        theirs = Playlist.objects.create(owner=stranger, title="Theirs").lessons.create(kind="text", title="T", body="<p>x</p>")
        dup = {"modules": [{"title": "M", "items": [self.L1]}, {"title": "N", "items": [self.L1]}]}
        self.assertEqual(self.api.put(self._url("outline/"), dup, format="json").status_code, 400)
        foreign = self._outline({"kind": "lesson", "id": theirs.pk})
        self.assertEqual(self.api.put(self._url("outline/"), foreign, format="json").status_code, 400)
        published = self._outline({"kind": "video", "id": self.v1.pk})  # published content belongs in Further reading
        self.assertEqual(self.api.put(self._url("outline/"), published, format="json").status_code, 400)

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

    def test_learner_facing_text_is_held_for_review_but_language_goes_live(self):
        self.api.patch(self._url(), {"language": "Hindi", "level": "beginner"}, format="json")
        self.assertEqual((self._status(), self._held(), self.course.language), ("published", None, "Hindi"))
        res = self.api.patch(self._url(), {"summary": "A new promise"}, format="json")
        self.assertEqual(res.json()["summary"], "A new promise")  # the builder shows the held text
        self.assertEqual((self._status(), self._held(), self.course.summary), ("published", ["summary"], ""))
        self.api.patch(self._url(), {"summary": ""}, format="json")  # back to the live text: nothing left to review
        self.assertIsNone(self._held())

    def test_faqs_save_limit_and_review_rule(self):
        faqs = [{"question": "Do I need SCADA experience?", "answer": "No."}]
        res = self.api.put(self._url("faqs/"), faqs, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual([f["question"] for f in res.json()["faqs"]], ["Do I need SCADA experience?"])
        self.assertEqual((self._status(), self._held()), ("published", ["faqs"]))
        self.assertFalse(self.course.faqs.exists())
        self.api.put(self._url("faqs/"), [], format="json")  # same as live again
        self.assertIsNone(self._held())
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
    def test_unpublished_courses_have_no_public_page_even_for_their_owner(self):
        """Authors preview inside the builder; a draft or a course in review never has a working address."""
        draft = Playlist.objects.create(owner=self.pro, title="Pro draft")
        in_review = Playlist.objects.create(owner=self.staff, company=self.genex, title="Company draft", status="pending")
        colleague = make_user("staff2", account_type="company", company=self.genex)
        admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        for viewer in (None, self.pro, self.learner, self.staff, colleague, admin):
            client = APIClient()
            if viewer:
                client.force_authenticate(viewer)
            for course in (draft, in_review):
                self.assertEqual(client.get(f"/api/learning/courses/{course.slug}/").status_code, 404, (viewer, course))
        self.assertEqual(self.api.get(f"/api/learning/courses/{self.course.slug}/").status_code, 200)

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
        lesson = self.own.lessons.create(kind="text", title="V", body="<p>x</p>")
        foreign = CourseModule.objects.create(playlist=self.company_course, title="Theirs")
        with self.assertRaises(ValidationError):
            PlaylistItem(playlist=self.own, lesson=lesson, module=foreign).full_clean()

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


class BuilderPhaseTwoTests(TestCase):
    """Phase 2 backend: lesson minutes, course list counts, and the delete rule."""

    def setUp(self):
        self.api = APIClient()
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.api.force_authenticate(self.pro)
        self.video = publish_video(self.pro, "Ten minutes")
        VideoItem.objects.filter(pk=self.video.pk).update(duration="9:30 min", duration_seconds=570)
        self.post = publish_post(self.pro, "Long read")
        BlogPost.objects.filter(pk=self.post.pk).update(body=[("rich_text", "<p>" + "word " * 450 + "</p>")])
        self.course = Playlist.objects.create(owner=self.pro, title="SCADA", status="published")
        add_lesson(self.course, "Ten minutes", "video", position=0, duration="9:30 min")
        add_lesson(self.course, "Long read", "text", position=1, body="<p>" + "word " * 450 + "</p>")

    def test_lessons_carry_minutes(self):
        items = self.api.get(f"/api/learning/me/courses/{self.course.pk}/").json()["items"]
        self.assertEqual([(i["title"], i["minutes"]) for i in items], [("Ten minutes", 10), ("Long read", 3)])

    def test_company_lesson_minutes(self):
        from organizations.models import Company
        from pages.models import TechArticle, Whitepaper
        from .serializers import lesson_minutes
        genex = Company.objects.create(name="Genex", slug="genex")
        article = TechArticle.objects.create(title="A", read_time="8 Mins Read", date=TODAY, excerpt="e", company=genex)
        paper = Whitepaper.objects.create(title="W", date=TODAY, pages="12 pages", description="d", company=genex)
        self.assertEqual((lesson_minutes(article, "article"), lesson_minutes(paper, "whitepaper")), (8, 24))

    def test_list_shows_learners_and_delete_rule(self):
        learner = make_user("learner")
        Enrollment.objects.create(user=learner, playlist=self.course)
        row = self.api.get("/api/learning/me/courses/").json()[0]
        self.assertEqual((row["enrolled_count"], row["can_delete"]), (1, False))
        self.assertEqual(self.api.delete(f"/api/learning/me/courses/{self.course.pk}/").status_code, 400)
        self.assertTrue(Playlist.objects.filter(pk=self.course.pk).exists())

        draft = Playlist.objects.create(owner=self.pro, title="Draft")
        self.assertTrue(self.api.get(f"/api/learning/me/courses/{draft.pk}/").json()["can_delete"])
        self.assertEqual(self.api.delete(f"/api/learning/me/courses/{draft.pk}/").status_code, 204)


class CourseReviewTests(TestCase):
    """Phase 3: who may review, one review per learner, moderation, filters, ratings from 3 reviews."""

    def setUp(self):
        from .models import ItemProgress
        self.ItemProgress = ItemProgress
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.v1, self.v2 = publish_video(self.pro, "One"), publish_video(self.pro, "Two")
        self.course = Playlist.objects.create(owner=self.pro, title="SCADA", status="published")
        self.i1 = add_lesson(self.course, self.v1.title, "video", position=0)
        self.i2 = add_lesson(self.course, self.v2.title, "video", position=1)
        self.url = f"/api/learning/courses/{self.course.slug}/reviews/"

    def _learner(self, name, lessons=1, rating=None, body=""):
        user = make_user(name)
        Enrollment.objects.create(user=user, playlist=self.course)
        for item in [self.i1, self.i2][:lessons]:
            self.ItemProgress.objects.create(user=user, item=item)
        if rating:
            api = APIClient()
            api.force_authenticate(user)
            api.put(self.url + "me/", {"rating": rating, "body": body}, format="json")
        return user

    def test_only_enrolled_learners_with_progress_can_review(self):
        api = APIClient()
        self.assertEqual(api.put(self.url + "me/", {"rating": 5}, format="json").status_code, 401)
        stranger = make_user("stranger")
        api.force_authenticate(stranger)
        self.assertEqual(api.put(self.url + "me/", {"rating": 5}, format="json").status_code, 403)
        Enrollment.objects.create(user=stranger, playlist=self.course)
        state = api.get(self.url + "me/").json()
        self.assertEqual((state["can_review"], state["reason"]), (False, "Finish at least one lesson to review this course."))
        self.ItemProgress.objects.create(user=stranger, item=self.i1)
        self.assertEqual(api.put(self.url + "me/", {"rating": 4, "body": " Useful. "}, format="json").status_code, 201)
        self.assertEqual(api.get(self.url + "me/").json()["review"]["body"], "Useful.")

    def test_owner_cannot_review_their_own_course(self):
        api = APIClient()
        api.force_authenticate(self.pro)
        Enrollment.objects.create(user=self.pro, playlist=self.course)
        self.ItemProgress.objects.create(user=self.pro, item=self.i1)
        self.assertEqual(api.put(self.url + "me/", {"rating": 5}, format="json").status_code, 403)

    def test_editing_keeps_one_review_and_notifies_the_owner_once(self):
        learner = self._learner("ana", rating=3)
        api = APIClient()
        api.force_authenticate(learner)
        res = api.put(self.url + "me/", {"rating": 5, "body": "Better on a second pass."}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(CourseReview.objects.get().rating, 5)
        self.assertEqual(Notification.objects.filter(recipient=self.pro, kind="course_review").count(), 1)
        self.assertEqual(api.delete(self.url + "me/").status_code, 204)
        self.assertFalse(CourseReview.objects.exists())

    def test_rating_shows_from_three_visible_reviews_and_ignores_hidden_ones(self):
        self._learner("a", rating=5)
        self._learner("b", rating=4)
        card = APIClient().get("/api/learning/courses/").json()["results"][0]
        self.assertIsNone(card["rating"])
        self._learner("c", rating=3)
        self.assertEqual(APIClient().get("/api/learning/courses/").json()["results"][0]["rating"], {"average": 4.0, "count": 3})
        CourseReview.objects.filter(rating=3).update(status="hidden")
        self.assertIsNone(APIClient().get("/api/learning/courses/").json()["results"][0]["rating"])

    def test_list_filters_and_completed_flag(self):
        self._learner("finisher", lessons=2, rating=5, body="Great")
        self._learner("starter", lessons=1, rating=3, body="Okay")
        hidden = self._learner("rude", lessons=1, rating=1, body="Spam")
        CourseReview.objects.filter(user=hidden).update(status="hidden")
        rows = APIClient().get(self.url).json()["results"]
        self.assertEqual({(r["author"]["username"], r["completed_course"]) for r in rows}, {("finisher", True), ("starter", False)})
        self.assertEqual([r["rating"] for r in APIClient().get(self.url + "?rating=5").json()["results"]], [5])
        self.assertEqual([r["rating"] for r in APIClient().get(self.url + "?rating_max=3").json()["results"]], [3])
        self.assertEqual([r["author"]["username"] for r in APIClient().get(self.url + "?completed=1").json()["results"]], ["finisher"])

    def test_drafts_have_no_reviews_endpoint(self):
        draft = Playlist.objects.create(owner=self.pro, title="Draft")
        self.assertEqual(APIClient().get(f"/api/learning/courses/{draft.slug}/reviews/").status_code, 404)

    def test_admin_can_hide_and_show(self):
        from .admin import CourseReviewAdmin
        self._learner("x", rating=2)
        model_admin = CourseReviewAdmin(CourseReview, AdminSite())
        model_admin.hide(RequestFactory().post("/"), CourseReview.objects.all())
        self.assertEqual(CourseReview.objects.get().status, "hidden")
        model_admin.show(RequestFactory().post("/"), CourseReview.objects.all())
        self.assertEqual(CourseReview.objects.get().status, "visible")
        self.assertFalse(model_admin.has_add_permission(RequestFactory().get("/")))


class SeedCourseDemoTests(TestCase):
    def setUp(self):
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.course = Playlist.objects.create(owner=self.pro, title="Live", status="published")
        add_lesson(self.course, publish_video(self.pro, "V").title, "video", position=0)

    def test_seed_adds_demo_data_and_clear_removes_it(self):
        from django.core.management import call_command
        from django.test import override_settings
        with override_settings(DEBUG=True):
            call_command("seed_course_demo", stdout=io.StringIO())
            call_command("seed_course_demo", stdout=io.StringIO())  # running twice adds nothing new
            self.assertEqual(User.objects.filter(username__startswith="demo_").count(), 16)
            self.assertTrue(Enrollment.objects.filter(playlist=self.course).exists())
            self.assertEqual(CourseReview.objects.filter(user__username__startswith="demo_").count(),
                             CourseReview.objects.count())
            call_command("seed_course_demo", "--clear", stdout=io.StringIO())
        self.assertFalse(User.objects.filter(username__startswith="demo_").exists())
        self.assertFalse(Enrollment.objects.exists())
        self.assertFalse(CourseReview.objects.exists())

    def test_seed_refuses_without_debug(self):
        from django.core.management import call_command
        from django.core.management.base import CommandError
        from django.test import override_settings
        with override_settings(DEBUG=False), self.assertRaises(CommandError):
            call_command("seed_course_demo", stdout=io.StringIO())


class CoursePageApiTests(TestCase):
    """Phase 4: the full course page payload and the related-courses tabs."""

    def setUp(self):
        from organizations.models import Company
        from pages.models import TechArticle
        from .models import CareerRole, CourseFAQ, CourseModule, ItemProgress
        self.ItemProgress = ItemProgress
        self.genex = Company.objects.create(name="Genex", slug="genex", description="Monitoring software.")
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng", display_name="Priya")
        self.v1, self.v2 = publish_video(self.pro, "One"), publish_video(self.pro, "Two")
        VideoItem.objects.filter(pk=self.v1.pk).update(duration_seconds=600)
        VideoItem.objects.filter(pk=self.v2.pk).update(duration_seconds=300)
        self.post = publish_post(self.pro, "Three")
        self.role = CareerRole.objects.get(slug="scada-engineer")
        self.course = Playlist.objects.create(owner=self.pro, title="SCADA", status="published", level="intermediate",
                                              summary="How plants are monitored.", outcomes=["Map registers"])
        self.course.roles.add(self.role)
        module = CourseModule.objects.create(playlist=self.course, title="Basics", position=0)
        self.i1 = add_lesson(self.course, "One", "video", position=0, module=module, duration="10:00 min")
        self.i2 = add_lesson(self.course, "Two", "video", position=1, module=module, duration="5:00 min")
        self.i3 = add_lesson(self.course, "Three", "text", position=2)
        CourseFAQ.objects.create(playlist=self.course, question="Do I need experience?", answer="No.")
        self.url = f"/api/learning/courses/{self.course.slug}/"

        self.staff = make_user("staff", account_type="company", company=self.genex)
        self.article = TechArticle.objects.create(title="SLD", read_time="8 min", date=TODAY, excerpt="e", company=self.genex)

    def _company_course(self, **kwargs):
        course = Playlist.objects.create(owner=self.staff, company=self.genex, status="published", **kwargs)
        add_lesson(course, self.article.title, "text", position=0)
        return course

    def _verified_pro(self, username, company):
        user = make_user(username, account_type="professional", company=company, role_title="Engineer")
        User.objects.filter(pk=user.pk).update(company_verified=True)
        user.refresh_from_db()
        return user

    def test_page_fields(self):
        self.course.reading.create(post=self.post)
        data = APIClient().get(self.url).json()
        self.assertEqual((data["summary"], data["outcomes"], data["language"]), ("How plants are monitored.", ["Map registers"], "English"))
        self.assertEqual(data["lesson_counts"], {"video": 2, "text": 1})
        # Further reading comes separately and adds nothing to the lessons or the time.
        self.assertEqual([(r["kind"], r["title"], r["is_locked"]) for r in data["reading"]], [("post", "Three", False)])
        self.assertEqual(len(data["items"]), 3)
        self.assertEqual(data["total_minutes"], 15 + data["items"][2]["minutes"])
        self.assertEqual([(m["title"], m["item_ids"], m["minutes"]) for m in data["modules"]], [("Basics", [self.i1.pk, self.i2.pk], 15)])
        self.assertEqual(data["faqs"], [{"question": "Do I need experience?", "answer": "No."}])
        self.assertIsNone(data["my_review"])
        self.assertIsNone(data["rating_summary"])
        self.assertEqual(data["learner_companies"], [])

    def test_next_lesson_for_an_enrolled_learner(self):
        learner = make_user("learner")
        Enrollment.objects.create(user=learner, playlist=self.course)
        self.ItemProgress.objects.create(user=learner, item=self.i1)
        api = APIClient()
        api.force_authenticate(learner)
        data = api.get(self.url).json()
        self.assertEqual(data["next_item_id"], self.i2.pk)
        self.assertEqual(data["my_review"]["can_review"], True)

    def test_instructors_and_publisher(self):
        data = APIClient().get(self.url).json()
        self.assertEqual([p["username"] for p in data["instructors"]], ["pro"])
        self.assertEqual(data["instructors"][0]["course_count"], 1)
        self.assertIsNone(data["publisher"])  # an unlisted company is never "Offered by"

        company_course = self._company_course(title="Company course")
        data = APIClient().get(f"/api/learning/courses/{company_course.slug}/").json()
        self.assertEqual(data["instructors"], [])
        self.assertEqual((data["publisher"]["name"], data["publisher"]["description"]), ("Genex", "Monitoring software."))
        self.assertEqual(data["publisher"]["counts"]["courses"], 1)

        teacher = self._verified_pro("teacher", self.genex)
        company_course.instructors.add(teacher)
        data = APIClient().get(f"/api/learning/courses/{company_course.slug}/").json()
        self.assertEqual([p["username"] for p in data["instructors"]], ["teacher"])

    def test_career_path_steps(self):
        beginner = Playlist.objects.create(owner=self.pro, title="Intro", status="published", level="beginner")
        beginner.roles.add(self.role)
        Playlist.objects.create(owner=self.pro, title="Draft advanced", level="advanced").roles.add(self.role)
        path = APIClient().get(self.url).json()["roles"][0]["path"]
        self.assertEqual([(s["level"], s["is_current"], s["course"]["title"]) for s in path],
                         [("beginner", False, "Intro"), ("intermediate", True, "SCADA")])

    def test_learner_companies_need_three_verified_companies(self):
        from organizations.models import Company
        for i in range(3):
            company = Company.objects.create(name=f"Co {i}", slug=f"co-{i}")
            Enrollment.objects.create(user=self._verified_pro(f"eng{i}", company), playlist=self.course)
            names = [c["name"] for c in APIClient().get(self.url).json()["learner_companies"]]
            self.assertEqual(len(names), 3 if i == 2 else 0)

    def test_rating_summary_and_first_reviews(self):
        for i, stars in enumerate([5, 5, 4]):
            user = make_user(f"r{i}")
            Enrollment.objects.create(user=user, playlist=self.course)
            CourseReview.objects.create(user=user, playlist=self.course, rating=stars)
        data = APIClient().get(self.url).json()
        self.assertEqual((data["rating_summary"]["average"], data["rating_summary"]["count"]), (4.7, 3))
        self.assertEqual([d["percent"] for d in data["rating_summary"]["distribution"]], [67, 33, 0, 0, 0])
        self.assertEqual(len(data["reviews"]), 3)

    def test_related_tabs_skip_empty_ones_and_this_course(self):
        from pages.models import Topic
        topic = Topic.objects.first()
        self.course.topics.add(topic)
        other = Playlist.objects.create(owner=self.pro, title="Other", status="published")
        other.topics.add(topic)
        tabs = APIClient().get(f"{self.url}related/").json()
        self.assertEqual([(t["key"], [c["title"] for c in t["courses"]]) for t in tabs],
                         [("topic", ["Other"]), ("publisher", ["Other"])])

    def test_enrollment_list_stays_light(self):
        learner = make_user("learner")
        Enrollment.objects.create(user=learner, playlist=self.course)
        api = APIClient()
        api.force_authenticate(learner)
        row = api.get("/api/learning/me/enrollments/").json()["results"][0]
        self.assertIn("enrollment", row)
        self.assertNotIn("instructors", row)


class OwnCourseLockTests(TestCase):
    """Owners and instructors can't enroll in or review their own course, on either account type."""

    def setUp(self):
        from organizations.models import Company
        self.genex = Company.objects.create(name="Genex", slug="genex")
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.staff = make_user("staff", account_type="company", company=self.genex)
        self.colleague = make_user("staff2", account_type="company", company=self.genex)
        self.teacher = make_user("teacher", account_type="professional", company=self.genex)
        User.objects.filter(pk=self.teacher.pk).update(company_verified=True)
        self.learner = make_user("learner")
        self.pro_course = Playlist.objects.create(owner=self.pro, title="Pro course", status="published")
        add_lesson(self.pro_course, publish_video(self.pro, "One").title, "video", position=0)
        self.co_course = Playlist.objects.create(owner=self.staff, company=self.genex, title="Company course", status="published")
        add_lesson(self.co_course, publish_video(self.pro, "Two").title, "video", position=0)
        self.co_course.instructors.add(self.teacher)

    def _enroll(self, user, course):
        api = APIClient()
        api.force_authenticate(user)
        return api.post(f"/api/learning/courses/{course.slug}/enroll/")

    def test_relation_to(self):
        self.assertEqual(self.pro_course.relation_to(self.pro), "owner")
        self.assertEqual(self.co_course.relation_to(self.staff), "owner")
        self.assertEqual(self.co_course.relation_to(self.colleague), "owner")
        self.assertEqual(self.co_course.relation_to(self.teacher), "instructor")
        self.assertIsNone(self.co_course.relation_to(self.learner))
        self.assertIsNone(self.pro_course.relation_to(self.staff))

    def test_owners_and_instructors_cannot_enroll(self):
        for user, course, detail in [
            (self.pro, self.pro_course, "You can't enroll in your own course."),
            (self.staff, self.co_course, "You can't enroll in your own course."),
            (self.colleague, self.co_course, "You can't enroll in your own course."),
            (self.teacher, self.co_course, "You can't enroll in a course you teach."),
        ]:
            response = self._enroll(user, course)
            self.assertEqual((response.status_code, response.json()["detail"]), (403, detail), user.username)
        self.assertFalse(Enrollment.objects.exists())
        self.assertEqual(self._enroll(self.learner, self.co_course).status_code, 200)
        self.assertEqual(self._enroll(self.pro, self.co_course).status_code, 200)

    def test_page_reports_relation_and_review_reason(self):
        api = APIClient()
        api.force_authenticate(self.teacher)
        page = api.get(f"/api/learning/courses/{self.co_course.slug}/").json()
        self.assertEqual(page["my_relation"], "instructor")
        self.assertEqual(page["my_review"]["reason"], "You can't review a course you teach.")
        api.force_authenticate(self.learner)
        self.assertIsNone(api.get(f"/api/learning/courses/{self.co_course.slug}/").json()["my_relation"])

    def test_admin_refuses_self_enrolment(self):
        from django.core.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            Enrollment(user=self.teacher, playlist=self.co_course).full_clean()
        Enrollment(user=self.learner, playlist=self.co_course).full_clean()


class CourseRevisionTests(TestCase):
    """Phase 8: a live course stays up while edits wait for review; approving applies them."""

    def setUp(self):
        from organizations.models import Company
        from pages.models import TechArticle
        self.api = APIClient()
        self.root = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.learner = make_user("learner")
        self.v1, self.v2 = publish_video(self.pro, "One"), publish_video(self.pro, "Two")
        self.course = Playlist.objects.create(owner=self.pro, title="SCADA basics", summary="Old promise", status="published")
        self.i1 = add_lesson(self.course, self.v1.title, "video", position=0)
        genex = Company.objects.create(name="Genex", slug="genex")
        self.staff = make_user("staff", account_type="company", company=genex)
        self.article = TechArticle.objects.create(title="SLD guide", read_time="8 min", date=TODAY, excerpt="e", company=genex)
        self.co_course = Playlist.objects.create(owner=self.staff, company=genex, title="Company course", status="published")
        add_lesson(self.co_course, self.article.title, "text", position=0)

    def _admin(self, action, *courses):
        request = RequestFactory().post("/")
        request.user = self.root
        request._messages = type("M", (), {"add": lambda *a, **k: None})()
        getattr(PlaylistAdmin(Playlist, AdminSite()), action)(request, Playlist.objects.filter(pk__in=[c.pk for c in courses]))
        for c in courses:
            c.refresh_from_db()

    def test_live_page_keeps_the_old_version_until_approved(self):
        from .models import CourseRevision, ItemProgress
        Enrollment.objects.create(user=self.learner, playlist=self.course)
        ItemProgress.objects.create(user=self.learner, item=self.i1)
        two = self.course.lessons.create(kind="text", title="Two", body="<p>x</p>", approved=True)
        self.api.force_authenticate(self.pro)
        self.api.patch(f"/api/learning/me/courses/{self.course.pk}/", {"title": "SCADA fundamentals", "summary": "New promise"}, format="json")
        self.api.put(f"/api/learning/me/courses/{self.course.pk}/outline/", {
            "modules": [{"title": "Start here", "items": [{"kind": "lesson", "id": self.i1.lesson_id}, {"kind": "lesson", "id": two.pk}]}],
        }, format="json")
        self.api.put(f"/api/learning/me/courses/{self.course.pk}/faqs/", [{"question": "Free?", "answer": "Yes."}], format="json")

        builder = self.api.get(f"/api/learning/me/courses/{self.course.pk}/").json()
        self.assertEqual((builder["status"], builder["title"], builder["revision"]["status"]), ("published", "SCADA fundamentals", "pending"))
        self.assertEqual(builder["revision"]["changed"], ["faqs", "outline", "summary", "title"])
        page = APIClient().get(f"/api/learning/courses/{self.course.slug}/").json()
        self.assertEqual((page["title"], page["summary"], len(page["items"]), page["faqs"]), ("SCADA basics", "Old promise", 1, []))

        self._admin("approve", self.course)
        self.assertEqual((self.course.status, self.course.title, self.course.summary), ("published", "SCADA fundamentals", "New promise"))
        self.assertFalse(CourseRevision.objects.filter(playlist=self.course).exists())
        self.assertEqual(list(self.course.modules.values_list("title", flat=True)), ["Start here"])
        self.assertEqual(self.course.items.count(), 2)
        self.assertTrue(ItemProgress.objects.filter(user=self.learner, item=self.i1).exists())  # progress kept
        self.assertEqual(list(self.course.faqs.values_list("question", flat=True)), ["Free?"])
        self.assertTrue(Notification.objects.filter(recipient=self.pro, text__contains="changes").exists())

    def test_reject_keeps_live_version_and_a_new_save_resubmits(self):
        from .models import CourseRevision
        self.api.force_authenticate(self.pro)
        self.api.patch(f"/api/learning/me/courses/{self.course.pk}/", {"summary": "Overpromise"}, format="json")
        CourseRevision.objects.filter(playlist=self.course).update(rejection_reason="Too vague.")
        self._admin("reject", self.course)
        revision = CourseRevision.objects.get(playlist=self.course)
        self.assertEqual((self.course.status, self.course.summary, revision.status), ("published", "Old promise", "rejected"))
        info = self.api.get(f"/api/learning/me/courses/{self.course.pk}/").json()["revision"]
        self.assertEqual((info["status"], info["rejection_reason"]), ("rejected", "Too vague."))
        self.api.patch(f"/api/learning/me/courses/{self.course.pk}/", {"summary": "A clear promise"}, format="json")
        revision.refresh_from_db()
        self.assertEqual((revision.status, revision.rejection_reason), ("pending", ""))

    def test_withdraw_drops_the_changes(self):
        from .models import CourseRevision
        self.api.force_authenticate(self.pro)
        self.api.patch(f"/api/learning/me/courses/{self.course.pk}/", {"title": "Renamed"}, format="json")
        res = self.api.delete(f"/api/learning/me/courses/{self.course.pk}/revision/")
        self.assertEqual((res.status_code, res.json()["title"], res.json()["revision"]), (200, "SCADA basics", None))
        self.assertFalse(CourseRevision.objects.exists())

    def test_company_courses_work_the_same(self):
        self.api.force_authenticate(self.staff)
        self.api.patch(f"/api/learning/me/courses/{self.co_course.pk}/", {"description": "Updated"}, format="json")
        self.co_course.refresh_from_db()
        self.assertEqual((self.co_course.status, self.co_course.description, self.co_course.revision.changes), ("published", "", {"description": "Updated"}))
        self._admin("approve", self.co_course)
        self.assertEqual(self.co_course.description, "Updated")

    def test_approve_skips_lessons_deleted_while_waiting(self):
        self.api.force_authenticate(self.pro)
        self.api.put(f"/api/learning/me/courses/{self.course.pk}/outline/", {
            "modules": [{"title": "New", "items": [{"kind": "video", "id": self.v1.pk}, {"kind": "video", "id": self.v2.pk}]}],
        }, format="json")
        self.v2.delete()
        self._admin("approve", self.course)
        self.assertEqual(self.course.items.count(), 1)


class ReviewReplyTests(TestCase):
    """Phase 9: the course team answers reviews; one reply per review; Genex can hide it."""

    def setUp(self):
        from organizations.models import Company
        from pages.models import TechArticle
        from .models import ItemProgress
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng", display_name="Priya")
        self.course = Playlist.objects.create(owner=self.pro, title="SCADA", status="published")
        item = add_lesson(self.course, publish_video(self.pro, "One").title, "video", position=0)
        self.learner = make_user("learner")
        Enrollment.objects.create(user=self.learner, playlist=self.course)
        ItemProgress.objects.create(user=self.learner, item=item)
        self.review = CourseReview.objects.create(user=self.learner, playlist=self.course, rating=3, body="What about DNP3?")
        self.url = f"/api/learning/courses/{self.course.slug}/reviews/{self.review.pk}/reply/"

        genex = Company.objects.create(name="Genex", slug="genex")
        self.staff = make_user("staff", account_type="company", company=genex)
        self.teacher = make_user("teacher", account_type="professional", company=genex, display_name="Ravi")
        User.objects.filter(pk=self.teacher.pk).update(company_verified=True)
        self.co_course = Playlist.objects.create(owner=self.staff, company=genex, title="Company course", status="published")
        co_item = add_lesson(self.co_course, TechArticle.objects.create(title="SLD", read_time="8 min", date=TODAY, excerpt="e", company=genex).title, "text", position=0)
        self.co_course.instructors.add(self.teacher)
        Enrollment.objects.create(user=self.learner, playlist=self.co_course)
        ItemProgress.objects.create(user=self.learner, item=co_item)
        self.co_review = CourseReview.objects.create(user=self.learner, playlist=self.co_course, rating=4)

    def _as(self, user):
        api = APIClient()
        api.force_authenticate(user)
        return api

    def test_owner_replies_once_edits_and_learner_is_notified(self):
        self.assertEqual(self._as(self.learner).put(self.url, {"body": "Me too"}, format="json").status_code, 403)
        self.assertEqual(self._as(self.pro).put(self.url, {"body": "  "}, format="json").status_code, 400)
        res = self._as(self.pro).put(self.url, {"body": "Module 2 covers DNP3."}, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual((res.json()["reply"]["label"], res.json()["reply"]["author"]["display_name"]), ("Instructor", "Priya"))
        self.assertEqual(Notification.objects.filter(recipient=self.learner, kind="review_reply").count(), 1)
        self.assertEqual(self._as(self.pro).put(self.url, {"body": "Module 2, lesson 3."}, format="json").status_code, 200)
        self.assertEqual(Notification.objects.filter(recipient=self.learner, kind="review_reply").count(), 1)  # edits don't notify again
        page = APIClient().get(f"/api/learning/courses/{self.course.slug}/").json()
        self.assertEqual((page["reviews"][0]["reply"]["body"], page["reviews"][0]["can_reply"]), ("Module 2, lesson 3.", False))
        listed = self._as(self.pro).get(f"/api/learning/courses/{self.course.slug}/reviews/").json()["results"]
        self.assertTrue(listed[0]["can_reply"])
        self.assertEqual(self._as(self.pro).delete(self.url).status_code, 204)
        self.assertIsNone(APIClient().get(f"/api/learning/courses/{self.course.slug}/").json()["reviews"][0]["reply"])

    def test_hidden_reply_shows_only_to_the_course_team(self):
        from .models import ReviewReply
        ReviewReply.objects.create(review=self.review, author=self.pro, body="Rude reply", status=ReviewReply.STATUS_HIDDEN)
        self.assertIsNone(APIClient().get(f"/api/learning/courses/{self.course.slug}/").json()["reviews"][0]["reply"])
        mine = self._as(self.pro).get(f"/api/learning/courses/{self.course.slug}/").json()["reviews"][0]["reply"]
        self.assertEqual(mine["status"], "hidden")

    def test_company_course_team_replies_as_the_publisher_or_instructor(self):
        url = f"/api/learning/courses/{self.co_course.slug}/reviews/{self.co_review.pk}/reply/"
        res = self._as(self.staff).put(url, {"body": "Thanks!"}, format="json")
        self.assertEqual((res.json()["reply"]["label"], res.json()["reply"]["author"]["display_name"]), ("Course publisher", "Genex"))
        res = self._as(self.teacher).put(url, {"body": "Glad it helped."}, format="json")  # the team shares one reply
        self.assertEqual((res.status_code, res.json()["reply"]["label"]), (200, "Instructor"))
        self.assertEqual(self._as(self.pro).put(url, {"body": "x"}, format="json").status_code, 403)

    def test_cannot_reply_to_a_hidden_review_and_admin_refuses_outsiders(self):
        from django.core.exceptions import ValidationError
        from .models import ReviewReply
        self.review.status = CourseReview.STATUS_HIDDEN
        self.review.save()
        self.assertEqual(self._as(self.pro).put(self.url, {"body": "Hi"}, format="json").status_code, 404)
        with self.assertRaises(ValidationError):
            ReviewReply(review=self.co_review, author=self.pro, body="Not mine").full_clean()


class CertificateTests(TestCase):
    """Certification C1: a lesson counts when opened from the course; finishing issues a certificate."""

    def setUp(self):
        from organizations.models import Company
        from pages.models import TechArticle
        self.genex = Company.objects.create(name="Genex", slug="genex")
        self.pro = make_user("pro", account_type="professional", company=self.genex, role_title="SCADA Lead", display_name="R. Mehta")
        User.objects.filter(pk=self.pro.pk).update(company_verified=True)
        self.pro.refresh_from_db()
        self.course = Playlist.objects.create(owner=self.pro, title="SCADA basics", status="published", level="beginner")
        self.i1 = add_lesson(self.course, publish_video(self.pro, "One").title, "video", position=0)
        self.i2 = add_lesson(self.course, publish_video(self.pro, "Two").title, "video", position=1)
        self.learner = make_user("learner", display_name="Priya Nair")
        self.api = APIClient()
        self.api.force_authenticate(self.learner)
        self.api.post(f"/api/learning/courses/{self.course.slug}/enroll/")

        self.staff = make_user("staff", account_type="company", company=self.genex)
        self.teacher = make_user("teacher", account_type="professional", company=self.genex, role_title="Protection Engineer")
        User.objects.filter(pk=self.teacher.pk).update(company_verified=True)
        self.co_course = Playlist.objects.create(owner=self.staff, company=self.genex, title="Company course", status="published")
        self.co_item = add_lesson(self.co_course, TechArticle.objects.create(title="SLD", read_time="8 min", date=TODAY, excerpt="e", company=self.genex).title, "text", position=0)
        self.co_course.instructors.add(self.teacher)

    def _open(self, item, course=None):
        return self.api.post(f"/api/learning/courses/{(course or self.course).slug}/items/{item.pk}/open/")

    def test_opening_every_lesson_issues_one_certificate_and_notifies(self):
        from .models import Certificate
        self.assertIsNone(self._open(self.i1).json()["certificate_code"])
        code = self._open(self.i2).json()["certificate_code"]
        self.assertRegex(code, r"^GL-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$")
        self.assertEqual(self._open(self.i2).json()["certificate_code"], code)  # opening again: same certificate
        self.assertEqual(Certificate.objects.count(), 1)
        self.assertTrue(Notification.objects.filter(recipient=self.learner, kind="certificate").exists())
        page = APIClient().get(f"/api/learning/certificates/{code}/").json()
        self.assertEqual((page["learner_name"], page["course"]["title"], page["course"]["lessons"], page["is_mine"]), ("Priya Nair", "SCADA basics", 2, False))
        self.assertEqual(page["instructors"], [{"name": "R. Mehta", "username": "pro", "role_title": "SCADA Lead", "company": {"name": "Genex", "logo_url": None}}])
        self.assertEqual(page["publisher"]["name"], "Genex")
        course_page = self.api.get(f"/api/learning/courses/{self.course.slug}/").json()
        self.assertEqual(course_page["enrollment"]["certificate_code"], code)
        self.assertEqual([c["code"] for c in self.api.get("/api/learning/me/certificates/").json()], [code])

    def test_opening_outside_the_course_or_before_enrolling_does_not_count(self):
        from .models import ItemProgress
        other = make_user("other")
        api = APIClient()
        api.force_authenticate(other)
        self.assertEqual(api.post(f"/api/learning/courses/{self.course.slug}/items/{self.i1.pk}/open/").status_code, 403)
        api.post(f"/api/learning/courses/{self.course.slug}/enroll/")
        self.assertFalse(ItemProgress.objects.filter(user=other).exists())  # enrolling later starts from nothing
        self.assertEqual(api.get(f"/api/learning/courses/{self.course.slug}/").json()["enrollment"]["completed"], 0)

    def test_snapshot_is_frozen_and_name_can_be_corrected_once(self):
        code = (self._open(self.i1), self._open(self.i2))[1].json()["certificate_code"]
        self.course.title = "Renamed later"
        self.course.save()
        self.assertEqual(APIClient().get(f"/api/learning/certificates/{code}/").json()["course"]["title"], "SCADA basics")
        url = f"/api/learning/certificates/{code}/"
        self.assertEqual(APIClient().patch(url, {"learner_name": "Hacker"}, format="json").status_code, 401)  # signed out: renew, then retry
        stranger = APIClient()
        stranger.force_authenticate(make_user("stranger"))
        self.assertEqual(stranger.patch(url, {"learner_name": "Hacker"}, format="json").status_code, 403)
        self.assertEqual(self.api.patch(url, {"learner_name": "x"}, format="json").status_code, 400)
        res = self.api.patch(url, {"learner_name": "  Priya   S. Nair "}, format="json")
        self.assertEqual((res.json()["learner_name"], res.json()["can_correct_name"]), ("Priya S. Nair", False))
        self.assertEqual(self.api.patch(url, {"learner_name": "Again"}, format="json").status_code, 400)

    def test_revoked_certificate_hides_the_learner(self):
        from .models import Certificate
        code = (self._open(self.i1), self._open(self.i2))[1].json()["certificate_code"]
        Certificate.objects.filter(code=code).update(status="revoked", revoked_reason="Shared account.")
        page = APIClient().get(f"/api/learning/certificates/{code}/").json()
        self.assertEqual((page["status"], page["revoked_reason"], "learner_name" in page), ("revoked", "", False))
        self.assertEqual(self.api.get(f"/api/learning/certificates/{code.lower()}/").json()["revoked_reason"], "Shared account.")
        self.assertIsNone(self.api.get(f"/api/learning/courses/{self.course.slug}/").json()["enrollment"]["certificate_code"])

    def test_company_course_prints_listed_instructors_and_company(self):
        self.api.post(f"/api/learning/courses/{self.co_course.slug}/enroll/")
        code = self._open(self.co_item, self.co_course).json()["certificate_code"]
        page = APIClient().get(f"/api/learning/certificates/{code}/").json()
        self.assertEqual([(p["name"], p["role_title"]) for p in page["instructors"]], [("teacher", "Protection Engineer")])
        self.assertEqual(page["publisher"]["name"], "Genex")

    def test_removing_the_last_unopened_lesson_issues_the_certificate(self):
        from .models import Certificate
        from .revisions import apply_outline
        self._open(self.i1)
        self.assertFalse(Certificate.objects.exists())
        apply_outline(self.course, {"modules": [{"title": "M", "items": [{"kind": "lesson", "id": self.i1.lesson_id}]}], "loose_items": []})
        self.assertEqual(Certificate.objects.filter(user=self.learner).count(), 1)

    def test_backfill_command_is_idempotent(self):
        from django.core.management import call_command
        from .models import Certificate, ItemProgress
        ItemProgress.objects.create(user=self.learner, item=self.i1)
        ItemProgress.objects.create(user=self.learner, item=self.i2)
        out = io.StringIO()
        call_command("issue_certificates", stdout=out)
        call_command("issue_certificates", stdout=out)
        self.assertEqual(Certificate.objects.count(), 1)
        self.assertIn("Issued 1", out.getvalue())


class CertificateFilesTests(TestCase):
    """Certification C3: PDF, link-preview picture and share page, public-profile opt-in."""

    def setUp(self):
        from django.core.cache import cache
        from .models import Certificate
        cache.clear()
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng", display_name="R. Mehta")
        self.learner = make_user("learner", display_name="Priya Nair")
        course = Playlist.objects.create(owner=self.pro, title="SCADA basics", status="published")
        self.certificate = Certificate.objects.create(
            code="GL-ABCD-EFGH", user=self.learner, playlist=course, learner_name="Priya Nair", issued_at=timezone.now(),
            snapshot={"course": {"title": "SCADA basics", "slug": course.slug, "level": "", "lessons": 3, "minutes": 40},
                      "instructors": [{"name": "R. Mehta", "username": "pro", "role_title": "Eng", "company": None}], "publisher": None},
        )
        self.base = "/api/learning/certificates/GL-ABCD-EFGH/"

    def test_pdf_is_for_the_learner_only(self):
        self.assertEqual(APIClient().get(self.base + "pdf/").status_code, 401)
        other = APIClient()
        other.force_authenticate(self.pro)
        self.assertEqual(other.get(self.base + "pdf/").status_code, 404)
        api = APIClient()
        api.force_authenticate(self.learner)
        res = api.get(self.base + "pdf/")
        self.assertEqual((res.status_code, res["Content-Type"]), (200, "application/pdf"))
        self.assertTrue(res.content.startswith(b"%PDF"))
        self.assertIn("GeLearn-certificate-GL-ABCD-EFGH.pdf", res["Content-Disposition"])

    def test_preview_picture_and_share_page(self):
        res = APIClient().get(self.base + "image.png")
        self.assertEqual((res.status_code, res["Content-Type"]), (200, "image/png"))
        self.assertTrue(res.content.startswith(b"\x89PNG"))
        big = APIClient().get(self.base + "image.png?download=1")
        self.assertIn('filename="GeLearn-certificate-GL-ABCD-EFGH.png"', big["Content-Disposition"])
        self.assertGreater(len(big.content), len(res.content))  # the sharper download
        page = APIClient().get(self.base + "share/").content.decode()
        self.assertIn('property="og:title" content="Priya Nair completed SCADA basics on GeLearn"', page)
        self.assertIn("/api/learning/certificates/GL-ABCD-EFGH/image.png", page)
        self.assertIn('http-equiv="refresh" content="0; url=http://localhost:5173/certificates/GL-ABCD-EFGH"', page)

    def test_revoked_certificate_has_no_picture_or_pdf(self):
        self.certificate.status = "revoked"
        self.certificate.save()
        self.assertEqual(APIClient().get(self.base + "image.png").status_code, 404)
        self.assertNotIn("og:image", APIClient().get(self.base + "share/").content.decode())

    def test_public_profile_lists_certificates_only_when_switched_on(self):
        url = "/api/learning/certificates/?user=learner"
        self.assertEqual(APIClient().get(url).json(), [])
        api = APIClient()
        api.force_authenticate(self.learner)
        self.assertEqual(len(api.get(url).json()), 1)  # the learner always sees their own
        self.assertEqual(api.patch("/api/accounts/me/", {"show_certificates": True}, format="json").status_code, 200)
        self.assertEqual([c["code"] for c in APIClient().get(url).json()], ["GL-ABCD-EFGH"])


class CoursePageQueryTests(TestCase):
    """The course page's career paths load in one batch, however many roles and courses there are."""

    def setUp(self):
        from .models import CareerRole
        self.pro = User.objects.create_user("qpro", "qpro@example.org", "Passw0rd!x", account_type="professional", company_other="Acme")
        self.course = Playlist.objects.create(owner=self.pro, title="Main", status="published", level="intermediate")
        self.roles = [CareerRole.objects.create(name=f"Role {i}") for i in range(4)]
        self.client = APIClient()

    def _queries(self):
        from django.db import connection
        from django.test.utils import CaptureQueriesContext
        with CaptureQueriesContext(connection) as ctx:
            res = self.client.get(f"/api/learning/courses/{self.course.slug}/")
        self.assertEqual(res.status_code, 200)
        return len(ctx), res.json()

    def _add_role_with_courses(self, role):
        self.course.roles.add(role)
        for level in ("beginner", "advanced"):
            for n in range(2):
                c = Playlist.objects.create(owner=self.pro, title=f"{role.name} {level} {n}", status="published", level=level)
                c.roles.add(role)

    def test_query_count_does_not_grow_with_roles(self):
        self._add_role_with_courses(self.roles[0])
        one, _ = self._queries()
        for role in self.roles[1:]:
            self._add_role_with_courses(role)
        four, data = self._queries()
        self.assertEqual(four, one)
        self.assertEqual(len(data["roles"]), 4)
        for row in data["roles"]:
            self.assertEqual([p["level"] for p in row["path"]], ["beginner", "intermediate", "advanced"])
            self.assertTrue(next(p for p in row["path"] if p["level"] == "intermediate")["is_current"])

    def test_path_picks_the_most_enrolled_course_per_level(self):
        role = self.roles[0]
        self.course.roles.add(role)
        quiet = Playlist.objects.create(owner=self.pro, title="Quiet", status="published", level="beginner")
        popular = Playlist.objects.create(owner=self.pro, title="Popular", status="published", level="beginner")
        draft = Playlist.objects.create(owner=self.pro, title="Draft", status="draft", level="beginner")
        for c in (quiet, popular, draft):
            c.roles.add(role)
        for i in range(3):
            learner = User.objects.create_user(f"l{i}", f"l{i}@example.org", "Passw0rd!x")
            Enrollment.objects.create(user=learner, playlist=popular)
            Enrollment.objects.create(user=learner, playlist=draft)
        _, data = self._queries()
        beginner = next(p for p in data["roles"][0]["path"] if p["level"] == "beginner")
        self.assertEqual(beginner["course"]["slug"], popular.slug)  # drafts never appear


class CourseLessonBuilderTests(TestCase):
    """Lessons written inside a course (text and video), built by Professionals and Company accounts alike."""

    def setUp(self):
        from organizations.models import Company
        self.api = APIClient()
        self.genex = Company.objects.create(name="Genex", slug="genex")
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.other_pro = make_user("other", account_type="professional", company_other="Acme", role_title="Eng")
        self.staff = make_user("staff", account_type="company", company=self.genex)
        self.colleague = make_user("staff2", account_type="company", company=self.genex)

    def _course(self, user):
        self.api.force_authenticate(user)
        res = self.api.post("/api/learning/me/courses/", {"title": "Protection Basics"}, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        return res.json()["id"]

    def _lessons_url(self, course_id, lesson_id=None):
        base = f"/api/learning/me/courses/{course_id}/lessons/"
        return f"{base}{lesson_id}/" if lesson_id else base

    def _build_and_submit(self, user):
        course_id = self._course(user)
        text = self.api.post(self._lessons_url(course_id), {
            "kind": "text", "title": "Why relays trip", "body": "<p>Overcurrent <script>alert(1)</script>basics.</p>",
        }, format="json")
        self.assertEqual(text.status_code, 201, text.content)
        self.assertNotIn("script", text.json()["body"])
        video = self.api.post(self._lessons_url(course_id), {
            "kind": "video", "title": "Relay testing walkthrough", "video_url": "https://youtu.be/abc123", "duration": "12:30",
        }, format="json")
        self.assertEqual(video.status_code, 201, video.content)
        refs = [{"kind": "lesson", "id": text.json()["id"]}, {"kind": "lesson", "id": video.json()["id"]}]
        res = self.api.put(f"/api/learning/me/courses/{course_id}/outline/", lessons(refs), format="json")
        self.assertEqual(res.status_code, 200, res.content)
        items = res.json()["items"]
        self.assertEqual([(i["kind"], i["lesson_type"], i["meta"]) for i in items],
                         [("lesson", "text", ""), ("lesson", "video", "12:30")])
        self.assertEqual(items[1]["minutes"], 13)
        self.assertEqual(items[0]["path"], f"/courses/{Playlist.objects.get(pk=course_id).slug}/lessons/{text.json()['id']}")
        self.assertEqual(self.api.post(f"/api/learning/me/courses/{course_id}/submit/").status_code, 200)
        return course_id

    def test_professional_builds_and_submits_a_course_of_its_own_lessons(self):
        self._build_and_submit(self.pro)

    def test_company_builds_and_submits_a_course_of_its_own_lessons(self):
        course_id = self._build_and_submit(self.staff)
        self.api.force_authenticate(self.colleague)  # any staff login of the company can edit it
        self.assertEqual(len(self.api.get(self._lessons_url(course_id)).json()), 2)

    def test_other_authors_cant_see_or_change_the_lessons(self):
        course_id = self._course(self.pro)
        lesson = self.api.post(self._lessons_url(course_id), {"kind": "text", "title": "Mine", "body": "<p>x</p>"}, format="json").json()
        for intruder in (self.other_pro, self.staff):
            self.api.force_authenticate(intruder)
            self.assertEqual(self.api.get(self._lessons_url(course_id)).status_code, 404)
            self.assertEqual(self.api.patch(self._lessons_url(course_id, lesson["id"]), {"title": "Hacked"}, format="json").status_code, 404)
            other_course = self._course(intruder)
            res = self.api.put(f"/api/learning/me/courses/{other_course}/outline/", lessons([{"kind": "lesson", "id": lesson["id"]}]), format="json")
            self.assertEqual(res.status_code, 400)  # another course's lesson can't be borrowed

    def test_validation(self):
        course_id = self._course(self.pro)
        url = self._lessons_url(course_id)
        quiz = self.api.post(url, {"kind": "quiz", "title": "Check"}, format="json")
        self.assertEqual((quiz.status_code, quiz.json()["problem"]), (201, "add at least one question"))
        self.assertEqual(self.api.post(url, {"kind": "text", "title": "x"}, format="json").status_code, 400)
        self.assertIn("video_url", self.api.post(url, {"kind": "video", "title": "Clip", "video_url": "javascript:alert(1)"}, format="json").json())
        self.assertIn("duration", self.api.post(url, {"kind": "video", "title": "Clip", "duration": "soon"}, format="json").json())
        lesson = self.api.post(url, {"kind": "text", "title": "Text"}, format="json").json()
        self.assertEqual(self.api.patch(self._lessons_url(course_id, lesson["id"]), {"kind": "video"}, format="json").status_code, 400)

    def test_submit_needs_every_outline_lesson_finished(self):
        course_id = self._course(self.pro)
        empty = self.api.post(self._lessons_url(course_id), {"kind": "video", "title": "Coming soon"}, format="json").json()
        self.api.put(f"/api/learning/me/courses/{course_id}/outline/", lessons([{"kind": "lesson", "id": empty["id"]}]), format="json")
        res = self.api.post(f"/api/learning/me/courses/{course_id}/submit/")
        self.assertEqual(res.status_code, 400)
        self.assertIn("Coming soon", res.json()["items"])

    def test_deleting_a_lesson_takes_it_out_of_the_outline(self):
        course_id = self._course(self.pro)
        lesson = self.api.post(self._lessons_url(course_id), {"kind": "text", "title": "Gone", "body": "<p>x</p>"}, format="json").json()
        self.api.put(f"/api/learning/me/courses/{course_id}/outline/", lessons([{"kind": "lesson", "id": lesson["id"]}]), format="json")
        res = self.api.delete(self._lessons_url(course_id, lesson["id"]))
        self.assertEqual((res.status_code, res.json()["course_revision"]), (200, None))
        self.assertEqual(self.api.get(f"/api/learning/me/courses/{course_id}/").json()["items"], [])

    def test_approval_approves_the_lessons_in_the_outline(self):
        course_id = self._build_and_submit(self.pro)
        spare = Playlist.objects.get(pk=course_id).lessons.create(kind="text", title="Not placed", body="<p>x</p>")
        admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        request = RequestFactory().post("/")
        request.user = admin
        PlaylistAdmin(Playlist, AdminSite()).approve(request, Playlist.objects.filter(pk=course_id))
        course = Playlist.objects.get(pk=course_id)
        self.assertEqual(course.status, "published")
        self.assertTrue(all(course.lessons.exclude(pk=spare.pk).values_list("approved", flat=True)))
        spare.refresh_from_db()
        self.assertFalse(spare.approved)  # not in the outline: reviewed when it's added

    def test_lessons_open_with_their_course(self):
        from commerce.access import has_access
        course = Playlist.objects.create(owner=self.pro, title="Paid", access="paid", price=Decimal("499"))
        lesson = course.lessons.create(kind="text", title="Inside", body="<p>x</p>")
        self.assertTrue(has_access(self.pro, lesson))  # the owner
        self.assertFalse(has_access(self.other_pro, lesson))

    def test_course_length_counts_video_lessons(self):
        from .queries import with_course_stats
        course = Playlist.objects.create(owner=self.pro, title="Clips")
        course.items.create(lesson=course.lessons.create(kind="video", title="One", video_url="https://youtu.be/a", duration="10 min"), position=0)
        course.items.create(lesson=course.lessons.create(kind="text", title="Two", body="<p>x</p>"), position=1)
        self.assertEqual(with_course_stats(Playlist.objects.filter(pk=course.pk)).get().video_seconds, 600)


class CourseLessonLearnerTests(TestCase):
    """Phase 2: learners open a course's own lessons from the course; free previews open for anyone."""

    def setUp(self):
        from organizations.models import Company
        self.api = APIClient()
        self.genex = Company.objects.create(name="Genex", slug="genex")
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.learner = make_user("learner")
        self.stranger = make_user("stranger")
        self.staff = make_user("staff", account_type="company", company=self.genex)
        self.video = publish_video(self.pro, "Published clip")
        self.course = Playlist.objects.create(owner=self.pro, title="Mixed Course", status="published")
        self.preview = self.course.lessons.create(kind="text", title="Welcome", body="<p>Start here.</p>", is_preview=True, approved=True)
        self.inside = self.course.lessons.create(kind="video", title="Inside", video_url="https://youtu.be/x", duration="4 min",
                                                 body="<p>Notes</p>", approved=True)
        self.i1 = self.course.items.create(lesson=self.preview, position=0)
        self.i2 = add_lesson(self.course, self.video.title, "video", position=1)
        self.i3 = self.course.items.create(lesson=self.inside, position=2)

    def _lesson(self, lesson, user=None, course=None):
        client = APIClient()
        if user:
            client.force_authenticate(user)
        return client.get(f"/api/learning/courses/{(course or self.course).slug}/lessons/{lesson.pk}/")

    def test_who_can_open_what(self):
        self.assertEqual(self._lesson(self.preview).status_code, 200)  # free preview: anyone
        res = self._lesson(self.inside)
        self.assertEqual((res.status_code, res.json()["code"]), (403, "sign_in"))
        self.assertNotIn("body", res.json())
        self.assertEqual(self._lesson(self.inside, self.stranger).json()["code"], "enroll")
        Enrollment.objects.create(user=self.learner, playlist=self.course)
        res = self._lesson(self.inside, self.learner)
        self.assertEqual(res.status_code, 200)
        self.assertEqual((res.json()["video_url"], res.json()["body"], res.json()["item_id"]), ("https://youtu.be/x", "<p>Notes</p>", self.i3.pk))
        self.assertEqual(self._lesson(self.inside, self.pro).status_code, 200)  # the owner
        admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        self.assertEqual(self._lesson(self.inside, admin).status_code, 200)

    def test_paid_course_needs_a_purchase(self):
        self.course.access, self.course.price = "paid", Decimal("499")
        self.course.save()
        Enrollment.objects.create(user=self.learner, playlist=self.course)  # e.g. enrolled before it became paid
        self.assertEqual(self._lesson(self.inside, self.learner).json()["code"], "paid")
        self.assertEqual(self._lesson(self.preview, self.learner).status_code, 200)  # a free preview stays open

    def test_company_course_team_can_open_it(self):
        course = Playlist.objects.create(owner=self.staff, company=self.genex, title="Company Course", status="published")
        lesson = course.lessons.create(kind="text", title="Ours", body="<p>x</p>", approved=True)
        course.items.create(lesson=lesson, position=0)
        colleague = make_user("staff2", account_type="company", company=self.genex)
        self.assertEqual(self._lesson(lesson, colleague, course).status_code, 200)
        self.assertEqual(self._lesson(lesson, self.stranger, course).json()["code"], "enroll")

    def test_hidden_unless_live_approved_and_in_the_outline(self):
        Enrollment.objects.create(user=self.learner, playlist=self.course)
        loose = self.course.lessons.create(kind="text", title="Not placed", body="<p>x</p>", approved=True, is_preview=True)
        self.assertEqual(self._lesson(loose, self.learner).status_code, 404)
        self.assertEqual(self._lesson(loose, self.pro).status_code, 200)  # the author can still read it
        self.inside.approved = False
        self.inside.save()
        self.assertEqual(self._lesson(self.inside, self.learner).status_code, 404)
        self.course.status = "draft"
        self.course.save()
        self.assertEqual(self._lesson(self.preview).status_code, 404)
        self.assertEqual(self._lesson(self.preview, self.pro).status_code, 200)

    def test_course_page_locks_and_previews(self):
        items = {i["item_id"]: i for i in APIClient().get(f"/api/learning/courses/{self.course.slug}/").json()["items"]}
        self.assertEqual((items[self.i1.pk]["is_locked"], items[self.i1.pk]["is_preview"]), (False, True))
        self.assertTrue(items[self.i3.pk]["is_locked"])
        self.assertEqual(items[self.i3.pk]["path"], f"/courses/{self.course.slug}/lessons/{self.inside.pk}")
        self.api.force_authenticate(self.learner)
        self.api.post(f"/api/learning/courses/{self.course.slug}/enroll/")
        items = {i["item_id"]: i for i in self.api.get(f"/api/learning/courses/{self.course.slug}/").json()["items"]}
        self.assertFalse(items[self.i3.pk]["is_locked"])

    def test_mixed_course_completes_to_a_certificate(self):
        self.api.force_authenticate(self.learner)
        self.api.post(f"/api/learning/courses/{self.course.slug}/enroll/")
        for item in (self.i1, self.i2):
            res = self.api.post(f"/api/learning/courses/{self.course.slug}/items/{item.pk}/open/")
            self.assertIsNone(res.json()["certificate_code"])
        res = self.api.post(f"/api/learning/courses/{self.course.slug}/items/{self.i3.pk}/open/")
        self.assertTrue(res.json()["certificate_code"])

    def test_preview_open_without_enrolling_doesnt_count(self):
        self.api.force_authenticate(self.stranger)
        res = self.api.post(f"/api/learning/courses/{self.course.slug}/items/{self.i1.pk}/open/")
        self.assertEqual(res.status_code, 403)

    def test_lessons_never_appear_in_search(self):
        res = APIClient().get("/api/discovery/search/", {"q": "Welcome"})
        self.assertEqual(res.status_code, 200)
        self.assertNotIn("Start here", res.content.decode())
        self.assertNotIn("/lessons/", res.content.decode())


class CourseLessonLiveReviewTests(TestCase):
    """Phase 3: lesson changes on a live course wait for Genex review; learners keep the approved lessons."""

    def setUp(self):
        from organizations.models import Company
        self.genex = Company.objects.create(name="Genex", slug="genex")
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.staff = make_user("staff", account_type="company", company=self.genex)
        self.learner = make_user("learner")
        self.admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")

    def _live_course(self, author):
        """A live course of two approved lessons, built by `author` (a Professional or a Company account)."""
        course = Playlist.objects.create(owner=author, company=author.company if author.account_type == "company" else None,
                                         title="Live Lessons", status="published")
        self.text = course.lessons.create(kind="text", title="Why relays trip", body="<p>Old text</p>", approved=True)
        self.video = course.lessons.create(kind="video", title="Testing", video_url="https://youtu.be/old", duration="5 min", approved=True)
        self.module = course.modules.create(title="Basics", position=0)
        self.i1 = course.items.create(lesson=self.text, position=0, module=self.module)
        self.i2 = course.items.create(lesson=self.video, position=1, module=self.module)
        Enrollment.objects.create(user=self.learner, playlist=course)
        self.author = APIClient()
        self.author.force_authenticate(author)
        return course

    def _url(self, course, lesson=None):
        base = f"/api/learning/me/courses/{course.pk}/lessons/"
        return f"{base}{lesson.pk if hasattr(lesson, 'pk') else lesson}/" if lesson else base

    def _as_learner(self, course, lesson):
        client = APIClient()
        client.force_authenticate(self.learner)
        return client.get(f"/api/learning/courses/{course.slug}/lessons/{lesson.pk if hasattr(lesson, 'pk') else lesson}/")

    def _admin(self, action, course):
        request = RequestFactory().post("/")
        request.user = self.admin
        request._messages = None
        getattr(PlaylistAdmin(Playlist, AdminSite()), action)(request, Playlist.objects.filter(pk=course.pk))

    def _edit_then_approve(self, author):
        course = self._live_course(author)
        # The learner has opened the first lesson: that progress must survive the update.
        learner = APIClient()
        learner.force_authenticate(self.learner)
        learner.post(f"/api/learning/courses/{course.slug}/items/{self.i1.pk}/open/")

        res = self.author.patch(self._url(course, self.text), {"title": "Why relays trip (updated)", "body": "<p>New text</p>"}, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual((res.json()["title"], res.json()["body"], res.json()["review"]), ("Why relays trip (updated)", "<p>New text</p>", "changed"))
        self.assertEqual(res.json()["course_revision"]["status"], "pending")
        self.assertEqual(res.json()["course_revision"]["changed"], ["lessons"])

        # Learners keep the approved lesson; the builder shows the author's version.
        live = self._as_learner(course, self.text).json()
        self.assertEqual((live["title"], live["body"], live["has_pending"]), ("Why relays trip", "<p>Old text</p>", False))
        builder = self.author.get(f"/api/learning/me/courses/{course.pk}/").json()
        self.assertEqual(builder["items"][0]["title"], "Why relays trip (updated)")
        self.assertEqual(APIClient().get(f"/api/learning/courses/{course.slug}/").json()["items"][0]["title"], "Why relays trip")
        # The author's preview of the lesson page shows the edits, flagged.
        preview = self.author.get(f"/api/learning/courses/{course.slug}/lessons/{self.text.pk}/").json()
        self.assertEqual((preview["body"], preview["has_pending"]), ("<p>New text</p>", True))

        self._admin("approve", course)
        live = self._as_learner(course, self.text).json()
        self.assertEqual((live["title"], live["body"]), ("Why relays trip (updated)", "<p>New text</p>"))
        self.text.refresh_from_db()
        self.assertIsNone(self.text.pending)
        self.assertFalse(CourseRevision.objects.filter(playlist=course).exists())
        self.assertTrue(ItemProgress.objects.filter(user=self.learner, item=self.i1).exists())

    def test_professional_edits_a_live_lesson_through_review(self):
        self._edit_then_approve(self.pro)

    def test_company_edits_a_live_lesson_through_review(self):
        self._edit_then_approve(self.staff)

    def _add_new_lesson(self, author):
        course = self._live_course(author)
        res = self.author.post(self._url(course), {"kind": "text", "title": "Coordination", "body": "<p>Grading curves</p>"}, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        new = res.json()
        self.assertEqual((new["review"], new["card"]["approved"], new["course_revision"]), ("new", False, None))
        refs = [{"kind": "lesson", "id": i} for i in (self.text.pk, self.video.pk, new["id"])]
        outline = {"modules": [{"id": self.module.pk, "title": "Basics", "items": refs}]}
        res = self.author.put(f"/api/learning/me/courses/{course.pk}/outline/", outline, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual(res.json()["revision"]["changed"], ["outline"])
        self.assertEqual(len(res.json()["items"]), 3)  # the builder shows the outline waiting for review
        self.assertEqual(course.items.count(), 2)  # learners still have the live two
        self.assertEqual(self._as_learner(course, new["id"]).status_code, 404)
        return course, new

    def test_professional_adds_a_lesson_to_a_live_course(self):
        course, new = self._add_new_lesson(self.pro)
        self._admin("approve", course)
        self.assertEqual(course.items.count(), 3)
        self.assertTrue(course.lessons.get(pk=new["id"]).approved)
        self.assertEqual(self._as_learner(course, new["id"]).json()["body"], "<p>Grading curves</p>")

    def test_company_adds_a_lesson_to_a_live_course(self):
        course, new = self._add_new_lesson(self.staff)
        self._admin("approve", course)
        self.assertEqual(self._as_learner(course, new["id"]).status_code, 200)

    def test_an_unfinished_new_lesson_cant_go_for_review(self):
        course = self._live_course(self.pro)
        empty = self.author.post(self._url(course), {"kind": "video", "title": "Coming soon"}, format="json").json()
        refs = [{"kind": "lesson", "id": i} for i in (self.text.pk, self.video.pk, empty["id"])]
        res = self.author.put(f"/api/learning/me/courses/{course.pk}/outline/", lessons(refs), format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("Coming soon", res.json()["items"])

    def test_a_live_lesson_cant_be_emptied(self):
        course = self._live_course(self.pro)
        res = self.author.patch(self._url(course, self.video), {"video_url": ""}, format="json")
        self.assertEqual(res.status_code, 400)
        self.video.refresh_from_db()
        self.assertIsNone(self.video.pending)

    def test_free_preview_applies_straight_away(self):
        course = self._live_course(self.pro)
        res = self.author.patch(self._url(course, self.text), {"is_preview": True}, format="json")
        self.assertEqual((res.json()["review"], res.json()["course_revision"]), (None, None))
        self.assertEqual(APIClient().get(f"/api/learning/courses/{course.slug}/lessons/{self.text.pk}/").status_code, 200)

    def test_editing_back_to_the_live_version_drops_the_review(self):
        course = self._live_course(self.pro)
        self.author.patch(self._url(course, self.text), {"title": "Changed"}, format="json")
        res = self.author.patch(self._url(course, self.text), {"title": "Why relays trip"}, format="json")
        self.assertEqual((res.json()["review"], res.json()["course_revision"]), (None, None))

    def test_sent_back_then_sent_again(self):
        course = self._live_course(self.pro)
        self.author.patch(self._url(course, self.text), {"body": "<p>Draft wording</p>"}, format="json")
        self._admin("reject", course)
        self.assertEqual(course.revision.status, "rejected")
        self.text.refresh_from_db()
        self.assertEqual(self.text.pending, {"body": "<p>Draft wording</p>"})  # kept, so the author can fix it
        self.assertEqual(self._as_learner(course, self.text).json()["body"], "<p>Old text</p>")
        res = self.author.patch(self._url(course, self.text), {"body": "<p>Better wording</p>"}, format="json")
        self.assertEqual(res.json()["course_revision"]["status"], "pending")

    def test_withdraw_drops_lesson_edits(self):
        course, new = self._add_new_lesson(self.pro)
        self.author.patch(self._url(course, self.text), {"title": "Changed"}, format="json")
        res = self.author.delete(f"/api/learning/me/courses/{course.pk}/revision/")
        self.assertIsNone(res.json()["revision"])
        self.text.refresh_from_db()
        self.assertIsNone(self.text.pending)
        self.assertEqual(self.author.get(self._url(course, new["id"])).json()["review"], "new")  # kept as a draft lesson
        self.assertEqual(len(res.json()["items"]), 2)

    def test_deleting_a_new_lesson_leaves_the_held_outline(self):
        course, new = self._add_new_lesson(self.pro)
        res = self.author.delete(self._url(course, new["id"]))
        self.assertIsNone(res.json()["course_revision"])  # the outline is back to the live one, so nothing waits

    def test_deleting_a_live_lesson_can_finish_the_course(self):
        course = self._live_course(self.pro)
        learner = APIClient()
        learner.force_authenticate(self.learner)
        learner.post(f"/api/learning/courses/{course.slug}/items/{self.i1.pk}/open/")
        self.assertEqual(self.author.delete(self._url(course, self.video)).status_code, 200)
        self.assertEqual(course.items.count(), 1)
        self.assertTrue(Certificate.objects.filter(user=self.learner, playlist=course).exists())

    def test_lessons_of_other_courses_are_untouched_by_approval(self):
        course = self._live_course(self.pro)
        other = Playlist.objects.create(owner=self.pro, title="Other", status="published")
        held = other.lessons.create(kind="text", title="Other lesson", body="<p>a</p>", approved=True, pending={"body": "<p>b</p>"})
        self.author.patch(self._url(course, self.text), {"title": "Changed"}, format="json")
        self._admin("approve", course)
        held.refresh_from_db()
        self.assertEqual((held.body, held.pending), ("<p>a</p>", {"body": "<p>b</p>"}))


def question(prompt, options, correct, explanation=""):
    return {"prompt": prompt, "options": options, "correct": correct, "explanation": explanation}


QUIZ = [
    question("Which relay clears a fault fastest?", ["Overcurrent", "Differential", "Distance"], [1], "Differential is unit protection."),
    question("Which are protection relays? (all that apply)", ["Differential", "Ammeter", "Distance"], [0, 2]),
]


class CourseQuizTests(TestCase):
    """Phase 4: quiz lessons, graded on the server; passing completes them."""

    def setUp(self):
        from organizations.models import Company
        self.genex = Company.objects.create(name="Genex", slug="genex")
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.staff = make_user("staff", account_type="company", company=self.genex)
        self.learner = make_user("learner")
        self.stranger = make_user("stranger")
        self.admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")

    def _client(self, user=None):
        client = APIClient()
        if user:
            client.force_authenticate(user)
        return client

    def _build_quiz(self, author):
        """Builds a draft course with a text lesson and a quiz through the builder API; returns (course, quiz lesson json)."""
        api = self._client(author)
        course_id = api.post("/api/learning/me/courses/", {"title": "Relay Check"}, format="json").json()["id"]
        url = f"/api/learning/me/courses/{course_id}/lessons/"
        text = api.post(url, {"kind": "text", "title": "Read first", "body": "<p>Relays</p>"}, format="json").json()
        res = api.post(url, {"kind": "quiz", "title": "Relay quiz", "pass_mark": 50, "questions": QUIZ}, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        quiz = res.json()
        self.assertEqual((quiz["problem"], quiz["minutes"], quiz["questions"][1]["correct"]), (None, 2, [0, 2]))
        refs = [{"kind": "lesson", "id": text["id"]}, {"kind": "lesson", "id": quiz["id"]}]
        self.assertEqual(api.put(f"/api/learning/me/courses/{course_id}/outline/", lessons(refs), format="json").status_code, 200)
        return Playlist.objects.get(pk=course_id), quiz

    def _publish(self, course):
        request = RequestFactory().post("/")
        request.user = self.admin
        request._messages = None
        api = self._client(course.owner)
        self.assertEqual(api.post(f"/api/learning/me/courses/{course.pk}/submit/").status_code, 200)
        PlaylistAdmin(Playlist, AdminSite()).approve(request, Playlist.objects.filter(pk=course.pk))
        course.refresh_from_db()

    def _enrolled(self, course):
        api = self._client(self.learner)
        api.post(f"/api/learning/courses/{course.slug}/enroll/")
        return api

    def _attempt(self, api, course, quiz_id, answers):
        return api.post(f"/api/learning/courses/{course.slug}/lessons/{quiz_id}/attempts/", {"answers": answers}, format="json")

    def test_professional_and_company_build_quizzes(self):
        for author in (self.pro, self.staff):
            course, _ = self._build_quiz(author)
            self._publish(course)
            self.assertEqual(course.status, "published")

    def test_question_validation(self):
        api = self._client(self.pro)
        course_id = api.post("/api/learning/me/courses/", {"title": "Checks"}, format="json").json()["id"]
        url = f"/api/learning/me/courses/{course_id}/lessons/"
        bad = [
            [question("Q?", ["Only one"], [0])],
            [question("Q?", ["A", "B"], [])],
            [question("Q?", ["A", "B"], [2])],
            [question("Q?", ["A", "a"], [0])],
            [question("Q?", ["A", " "], [0])],
            [question("Q?", ["A", "B"], [0])] * 31,
        ]
        for questions in bad:
            res = api.post(url, {"kind": "quiz", "title": "Bad quiz", "questions": questions}, format="json")
            self.assertEqual(res.status_code, 400, questions[0])
        res = api.post(url, {"kind": "text", "title": "Text", "questions": QUIZ}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(api.post(url, {"kind": "quiz", "title": "Mark", "pass_mark": 0}, format="json").status_code, 400)

    def test_learners_never_get_the_answers_before_submitting(self):
        course, quiz = self._build_quiz(self.pro)
        self._publish(course)
        res = self._enrolled(course).get(f"/api/learning/courses/{course.slug}/lessons/{quiz['id']}/")
        data = res.json()["quiz"]
        self.assertEqual([q["multiple"] for q in data["questions"]], [False, True])
        self.assertNotIn("correct", res.content.decode())
        self.assertNotIn("Differential is unit", res.content.decode())
        self.assertEqual((data["pass_mark"], data["best"]), (50, None))

    def test_fail_then_pass_completes_the_course(self):
        course, quiz = self._build_quiz(self.pro)
        self._publish(course)
        api = self._enrolled(course)
        text_item = course.items.get(position=0)
        quiz_item = course.items.get(lesson_id=quiz["id"])
        api.post(f"/api/learning/courses/{course.slug}/items/{text_item.pk}/open/")
        # Opening a quiz doesn't complete it.
        api.post(f"/api/learning/courses/{course.slug}/items/{quiz_item.pk}/open/")
        self.assertFalse(ItemProgress.objects.filter(user=self.learner, item=quiz_item).exists())

        res = self._attempt(api, course, quiz["id"], [[0], [0]]).json()  # both wrong ([0] alone misses Distance)
        self.assertEqual((res["score"], res["passed"], res["saved"]), (0, False, True))
        self.assertEqual([r["correct"] for r in res["results"]], [False, False])
        self.assertEqual(res["results"][0]["explanation"], "Differential is unit protection.")
        self.assertNotIn("correct_options", res["results"][0])  # the right options only once passed
        self.assertFalse(ItemProgress.objects.filter(user=self.learner, item=quiz_item).exists())

        res = self._attempt(api, course, quiz["id"], [[1], [2, 0]]).json()
        self.assertEqual((res["score"], res["percent"], res["passed"]), (2, 100, True))
        self.assertEqual(res["results"][1]["correct_options"], [0, 2])
        self.assertTrue(res["certificate_code"])

        # A worse retake doesn't undo the pass.
        self._attempt(api, course, quiz["id"], [[0], [1]])
        best = api.get(f"/api/learning/courses/{course.slug}/lessons/{quiz['id']}/").json()["quiz"]["best"]
        self.assertEqual(best, {"score": 2, "total": 2, "passed": True})
        self.assertTrue(ItemProgress.objects.filter(user=self.learner, item=quiz_item).exists())

    def test_pass_mark_decides(self):
        course, quiz = self._build_quiz(self.pro)
        self._publish(course)
        api = self._enrolled(course)
        self.assertTrue(self._attempt(api, course, quiz["id"], [[1], [0]]).json()["passed"])  # 50% at a 50% mark
        CourseLessonModel = course.lessons.model
        CourseLessonModel.objects.filter(pk=quiz["id"]).update(pass_mark=60)
        self.assertFalse(self._attempt(api, course, quiz["id"], [[1], [0]]).json()["passed"])

    def test_bad_answers_are_refused(self):
        course, quiz = self._build_quiz(self.pro)
        self._publish(course)
        api = self._enrolled(course)
        for answers in ([[1]], [[1], []], [[1], [7]], [[0, 1], [0]], "1,2", [[True], [0]]):
            self.assertEqual(self._attempt(api, course, quiz["id"], answers).status_code, 400, answers)
        self.assertFalse(QuizAttempt.objects.exists())

    def test_preview_tries_arent_saved_and_locked_quizzes_stay_locked(self):
        course, quiz = self._build_quiz(self.pro)
        self._publish(course)
        res = self._attempt(self._client(self.stranger), course, quiz["id"], [[1], [0, 2]])
        self.assertEqual(res.status_code, 403)  # not a preview: enroll first
        course.lessons.filter(pk=quiz["id"]).update(is_preview=True)
        for client in (self._client(), self._client(self.stranger)):
            res = self._attempt(client, course, quiz["id"], [[1], [0, 2]]).json()
            self.assertEqual((res["passed"], res["saved"]), (True, False))
        self.assertFalse(QuizAttempt.objects.exists())

    def test_live_quiz_edits_wait_for_review(self):
        course, quiz = self._build_quiz(self.pro)
        self._publish(course)
        author = self._client(self.pro)
        changed = [question("Which relay protects a transformer?", ["Differential", "Fuse only"], [0])]
        res = author.patch(f"/api/learning/me/courses/{course.pk}/lessons/{quiz['id']}/", {"questions": changed}, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual((res.json()["review"], len(res.json()["questions"])), ("changed", 1))
        api = self._enrolled(course)
        live = api.get(f"/api/learning/courses/{course.slug}/lessons/{quiz['id']}/").json()["quiz"]
        self.assertEqual(len(live["questions"]), 2)  # learners keep the approved quiz
        self.assertTrue(self._attempt(api, course, quiz["id"], [[1], [0, 2]]).json()["passed"])  # graded against it too
        # The author's preview shows (and grades) the version waiting for review, without saving.
        preview = self._attempt(author, course, quiz["id"], [[0]]).json()
        self.assertEqual((preview["passed"], preview["saved"]), (True, False))

        request = RequestFactory().post("/")
        request.user = self.admin
        request._messages = None
        PlaylistAdmin(Playlist, AdminSite()).approve(request, Playlist.objects.filter(pk=course.pk))
        live = api.get(f"/api/learning/courses/{course.slug}/lessons/{quiz['id']}/").json()["quiz"]
        self.assertEqual([q["prompt"] for q in live["questions"]], ["Which relay protects a transformer?"])

    def test_a_live_quiz_cant_lose_all_its_questions(self):
        course, quiz = self._build_quiz(self.pro)
        self._publish(course)
        res = self._client(self.pro).patch(f"/api/learning/me/courses/{course.pk}/lessons/{quiz['id']}/", {"questions": []}, format="json")
        self.assertEqual(res.status_code, 400)


class FurtherReadingTests(TestCase):
    """Course builder v2: published content is optional Further reading, never a lesson or part of completion."""

    def setUp(self):
        self.api = APIClient()
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.other = make_user("other", account_type="professional", company_other="Acme", role_title="Eng")
        self.learner = make_user("learner")
        self.video = publish_video(self.pro, "Walkthrough")
        self.post = publish_post(self.pro, "Field notes", access="paid", price=Decimal("99"))
        self.theirs = publish_video(self.other, "Not mine")
        self.course = Playlist.objects.create(owner=self.pro, title="Grid basics", status="published")
        self.item = add_lesson(self.course, "Only lesson")
        self.url = f"/api/learning/me/courses/{self.course.pk}/reading/"
        self.api.force_authenticate(self.pro)

    def test_professional_picks_own_content_in_order_and_it_goes_live(self):
        res = self.api.put(self.url, {"items": [{"kind": "post", "id": self.post.pk}, {"kind": "video", "id": self.video.pk}]}, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual([r["title"] for r in res.json()["reading"]], ["Field notes", "Walkthrough"])
        self.assertFalse(CourseRevision.objects.filter(playlist=self.course).exists())  # no review needed, even live
        page = APIClient().get(f"/api/learning/courses/{self.course.slug}/").json()
        # Further reading keeps the content's own access: the paid post stays locked for a visitor.
        self.assertEqual([(r["title"], r["is_locked"]) for r in page["reading"]], [("Field notes", True), ("Walkthrough", False)])

        res = self.api.put(self.url, {"items": [{"kind": "video", "id": self.video.pk}]}, format="json")
        self.assertEqual([r["title"] for r in res.json()["reading"]], ["Walkthrough"])

    def test_refuses_other_peoples_content_lessons_and_too_many(self):
        for items in ([{"kind": "video", "id": self.theirs.pk}], [{"kind": "lesson", "id": self.item.lesson_id}]):
            self.assertEqual(self.api.put(self.url, {"items": items}, format="json").status_code, 400, items)
        too_many = [{"kind": "video", "id": self.video.pk}] * 21
        self.assertEqual(self.api.put(self.url, {"items": too_many}, format="json").status_code, 400)
        self.api.force_authenticate(self.other)
        self.assertEqual(self.api.put(self.url, {"items": []}, format="json").status_code, 404)

    def test_further_reading_never_counts_toward_completion(self):
        from .models import Certificate
        self.course.reading.create(video=self.video)
        api = APIClient()
        api.force_authenticate(self.learner)
        api.post(f"/api/learning/courses/{self.course.slug}/enroll/")
        res = api.post(f"/api/learning/courses/{self.course.slug}/items/{self.item.pk}/open/")
        self.assertIsNotNone(res.json()["certificate_code"])  # the one lesson is the whole course
        enrollment = api.get(f"/api/learning/courses/{self.course.slug}/").json()["enrollment"]
        self.assertEqual((enrollment["total"], enrollment["percent"]), (1, 100))
        self.assertTrue(Certificate.objects.filter(user=self.learner, playlist=self.course).exists())

    def test_deleted_content_drops_out(self):
        self.course.reading.create(video=self.video)
        self.course.reading.create(post=self.post, position=1)
        self.post.delete()
        self.assertEqual([r["title"] for r in self.api.get(f"/api/learning/me/courses/{self.course.pk}/").json()["reading"]], ["Walkthrough"])


class LeaveCourseTests(TestCase):
    """Phase 6: a learner can leave a course, losing their progress, quiz results and review, unless a certificate was issued."""

    def setUp(self):
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.learner = make_user("learner")
        self.other = make_user("other")
        self.course = Playlist.objects.create(owner=self.pro, title="Relay Basics", status="published")
        self.text = add_lesson(self.course, "Read first", "text", position=0)
        self.quiz = add_lesson(self.course, "Relay quiz", "quiz", position=1)
        self.other_course = Playlist.objects.create(owner=self.pro, title="Other course", status="published")
        self.other_item = add_lesson(self.other_course, "Other lesson", "text")
        self.api = APIClient()
        self.api.force_authenticate(self.learner)
        self.url = "/api/learning/courses/relay-basics/enroll/"
        self.api.post(self.url)

    def _progress(self):
        """Progress, a quiz attempt and a review on this course, plus progress on another course that must survive."""
        self.api.post(f"/api/learning/courses/relay-basics/items/{self.text.pk}/open/")
        QuizAttempt.objects.create(user=self.learner, lesson=self.quiz.lesson, score=0, total=1, answers=[[1]])
        CourseReview.objects.create(user=self.learner, playlist=self.course, rating=4, body="Useful")
        self.api.post("/api/learning/courses/other-course/enroll/")
        self.api.post(f"/api/learning/courses/other-course/items/{self.other_item.pk}/open/")

    def test_leaving_deletes_enrollment_progress_attempts_and_review(self):
        self._progress()
        self.assertTrue(self.api.get("/api/learning/courses/relay-basics/").json()["enrollment"]["can_leave"])
        self.assertEqual(self.api.delete(self.url).status_code, 204)
        self.assertFalse(Enrollment.objects.filter(user=self.learner, playlist=self.course).exists())
        self.assertFalse(ItemProgress.objects.filter(user=self.learner, item__playlist=self.course).exists())
        self.assertFalse(QuizAttempt.objects.filter(user=self.learner).exists())
        self.assertFalse(CourseReview.objects.filter(user=self.learner).exists())
        # Other courses are untouched.
        self.assertTrue(Enrollment.objects.filter(user=self.learner, playlist=self.other_course).exists())
        self.assertTrue(ItemProgress.objects.filter(user=self.learner, item=self.other_item).exists())
        self.assertIsNone(self.api.get("/api/learning/courses/relay-basics/").json()["enrollment"])

    def test_enrolling_again_starts_from_zero(self):
        self._progress()
        self.api.delete(self.url)
        body = self.api.post(self.url).json()
        self.assertEqual((body["enrollment"]["completed"], body["enrollment"]["percent"]), (0, 0))

    def test_leaving_is_refused_once_a_certificate_was_issued(self):
        for status in (Certificate.STATUS_VALID, Certificate.STATUS_REVOKED):
            cert = Certificate.objects.create(code=f"GL-TEST-{status[:4].upper()}", user=self.learner, playlist=self.course,
                                              learner_name="Learner", issued_at=timezone.now(), status=status)
            enrollment = self.api.get("/api/learning/courses/relay-basics/").json()["enrollment"]
            self.assertFalse(enrollment["can_leave"])
            res = self.api.delete(self.url)
            self.assertEqual(res.status_code, 409)
            self.assertIn("certificate", res.json()["detail"])
            self.assertTrue(Enrollment.objects.filter(user=self.learner, playlist=self.course).exists())
            cert.delete()

    def test_someone_not_enrolled_gets_404(self):
        api = APIClient()
        api.force_authenticate(self.other)
        self.assertEqual(api.delete(self.url).status_code, 404)
        self.assertEqual(APIClient().delete(self.url).status_code, 401)

    def test_my_enrollments_say_whether_each_course_can_be_left(self):
        rows = self.api.get("/api/learning/me/enrollments/").json()["results"]
        self.assertEqual([(r["slug"], r["enrollment"]["can_leave"]) for r in rows], [("relay-basics", True)])
