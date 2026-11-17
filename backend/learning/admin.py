from django import forms
from django.conf import settings
from django.contrib import admin, messages
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from django.utils.html import format_html, format_html_join
from django.utils.safestring import mark_safe

from engagement.models import Notification

from .models import (
    MAX_FAQS, MAX_MODULES, MAX_ROLES, MAX_TOPICS, PROMISED_FIELDS, CourseFAQ, CourseLesson, CourseModule, Certificate, CourseReview, CourseRevision,
    Enrollment, Playlist, PlaylistItem, ReviewReply, instructor_problem,
)
from .revisions import apply_revision, live_value, outline_lesson_ids, revision_of


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


def _short(value, limit=160):
    text = ", ".join(value) if isinstance(value, list) else ("" if value is None else str(value))
    return (text[:limit] + "…") if len(text) > limit else (text or "(empty)")


class CourseRevisionInline(admin.StackedInline):
    """A live course's changes waiting for review: what each part is now and what the author wants it to be."""
    model = CourseRevision
    extra = 0
    max_num = 1
    can_delete = False
    fields = ("status", "submitted_at", "submitted_by", "comparison", "rejection_reason")
    readonly_fields = ("status", "submitted_at", "submitted_by", "comparison")
    verbose_name_plural = "Pending changes (learners still see the live version; Approve applies them, Reject sends them back with the reason below)"

    def has_add_permission(self, request, obj=None):
        return False

    @admin.display(description="Changes")
    def comparison(self, revision):
        course, rows = revision.playlist, []
        for field in PROMISED_FIELDS:
            if field in revision.changes:
                rows.append((Playlist._meta.get_field(field).verbose_name.capitalize(), _short(live_value(course, field)), _short(revision.changes[field])))
        if "faqs" in revision.changes:
            rows.append(("FAQs", f"{course.faqs.count()} questions", "; ".join(q for q, _ in revision.changes["faqs"]) or "(none)"))
        if "outline" in revision.changes:
            new = revision.changes["outline"]
            lessons = sum(len(m["items"]) for m in new["modules"]) + len(new["loose_items"])
            rows.append(("Modules", "; ".join(course.modules.values_list("title", flat=True)) or "(none)",
                         f"{'; '.join(m['title'] for m in new['modules']) or '(none)'} ({lessons} lessons)"))
            added = course.lessons.filter(pk__in=outline_lesson_ids(new), approved=False).values_list("title", flat=True)
            if added:
                rows.append(("New lessons", "(not live)", "; ".join(added)))
        if revision.changes.get("lessons"):
            edited = course.lessons.filter(pk__in=revision.changes["lessons"]).values_list("title", flat=True)
            rows.append(("Edited lessons", "(see “Lessons written for this course” below)", "; ".join(edited)))
        body = format_html_join("", "<tr><th style='padding:4px 12px 4px 0'>{}</th><td style='padding:4px 12px'>{}</td><td style='padding:4px 0'>{}</td></tr>", rows)
        return format_html("<table><tr><th></th><th style='text-align:left;padding:4px 12px'>Live now</th><th style='text-align:left'>Proposed</th></tr>{}</table>", body)


class PendingChangesFilter(admin.SimpleListFilter):
    title = "pending changes"
    parameter_name = "changes"

    def lookups(self, request, model_admin):
        return [("pending", "Waiting for review"), ("rejected", "Sent back")]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(revision__status=self.value())
        return queryset


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
    fields = ("position", "module", "video", "post", "article", "research", "whitepaper", "podcast", "lesson")
    readonly_fields = ("position", "module", "video", "post", "article", "research", "whitepaper", "podcast", "lesson")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


def _rich(html):
    # Sanitised when saved (pages.richtext.sanitize_submission_html), so it's safe to render.
    if not html:
        return "(empty)"
    return format_html('<div style="max-height:420px;overflow:auto;border:1px solid #ddd;padding:12px;max-width:760px">{}</div>', mark_safe(html))


def _questions(questions, pass_mark):
    """A quiz for review: each question with its answers, the right ones marked ✓."""
    if not questions:
        return "(no questions yet)"
    blocks = []
    for n, q in enumerate(questions, 1):
        options = format_html_join("", "<li>{}{}</li>", ((("✓ " if i in q["correct"] else ""), o) for i, o in enumerate(q["options"])))
        explanation = format_html("<div style='color:#555'>Why: {}</div>", q["explanation"]) if q.get("explanation") else ""
        blocks.append(format_html("<div style='margin:0 0 10px'><b>{}. {}</b><ul style='margin:4px 0'>{}</ul>{}</div>", n, q["prompt"], options, explanation))
    return format_html("<div style='max-width:760px'><p>Pass mark: {}%</p>{}</div>", pass_mark, mark_safe("".join(blocks)))


