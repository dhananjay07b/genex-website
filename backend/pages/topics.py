"""
Topic housekeeping for the CMS: how many things use a topic, and merging
topics. Works off every many-to-many relation pointing at Topic (content,
courses, live sessions, blog submissions, Professional expertise), so new
relations are covered automatically.
"""
from django.db import transaction
from django.db.models import Count, IntegerField, OuterRef, Subquery, Value
from django.db.models.functions import Coalesce

from .models import Topic


def _topic_relations():
    """(through model, its FK name to Topic, its FK name to the tagged object) for each M2M onto Topic."""
    relations = []
    for rel in Topic._meta.related_objects:
        if not rel.many_to_many:
            continue
        through = rel.through
        topic_fk = next(f.name for f in through._meta.fields if f.is_relation and f.related_model is Topic)
        other_fk = next(
            f.name for f in through._meta.fields
            if f.is_relation and f.name != topic_fk and f.related_model is not None
        )
        relations.append((through, topic_fk, other_fk))
    return relations


def with_usage(queryset):
    """Annotate `usage`: how many items, courses, sessions and profiles carry each topic."""
    total = Value(0, output_field=IntegerField())
    for through, topic_fk, _ in _topic_relations():
        count = (
            through.objects.filter(**{topic_fk: OuterRef("pk")})
            .values(topic_fk).annotate(n=Count("pk")).values("n")
        )
        total = total + Coalesce(Subquery(count, output_field=IntegerField()), 0)
    return queryset.annotate(usage=total)


@transaction.atomic
def merge_topics(sources, target):
    """
    Move every tag from `sources` onto `target`, then delete `sources`.
    Something tagged with both keeps a single tag. Returns the number of tags moved.
    """
    source_ids = [t.pk for t in sources if t.pk != target.pk]
    moved = 0
    for through, topic_fk, other_fk in _topic_relations():
        # One source at a time, so an item tagged with two sources ends up with one target tag.
        for source_id in source_ids:
            already = list(through.objects.filter(**{topic_fk: target}).values_list(f"{other_fk}_id", flat=True))
            rows = through.objects.filter(**{f"{topic_fk}_id": source_id})
            moved += rows.exclude(**{f"{other_fk}_id__in": already}).update(**{topic_fk: target})
            rows.delete()  # tags the target already had
    Topic.objects.filter(pk__in=source_ids).delete()
    return moved
