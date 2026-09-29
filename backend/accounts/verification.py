"""
Company verification for Professionals, in one place.

A Professional is verified for their linked Company only when ALL hold:
  1. the Company is active,
  2. their account email sits on one of the Company's domains,
  3. they've confirmed that email (allauth EmailAddress.verified).

`refresh_company_verification` recomputes this from scratch and is called
wherever any input can change: registration, profile updates, email
confirmation, and Admin edits to a user or a company's domains.
"""
from allauth.account.models import EmailAddress
from django.utils import timezone
from rest_framework import serializers

from organizations.models import Company

from .models import User


def email_is_confirmed(user):
    return bool(user.email) and EmailAddress.objects.filter(
        user=user, email__iexact=user.email, verified=True,
    ).exists()


def qualifies_for_verification(user):
    company = user.company if user.company_id else None
    return (
        user.account_type == User.ACCOUNT_PROFESSIONAL
        and company is not None
        and company.is_active
        and company.owns_email(user.email)
        and email_is_confirmed(user)
    )


def refresh_company_verification(user):
    """Bring `company_verified` in line with reality; returns the new value."""
    verified = qualifies_for_verification(user)
    if verified != user.company_verified:
        user.company_verified = verified
        user.company_verified_at = timezone.now() if verified else None
        User.objects.filter(pk=user.pk).update(
            company_verified=user.company_verified, company_verified_at=user.company_verified_at,
        )
    return verified


def refresh_company_members(company):
    """After Admin edits a company (domains, active flag) — re-check its verified experts."""
    for user in company.members.filter(account_type=User.ACCOUNT_PROFESSIONAL):
        refresh_company_verification(user)


def _domain_list(company):
    return ", ".join(f"@{d}" for d in company.domains.values_list("domain", flat=True))


def resolve_professional_company(email, company_id, company_other, *, email_field="email"):
    """
    Validate a Professional's company choice. Exactly one of a registered
    `company_id` or a free-text `company_other` is required.

    Returns (company_or_None, company_other). Raises a field-keyed
    ValidationError the frontend can show inline.
    """
    company_other = (company_other or "").strip()

    if company_id:
        company = Company.objects.filter(pk=company_id, is_active=True).first()
        if company is None:
            raise serializers.ValidationError(
                {"company_id": "That company isn't available on GeLearn. Pick another, or choose 'Other'."}
            )
        if not company.owns_email(email):
            raise serializers.ValidationError({
                email_field: (
                    f"Use your official {_domain_list(company)} email to get verified as a {company.name} expert, "
                    f"or choose 'Other' to continue without verification."
                ),
            })
        return company, ""

    if company_other:
        listed = Company.objects.filter(name__iexact=company_other, is_active=True).first()
        if listed is not None:
            raise serializers.ValidationError({
                "company_other": f"{listed.name} is registered on GeLearn — select it from the list to get verified.",
            })
        return None, company_other

    raise serializers.ValidationError({"company_id": "Select your company, or choose 'Other' and type its name."})
