from django.contrib.contenttypes.models import ContentType
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from learning.models import Playlist

from .models import Notification


class NotificationListQueryTests(TestCase):
    """The notifications list costs the same few queries however many notifications there are."""

    def setUp(self):
        self.pro = User.objects.create_user("pro", "pro@example.org", "Passw0rd!x", account_type="professional", company_other="Acme")
        self.client = APIClient()
        self.client.force_authenticate(self.pro)
        self.course_type = ContentType.objects.get_for_model(Playlist)

    def _notify(self, n):
        for i in range(n):
            course = Playlist.objects.create(owner=self.pro, title=f"Course {i}", status="published")
            Notification.objects.create(recipient=self.pro, kind="course_review", text="New review",
                                        content_type=self.course_type, object_id=course.pk)

    def _count_queries(self):
        from django.db import connection
        from django.test.utils import CaptureQueriesContext
        with CaptureQueriesContext(connection) as ctx:
            res = self.client.get("/api/engagement/notifications/")
        self.assertEqual(res.status_code, 200)
        return len(ctx), res.json()

    def test_query_count_does_not_grow_with_notifications(self):
        self._notify(2)
        few, _ = self._count_queries()
        self._notify(10)
        many, data = self._count_queries()
        self.assertEqual(many, few, "each extra notification should not add queries")
        rows = data["results"] if isinstance(data, dict) else data
        self.assertEqual(len(rows), 12)
        self.assertTrue(all(r["path"].endswith("#cp-reviews") for r in rows))  # links still resolve

    def test_activity_feed_query_count_does_not_grow_either(self):
        from django.db import connection
        from django.test.utils import CaptureQueriesContext

        def count():
            with CaptureQueriesContext(connection) as ctx:
                self.assertEqual(self.client.get("/api/accounts/me/activity/").status_code, 200)
            return len(ctx)
        self._notify(2)
        few = count()
        self._notify(10)
        self.assertEqual(count(), few)
