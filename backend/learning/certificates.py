"""
Certificates of completion. A learner earns one by opening every lesson of a
live course from inside the course while enrolled (ItemProgress rows are only
created that way); manual ticking no longer exists.
"""
import secrets

from django.contrib.contenttypes.models import ContentType
from django.db import IntegrityError, transaction
from django.utils import timezone

from accounts.roles import display_company, display_publisher
from engagement.models import Notification

from .models import Certificate, Enrollment, ItemProgress, Playlist
from .serializers import ITEM_SELECT, lesson_minutes

CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"  # no 0/O or 1/I/L


def new_code():
    while True:
        part = lambda: "".join(secrets.choice(CODE_ALPHABET) for _ in range(4))  # noqa: E731
        code = f"GL-{part()}-{part()}"
        if not Certificate.objects.filter(code=code).exists():
            return code


def _person(user):
    """An instructor as printed: name, designation, and their company only once it's verified."""
    company = display_company(user)
    return {
        "name": user.display_name or user.username,
        "username": user.username,
        "role_title": user.role_title,
        "company": {"name": company["name"], "logo_url": company["logo_url"]} if company and company["verified"] else None,
    }


def snapshot_of(course):
    """Everything the certificate prints about the course, frozen at issue time."""
    items = list(course.items.select_related(*ITEM_SELECT))
    if course.company_id:
        people = [_person(p) for p in course.listed_instructors().select_related("company__logo")]
        publisher = display_publisher(course.company)
    else:
        people = [_person(course.owner)]
        shown = display_company(course.owner)
        publisher = display_publisher(course.owner.company) if shown and shown["verified"] else None
    return {
        "course": {
            "title": course.title, "slug": course.slug, "level": course.level,
            "lessons": len(items), "minutes": sum(lesson_minutes(i.target, i.kind) for i in items),
        },
        "instructors": people,
        "publisher": {"name": publisher["name"], "slug": publisher["slug"], "logo_url": publisher["logo_url"]} if publisher else None,
    }


def has_finished(user, course):
    """Opened every lesson of the course (a course with no lessons can't be finished)."""
    total = course.items.count()
    return total > 0 and ItemProgress.objects.filter(user=user, item__playlist=course).count() >= total


def issue_if_finished(user, course):
    """Issues the certificate the moment a learner finishes a live course. Returns it (new or existing), or None."""
    if course.status != Playlist.STATUS_PUBLISHED or not Enrollment.objects.filter(user=user, playlist=course).exists():
        return None
    existing = Certificate.objects.filter(user=user, playlist=course).first()
    if existing or not has_finished(user, course):
        return existing
    try:
        with transaction.atomic():
            certificate = Certificate.objects.create(
                code=new_code(), user=user, playlist=course, issued_at=timezone.now(),
                learner_name=(user.display_name or user.username)[:80], snapshot=snapshot_of(course),
            )
    except IntegrityError:  # issued by a parallel request a moment ago
        return Certificate.objects.filter(user=user, playlist=course).first()
    Notification.objects.create(
        recipient=user, kind="certificate",
        text=f'You earned a certificate for "{course.title}".'[:300],
        content_type=ContentType.objects.get_for_model(certificate), object_id=certificate.pk,
    )
    return certificate


def issue_due(course):
    """After lessons are removed, learners who have now opened every remaining lesson get their certificate."""
    if course.status != Playlist.STATUS_PUBLISHED:
        return 0
    issued = 0
    for enrollment in course.enrollments.select_related("user").exclude(user__certificates__playlist=course):
        if issue_if_finished(enrollment.user, course):
            issued += 1
    return issued


def certificate_payload(certificate, viewer):
    """
    A certificate as its page shows it, to anyone with the link. A revoked one
    reveals only that it was revoked (and for which course), never the learner.
    """
    mine = bool(viewer and viewer.is_authenticated and viewer.pk == certificate.user_id)
    snapshot = certificate.snapshot
    base = {"code": certificate.code, "status": certificate.status, "issued_at": certificate.issued_at.isoformat(), "is_mine": mine}
    if certificate.status == Certificate.STATUS_REVOKED:
        return {**base, "revoked_reason": certificate.revoked_reason if mine else "", "course": {"title": snapshot["course"]["title"]}}
    course = certificate.playlist
    live = course is not None and course.status == Playlist.STATUS_PUBLISHED
    return {
        **base,
        "learner_name": certificate.learner_name,
        "can_correct_name": mine and not certificate.name_corrected,
        "course": {**snapshot["course"], "path": f"/courses/{course.slug}" if live else None},
        "instructors": snapshot["instructors"],
        "publisher": snapshot["publisher"],
    }
