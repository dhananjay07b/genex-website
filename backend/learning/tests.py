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
    video = VideoItem.objects.create(title=title, category="Grid", date=TODAY, duration="5 min", excerpt="e", video_url="https://v.example/x", **kwargs)
    UserVideoPost.objects.create(author=author, title=title, excerpt="e", video_url="https://v.example/x", topic="Grid",
                                 duration="5 min", status="published", published_video=video)
    return video


def publish_post(author, title="Post", **kwargs):
    post = BlogPost.objects.create(title=title, topic="Grid", date=TODAY, excerpt="e", **kwargs)
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

    def test_live_course_blocks_downgrade(self):
        api = APIClient()
        api.force_authenticate(self.pro)
        self.assertEqual(api.patch("/api/accounts/me/", {"account_type": "learner"}, format="json").status_code, 400)