def _video(url, duration):
    if not url:
        return "(no link yet)"
    return format_html('<a href="{0}" target="_blank" rel="noopener">{0}</a> · {1}', url, duration or "no length")


class CourseLessonInline(admin.StackedInline):
    """
    Lessons written inside the course: what learners will read and watch, for
    review with the rest of the course. Authors edit them in the course builder.
    On a live course, a lesson's edits waiting for review show next to the live version.
    """
    model = CourseLesson
    extra = 0
    can_delete = False
    verbose_name_plural = "Lessons written for this course"
    fields = ("kind", "title", "status", "is_preview", "preview", "video", "content", "quiz", "waiting")
    readonly_fields = fields

    def has_add_permission(self, request, obj=None):
        return False

    @admin.display(description="Status")
    def status(self, obj):
        in_outline = obj.items.exists()
        if obj.pending:
            state = "Live · edits waiting for review (below)"
        elif obj.approved:
            state = "Approved"
        else:
            state = "Not yet approved"
        return f"{state} · {'in the outline' if in_outline else 'not in the live outline (learners never see it)'}"

    @admin.display(description="Preview")
    def preview(self, obj):
        # The lesson page shows the course team and Admin the version with edits waiting for review.
        url = f"{settings.GELEARN_FRONTEND_URL.rstrip('/')}/courses/{obj.playlist.slug}/lessons/{obj.pk}"
        return format_html('<a href="{}" target="_blank" rel="noopener">Preview on GeLearn</a>', url)

    @admin.display(description="Video (live)")
    def video(self, obj):
        return _video(obj.video_url, obj.duration) if obj.kind == CourseLesson.KIND_VIDEO else "—"

    @admin.display(description="Text (live)")
    def content(self, obj):
        return _rich(obj.body)

    @admin.display(description="Quiz (live)")
    def quiz(self, obj):
        from .quizzes import live_questions
        return _questions(live_questions(obj), obj.pass_mark) if obj.kind == CourseLesson.KIND_QUIZ else "—"

    @admin.display(description="Waiting for review")
    def waiting(self, obj):
        """The proposed version of each changed field. Approve applies them; Reject sends them back."""
        if not obj.pending:
            return "—"
        rows = []
        if "title" in obj.pending:
            rows.append(("Title", obj.pending["title"]))
        if "video_url" in obj.pending or "duration" in obj.pending:
            rows.append(("Video", _video(obj.pending.get("video_url", obj.video_url), obj.pending.get("duration", obj.duration))))
        if "body" in obj.pending:
            rows.append(("Text", _rich(obj.pending["body"])))
        if "questions" in obj.pending or "pass_mark" in obj.pending:
            from .quizzes import live_questions
            questions = obj.pending.get("questions", live_questions(obj))
            rows.append(("Quiz", _questions(questions, obj.pending.get("pass_mark", obj.pass_mark))))
        return format_html_join("", "<p style='margin:0 0 4px'><b>{}</b></p><div style='margin:0 0 12px'>{}</div>", rows)


