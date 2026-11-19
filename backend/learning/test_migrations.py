import datetime

from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase

BEFORE = [("learning", "0015_course_reading")]
AFTER = [("learning", "0017_lessons_only_outline")]


class LessonsOnlyMigrationTests(TransactionTestCase):
    """0016: published-content lessons move to Further reading; lessons outside a module get one."""

    def setUp(self):
        executor = MigrationExecutor(connection)
        executor.migrate(BEFORE)
        self.old = executor.loader.project_state(BEFORE).apps

    def tearDown(self):
        executor = MigrationExecutor(connection)
        executor.loader.build_graph()
        executor.migrate(executor.loader.graph.leaf_nodes())

    def _migrate(self):
        executor = MigrationExecutor(connection)
        executor.loader.build_graph()
        executor.migrate(AFTER)
        return executor.loader.project_state(AFTER).apps

    def test_moves_published_items_and_puts_loose_lessons_in_a_module(self):
        from accounts.models import User  # accounts is fully migrated; only learning is rolled back
        Playlist = self.old.get_model("learning", "Playlist")
        from pages.models import VideoItem  # pages is fully migrated too
        PlaylistItem = self.old.get_model("learning", "PlaylistItem")
        ItemProgress = self.old.get_model("learning", "ItemProgress")
        Enrollment = self.old.get_model("learning", "Enrollment")
        CourseRevision = self.old.get_model("learning", "CourseRevision")

        author_id = User.objects.create_user("pro", "pro@example.org", "Passw0rd!x", account_type="professional").pk
        learner_id = User.objects.create_user("learner", "l@example.org", "Passw0rd!x").pk
        today = datetime.date(2026, 9, 30)
        video = VideoItem.objects.create(title="Old video lesson", date=today, duration="5 min", excerpt="e", video_url="https://v.example/x")
        mixed = Playlist.objects.create(owner_id=author_id, title="Mixed", slug="mixed", status="published")
        lesson = mixed.lessons.create(kind="text", title="Written", body="<p>x</p>", approved=True)
        video_item = PlaylistItem.objects.create(playlist=mixed, video_id=video.pk, position=0)
        PlaylistItem.objects.create(playlist=mixed, lesson=lesson, position=1)
        Enrollment.objects.create(user_id=learner_id, playlist=mixed)
        ItemProgress.objects.create(user_id=learner_id, item=video_item)
        CourseRevision.objects.create(playlist=mixed, submitted_by_id=author_id, submitted_at=datetime.datetime(2026, 11, 1, tzinfo=datetime.timezone.utc), changes={"outline": {
            "modules": [], "loose_items": [{"kind": "video", "id": video.pk}, {"kind": "lesson", "id": lesson.pk}],
        }})
        only_published = Playlist.objects.create(owner_id=author_id, title="Published only", slug="published-only", status="published")
        PlaylistItem.objects.create(playlist=only_published, video_id=video.pk, position=0)

        apps = self._migrate()
        Playlist = apps.get_model("learning", "Playlist")
        mixed = Playlist.objects.get(slug="mixed")
        self.assertEqual([r.video_id for r in mixed.reading.all()], [video.pk])
        items = list(mixed.items.all())
        self.assertEqual([i.lesson_id for i in items], [lesson.pk])
        self.assertEqual(items[0].module.title, "Module 1")
        self.assertFalse(apps.get_model("learning", "ItemProgress").objects.exists())  # progress on the moved item is gone
        held = apps.get_model("learning", "CourseRevision").objects.get(playlist=mixed).changes["outline"]
        self.assertEqual(held, {"modules": [{"id": -1, "title": "Module 1", "summary": "", "items": [{"kind": "lesson", "id": lesson.pk}]}],
                                "loose_items": []})

        only_published = Playlist.objects.get(slug="published-only")
        self.assertEqual((only_published.items.count(), only_published.reading.count(), only_published.status), (0, 1, "published"))
