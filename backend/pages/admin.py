from django.contrib import admin
from django.utils import timezone

from .models import BlogPost, UserBlogPost


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
            )
            submission.status = "published"
            submission.published_post = post
            submission.reviewed_at = timezone.now()
            submission.reviewed_by = request.user
            submission.save(update_fields=["status", "published_post", "reviewed_at", "reviewed_by"])

    @admin.action(description="Reject selected submissions")
    def reject(self, request, queryset):
        queryset.filter(status="pending").update(
            status="rejected", reviewed_at=timezone.now(), reviewed_by=request.user,
        )
