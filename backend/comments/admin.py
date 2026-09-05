from django.contrib import admin

from .models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("author", "content_type", "object_id", "status", "created_at")
    list_filter = ("status", "content_type")
    actions = ["mark_hidden", "mark_visible"]
    search_fields = ("body", "author__username", "author__display_name")

    @admin.action(description="Hide selected comments")
    def mark_hidden(self, request, queryset):
        queryset.update(status="hidden")

    @admin.action(description="Make selected comments visible")
    def mark_visible(self, request, queryset):
        queryset.update(status="visible")
