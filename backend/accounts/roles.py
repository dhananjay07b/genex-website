"""
Single source of truth for role checks. Everything else (views, serializers,
permission classes) should ask these helpers instead of comparing
`account_type` strings or `is_superuser` directly.
"""
from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import User


def _authed(user):
    return bool(user and user.is_authenticated)


def is_admin(user):
    return _authed(user) and user.is_superuser


def is_company(user):
    return _authed(user) and user.account_type == User.ACCOUNT_COMPANY and user.company_id is not None


def is_professional(user):
    return _authed(user) and user.account_type == User.ACCOUNT_PROFESSIONAL


def is_learner(user):
    return _authed(user) and user.account_type == User.ACCOUNT_LEARNER


def is_contributor(user):
    """Can publish content of some kind (Company staff or Professional)."""
    return is_company(user) or is_professional(user)


def display_company(user):
    """
    How a user's company is shown next to their name and content, or None.
      - Company staff: their Company, logo, verified (Admin created them).
      - Professional linked to an active Company: logo + verified only once
        `company_verified` is set (domain matched and email confirmed).
      - Professional with an unlisted company: name only, never verified.
    """
    company = user.company if user.company_id else None
    if company is not None and company.is_active:
        verified = user.account_type == User.ACCOUNT_COMPANY or (
            user.account_type == User.ACCOUNT_PROFESSIONAL and user.company_verified
        )
        return {
            "name": company.name,
            "slug": company.slug,
            "logo_url": company.logo_url if verified else None,
            "verified": verified,
        }
    if user.account_type == User.ACCOUNT_PROFESSIONAL and user.company_other:
        return {"name": user.company_other, "slug": None, "logo_url": None, "verified": False}
    return None


# ── DRF permission classes ───────────────────────────────────────────────────

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user)


class IsCompanyUser(BasePermission):
    """Company staff — Admin passes too so they can act anywhere."""
    def has_permission(self, request, view):
        return is_company(request.user) or is_admin(request.user)


class IsProfessional(BasePermission):
    def has_permission(self, request, view):
        return is_professional(request.user) or is_admin(request.user)


class IsContributor(BasePermission):
    def has_permission(self, request, view):
        return is_contributor(request.user) or is_admin(request.user)


class IsOwnerOrAdminOrReadOnly(BasePermission):
    """Object-level: reads are open, writes need the object's `author` or Admin."""
    owner_field = "author_id"

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if is_admin(request.user):
            return True
        return getattr(obj, getattr(view, "owner_field", self.owner_field), None) == request.user.id
