from django.contrib import admin
from django.contrib.contenttypes.models import ContentType
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from django.urls import path, reverse
from django.utils import timezone
from django.utils.html import format_html
from django.utils.text import slugify
from engagement.models import Notification

from .models import BlogPost, JobApplication, Topic, UserBlogPost, UserVideoPost, VideoItem
from .richtext import sanitize_rich_text


def _notify_status(submission, kind, text, target=None):
    Notification.objects.create(
        recipient=submission.author,
        kind=kind,
        text=text,
        content_type=ContentType.objects.get_for_model(target) if target else None,
        object_id=target.pk if target else None,
    )


def _cms_link(obj, label):
    """A link to edit a live post/video in Wagtail (same host: both admins are on the CMS domain)."""
    if obj is None:
        return "Not published yet"
    url = reverse(f"wagtailsnippets_{obj._meta.app_label}_{obj._meta.model_name}:edit", args=[obj.pk])
    return format_html('<a href="{}">{}</a>', url, label)


def _submission_topics(submission):
    """The submission's chosen topics, plus its suggested new topic (created on approval)."""
    topics = list(submission.topics.all())
    if submission.other_topic:
        other, _ = Topic.objects.get_or_create(
            name=submission.other_topic, defaults={"slug": slugify(submission.other_topic)},
        )
        topics.append(other)
    return topics


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
    readonly_fields = ("status", "published_post", "live_in_cms", "reviewed_at", "reviewed_by")

    @admin.display(description="Live post")
    def live_in_cms(self, obj):
        return _cms_link(obj.published_post, "Open live post in CMS")

    @admin.action(description="Approve and publish selected submissions")
    def approve_and_publish(self, request, queryset):
        for submission in queryset.filter(status="pending"):
            fields = dict(
                title=submission.title,
                excerpt=submission.excerpt,
                # Converted to Wagtail rich text (and cleaned again, even though the
                # API cleans on save — the live post must never carry unsanitised
                # author HTML), so the CMS editor can open it without losing
                # uploaded images, underline, strikethrough or code blocks.
                body=[("rich_text", sanitize_rich_text(submission.body))],
                image=submission.image,
                access=submission.access,
                price=submission.price,
                currency=submission.currency,
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

            post.topics.set(_submission_topics(submission))

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
    readonly_fields = ("status", "published_video", "live_in_cms", "reviewed_at", "reviewed_by")

    @admin.display(description="Live video")
    def live_in_cms(self, obj):
        return _cms_link(obj.published_video, "Open live video in CMS")
    filter_horizontal = ("topics",)

    @admin.action(description="Approve and publish selected submissions")
    def approve_and_publish(self, request, queryset):
        for submission in queryset.filter(status="pending"):
            fields = dict(
                title=submission.title,
                duration=submission.duration,
                excerpt=submission.excerpt,
                video_url=submission.video_url,
                image=submission.thumbnail,
                access=submission.access,
                price=submission.price,
                currency=submission.currency,
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
            video.topics.set(_submission_topics(submission))

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


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    """
    Applications from the job pages' Apply form. Applicants' details are read-only;
    only the status is changed here. The CV is in private storage and is
    downloaded through this admin (superuser-only), never from /media/.
    """
    list_display = ("created_at", "name", "job", "status", "email_sent")
    list_filter = ("status", "job")
    search_fields = ("name", "email", "job__title")
    date_hierarchy = "created_at"
    readonly_fields = ("job", "name", "email", "phone", "linkedin", "portfolio", "experience", "message",
                       "cv_download", "consent_at", "email_sent", "created_at")
    fields = ("status", "job", "name", "email", "phone", "linkedin", "portfolio", "experience", "message",
              "cv_download", "consent_at", "email_sent", "created_at")
    actions = ["mark_reviewed", "mark_shortlisted", "mark_rejected"]

    def has_add_permission(self, request):
        return False  # applications come from the website's form only

    def get_urls(self):
        return [
            path("<int:pk>/cv/", self.admin_site.admin_view(self.download_cv), name="pages_jobapplication_cv"),
            *super().get_urls(),
        ]

    def download_cv(self, request, pk):
        application = get_object_or_404(JobApplication, pk=pk)
        if not application.cv:
            raise Http404("No CV on this application.")
        filename = f"CV - {application.name}.pdf".replace('"', "")
        return FileResponse(application.cv.open("rb"), as_attachment=True, filename=filename, content_type="application/pdf")

    @admin.display(description="CV")
    def cv_download(self, obj):
        if not obj.cv:
            return "—"
        return format_html('<a href="{}">Download CV (PDF)</a>', reverse("admin:pages_jobapplication_cv", args=[obj.pk]))

    def _set_status(self, request, queryset, status):
        count = queryset.update(status=status)
        self.message_user(request, f"{count} application(s) updated.")

    @admin.action(description="Mark as reviewed")
    def mark_reviewed(self, request, queryset):
        self._set_status(request, queryset, "reviewed")

    @admin.action(description="Mark as shortlisted")
    def mark_shortlisted(self, request, queryset):
        self._set_status(request, queryset, "shortlisted")

    @admin.action(description="Mark as not taken forward")
    def mark_rejected(self, request, queryset):
        self._set_status(request, queryset, "rejected")
