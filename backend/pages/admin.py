from django.contrib import admin
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from django.utils.text import slugify
from engagement.models import Notification

from .models import BlogPost, Topic, UserBlogPost, UserVideoPost, VideoItem


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
    # Django's default widget for a ManyToManyField is a plain <select
    # multiple> — same ctrl/cmd-click trap fixed on the Wagtail side for
    # BlogPost.topics. filter_horizontal gives the real dual-list widget.
    filter_horizontal = ("topics",)
    # status/published_post/reviewed_* only change via the actions above — a
    # plain form edit would flip the badge without ever creating the BlogPost
    # or notifying the author, which is exactly the bug that bit us once.
    readonly_fields = ("status", "published_post", "reviewed_at", "reviewed_by")

    @admin.action(description="Approve and publish selected submissions")
    def approve_and_publish(self, request, queryset):
        for submission in queryset.filter(status="pending"):
            fields = dict(
                title=submission.title,
                topic=submission.topic or "Community",
                excerpt=submission.excerpt,
                body=[("rich_text", submission.body)],
                image=submission.image,
            )
            # A submission that already has a published_post is a re-approval
            # of an edit — update the existing live post in place instead of
            # creating a duplicate.
            if submission.published_post_id:
                post = submission.published_post
                for field, value in fields.items():
                    setattr(post, field, value)
                post.save(update_fields=list(fields.keys()))
            else:
                post = BlogPost.objects.create(date=timezone.now().date(), **fields)

            topics = list(submission.topics.all())
            if submission.other_topic:
                other, _ = Topic.objects.get_or_create(
                    name=submission.other_topic, defaults={"slug": slugify(submission.other_topic)},
                )
                topics.append(other)
            post.topics.set(topics)

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
    readonly_fields = ("status", "published_video", "reviewed_at", "reviewed_by")

    @admin.action(description="Approve and publish selected submissions")
    def approve_and_publish(self, request, queryset):
        for submission in queryset.filter(status="pending"):
            fields = dict(
                title=submission.title,
                category=submission.topic or "Community",
                duration=submission.duration,
                excerpt=submission.excerpt,
                video_url=submission.video_url,
                image=submission.thumbnail,
            )
            # A submission that already has a published_video is a re-approval
            # of an edit — update the existing live video in place instead of
            # creating a duplicate.
            if submission.published_video_id:
                video = submission.published_video
                for field, value in fields.items():
                    setattr(video, field, value)
                video.save(update_fields=list(fields.keys()))
            else:
                video = VideoItem.objects.create(date=timezone.now().date(), **fields)

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
