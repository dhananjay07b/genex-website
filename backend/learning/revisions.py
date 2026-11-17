"""
Pending changes to live courses (Phase 8). An edit to what a live course
promises (PROMISED_FIELDS, its modules or its FAQs) is held in a
CourseRevision while learners keep seeing the live course. Approving the
course in Django admin applies the revision; rejecting it keeps the live course.

The course's own lessons (CourseLesson) join in: an edit to an approved lesson
is held on the lesson (`pending`) and listed under the revision's "lessons" key;
a new lesson isn't approved, so adding it to the outline holds the outline.
Approving applies the held edits and approves the lessons the outline uses.
"""
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from .models import ITEM_KINDS, PROMISED_FIELDS, CourseFAQ, CourseModule, CourseRevision, Playlist, PlaylistItem
from .serializers import library_for_course


def is_live(course):
    return course.status == Playlist.STATUS_PUBLISHED


def _delete(course, revision):
    revision.delete()
    Playlist.revision.related.delete_cached_value(course)  # so `course.revision` doesn't return the deleted row


def revision_of(course):
    try:
        return course.revision
    except CourseRevision.DoesNotExist:
        return None


def _json(field, value):
    """A field value as stored in a revision (prices as strings, so JSON keeps them exact)."""
    if field == "price":
        return None if value is None else str(Decimal(value).quantize(Decimal("0.01")))
    return value


def live_outline(course):
    """The course's current modules and lessons, in the outline format the builder sends."""
    def ref(item):
        return {"kind": item.kind, "id": getattr(item, f"{ITEM_KINDS[item.kind][0]}_id")}
    items = list(course.items.all())
    modules = [
        {"id": m.pk, "title": m.title, "summary": m.summary, "items": [ref(i) for i in items if i.module_id == m.pk]}
        for m in course.modules.all()
    ]
    known = {m["id"] for m in modules}
    return {"modules": modules, "loose_items": [ref(i) for i in items if i.module_id not in known]}


def live_value(course, key):
    if key == "lessons":  # ids of lessons with edits held for review; none on the live course
        return []
    if key == "faqs":
        return [[f.question, f.answer] for f in course.faqs.all()]
    if key == "outline":
        return live_outline(course)
    return _json(key, getattr(course, key))


def normalise_outline(modules_in, loose):
    """Outline input as stored: stripped text, and new modules numbered -1, -2, … so lessons can point at them."""
    modules, new_id = [], -1
    for spec in modules_in:
        module_id = spec.get("id")
        if not module_id or module_id < 0:
            module_id, new_id = new_id, new_id - 1
        modules.append({
            "id": module_id, "title": spec["title"].strip(), "summary": spec.get("summary", "").strip(),
            "items": [{"kind": r["kind"], "id": r["id"]} for r in spec["items"]],
        })
    return {"modules": modules, "loose_items": [{"kind": r["kind"], "id": r["id"]} for r in loose]}


def stage(course, user, updates):
    """
    Hold `updates` ({key: value}) for review instead of applying them. A value
    equal to the live course drops that key; an empty revision is deleted.
    Saving again after Genex sent the changes back puts them back in review.
    """
    revision = revision_of(course)
    changes = dict(revision.changes) if revision else {}
    for key, value in updates.items():
        value = _json(key, value)
        if value == live_value(course, key):
            changes.pop(key, None)
        else:
            changes[key] = value
    if not changes:
        if revision:
            _delete(course, revision)
        return None
    if revision is None:
        revision = CourseRevision(playlist=course)
    if revision.changes != changes or revision.status != CourseRevision.STATUS_PENDING or revision.pk is None:
        revision.changes = changes
        revision.status = CourseRevision.STATUS_PENDING
        revision.rejection_reason = ""
        revision.submitted_at = timezone.now()
        revision.submitted_by = user
        revision.save()
    return revision


def lessons_with_edits(course):
    return sorted(course.lessons.filter(pending__isnull=False).values_list("pk", flat=True))


def restage_lessons(course, user):
    """
    After a lesson of a live course changed: list the lessons with held edits in
    the revision (dropping it when nothing is held any more). Changes Genex sent
    back go back into review, as when any other part is saved again.
    """
    return stage(course, user, {"lessons": lessons_with_edits(course)})


def outline_lesson_ids(outline):
    refs = [r for m in outline["modules"] for r in m["items"]] + outline["loose_items"]
    return {r["id"] for r in refs if r["kind"] == "lesson"}


def drop_from_held_outline(course, user, lesson_id):
    """A deleted lesson leaves the outline waiting for review too."""
    revision = revision_of(course)
    if not (revision and "outline" in revision.changes):
        return
    outline = revision.changes["outline"]
    keep = lambda refs: [r for r in refs if not (r["kind"] == "lesson" and r["id"] == lesson_id)]  # noqa: E731
    stage(course, user, {"outline": {
        "modules": [{**m, "items": keep(m["items"])} for m in outline["modules"]],
        "loose_items": keep(outline["loose_items"]),
    }})


