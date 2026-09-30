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


class DowngradeGuardTests(TestCase):
    def test_professional_with_paid_published_content_cannot_become_learner(self):
        pro = make_user("pro", account_type="professional", company_other="Acme", role_title="Eng")
        admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")
        request = RequestFactory().post("/")
        request.user = admin
        UserBlogPost.objects.create(author=pro, title="t", excerpt="e", body=BODY, status="pending", access="paid", price=Decimal("10"))
        UserBlogPostAdmin(UserBlogPost, AdminSite()).approve_and_publish(request, UserBlogPost.objects.all())

        api = APIClient()
        api.force_authenticate(pro)
        res = api.patch("/api/accounts/me/", {"account_type": "learner"}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("paid", res.json()["account_type"][0])

        post = UserBlogPost.objects.get().published_post
        post.access, post.price = "free", None
        post.save()
        self.assertEqual(api.patch("/api/accounts/me/", {"account_type": "learner"}, format="json").status_code, 200)
