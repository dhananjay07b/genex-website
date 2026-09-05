from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.utils import OperationalError, ProgrammingError


class MembershipTier(models.Model):
    """
    Extensible tier registry. Gating checks compare `rank` rather than
    hardcoding tier names, so a new tier (e.g. a future paid "premium")
    is a data row, not a code/schema change.
    """
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    rank = models.PositiveIntegerField(default=0, help_text="Higher rank = more access")
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["rank"]

    def __str__(self):
        return self.name


def get_default_tier_id():
    """
    Every actual User row represents someone who has registered, so the
    default is the "registered" tier (the "free" tier represents anonymous
    visitors who have no User row at all) — created by the 0002 data
    migration. Falls back to the lowest-rank tier if that slug is missing.
    """
    try:
        tier = MembershipTier.objects.filter(slug="registered").first()
        if tier is None:
            tier = MembershipTier.objects.order_by("rank").first()
    except (OperationalError, ProgrammingError):
        return None
    return tier.pk if tier else None


class User(AbstractUser):
    membership_tier = models.ForeignKey(
        MembershipTier,
        on_delete=models.PROTECT,
        related_name="users",
        default=get_default_tier_id,
    )
    display_name = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.display_name or self.username