def sync_items(course, rows):
    """
    Make the course's lessons exactly `rows` ((ref, module_id) pairs, in order),
    updating rows that already exist so learners keep the lessons they've
    finished. Lessons no longer listed are removed (with their progress).
    """
    existing = {}
    for item in course.items.all():
        existing[(item.kind, getattr(item, f"{ITEM_KINDS[item.kind][0]}_id"))] = item
    keep, changed, new = set(), [], []
    for position, (ref, module_id) in enumerate(rows):
        item = existing.get((ref["kind"], ref["id"]))
        if item is None:
            new.append(PlaylistItem(playlist=course, position=position, module_id=module_id,
                                    **{f"{ITEM_KINDS[ref['kind']][0]}_id": ref["id"]}))
            continue
        keep.add(item.pk)
        if (item.position, item.module_id) != (position, module_id):
            item.position, item.module_id = position, module_id
            changed.append(item)
    course.items.exclude(pk__in=keep).delete()
    PlaylistItem.objects.bulk_update(changed, ["position", "module"])
    PlaylistItem.objects.bulk_create(new)


def apply_outline(course, outline):
    """Write an outline to the course. Unknown or negative module ids become new modules. Returns True if any module was added or reworded."""
    current = {m.pk: m for m in course.modules.all()}
    reworded, rows, kept = False, [], []
    for position, spec in enumerate(outline["modules"]):
        title, summary = spec["title"].strip(), spec.get("summary", "").strip()
        module = current.get(spec.get("id"))
        if module is None:
            module = CourseModule.objects.create(playlist=course, title=title, summary=summary, position=position)
            reworded = True
        else:
            if (module.title, module.summary) != (title, summary):
                reworded = True
            module.title, module.summary, module.position = title, summary, position
            module.save(update_fields=["title", "summary", "position"])
        kept.append(module.pk)
        rows += [(ref, module.pk) for ref in spec["items"]]
    rows += [(ref, None) for ref in outline["loose_items"]]
    course.modules.exclude(pk__in=kept).delete()
    sync_items(course, rows)
    # Removing a lesson can leave some learners with every remaining lesson opened.
    from .certificates import issue_due
    issue_due(course)
    return reworded


def apply_faqs(course, faqs):
    course.faqs.all().delete()
    CourseFAQ.objects.bulk_create([
        CourseFAQ(playlist=course, question=q, answer=a, position=i) for i, (q, a) in enumerate(faqs)
    ])


def _still_allowed(course, outline):
    """Drops lessons whose content was deleted or unpublished while the changes waited for review."""
    library = library_for_course(course)
    allowed = {kind: set(qs.values_list("pk", flat=True)) for kind, qs in library.items()}
    ok = lambda refs: [r for r in refs if r["id"] in allowed.get(r["kind"], ())]  # noqa: E731
    return {
        "modules": [{**m, "items": ok(m["items"])} for m in outline["modules"]],
        "loose_items": ok(outline["loose_items"]),
    }


@transaction.atomic
def apply_revision(course):
    """Approve: write the held changes to the live course and delete the revision."""
    revision = revision_of(course)
    if revision is None:
        return False
    changes = revision.changes
    for field in PROMISED_FIELDS:
        if field in changes:
            value = changes[field]
            setattr(course, field, Decimal(value) if field == "price" and value is not None else value)
    if "faqs" in changes:
        apply_faqs(course, changes["faqs"])
    if "outline" in changes:
        outline = _still_allowed(course, changes["outline"])
        course.lessons.filter(pk__in=outline_lesson_ids(outline)).update(approved=True)
        apply_outline(course, outline)
    apply_lesson_edits(course)
    course.save()
    _delete(course, revision)
    return True


def apply_lesson_edits(course):
    """Write each lesson's held edits to the live lesson (on approval)."""
    for lesson in course.lessons.filter(pending__isnull=False):
        for field, value in lesson.pending.items():
            setattr(lesson, field, value)
        lesson.pending = None
        lesson.save()


def withdraw(course):
    """Drop everything waiting for review: the revision and the lessons' held edits. New lessons stay as unpublished drafts."""
    revision = revision_of(course)
    if revision:
        _delete(course, revision)
    course.lessons.filter(pending__isnull=False).update(pending=None)


def rewords(course, outline):
    """True if the outline adds a module or changes a module's title or summary (what needs review on a live course)."""
    current = {m.pk: (m.title, m.summary) for m in course.modules.all()}
    return any(current.get(m["id"]) != (m["title"], m["summary"]) for m in outline["modules"])