def _notify(course, text):
    Notification.objects.create(
        recipient=course.owner, kind="course_status", text=text,
        content_type=ContentType.objects.get_for_model(course), object_id=course.pk,
    )


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    form = PlaylistAdminForm
    list_display = ("title", "owner", "company", "status", "changes_waiting", "level", "featured", "access", "price", "item_count", "submitted_at", "reviewed_at")
    list_filter = ("status", PendingChangesFilter, "access", "level", "featured")
    search_fields = ("title", "owner__username", "owner__display_name")
    inlines = [CourseRevisionInline, CourseModuleInline, PlaylistItemInline, CourseLessonInline, CourseFAQInline]
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

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("owner", "company", "revision")

    @admin.display(description="Changes")
    def changes_waiting(self, obj):
        revision = revision_of(obj)
        return revision.get_status_display() if revision else ""

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
            # Reviewed with the course: the lessons its outline uses. Others wait until they're added (and reviewed).
            course.lessons.filter(pk__in=course.items.filter(lesson__isnull=False).values("lesson")).update(approved=True)
            _notify(course, f'Your course "{course.title}" is live.')
        # Live courses with changes waiting: apply them; the course never went offline.
        for course in queryset.filter(status=Playlist.STATUS_PUBLISHED, revision__status=CourseRevision.STATUS_PENDING):
            apply_revision(course)
            course.reviewed_at = timezone.now()
            course.reviewed_by = request.user
            course.save(update_fields=["reviewed_at", "reviewed_by"])
            _notify(course, f'Your changes to "{course.title}" are live.')

    @admin.action(description="Reject selected courses (or their pending changes)")
    def reject(self, request, queryset):
        for course in queryset.filter(status=Playlist.STATUS_PENDING):
            course.status = Playlist.STATUS_REJECTED
            course.reviewed_at = timezone.now()
            course.reviewed_by = request.user
            course.save(update_fields=["status", "reviewed_at", "reviewed_by"])
            _notify(course, f'Your course "{course.title}" was sent back with feedback.')
        # Live courses: the live version stays; the author sees the reason typed in "Pending changes".
        for revision in CourseRevision.objects.filter(
            playlist__in=queryset.filter(status=Playlist.STATUS_PUBLISHED), status=CourseRevision.STATUS_PENDING,
        ).select_related("playlist"):
            revision.status = CourseRevision.STATUS_REJECTED
            revision.save(update_fields=["status"])
            _notify(revision.playlist, f'Your changes to "{revision.playlist.title}" were sent back with feedback. The live course is unchanged.')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("user", "playlist", "enrolled_at")
    search_fields = ("user__username", "playlist__title")


class ReviewReplyInline(admin.StackedInline):
    """The course team's reply. Written on GeLearn; Genex can only hide or show it."""
    model = ReviewReply
    extra = 0
    max_num = 1
    can_delete = False
    fields = ("author", "body", "status", "created_at", "updated_at")
    readonly_fields = ("author", "body", "created_at", "updated_at")

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(CourseReview)
class CourseReviewAdmin(admin.ModelAdmin):
    """Reviews go live straight away; Genex hides any that break the rules. Learners write and edit them on GeLearn."""
    list_display = ("playlist", "user", "rating", "status", "short_body", "created_at")
    list_filter = ("status", "rating")
    search_fields = ("playlist__title", "user__username", "user__display_name", "body")
    readonly_fields = ("playlist", "user", "rating", "body", "created_at", "updated_at")
    fields = ("playlist", "user", "rating", "body", "status", "created_at", "updated_at")
    inlines = [ReviewReplyInline]
    actions = ["hide", "show", "hide_replies"]

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

    @admin.action(description="Hide the replies on selected reviews")
    def hide_replies(self, request, queryset):
        ReviewReply.objects.filter(review__in=queryset).update(status=ReviewReply.STATUS_HIDDEN)


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    """
    Certificates are issued automatically when a learner opens every lesson of a
    live course. Genex can revoke one (with a reason) or restore it, and fix the
    printed name after the learner's one correction. They are never created or
    deleted here.
    """
    list_display = ("code", "learner_name", "course_title", "issued_at", "status")
    list_filter = ("status",)
    search_fields = ("code", "learner_name", "user__username", "user__email", "playlist__title")
    fields = ("code", "user", "playlist", "learner_name", "name_corrected", "issued_at", "printed", "status", "revoked_reason")
    readonly_fields = ("code", "user", "playlist", "name_corrected", "issued_at", "printed", "status")
    actions = ["revoke", "restore"]

    @admin.display(description="Course")
    def course_title(self, obj):
        return obj.snapshot.get("course", {}).get("title", "")

    @admin.display(description="As printed")
    def printed(self, obj):
        snap = obj.snapshot
        people = ", ".join(f"{p['name']} ({p['role_title'] or 'Instructor'})" for p in snap.get("instructors", [])) or "none listed"
        publisher = (snap.get("publisher") or {}).get("name", "no company")
        course = snap.get("course", {})
        return f"{course.get('title', '')} · {course.get('lessons', 0)} lessons · instructors: {people} · offered by {publisher}"

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.action(description="Revoke selected certificates (type the reason on each first)")
    def revoke(self, request, queryset):
        for certificate in queryset.filter(status=Certificate.STATUS_VALID):
            certificate.status = Certificate.STATUS_REVOKED
            certificate.revoked_reason = certificate.revoked_reason or "Revoked by Genex."
            certificate.save(update_fields=["status", "revoked_reason"])

    @admin.action(description="Restore selected certificates")
    def restore(self, request, queryset):
        queryset.update(status=Certificate.STATUS_VALID, revoked_reason="")
