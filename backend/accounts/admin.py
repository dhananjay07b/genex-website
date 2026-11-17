from allauth.account.models import EmailAddress
from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.template.response import TemplateResponse

from .models import User
from .purge import build_plan, purge_user
from .roles import display_company
from .verification import refresh_company_verification
from .work_email import ensure_sign_in_address


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        # first_name/last_name are inherited from Django's AbstractUser but unused —
        # `display_name` is the one name shown everywhere on GeLearn.
        ("Personal info", {"fields": ("display_name", "email", "bio", "career_goal")}),
        ("Account type & company", {
            "fields": ("account_type", "company", "company_other", "role_title", "verification_status"),
            "description": (
                "Company accounts must be linked to a registered company and are verified automatically. "
                "Professionals are verified when their confirmed email matches their company's domain."
            ),
        }),
        ("GeLearn featuring", {
            "fields": ("is_featured", "featured_order", "gelearn_rating"),
            "description": "Professionals only. Featured Professionals appear in 'Our Leading Professionals' on the GeLearn home page.",
        }),
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
    list_filter = ("account_type", "company", "company_verified", "is_featured", "is_superuser", "is_active")
    search_fields = ("username", "email", "display_name", "company__name", "company_other")
    autocomplete_fields = ("company",)
    actions = ["delete_with_gelearn_content"]

    @admin.action(description="Delete user and all their GeLearn content")
    def delete_with_gelearn_content(self, request, queryset):
        """Shows everything that will go (accounts/purge.py), then deletes on confirm."""
        if any(u.is_superuser for u in queryset):
            self.message_user(request, "Superusers can't be removed this way. Untick them and try again.", messages.ERROR)
            return None
        if request.POST.get("confirm") == "yes":
            users = list(queryset)
            for user in users:
                purge_user(user)
            self.message_user(request, f"Deleted {len(users)} user(s) and their GeLearn content.", messages.SUCCESS)
            return None
        context = {
            **self.admin_site.each_context(request),
            "title": "Delete users and all their GeLearn content?",
            "opts": self.model._meta,
            "plans": [build_plan(user) for user in queryset],
            "action_checkbox_name": admin.helpers.ACTION_CHECKBOX_NAME,
        }
        return TemplateResponse(request, "admin/accounts/user/purge_confirmation.html", context)

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
        old_email = User.objects.filter(pk=obj.pk).values_list("email", flat=True).first() if change else None
        super().save_model(request, obj, form, change)
        if obj.account_type == User.ACCOUNT_COMPANY and obj.email:
            # Admin-issued credentials: the email is trusted, so skip the
            # confirmation email allauth would otherwise expect.
            EmailAddress.objects.filter(user=obj).exclude(email__iexact=obj.email).update(primary=False)
            EmailAddress.objects.update_or_create(
                user=obj, email=obj.email.lower(),
                defaults={"verified": True, "primary": True},
            )
        elif obj.email:
            moved = bool(old_email) and old_email.lower() != obj.email.lower()
            if moved:
                # The old sign-in address goes. Left behind, it showed in Settings as
                # a work email waiting to be confirmed (work_email.work_address).
                EmailAddress.objects.filter(user=obj, email__iexact=old_email).delete()
            # The sign-in email becomes the primary address: a confirmed work email
            # keeps its confirmation, a new one is recorded unconfirmed.
            ensure_sign_in_address(obj)
            address = EmailAddress.objects.get(user=obj, email__iexact=obj.email)
            if moved and not address.verified:
                address.send_confirmation(request)  # Settings tells them a link was sent
        refresh_company_verification(obj)
