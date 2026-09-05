from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import MembershipTier, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Membership", {"fields": ("membership_tier", "display_name", "bio")}),
    )
    list_display = ("username", "email", "membership_tier", "is_staff")
    list_filter = DjangoUserAdmin.list_filter + ("membership_tier",)


@admin.register(MembershipTier)
class MembershipTierAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "rank")
