"""
Course reviews: who may review a course, how a review is shown, and the
course-wide rating (average, count and 5-to-1 distribution).
"""
from django.db.models import Count, IntegerField, OuterRef, Subquery
from django.db.models.functions import Coalesce

from accounts.roles import display_company

from .models import MIN_REVIEWS_FOR_RATING, CourseReview, Enrollment, ItemProgress, ReviewReply


def review_block_reason(user, course):
    """Why `user` can't review `course` (a message), or None if they can."""
    if not user.is_authenticated:
        return "Sign in to review this course."
    relation = course.relation_to(user)
    if relation == "owner":
        return "You can't review your own course."
    if relation == "instructor":
        return "You can't review a course you teach."
    if not Enrollment.objects.filter(user=user, playlist=course).exists():
        return "Enroll in the course to review it."
    if not ItemProgress.objects.filter(user=user, item__playlist=course).exists():
        return "Finish at least one lesson to review this course."
    return None


def with_progress(reviews):
    """Annotates each review with `lessons_done`: how many of the course's lessons its author has finished."""
    done = (
        ItemProgress.objects.filter(user=OuterRef("user"), item__playlist=OuterRef("playlist"))
        .values("user").annotate(n=Count("pk")).values("n")
    )
    return reviews.annotate(lessons_done=Coalesce(Subquery(done, output_field=IntegerField()), 0))


# Load each review's author and its reply (with the reply's author) in the same query.
REVIEW_SELECT = ("user__avatar", "user__company__logo", "reply__author__avatar", "reply__author__company")


def reply_payload(reply):
    """The course team's reply. A company account replies in the company's name, as the course publisher."""
    author = reply.author
    as_company = author.account_type == "company" and author.company_id
    return {
        "body": reply.body,
        "status": reply.status,
        "created_at": reply.created_at.isoformat(),
        "updated_at": reply.updated_at.isoformat(),
        "label": "Course publisher" if as_company else "Instructor",
        "author": {
            "username": None if as_company else author.username,
            "display_name": author.company.name if as_company else (author.display_name or author.username),
            "avatar_url": None if as_company else (author.avatar.file.url if author.avatar_id else None),
            "role_title": "" if as_company else author.role_title,
        },
    }


def review_payload(review, lesson_count, viewer=None, can_reply=False):
    """
    A review as the course page shows it. `lesson_count` is the course's number of
    lessons; `can_reply` is whether the viewer is on the course team (owner or
    instructor), who may reply and also see a reply Genex has hidden.
    """
    author = review.user
    done = getattr(review, "lessons_done", None)
    if done is None:
        done = ItemProgress.objects.filter(user=author, item__playlist_id=review.playlist_id).count()
    try:
        reply = review.reply
    except ReviewReply.DoesNotExist:
        reply = None
    if reply and reply.status != ReviewReply.STATUS_VISIBLE and not can_reply:
        reply = None
    return {
        "id": review.pk,
        "rating": review.rating,
        "reply": reply_payload(reply) if reply else None,
        "can_reply": can_reply,
        "body": review.body,
        "created_at": review.created_at.isoformat(),
        "updated_at": review.updated_at.isoformat(),
        "status": review.status,
        "completed_course": bool(lesson_count) and done >= lesson_count,
        "is_mine": bool(viewer and viewer.is_authenticated and viewer.pk == author.pk),
        "author": {
            "username": author.username,
            "display_name": author.display_name or author.username,
            "avatar_url": author.avatar.file.url if author.avatar_id else None,
            "role_title": author.role_title,
            "company": display_company(author),
        },
    }


def rating_summary(course):
    """
    Average, count and distribution of a course's visible reviews; None until it
    has MIN_REVIEWS_FOR_RATING of them, so one early review can't show as 5.0.
    """
    counts = dict(
        CourseReview.objects.filter(playlist=course, status=CourseReview.STATUS_VISIBLE)
        .values_list("rating").annotate(n=Count("pk"))
    )
    total = sum(counts.values())
    if total < MIN_REVIEWS_FOR_RATING:
        return None
    average = sum(stars * n for stars, n in counts.items()) / total
    return {
        "average": round(average, 1),
        "count": total,
        # Percentages per star, 5 down to 1.
        "distribution": [{"stars": s, "percent": round(counts.get(s, 0) * 100 / total)} for s in (5, 4, 3, 2, 1)],
    }


def card_rating(course):
    """The short rating for course cards, from the `rating_avg` / `rating_count` annotations."""
    count = getattr(course, "rating_count", 0) or 0
    if count < MIN_REVIEWS_FOR_RATING:
        return None
    return {"average": round(course.rating_avg, 1), "count": count}
