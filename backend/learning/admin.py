from django import forms
from django.contrib import admin, messages
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone

from engagement.models import Notification

from .models import (
    MAX_FAQS, MAX_MODULES, MAX_ROLES, MAX_TOPICS, CourseFAQ, CourseModule, CourseReview, Enrollment, Playlist, PlaylistItem,
    instructor_problem,
)


class CourseModuleInline(admin.TabularInline):
    model = CourseModule
    extra = 0
    max_num = MAX_MODULES
    fields = ("position", "title", "summary")


class CourseFAQInline(admin.StackedInline):
    model = CourseFAQ
    extra = 0
    max_num = MAX_FAQS
    fields = ("position", "question", "answer")


class PlaylistAdminForm(forms.ModelForm):
    """Applies the course builder's rules in admin too, so a slip here can't create a course the site can't show."""

    class Meta:
        model = Playlist
        fields = "__all__"

    def clean(self):
        data = super().clean()
        # `company` is read-only here, so the course's own company decides who may teach it.
        people = data.get("instructors")
        if people is not None:
            problem = instructor_problem(self.instance.company, list(people))
            if problem:
                self.add_error("instructors", problem)
        topics, roles = data.get("topics"), data.get("roles")
        if topics is not None and len(topics) > MAX_TOPICS:
            self.add_error("topics", f"Choose at most {MAX_TOPICS} topics.")
        if roles is not None and len(roles) > MAX_ROLES:
            self.add_error("roles", f"Choose at most {MAX_ROLES} career roles.")
        return data


class PlaylistItemInline(admin.TabularInline):
    model = PlaylistItem
    extra = 0
    fields = ("position", "module", "video", "post", "article", "research", "whitepaper", "podcast")
    readonly_fields = ("position", "module", "video", "post", "article", "research", "whitepaper", "podcast")
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
    form = PlaylistAdminForm
    list_display = ("title", "owner", "company", "status", "level", "featured", "access", "price", "item_count", "submitted_at", "reviewed_at")
    list_filter = ("status", "access", "level", "featured")
    search_fields = ("title", "owner__username", "owner__display_name")
    inlines = [CourseModuleInline, PlaylistItemInline, CourseFAQInline]
    actions = ["approve", "reject"]
    # Status only changes through the actions, so the owner is always notified.
    # Company is fixed when the course is created (Company Studio sets it, a
    # Professional's course has none): changing it would hand the course to
    # another publisher and lock its author out.
    readonly_fields = ("owner", "company", "slug", "status", "submitted_at", "reviewed_at", "reviewed_by", "created_at", "updated_at")
    fields = ("title", "slug", "owner", "company", "summary", "description", "outcomes", "prerequisites", "language",
              "instructors", "cover", "level", "topics", "roles", "featured",
              "access", "price", "currency",
              "status", "rejection_reason", "submitted_at", "reviewed_at", "reviewed_by", "created_at", "updated_at")
    filter_horizontal = ("topics", "roles")
    autocomplete_fields = ("instructors",)

    @admin.display(description="Items")
    def item_count(self, obj):
        return obj.items.count()

    def has_add_permission(self, request):
        # Courses are created by their authors in the course builder, which sets the owner and company.
        return False

    @admin.action(description="Approve and publish selected courses")
    def approve(self, request, queryset):
        empty = queryset.filter(status=Playlist.STATUS_PENDING, items__isnull=True)
        if empty.exists():
            # A lesson's content can be deleted after the course was submitted.
            self.message_user(request, "Not approved (no lessons left): " + ", ".join(c.title for c in empty), messages.WARNING)
        for course in queryset.filter(status=Playlist.STATUS_PENDING).exclude(pk__in=empty.values("pk")):
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


@admin.register(CourseReview)
class CourseReviewAdmin(admin.ModelAdmin):
    """Reviews go live straight away; Genex hides any that break the rules. Learners write and edit them on GeLearn."""
    list_display = ("playlist", "user", "rating", "status", "short_body", "created_at")
    list_filter = ("status", "rating")
    search_fields = ("playlist__title", "user__username", "user__display_name", "body")
    readonly_fields = ("playlist", "user", "rating", "body", "created_at", "updated_at")
    fields = ("playlist", "user", "rating", "body", "status", "created_at", "updated_at")
    actions = ["hide", "show"]

    @admin.display(description="Review")
    def short_body(self, obj):
        return (obj.body[:80] + "…") if len(obj.body) > 80 else obj.body

    def has_add_permission(self, request):
        return False

    @admin.action(description="Hide selected reviews")
    def hide(self, request, queryset):
        queryset.update(status=CourseReview.STATUS_HIDDEN)

    @admin.action(description="Show selected reviews again")
    def show(self, request, queryset):
        queryset.update(status=CourseReview.STATUS_VISIBLE)
