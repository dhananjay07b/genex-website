"""
Who can open a course's own lessons (learning.CourseLesson), and what they get.

A lesson isn't published anywhere else on GeLearn, so it opens only from its
course:
  - anyone, when the author marked it a free preview (live courses only);
  - the course team (owner, the publishing company's logins, instructors) and Admin;
  - enrolled learners who can open the course (paid courses: a purchase).
"""
from accounts.roles import is_admin
from commerce.access import has_access

from .models import Enrollment, Playlist

SIGN_IN = "sign_in"
ENROLL = "enroll"
PAID = "paid"


def is_course_team(user, course):
    return user.is_authenticated and (is_admin(user) or course.relation_to(user) is not None)


def lesson_block(user, lesson, enrolled=None, cache=None):
    """Why `user` can't open `lesson` (a code: SIGN_IN, ENROLL or PAID), or None when they can."""
    course = lesson.playlist
    if lesson.is_preview and course.status == Playlist.STATUS_PUBLISHED:
        return None
    if not user.is_authenticated:
        return SIGN_IN
    if is_course_team(user, course):
        return None
    if not has_access(user, course, cache):
        return PAID
    if enrolled is None:
        enrolled = Enrollment.objects.filter(user=user, playlist=course).exists()
    return None if enrolled else ENROLL


BLOCK_MESSAGES = {
    SIGN_IN: "Sign in and enroll in the course to open this lesson.",
    ENROLL: "Enroll in the course to open this lesson.",
    PAID: "This lesson is part of a paid course. Checkout is coming soon.",
}


def lesson_payload(lesson, item):
    """What the lesson page shows. Live (approved) fields only."""
    from .serializers import lesson_own_minutes
    return {
        "id": lesson.pk,
        "item_id": item.pk if item else None,
        "kind": lesson.kind,
        "title": lesson.title,
        "video_url": lesson.video_url if lesson.kind == lesson.KIND_VIDEO else "",
        "duration": lesson.duration if lesson.kind == lesson.KIND_VIDEO else "",
        "body": lesson.body,
        "is_preview": lesson.is_preview,
        "minutes": lesson_own_minutes(lesson),
    }
