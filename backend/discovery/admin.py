from django.contrib import admin

from .models import SearchQuery, ViewEvent


@admin.register(ViewEvent)
class ViewEventAdmin(admin.ModelAdmin):
    list_display = ("content_type", "object_id", "user", "viewed_at")
    list_filter = ("content_type",)
    readonly_fields = ("user", "content_type", "object_id", "viewed_at")


@admin.register(SearchQuery)
class SearchQueryAdmin(admin.ModelAdmin):
    list_display = ("query", "result_count", "user", "created_at")
    search_fields = ("query",)
    readonly_fields = ("query", "result_count", "user", "created_at")
