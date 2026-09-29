from django.contrib import admin
from django.utils import timezone

from .models import Purchase


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ("user", "content_type", "object_id", "content_title", "amount", "currency", "status", "provider", "created_at")
    list_filter = ("status", "provider", "content_type")
    search_fields = ("user__username", "user__email", "provider_ref")
    autocomplete_fields = ("user",)
    readonly_fields = ("created_at", "paid_at")
    fields = ("user", "content_type", "object_id", "amount", "currency", "status", "provider", "provider_ref", "created_at", "paid_at")

    @admin.display(description="Content")
    def content_title(self, obj):
        return str(obj.content) if obj.content else "— (deleted)"

    def save_model(self, request, obj, form, change):
        if obj.status == Purchase.STATUS_PAID and obj.paid_at is None:
            obj.paid_at = timezone.now()
        if not obj.provider:
            obj.provider = "manual"
        super().save_model(request, obj, form, change)
