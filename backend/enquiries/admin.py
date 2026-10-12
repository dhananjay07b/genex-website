from django.contrib import admin

from .models import Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    """Messages from the website's Contact form (and Careers applications). Read them here; mark them handled."""
    list_display = ("created_at", "name", "company", "project_type", "subject", "status", "email_sent")
    list_filter = ("status", "project_type", "email_sent")
    search_fields = ("name", "company", "email", "subject", "message")
    readonly_fields = ("name", "company", "email", "phone", "project_type", "subject", "message", "email_sent", "created_at")
    fields = ("status", "created_at", "name", "company", "email", "phone", "project_type", "subject", "message", "email_sent")
    actions = ["mark_handled", "mark_new"]

    def has_add_permission(self, request):
        return False  # enquiries come from the website

    @admin.action(description="Mark selected enquiries handled")
    def mark_handled(self, request, queryset):
        queryset.update(status=Enquiry.STATUS_HANDLED)

    @admin.action(description="Mark selected enquiries new")
    def mark_new(self, request, queryset):
        queryset.update(status=Enquiry.STATUS_NEW)
