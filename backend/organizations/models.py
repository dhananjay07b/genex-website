import re

from django.core.exceptions import ValidationError
from django.db import models

# Free/consumer mailbox providers. A company domain on this list would let
# anyone "verify" as that company's employee, so they're rejected outright.
PUBLIC_EMAIL_DOMAINS = frozenset({
    "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "ymail.com",
    "outlook.com", "hotmail.com", "live.com", "msn.com", "icloud.com", "me.com",
    "aol.com", "proton.me", "protonmail.com", "zoho.com", "zohomail.in",
    "rediffmail.com", "gmx.com", "mail.com", "yandex.com",
})

_DOMAIN_RE = re.compile(r"^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$")


def normalize_domain(value):
    return (value or "").strip().lower().lstrip("@").rstrip(".")


class Company(models.Model):
    """
    A registered organisation on GeLearn (Genex itself, Google, etc.). Created
    and managed only by the superuser in Django admin. Company staff logins
    (User.account_type = company) and domain-verified Professionals both
    point at a Company.
    """
    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=160, unique=True)
    logo = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
        help_text="Small square logo (SVG or PNG) shown next to everything this company or its verified experts publish.",
    )
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(
        default=True,
        help_text="Inactive companies disappear from the registration dropdown and their professionals lose the verified badge. Use this instead of deleting.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Companies"

    def __str__(self):
        return self.name

    @property
    def logo_url(self):
        return self.logo.file.url if self.logo_id else None

    def owns_email(self, email):
        """True if `email` sits on one of this company's domains (or a subdomain of one)."""
        email_domain = normalize_domain((email or "").rpartition("@")[2])
        if not email_domain:
            return False
        for domain in self.domains.values_list("domain", flat=True):
            if email_domain == domain or email_domain.endswith("." + domain):
                return True
        return False


class CompanyDomain(models.Model):
    """An official email domain for a Company, e.g. `google.com`. Used to verify professionals."""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="domains")
    domain = models.CharField(
        max_length=253, unique=True,
        help_text="Email domain only, e.g. 'google.com' (subdomains like 'in.google.com' are accepted automatically).",
    )

    class Meta:
        ordering = ["domain"]

    def __str__(self):
        return self.domain

    def clean(self):
        self.domain = normalize_domain(self.domain)
        if not _DOMAIN_RE.match(self.domain):
            raise ValidationError({"domain": "Enter a valid domain like 'google.com' (no '@', no 'https://')."})
        if self.domain in PUBLIC_EMAIL_DOMAINS:
            raise ValidationError({"domain": "Public email providers can't be used to verify company employees."})

    def save(self, *args, **kwargs):
        self.domain = normalize_domain(self.domain)
        super().save(*args, **kwargs)
