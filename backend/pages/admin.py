from django.contrib import admin
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from engagement.models import Notification

from .models import BlogPost, UserBlogPost, UserVideoPost, VideoItem


def _notify_status(submission, kind, text, target=None):
    Notification.objects.create(
        recipient=submission.author,
        kind=kind,
        text=text,
        content_type=ContentType.objects.get_for_model(target) if target else None,
        object_id=target.pk if target else None,
    )


@admin.register(UserBlogPost)
class UserBlogPostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "status", "created_at", "reviewed_at")
    list_filter = ("status",)
    search_fields = ("title", "author__username", "author__display_name")
    actions = ["approve_and_publish", "reject"]

    @admin.action(description="Approve and publish selected submissions")
    def approve_and_publish(self, request, queryset):
        for submission in queryset.filter(status="pending"):
            post = BlogPost.objects.create(
                title=submission.title,
                topic=submission.topic or "Community",
                date=timezone.now().date(),
                excerpt=submission.excerpt,
                body=[("rich_text", submission.body)],
            )
            submission.status = "published"
            submission.published_post = post
            submission.reviewed_at = timezone.now()
            submission.reviewed_by = request.user
            submission.save(update_fields=["status", "published_post", "reviewed_at", "reviewed_by"])
            _notify_status(submission, "blog_status", f'Your post "{submission.title}" was published.', post)

    @admin.action(description="Reject selected submissions")
    def reject(self, request, queryset):
        # Iterated (not bulk .update()) so per-instance hooks — e.g. the
        # notification created below — actually fire for every submission.
        for submission in queryset.filter(status="pending"):
            submission.status = "rejected"
            submission.reviewed_at = timezone.now()
            submission.reviewed_by = request.user
            submission.save(update_fields=["status", "reviewed_at", "reviewed_by"])
            _notify_status(submission, "blog_status", f'Your post "{submission.title}" was sent back with feedback.', submission)


@admin.register(UserVideoPost)
class UserVideoPostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "status", "created_at", "reviewed_at")
    list_filter = ("status",)
    search_fields = ("title", "author__username", "author__display_name")
    actions = ["approve_and_publish", "reject"]

    @admin.action(description="Approve and publish selected submissions")
    def approve_and_publish(self, request, queryset):
        for submission in queryset.filter(status="pending"):
            video = VideoItem.objects.create(
                title=submission.title,
                category=submission.topic or "Community",
                category_color="#1AAEE8",
                category_text_color="#ffffff",
                date=timezone.now().date(),
                duration="",
                excerpt=submission.excerpt,
                video_url=submission.video_url,
            )
            submission.status = "published"
            submission.published_video = video
            submission.reviewed_at = timezone.now()
            submission.reviewed_by = request.user
            submission.save(update_fields=["status", "published_video", "reviewed_at", "reviewed_by"])
            _notify_status(submission, "video_status", f'Your video "{submission.title}" was published.', video)

    @admin.action(description="Reject selected submissions")
    def reject(self, request, queryset):
        for submission in queryset.filter(status="pending"):
            submission.status = "rejected"
            submission.reviewed_at = timezone.now()
            submission.reviewed_by = request.user
            submission.save(update_fields=["status", "reviewed_at", "reviewed_by"])
            _notify_status(submission, "video_status", f'Your video "{submission.title}" was sent back with feedback.', submission)
