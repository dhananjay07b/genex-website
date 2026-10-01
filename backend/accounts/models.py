from decimal import Decimal

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


def get_default_tier_id():
    """
    Membership tiers were removed (replaced by per-item access on content —
    see pages.models.AccessControlled). Kept only because migration
    accounts/0001 references this callable by import path.
    """
    return None


class User(AbstractUser):
    """
    Roles:
      - Admin        → `is_superuser`. Not an account_type; the only role allowed into /admin and /cms.
      - Company      → staff login created by Admin in Django admin, always linked to a Company.
      - Professional → self-registered; may link to a Company (verified by email domain) or name
                       an unlisted one in `company_other` (never verified).
      - Learner      → self-registered default.
    Role checks live in accounts/roles.py — don't compare account_type strings elsewhere.
    """
    ACCOUNT_LEARNER = "learner"
    ACCOUNT_PROFESSIONAL = "professional"
    ACCOUNT_COMPANY = "company"
    ACCOUNT_TYPE_CHOICES = [
        (ACCOUNT_LEARNER, "Learner"),
        (ACCOUNT_PROFESSIONAL, "Professional"),
        (ACCOUNT_COMPANY, "Company"),
    ]
    SELF_SERVICE_ACCOUNT_TYPES = (ACCOUNT_LEARNER, ACCOUNT_PROFESSIONAL)

    display_name = models.CharField(max_length=150, blank=True, help_text="Full name shown publicly on the profile, bylines and comments.")
    bio = models.TextField(blank=True)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, default=ACCOUNT_LEARNER, db_index=True)
    company = models.ForeignKey(
        "organizations.Company", null=True, blank=True,
        on_delete=models.PROTECT, related_name="members",
        help_text="Required for Company accounts. For Professionals, the registered company they claim to work for.",
    )
    company_other = models.CharField(
        max_length=150, blank=True,
        help_text="Professionals only: an unlisted company name. Never verified, shown without a logo or badge.",
    )
    company_verified = models.BooleanField(
        default=False,
        help_text="Professionals only: email domain matched the company and the email was confirmed.",
    )
    company_verified_at = models.DateTimeField(null=True, blank=True)
    role_title = models.CharField(max_length=150, blank=True, help_text="Job title/role at their company, e.g. 'Deputy GM, Grid Operations'")
    years_experience = models.PositiveSmallIntegerField(null=True, blank=True)
    linkedin_url = models.URLField(blank=True)
    expertise = models.ManyToManyField(
        "pages.Topic", blank=True, related_name="expert_users",
        help_text="Up to 3 — shown on the public profile and author cards.",
    )
    avatar = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    cover_photo = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    # GeLearn featuring — Admin-only; never exposed as writable through the API.
    is_featured = models.BooleanField(
        default=False, help_text="Show in 'Our Leading Professionals' on the GeLearn home page.",
    )
    featured_order = models.PositiveSmallIntegerField(default=0, help_text="Lower numbers come first.")
    gelearn_rating = models.DecimalField(
        max_digits=2, decimal_places=1, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("5"))],
        help_text="0.0 to 5.0, set by Genex. Shown on the Professional's cards.",
    )

    def __str__(self):
        return self.display_name or self.username

    def clean(self):
        super().clean()
        errors = {}
        if self.account_type == self.ACCOUNT_COMPANY:
            if not self.company_id:
                errors["company"] = "Company accounts must be linked to a company."
            if self.company_other:
                errors["company_other"] = "Company accounts can't use an unlisted company name."
        elif self.account_type == self.ACCOUNT_LEARNER:
            if self.company_id:
                errors["company"] = "Learners aren't linked to a company. Change the account type to Professional first."
        if self.company_id and self.company_other:
            errors["company_other"] = "Choose either a registered company or an unlisted name, not both."
        if self.account_type == self.ACCOUNT_COMPANY and not self.email:
            errors["email"] = "Company accounts sign in with their email — it's required."
        if self.email and type(self).objects.filter(email__iexact=self.email).exclude(pk=self.pk).exists():
            errors["email"] = "Another account already uses this email."
        if self.is_featured and self.account_type != self.ACCOUNT_PROFESSIONAL:
            errors["is_featured"] = "Only Professionals can be featured."
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        # Verification is tied to a specific (email, company) pair — changing
        # either means it has to be proven again.
        if self.pk and self.company_verified:
            previous = type(self).objects.filter(pk=self.pk).values("email", "company_id").first()
            if previous and (
                previous["email"].lower() != (self.email or "").lower()
                or previous["company_id"] != self.company_id
            ):
                self.company_verified = False
                self.company_verified_at = None
                update_fields = kwargs.get("update_fields")
                if update_fields is not None:
                    kwargs["update_fields"] = set(update_fields) | {"company_verified", "company_verified_at"}
        if self.account_type != self.ACCOUNT_PROFESSIONAL and self.company_verified:
            # The badge is a Professional concept; Company staff are trusted by
            # construction (see roles.display_company).
            self.company_verified = False
            self.company_verified_at = None
        super().save(*args, **kwargs)
