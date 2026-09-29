from allauth.account.models import EmailAddress
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import MembershipTier, User
from .roles import display_company


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        # first_name/last_name are inherited from Django's AbstractUser but unused —
        # `display_name` is the one name shown everywhere on GeLearn.
        ("Personal info", {"fields": ("display_name", "email", "bio")}),
        ("Account type & company", {
            "fields": ("account_type", "company", "company_other", "role_title", "verification_status"),
            "description": (
                "Company accounts must be linked to a registered company and are verified automatically. "
                "Professionals are verified when their confirmed email matches their company's domain."
            ),
        }),
        ("Membership", {"fields": ("membership_tier",)}),
        ("Status", {"fields": ("is_active", "is_superuser")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "display_name", "account_type", "company", "password1", "password2"),
            "description": (
                "To create a Company staff login: choose account type 'Company' and the company. "
                "Share the email and password with them directly — they sign in on GeLearn, not here."
            ),
        }),
    )
    readonly_fields = ("verification_status", "last_login", "date_joined")
    list_display = ("username", "email", "account_type", "company", "verification_status", "is_superuser")
    list_filter = ("account_type", "company", "company_verified", "is_superuser", "is_active")
    search_fields = ("username", "email", "display_name", "company__name", "company_other")
    autocomplete_fields = ("company",)

    @admin.display(description="Verification")
    def verification_status(self, obj):
        """
        What the site actually shows. `company_verified` alone is misleading:
        it's the Professional-only proof flag, while Company staff are
        verified because Admin issued their login.
        """
        if not obj.pk:
            return "—"
        if obj.is_superuser:
            return "Admin (superuser)"
        if obj.account_type == User.ACCOUNT_COMPANY:
            if obj.company_id and obj.company.is_active:
                return "✓ Verified (company account)"
            return "✗ Not shown as verified: company inactive or missing"
        if obj.account_type == User.ACCOUNT_PROFESSIONAL:
            shown = display_company(obj)
            if shown and shown["verified"]:
                return f"✓ Verified on {obj.company_verified_at:%d %b %Y}" if obj.company_verified_at else "✓ Verified"
            if obj.company_id:
                return "Pending: waiting for the email on the company's domain to be confirmed"
            if obj.company_other:
                return "Not verifiable: unlisted company"
            return "No company"
        return "Not applicable (learner)"

    def save_model(self, request, obj, form, change):
        # is_staff only matters to Django admin, which is superuser-only anyway —
        # keep it in lock-step so no one else ever looks like staff.
        obj.is_staff = obj.is_superuser
        super().save_model(request, obj, form, change)
        if obj.account_type == User.ACCOUNT_COMPANY and obj.email:
            # Admin-issued credentials: the email is trusted, so skip the
            # confirmation email allauth would otherwise expect.
            EmailAddress.objects.filter(user=obj).exclude(email__iexact=obj.email).update(primary=False)
            EmailAddress.objects.update_or_create(
                user=obj, email=obj.email.lower(),
                defaults={"verified": True, "primary": True},
            )


@admin.register(MembershipTier)
class MembershipTierAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "rank")
