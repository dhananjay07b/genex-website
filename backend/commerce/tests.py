import datetime
from decimal import Decimal

from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from pages.models import BlogPost, PodcastEpisode, UserBlogPost, VideoItem

from .access import has_access
from .models import Purchase

TODAY = datetime.date(2026, 9, 29)


def make_user(username, **kwargs):
    return User.objects.create_user(username=username, email=f"{username}@example.org", password="Passw0rd!x", **kwargs)


def make_video(access="free", price=None, **kwargs):
    return VideoItem.objects.create(
        title="Grid talk", date=TODAY, duration="10 min", excerpt="x",
        video_url="https://video.example/v", access=access, price=price, **kwargs,
    )


class AccessRuleTests(TestCase):
    def setUp(self):
        self.anon = None
        self.learner = make_user("learner")
        self.owner = make_user("owner", account_type="professional", company_other="Acme", role_title="Eng")
        self.admin = User.objects.create_superuser("root", "root@example.org", "Passw0rd!x")

    def _own(self, obj):
        # Mirrors approve_and_publish: the submission points at the published post.
        UserBlogPost.objects.create(author=self.owner, title="t", excerpt="e", body="b", status="published", published_post=obj)

    def test_free_open_to_everyone(self):
        video = make_video()
        from django.contrib.auth.models import AnonymousUser
        self.assertTrue(has_access(AnonymousUser(), video))
        self.assertTrue(has_access(self.learner, video))

    def test_members_needs_sign_in(self):
        from django.contrib.auth.models import AnonymousUser
        video = make_video("members")
        self.assertFalse(has_access(AnonymousUser(), video))
        self.assertTrue(has_access(self.learner, video))

    def test_paid_matrix(self):
        from django.contrib.auth.models import AnonymousUser
        post = BlogPost.objects.create(title="Deep dive", date=TODAY, excerpt="teaser", access="paid", price=Decimal("499"))
        self._own(post)
        self.assertFalse(has_access(AnonymousUser(), post))
        self.assertFalse(has_access(self.learner, post))
        self.assertTrue(has_access(self.owner, post))
        self.assertTrue(has_access(self.admin, post))

        ct = ContentType.objects.get_for_model(BlogPost)
        pending = Purchase.objects.create(user=self.learner, content_type=ct, object_id=post.pk, amount=499, status="pending")
        self.assertFalse(has_access(self.learner, post))
        pending.status = Purchase.STATUS_PAID
        pending.save()
        self.assertTrue(has_access(self.learner, post))
        pending.status = Purchase.STATUS_REFUNDED
        pending.save()
        self.assertFalse(has_access(self.learner, post))

    def test_paid_requires_price_and_non_paid_clears_it(self):
        video = VideoItem(title="t", date=TODAY, duration="1", excerpt="e", access="paid")
        with self.assertRaises(ValidationError):
            video.full_clean()
        video.access, video.price = "members", Decimal("99")
        video.full_clean()
        self.assertIsNone(video.price)

    def test_one_paid_purchase_per_item(self):
        from django.db import IntegrityError, transaction
        video = make_video("paid", Decimal("10"))
        ct = ContentType.objects.get_for_model(VideoItem)
        Purchase.objects.create(user=self.learner, content_type=ct, object_id=video.pk, amount=10, status="paid")
        Purchase.objects.create(user=self.learner, content_type=ct, object_id=video.pk, amount=10, status="refunded")
        with self.assertRaises(IntegrityError), transaction.atomic():
            Purchase.objects.create(user=self.learner, content_type=ct, object_id=video.pk, amount=10, status="paid")


class GatedApiTests(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.learner = make_user("learner")

    def test_members_video_hides_url_from_anonymous_only(self):
        video = make_video("members")
        body = self.api.get(f"/api/snippets/videos/{video.pk}/").json()
        self.assertEqual((body["access"], body["is_locked"], body["video_url"]), ("members", True, None))
        self.api.force_authenticate(self.learner)
        body = self.api.get(f"/api/snippets/videos/{video.pk}/").json()
        self.assertEqual((body["is_locked"], body["video_url"]), (False, "https://video.example/v"))

    def test_paid_blog_keeps_teaser_but_hides_body(self):
        post = BlogPost.objects.create(
            title="Deep dive", date=TODAY, excerpt="teaser", access="paid", price=Decimal("499"),
            body=[("rich_text", "<p>secret</p>")],
        )
        self.api.force_authenticate(self.learner)
        body = self.api.get(f"/api/snippets/blog-posts/{post.pk}/").json()
        self.assertTrue(body["is_locked"])
        self.assertEqual((body["excerpt"], body["body"], body["price"], body["currency"]), ("teaser", [], "499.00", "INR"))
        self.assertNotIn("secret", str(body))

    def test_paid_podcast_hides_audio(self):
        ep = PodcastEpisode.objects.create(
            title="Ep", date=TODAY, duration="1", description="d", guest="g", guest_role="r",
            audio_url="https://audio.example/a", access="paid", price=Decimal("49"),
        )
        self.api.force_authenticate(self.learner)
        body = self.api.get(f"/api/snippets/podcasts/{ep.pk}/").json()
        self.assertEqual((body["is_locked"], body["audio_url"]), (True, None))

    def test_list_does_one_purchase_query(self):
        for _ in range(5):
            make_video("paid", Decimal("10"))
        self.api.force_authenticate(self.learner)
        from django.db import connection
        from django.test.utils import CaptureQueriesContext
        with CaptureQueriesContext(connection) as ctx:
            res = self.api.get("/api/snippets/videos/")
        self.assertEqual(res.status_code, 200)
        purchase_queries = [q for q in ctx.captured_queries if "commerce_purchase" in q["sql"]]
        self.assertEqual(len(purchase_queries), 1)

    def test_user_payload_has_no_tier(self):
        self.api.force_authenticate(self.learner)
        self.assertNotIn("membership_tier", self.api.get("/api/accounts/me/").json())
