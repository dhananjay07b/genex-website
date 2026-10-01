from django.contrib import admin
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone

from engagement.models import Notification

from .models import Enrollment, Playlist, PlaylistItem


class PlaylistItemInline(admin.TabularInline):
    model = PlaylistItem
    extra = 0
    fields = ("position", "video", "post")
    readonly_fields = ("position", "video", "post")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


def _notify(course, text):
    Notification.objects.create(
        recipient=course.owner, kind="course_status", text=text,
        content_type=ContentType.objects.get_for_model(course), object_id=course.pk,
    )


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "company", "status", "level", "featured", "access", "price", "item_count", "submitted_at", "reviewed_at")
    list_filter = ("status", "access", "level", "featured")
    search_fields = ("title", "owner__username", "owner__display_name")
    inlines = [PlaylistItemInline]
    actions = ["approve", "reject"]
    # Status only changes through the actions, so the owner is always notified.
    readonly_fields = ("owner", "slug", "status", "submitted_at", "reviewed_at", "reviewed_by", "created_at", "updated_at")
    fields = ("title", "slug", "owner", "company", "description", "cover", "level", "topics", "roles", "featured",
              "access", "price", "currency",
              "status", "rejection_reason", "submitted_at", "reviewed_at", "reviewed_by", "created_at", "updated_at")
    filter_horizontal = ("topics", "roles")

    @admin.display(description="Items")
    def item_count(self, obj):
        return obj.items.count()

    @admin.action(description="Approve and publish selected courses")
    def approve(self, request, queryset):
        for course in queryset.filter(status=Playlist.STATUS_PENDING):
            course.status = Playlist.STATUS_PUBLISHED
            course.reviewed_at = timezone.now()
            course.reviewed_by = request.user
            course.save(update_fields=["status", "reviewed_at", "reviewed_by"])
            _notify(course, f'Your course "{course.title}" is live.')

    @admin.action(description="Reject selected courses")
    def reject(self, request, queryset):
        for course in queryset.filter(status=Playlist.STATUS_PENDING):
            course.status = Playlist.STATUS_REJECTED
            course.reviewed_at = timezone.now()
            course.reviewed_by = request.user
            course.save(update_fields=["status", "reviewed_at", "reviewed_by"])
            _notify(course, f'Your course "{course.title}" was sent back with feedback.')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("user", "playlist", "enrolled_at")
    search_fields = ("user__username", "playlist__title")
