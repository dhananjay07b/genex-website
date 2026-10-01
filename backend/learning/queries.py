"""
Published-course querysets shared by the course API and GeLearn's home and
search. Counts use subqueries so they don't multiply each other's joins.
"""
from django.db.models import Count, IntegerField, OuterRef, Subquery, Sum, Value
from django.db.models.functions import Coalesce

from .models import Enrollment, Playlist, PlaylistItem


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
    Adds `item_count` (lessons), `enrolled_count` and `video_seconds`
    (total length of the course's videos; posts have no fixed length).
    """
    video_seconds = (
        PlaylistItem.objects.filter(playlist=OuterRef("pk"), video__isnull=False)
        .values("playlist").annotate(s=Sum("video__duration_seconds")).values("s")
    )
    return queryset.annotate(
        item_count=_count(PlaylistItem, "playlist"),
        enrolled_count=_count(Enrollment, "playlist"),
        video_seconds=Coalesce(Subquery(video_seconds, output_field=IntegerField()), Value(0)),
    )


def published_courses():
    return with_course_stats(
        Playlist.objects.filter(status=Playlist.STATUS_PUBLISHED)
        .select_related("owner__avatar", "owner__company__logo", "company__logo", "cover")
        .prefetch_related("topics", "roles")
    )
