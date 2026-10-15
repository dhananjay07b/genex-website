import random
import re

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings


class AccountAdapter(DefaultAccountAdapter):
    """
    Points emailed account links at the GeLearn React app's own pages
    instead of allauth's server-rendered fallback templates, which this
    project doesn't use.
    """

    def get_email_confirmation_url(self, request, emailconfirmation):
        return f"{settings.GELEARN_FRONTEND_URL}/verify-email/{emailconfirmation.key}"

    def send_mail(self, template_prefix, email, context):
        """
        GeLearn's own email templates (accounts/templates/account/email/) also get
        the site address, and — when someone confirms a work email rather than
        their sign-in email — the company it would verify them for.
        """
        context = {**context, "gelearn_url": settings.GELEARN_FRONTEND_URL.rstrip("/")}
        user = context.get("user")
        if template_prefix.startswith("account/email/email_confirmation") and user is not None:
            if email.lower() != (user.email or "").lower():
                from .work_email import company_for_email
                company = company_for_email(email)
                context["work_company"] = company.name if company else None
        super().send_mail(template_prefix, email, context)


def _generate_google_username(name):
    """First 4 letters of the Google account's display name (alphabetic
    only, lowercased) + 8 random digits, e.g. "John Doe" -> "john84213097".
    Retries on the rare collision rather than trusting the random digits
    alone to be unique."""
    from .models import User

    letters = re.sub(r"[^a-zA-Z]", "", name or "")[:4].lower() or "user"
    for _ in range(20):
        candidate = f"{letters}{random.randint(10_000_000, 99_999_999)}"
        if not User.objects.filter(username=candidate).exists():
            return candidate
    return f"{letters}{random.randint(10_000_000, 99_999_999)}"


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Google supplies a real name and no username — replace allauth's default
    "first.last123"-style generated username with our own scheme (see
    `_generate_google_username`), and use the account's full name as-is for
    `display_name` rather than splitting it into first/last name fields.
    """

    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        name = (
            data.get("name")
            or f"{user.first_name} {user.last_name}".strip()
            or sociallogin.account.extra_data.get("name", "")  # Google's full-name claim
        )
        user.display_name = name
        user.username = _generate_google_username(name)
        return user
