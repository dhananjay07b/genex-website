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

from .models import CourseLesson, Enrollment, Playlist

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


# What an edit to an approved lesson of a live course holds for review (CourseLesson.pending).
# "Free preview" isn't among them: it changes who can open the lesson, not what it says.
# A quiz's questions ride along as a list of dicts (learning/quizzes.py).
REVIEWED_FIELDS = ("title", "video_url", "duration", "body", "pass_mark", "questions")


def live_value(lesson, field):
    if field == "questions":
        from .quizzes import live_questions
        return live_questions(lesson)
    return getattr(lesson, field)


def with_pending(lesson, extra=None):
    """
    The author's version of `lesson`: the live lesson with its held edits (and
    `extra`) laid over it, as an unsaved copy. Learners never get this.
    """
    changes = {**(lesson.pending or {}), **(extra or {})}
    if not changes:
        return lesson
    from pages.durations import parse_duration_seconds
    copy = CourseLesson(**{f.attname: getattr(lesson, f.attname) for f in CourseLesson._meta.concrete_fields})
    for field, value in changes.items():
        # Questions are rows, not a field: the copy carries them for quizzes.lesson_questions.
        setattr(copy, "_questions" if field == "questions" else field, value)
    copy.duration_seconds = parse_duration_seconds(copy.duration) if copy.kind == copy.KIND_VIDEO else None
    copy.playlist = lesson.playlist
    return copy


def held_edits(lesson, wanted):
    """`wanted` ({field: value}) on top of what's already held, minus fields equal to the live lesson; None when nothing differs."""
    merged = {**(lesson.pending or {}), **{k: v for k, v in wanted.items() if k in REVIEWED_FIELDS}}
    return {k: v for k, v in merged.items() if v != live_value(lesson, k)} or None


def shown_version(lesson, author_view):
    """The lesson as the page shows it (and a quiz is graded): live, or for the course team with held edits. Returns (lesson, has_pending)."""
    has_pending = author_view and bool(lesson.pending)
    return (with_pending(lesson) if has_pending else lesson), has_pending


def lesson_payload(lesson, item, user, author_view=False):
    """
    What the lesson page shows: the live lesson, or for the course team its
    version with edits waiting for review (`has_pending` then says so). A quiz
    comes without its answers, with the viewer's best result so far.
    """
    from .quizzes import best_attempt, for_learner, lesson_questions
    from .serializers import lesson_own_minutes
    lesson, has_pending = shown_version(lesson, author_view)
    quiz = None
    if lesson.kind == lesson.KIND_QUIZ:
        quiz = {
            "questions": for_learner(lesson_questions(lesson)),
            "pass_mark": lesson.pass_mark,
            "best": best_attempt(user, lesson),
        }
    return {
        "quiz": quiz,
        "has_pending": has_pending,
        "approved": lesson.approved,
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
