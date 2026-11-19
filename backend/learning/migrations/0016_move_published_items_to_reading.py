"""
Course outlines now hold only the course's own lessons (text, video, quiz).

- Published content that was a lesson (video, post, article, research,
  whitepaper, podcast) moves to the course's Further reading, in the same order.
  Learners' progress on those items is deleted with them; issued certificates
  keep their own snapshot and stay valid.
- Every lesson now sits in a module: lessons outside any module go to the
  course's last module, or to a new "Module 1" when the course has none.
- Changes held for review get the same treatment, so approving them later
  can't bring published content back into an outline.

After migrating, run `manage.py issue_certificates`: a learner who had opened
every remaining lesson has now finished the course.
"""
from django.db import migrations

READING_FIELDS = ["video", "post", "article", "research", "whitepaper", "podcast"]


def _target_field(item):
    return next((f for f in READING_FIELDS if getattr(item, f"{f}_id")), None)


def move_items(apps, schema_editor):
    Playlist = apps.get_model("learning", "Playlist")
    PlaylistItem = apps.get_model("learning", "PlaylistItem")
    CourseReading = apps.get_model("learning", "CourseReading")
    CourseModule = apps.get_model("learning", "CourseModule")
    CourseRevision = apps.get_model("learning", "CourseRevision")

    for course in Playlist.objects.all():
        items = list(PlaylistItem.objects.filter(playlist=course).order_by("position", "id"))
        reading, seen, moved = [], set(), []
        for item in items:
            field = _target_field(item)
            if field is None:
                continue
            moved.append(item.pk)
            key = (field, getattr(item, f"{field}_id"))
            if key in seen:
                continue
            seen.add(key)
            reading.append(CourseReading(playlist=course, position=len(reading), **{f"{field}_id": key[1]}))
        CourseReading.objects.bulk_create(reading)
        # Deleting the items also deletes learners' progress on them (ItemProgress cascades).
        PlaylistItem.objects.filter(pk__in=moved).delete()

        loose = PlaylistItem.objects.filter(playlist=course, module__isnull=True)
        if loose.exists():
            module = CourseModule.objects.filter(playlist=course).order_by("-position", "-id").first()
            if module is None:
                module = CourseModule.objects.create(playlist=course, title="Module 1", summary="", position=0)
            loose.update(module=module)

    for revision in CourseRevision.objects.all():
        outline = revision.changes.get("outline")
        if not outline:
            continue
        lessons_only = lambda refs: [r for r in refs if r.get("kind") == "lesson"]  # noqa: E731
        modules = [{**m, "items": lessons_only(m["items"])} for m in outline.get("modules", [])]
        loose = lessons_only(outline.get("loose_items", []))
        if loose:
            if modules:
                modules[-1]["items"] += loose
            else:
                new_id = min([m["id"] for m in modules if m["id"] < 0], default=0) - 1
                modules.append({"id": new_id, "title": "Module 1", "summary": "", "items": loose})
        revision.changes["outline"] = {"modules": modules, "loose_items": []}
        revision.save(update_fields=["changes"])


class Migration(migrations.Migration):

    dependencies = [
        ("learning", "0015_course_reading"),
    ]

    operations = [
        migrations.RunPython(move_items, migrations.RunPython.noop),
    ]
