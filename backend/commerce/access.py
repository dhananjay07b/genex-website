"""
The single access check for gated content (anything inheriting
pages.models.AccessControlled). Serializers call this — never the frontend's
own idea of who can see what.
"""
from django.contrib.contenttypes.models import ContentType

from accounts.roles import is_admin, is_company

from .models import Purchase


def purchased_ids(user, model, cache=None):
    """Object ids of `model` the user has a paid Purchase for (memoised in `cache` if given)."""
    if not user or not user.is_authenticated:
        return frozenset()
    key = ("purchased", user.pk, model._meta.label_lower)
    if cache is not None and key in cache:
        return cache[key]
    ids = frozenset(
        Purchase.objects.filter(
            user=user, status=Purchase.STATUS_PAID,
            content_type=ContentType.objects.get_for_model(model),
        ).values_list("object_id", flat=True)
    )
    if cache is not None:
        cache[key] = ids
    return ids


def has_access(user, obj, cache=None):
    """
    `cache` is an optional dict shared across one request (e.g. a serializer's
    context) so a list of 200 items costs one purchase query, not 200.
    """
    if getattr(obj, "access", None) in (None, "free"):
        return True  # free, or content with no access setting (GeAcademy, research, whitepapers)
    if not user or not user.is_authenticated:
        return False
    if obj.access == obj.ACCESS_MEMBERS:
        return True
    # Paid.
    if is_admin(user) or user.pk in obj.access_owner_ids():
        return True
    company_id = getattr(obj, "company_id", None)
    if company_id and is_company(user) and user.company_id == company_id:
        return True  # any staff login of the publishing company
    return obj.pk in purchased_ids(user, type(obj), cache)
