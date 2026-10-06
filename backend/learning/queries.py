"""
Published-course querysets shared by the course API and GeLearn's home and
search. Counts use subqueries so they don't multiply each other's joins.
"""
from django.db.models import Avg, Count, FloatField, IntegerField, OuterRef, Subquery, Sum, Value
from django.db.models.functions import Coalesce

from .models import CourseReview, Enrollment, Playlist, PlaylistItem


def _count(model, field):
    return Coalesce(
        Subquery(
            model.objects.filter(**{field: OuterRef("pk")}).values(field).annotate(n=Count("pk")).values("n"),
            output_field=IntegerField(),
        ),
        Value(0),
    )


def with_course_stats(queryset):
    """
    Adds `item_count` (lessons), `enrolled_count`, `video_seconds` (total
    length of the course's videos; posts have no fixed length), and
    `rating_avg` / `rating_count` over its visible reviews.
    """
    visible_reviews = CourseReview.objects.filter(playlist=OuterRef("pk"), status=CourseReview.STATUS_VISIBLE).values("playlist")
    video_seconds = (
        PlaylistItem.objects.filter(playlist=OuterRef("pk"), video__isnull=False)
        .values("playlist").annotate(s=Sum("video__duration_seconds")).values("s")
    )
    return queryset.annotate(
        item_count=_count(PlaylistItem, "playlist"),
        enrolled_count=_count(Enrollment, "playlist"),
        video_seconds=Coalesce(Subquery(video_seconds, output_field=IntegerField()), Value(0)),
        rating_avg=Subquery(visible_reviews.annotate(a=Avg("rating")).values("a"), output_field=FloatField()),
        rating_count=Coalesce(Subquery(visible_reviews.annotate(n=Count("pk")).values("n"), output_field=IntegerField()), Value(0)),
    )


def course_queryset():
    """Courses in any status, with stats and the relations course pages need."""
    return with_course_stats(
        Playlist.objects
        .select_related("owner__avatar", "owner__company__logo", "company__logo", "cover")
        .prefetch_related("topics", "roles")
    )


def published_courses():
    return course_queryset().filter(status=Playlist.STATUS_PUBLISHED)
