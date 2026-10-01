from decimal import Decimal

from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory, TestCase
from rest_framework.test import APIClient

from accounts.models import User
from organizations.models import Company

from .admin import UserBlogPostAdmin, UserVideoPostAdmin
from .models import UserBlogPost, UserVideoPost

BODY = "<p>" + "Grid operations at scale. " * 12 + "</p>"


def make_user(username, **kwargs):
    return User.objects.create_user(username=username, email=f"{username}@example.org", password="Passw0rd!x", **kwargs)


class SubmissionRoleTests(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.learner = make_user("learner")

    def _post(self, **extra):
        payload = {"title": "Field notes", "excerpt": "An excerpt long enough.", "body": BODY, "status": "pending"}
        payload.update(extra)
        return self.api.post("/api/snippets/blog-submissions/", payload, format="json")

    def test_only_professionals_can_submit(self):
        self.api.force_authenticate(self.learner)
        self.assertEqual(self._post().status_code, 403)
        self.assertEqual(self.api.get("/api/snippets/video-submissions/").status_code, 403)
        company = make_user("co", account_type="company", company=Company.objects.create(name="C", slug="c"))
        self.api.force_authenticate(company)
        self.assertEqual(self._post().status_code, 403)
        self.api.force_authenticate(self.pro)
        self.assertEqual(self._post().status_code, 201)

    def test_body_is_sanitised_but_keeps_rich_formatting(self):
        self.api.force_authenticate(self.pro)
        body = BODY + '<p onclick="x()"><u>u</u><s>s</s><img src="https://cdn.example/a.png" onerror="alert(1)"><script>bad()</script><a href="javascript:x()">j</a></p><iframe src="https://evil"></iframe>'
        res = self._post(body=body)
        self.assertEqual(res.status_code, 201, res.content)
        stored = UserBlogPost.objects.get().body
        for bad in ("onclick", "onerror", "<script", "javascript:", "<iframe"):
            self.assertNotIn(bad, stored)
        for kept in ("<u>u</u>", "<s>s</s>", 'src="https://cdn.example/a.png"'):
            self.assertIn(kept, stored)

    def test_paid_needs_price_and_free_clears_it(self):
        self.api.force_authenticate(self.pro)
        self.assertIn("price", self._post(access="paid").json())
        res = self._post(access="members", price="99")
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual((res.json()["access"], res.json()["price"]), ("members", None))


class ApprovalCarriesAccessTests(TestCase):
    def setUp(self):
        self.pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        self.admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        self.request = RequestFactory().post("/")
        self.request.user = self.admin

    def test_blog_approval_publishes_access_price_and_clean_body(self):
        submission = UserBlogPost.objects.create(
            author=self.pro, title="Paid deep dive", excerpt="e", status="pending",
            body=BODY + "<p onclick='x()'>raw</p>", access="paid", price=Decimal("499"),
        )
        UserBlogPostAdmin(UserBlogPost, AdminSite()).approve_and_publish(self.request, UserBlogPost.objects.filter(pk=submission.pk))
        post = UserBlogPost.objects.get(pk=submission.pk).published_post
        self.assertEqual((post.access, post.price), ("paid", Decimal("499")))
        self.assertNotIn("onclick", str(post.body.raw_data))
        self.assertEqual(post.access_owner_ids(), {self.pro.pk})

    def test_video_approval_publishes_access(self):
        submission = UserVideoPost.objects.create(
            author=self.pro, title="Members video", excerpt="e", video_url="https://v.example/1",
            topic="Grid", duration="5 min", status="pending", access="members",
        )
        UserVideoPostAdmin(UserVideoPost, AdminSite()).approve_and_publish(self.request, UserVideoPost.objects.filter(pk=submission.pk))
        self.assertEqual(UserVideoPost.objects.get(pk=submission.pk).published_video.access, "members")



class GeLearnPhase1ContentTests(TestCase):
    """Topics with groups, parsed durations, and tender deadlines as dates."""

    def test_parse_duration_seconds(self):
        from .durations import parse_duration_seconds
        cases = {
            "14:32 min": 872, "20:00": 1200, "1:02:10": 3730, "48 min": 2880,
            "1 h 20 min": 4800, "2h": 7200, "40": 2400, "": None, "soon": None,
        }
        for text, expected in cases.items():
            self.assertEqual(parse_duration_seconds(text), expected, text)

    def test_video_and_podcast_store_duration_seconds(self):
        import datetime
        from .models import PodcastEpisode, VideoItem
        video = VideoItem.objects.create(title="V", category="Training", date=datetime.date(2026, 10, 1),
                                         duration="9:40 min", excerpt="e")
        self.assertEqual(video.duration_seconds, 580)
        video.duration = "12 min"
        video.save()
        self.assertEqual(video.duration_seconds, 720)
        episode = PodcastEpisode.objects.create(title="P", category="Solar", date=datetime.date(2026, 10, 1),
                                                duration="48 min", description="d", guest="g", guest_role="r")
        self.assertEqual(episode.duration_seconds, 2880)

    def test_topics_api_includes_group(self):
        from .models import Topic
        api = APIClient()
        rows = {row["name"]: row for row in api.get("/api/snippets/topics/").json()}
        # Seeded by pages/0039.
        self.assertEqual(rows["Solar PV"]["group"], "Renewables")
        self.assertEqual(rows["SCADA & Monitoring"]["group"], "Automation & data")
        Topic.objects.create(name="Ungrouped topic")
        rows = {row["name"]: row for row in api.get("/api/snippets/topics/").json()}
        self.assertIsNone(rows["Ungrouped topic"]["group"])

    def test_tender_deadline_is_a_date_in_the_api(self):
        import datetime
        from .models import Tender
        Tender.objects.create(title="T", authority="CEA", deadline=datetime.date(2026, 6, 30),
                              value="v", sector="Grid", description="d")
        row = APIClient().get("/api/snippets/tenders/").json()["results"][0]
        self.assertEqual(row["deadline"], "2026-06-30")

    def test_testimonial_defaults(self):
        from .models import Testimonial
        t = Testimonial.objects.create(quote="Useful.", name="A. Learner")
        self.assertTrue(t.is_active)
