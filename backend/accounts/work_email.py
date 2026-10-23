"""
A Professional's work email: a second address, used only to prove they work
at a registered Company (see verification.py). Sign-in stays on their own
email. Typical case: signed up with Gmail through Google, works at Acme.

Stored as a non-primary allauth EmailAddress, confirmed with the same link
flow as sign-up (/verify-email/<key>). Confirming it links the Professional to
the Company that owns its domain and verifies them.
"""
from allauth.account.models import EmailAddress
from django.db import transaction
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from organizations.models import Company

from .models import User
from .verification import refresh_company_verification


def work_address(user):
    """The user's work email (pending or confirmed), if any: their non-primary address."""
    return EmailAddress.objects.filter(user=user).exclude(email__iexact=user.email).first()


def ensure_sign_in_address(user):
    """
    Give the sign-in email its own primary EmailAddress row. Accounts made in
    Admin or by scripts have none, and allauth makes the first address
    confirmed without a primary the primary — replacing the sign-in email.
    """
    sign_in = EmailAddress.objects.filter(user=user, email__iexact=user.email).first()
    if sign_in is None:
        EmailAddress.objects.filter(user=user).update(primary=False)
        EmailAddress.objects.create(user=user, email=user.email, primary=True, verified=False)
    elif not sign_in.primary:
        EmailAddress.objects.filter(user=user).update(primary=False)
        EmailAddress.objects.filter(pk=sign_in.pk).update(primary=True)


def company_for_email(email):
    """The active Company whose domains include this address, if any."""
    for company in Company.objects.filter(is_active=True).prefetch_related("domains"):
        if company.owns_email(email):
            return company
    return None


def on_address_confirmed(address):
    """A work email was just confirmed: link its company, then re-check verification."""
    user = address.user
    if user.account_type == User.ACCOUNT_PROFESSIONAL and address.email.lower() != (user.email or "").lower():
        company = company_for_email(address.email)
        if company is not None and user.company_id != company.pk:
            user.company, user.company_other = company, ""
            user.save(update_fields=["company", "company_other"])
    refresh_company_verification(user)


def on_email_confirmed(request, email_address, **kwargs):
    """allauth's email_confirmed signal: sign-in email or work email."""
    on_address_confirmed(email_address)


def _payload(user):
    address = work_address(user)
    if address is None:
        return {"email": None, "verified": False, "company": None}
    company = company_for_email(address.email)
    return {
        "email": address.email,
        "verified": address.verified,
        "company": {"name": company.name, "slug": company.slug} if company else None,
    }


class WorkEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        user = self.context["user"]
        value = value.strip().lower()
        if value == (user.email or "").lower():
            raise serializers.ValidationError("That's already your sign-in email.")
        taken = (
            User.objects.filter(email__iexact=value).exclude(pk=user.pk).exists()
            or EmailAddress.objects.filter(email__iexact=value, verified=True).exclude(user=user).exists()
        )
        if taken:
            raise serializers.ValidationError("Another account already uses this email.")
        if company_for_email(value) is None:
            raise serializers.ValidationError(
                "This email's domain doesn't belong to a company registered on GeLearn. "
                "Ask your company to contact Genex, or keep your company as 'Other'."
            )
        return value


class WorkEmailView(APIView):
    """
    GET    → the work email and whether it's confirmed.
    POST   {"email"} → set it (replacing any earlier one) and send a confirmation link.
    DELETE → remove it; verification is re-checked.
    Professionals only.
    """
    permission_classes = [IsAuthenticated]
    throttle_scope = "work-email"

    def get_throttles(self):
        # Only sending links is limited; reading the status is not.
        return [ScopedRateThrottle()] if self.request.method == "POST" else []

    def _check(self, request):
        if request.user.account_type != User.ACCOUNT_PROFESSIONAL:
            return Response({"detail": "Work email verification is for Professional accounts."}, status=status.HTTP_403_FORBIDDEN)
        return None

    def get(self, request):
        return self._check(request) or Response(_payload(request.user))

    def post(self, request):
        if (refused := self._check(request)) is not None:
            return refused
        data = WorkEmailSerializer(data=request.data, context={"user": request.user})
        data.is_valid(raise_exception=True)
        email = data.validated_data["email"]
        current = work_address(request.user)
        if current is not None and current.email.lower() == email and current.verified:
            return Response(_payload(request.user))  # already confirmed: nothing to send
        with transaction.atomic():
            ensure_sign_in_address(request.user)
            EmailAddress.objects.filter(user=request.user).exclude(email__iexact=request.user.email).delete()
            address = EmailAddress.objects.create(user=request.user, email=email, primary=False, verified=False)
        address.send_confirmation(request._request)
        refresh_company_verification(User.objects.get(pk=request.user.pk))  # a replaced confirmed address may have been their proof
        return Response(_payload(request.user), status=status.HTTP_201_CREATED)

    def delete(self, request):
        if (refused := self._check(request)) is not None:
            return refused
        EmailAddress.objects.filter(user=request.user).exclude(email__iexact=request.user.email).delete()
        refresh_company_verification(User.objects.get(pk=request.user.pk))  # current company link, not a stale copy
        return Response(status=status.HTTP_204_NO_CONTENT)
