"""
Courses on GeLearn are playlists: an ordered set of a Professional's own
published videos and blog posts, with a cover and an access level. Learners
enroll and tick items off as they go.
"""
from datetime import timedelta

from django import forms
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils.text import slugify
from wagtail.admin.panels import FieldPanel, FieldRowPanel, MultiFieldPanel
from wagtail.snippets.models import register_snippet

from pages.models import AccessControlled


# Limits shared by the course builder API, Django admin and the models.
MAX_TOPICS = 5
MAX_ROLES = 3
MAX_OUTCOMES = 8
MAX_PREREQUISITES = 5
MAX_LINE = 120
MAX_INSTRUCTORS = 3
MAX_MODULES = 20
MAX_FAQS = 6
# What a live course promises learners: changing any of these (or the course's
# modules or FAQs) waits for Genex review in a CourseRevision.
PROMISED_FIELDS = ("title", "summary", "description", "outcomes", "prerequisites", "access", "price")


def clean_text_lines(value, limit, label):
    """
    A list of short text lines (outcomes, prerequisites): trimmed, blanks
    dropped, at most `limit` lines of MAX_LINE characters. Returns the cleaned
    list or raises ValidationError.
    """
    if not isinstance(value, list) or not all(isinstance(line, str) for line in value):
        raise ValidationError("Enter a list of text lines, e.g. [\"First\", \"Second\"].")
    lines = [line.strip() for line in value if line.strip()]
    if len(lines) > limit:
        raise ValidationError(f"Add at most {limit} {label}.")
    if any(len(line) > MAX_LINE for line in lines):
        raise ValidationError(f"Keep each line under {MAX_LINE} characters.")
    return lines


def eligible_instructors(company):
    """Who a company course can list as instructors: the company's verified, active Professionals."""
    User = get_user_model()
    return User.objects.filter(
        account_type=User.ACCOUNT_PROFESSIONAL, company=company, company__is_active=True,
        company_verified=True, is_active=True,
    )


def instructor_problem(company, people):
    """Why `people` can't be this course's instructors (a message), or None. `company` is the course's company."""
    if not people:
        return None
    if company is None:
        return "Only company courses list instructors. A Professional's own course always shows its owner."
    if len(people) > MAX_INSTRUCTORS:
        return f"Choose at most {MAX_INSTRUCTORS} instructors."
    allowed = set(eligible_instructors(company).values_list("pk", flat=True))
    refused = [str(person) for person in people if person.pk not in allowed]
    if refused:
        return (f"Not allowed: {', '.join(refused)}. Instructors must be Professionals at {company} "
                "whose company email is verified (company logins can't be instructors).")
    return None


def unique_slug(instance, value, max_length=200, fallback="item"):
    base = slugify(value)[:max_length] or fallback
    slug, n = base, 2
    while type(instance).objects.filter(slug=slug).exclude(pk=instance.pk).exists():
        slug, n = f"{base}-{n}", n + 1
    return slug


@register_snippet
class CareerRole(models.Model):
    """A job in the sector that courses prepare people for, e.g. "SCADA Engineer"."""
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=130, unique=True, blank=True)
    summary = models.TextField(max_length=300, blank=True, help_text="One or two sentences on what the role does.")
    image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+",
    )
    sort_order = models.PositiveSmallIntegerField(default=0, help_text="Lower numbers come first.")
    duties = models.TextField(
        blank=True, verbose_name="What this role does",
        help_text="One responsibility per line. Shown as a list on the role's page.",
    )
    topics = models.ManyToManyField(
        "pages.Topic", blank=True, related_name="career_roles", verbose_name="Skills",
        help_text="The topics this role draws on; shown as \"Skills you'll build\".",
    )

    panels = [
        FieldPanel("name"), FieldPanel("summary"), FieldPanel("image"), FieldPanel("sort_order"),
        FieldPanel("duties"), FieldPanel("topics", widget=forms.CheckboxSelectMultiple),
    ]

    @property
    def duty_list(self):
        return [line.strip(" -•\t") for line in self.duties.splitlines() if line.strip(" -•\t")]

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = "Career Role"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(self, self.name, 120, "role")
        super().save(*args, **kwargs)


class Playlist(AccessControlled):
    STATUS_DRAFT = "draft"
    STATUS_PENDING = "pending"
    STATUS_PUBLISHED = "published"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_PENDING, "Pending review"),
        (STATUS_PUBLISHED, "Published"),
        (STATUS_REJECTED, "Rejected"),
    ]
    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]

    # PROTECT: deleting a user must never silently delete courses learners are
    # enrolled in (a company course is shared by all the company's logins).
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="playlists")
    company = models.ForeignKey(
        "organizations.Company", null=True, blank=True, on_delete=models.PROTECT, related_name="courses",
        help_text="Set for courses a company builds in Company Studio; shown as 'Course by <company>'. "
                  "Empty for a Professional's own course.",
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    summary = models.CharField(
        max_length=220, blank=True, help_text="One or two sentences shown under the title and on course cards.",
    )
    description = models.TextField(blank=True, verbose_name="About this course")
    outcomes = models.JSONField(
        default=list, blank=True, verbose_name="What you'll learn",
        help_text="A list of up to 8 short outcomes.",
    )
    prerequisites = models.JSONField(
        default=list, blank=True, verbose_name="Before you start",
        help_text="A list of up to 5 things learners should know first.",
    )
    language = models.CharField(max_length=40, default="English")
    instructors = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name="taught_courses",
        help_text="Company courses only: up to 3 of the company's verified Professionals. "
                  "A Professional's own course always shows its owner.",
    )
    cover = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+",
    )
    level = models.CharField(max_length=12, choices=LEVEL_CHOICES, blank=True)
    topics = models.ManyToManyField("pages.Topic", blank=True, related_name="courses")
    roles = models.ManyToManyField(CareerRole, blank=True, related_name="courses")
    featured = models.BooleanField(default=False, help_text="Editorial pick; set by Admin only.")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_DRAFT, db_index=True)
    rejection_reason = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        verbose_name = "Course"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(self, self.title, 200, "course")
        super().save(*args, **kwargs)

    def access_owner_ids(self):
        return {self.owner_id}

    def clean(self):
        super().clean()
        errors = {}
        for field, limit, label in (("outcomes", MAX_OUTCOMES, "outcomes"), ("prerequisites", MAX_PREREQUISITES, "prerequisites")):
            try:
                setattr(self, field, clean_text_lines(getattr(self, field), limit, label))
            except ValidationError as error:
                errors[field] = error.messages
        self.language = (self.language or "").strip() or "English"
        if self.company_id and self.owner_id and self.owner.account_type == "professional" and self._state.adding:
            errors["company"] = "A Professional's own course can't belong to a company."
        if errors:
            raise ValidationError(errors)

    def relation_to(self, user):
        """
        How `user` stands behind this course: "owner" (the Professional who owns it, or the
        publishing company's account), "instructor" (chosen to teach it), or None. Owners and
        instructors can't enroll in or review their own course.
        """
        if not user.is_authenticated:
            return None
        if self.owner_id == user.pk or (
            self.company_id and user.company_id == self.company_id and user.account_type == "company"
        ):
            return "owner"
        if self.pk and self.instructors.filter(pk=user.pk).exists():
            return "instructor"
        return None

    def listed_instructors(self):
        """Instructors to show: only those still eligible (verification can lapse after they were chosen)."""
        if self.company_id is None:
            return self.instructors.none()
        return self.instructors.filter(pk__in=eligible_instructors(self.company).values("pk"))


class CourseModule(models.Model):
    """A named group of lessons in a course. Optional: a course without modules is one plain list."""
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="modules")
    title = models.CharField(max_length=120)
    summary = models.CharField(max_length=300, blank=True)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self):
        return f"{self.playlist} · {self.title}"


class CourseRevision(models.Model):
    """
    Edits to a live course that wait for Genex review. Learners keep seeing the
    live course; approving the course in Django admin applies the revision.
    `changes` holds only what differs from the live course: any of
    PROMISED_FIELDS, "faqs" ([[question, answer], …]) and "outline"
    ({modules: [{id, title, summary, items: [{kind, id}]}], loose_items: [...]};
    a module id below zero is a module that doesn't exist yet).
    """
    STATUS_PENDING = "pending"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [(STATUS_PENDING, "Waiting for review"), (STATUS_REJECTED, "Sent back")]

    playlist = models.OneToOneField(Playlist, on_delete=models.CASCADE, related_name="revision", verbose_name="course")
    changes = models.JSONField(default=dict)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    rejection_reason = models.TextField(blank=True, help_text="Shown to the author when the changes are sent back.")
    submitted_at = models.DateTimeField(help_text="When the author last saved changes.")
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")

    class Meta:
        verbose_name = "Pending course change"

    def __str__(self):
        return f"Changes to {self.playlist}"


class CourseFAQ(models.Model):
    """The course author's own questions, shown before GeLearn's standard ones."""
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="faqs")
    question = models.CharField(max_length=200)
    answer = models.TextField(max_length=1000)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]
        verbose_name = "Course FAQ"

    def __str__(self):
        return self.question


# A course lesson points at exactly one piece of published content. Professionals'
# courses use videos and blog posts; Company Studio courses use the company's
# GeAcademy articles, research, whitepapers and podcasts (and videos).
# kind → (field on PlaylistItem, model)
ITEM_KINDS = {
    "video": ("video", "pages.VideoItem"),
    "post": ("post", "pages.BlogPost"),
    "article": ("article", "pages.TechArticle"),
    "research": ("research", "pages.CaseStudy"),
    "whitepaper": ("whitepaper", "pages.Whitepaper"),
    "podcast": ("podcast", "pages.PodcastEpisode"),
}
_ITEM_FIELDS = [field for field, _ in ITEM_KINDS.values()]


def _exactly_one_target():
    combos = Q()
    for field in _ITEM_FIELDS:
        combos |= Q(**{f"{field}__isnull": False}, **{f"{other}__isnull": True for other in _ITEM_FIELDS if other != field})
    return combos


class PlaylistItem(models.Model):
    """One piece of published content, at a position in the course."""
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="items")
    module = models.ForeignKey(
        CourseModule, null=True, blank=True, on_delete=models.SET_NULL, related_name="items",
        help_text="Empty when the course has no modules, or the lesson isn't in one.",
    )
    video = models.ForeignKey("pages.VideoItem", null=True, blank=True, on_delete=models.CASCADE, related_name="+")
    post = models.ForeignKey("pages.BlogPost", null=True, blank=True, on_delete=models.CASCADE, related_name="+")
    article = models.ForeignKey("pages.TechArticle", null=True, blank=True, on_delete=models.CASCADE, related_name="+")
    research = models.ForeignKey("pages.CaseStudy", null=True, blank=True, on_delete=models.CASCADE, related_name="+")
    whitepaper = models.ForeignKey("pages.Whitepaper", null=True, blank=True, on_delete=models.CASCADE, related_name="+")
    podcast = models.ForeignKey("pages.PodcastEpisode", null=True, blank=True, on_delete=models.CASCADE, related_name="+")
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]
        constraints = [
            models.CheckConstraint(condition=_exactly_one_target(), name="playlist_item_exactly_one_target"),
            *[
                models.UniqueConstraint(fields=["playlist", field], condition=Q(**{f"{field}__isnull": False}),
                                        name=f"playlist_unique_{field}")
                for field in _ITEM_FIELDS
            ],
        ]

    def clean(self):
        super().clean()
        if self.module_id and self.module.playlist_id != self.playlist_id:
            raise ValidationError({"module": "That module belongs to a different course."})

    @property
    def kind(self):
        return next(kind for kind, (field, _) in ITEM_KINDS.items() if getattr(self, f"{field}_id"))

    @property
    def target(self):
        return getattr(self, ITEM_KINDS[self.kind][0])

    def __str__(self):
        return f"{self.playlist} #{self.position}: {self.target}"


class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enrollments")
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="enrollments")
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-enrolled_at"]
        constraints = [models.UniqueConstraint(fields=["user", "playlist"], name="one_enrollment_per_course")]

    def clean(self):
        super().clean()
        if self.user_id and self.playlist_id and self.playlist.relation_to(self.user):
            raise ValidationError({"user": "The course's owner and instructors can't enroll in it."})


class ItemProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="course_progress")
    item = models.ForeignKey(PlaylistItem, on_delete=models.CASCADE, related_name="progress")
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "item"], name="one_completion_per_item")]


MAX_CERTIFICATE_NAME = 80


class Certificate(models.Model):
    """
    GeLearn's certificate of completion: issued automatically once an enrolled
    learner has opened every lesson of a live course from inside the course.
    Everything printed is copied into `snapshot` when it is issued, so later
    edits to the course or anyone's profile never change a certificate that has
    been shared. Genex can revoke one in Django admin; it is never deleted.
    """
    STATUS_VALID = "valid"
    STATUS_REVOKED = "revoked"
    STATUS_CHOICES = [(STATUS_VALID, "Valid"), (STATUS_REVOKED, "Revoked")]

    code = models.CharField(max_length=16, unique=True, help_text="Public ID, e.g. GL-7K3X-9QF2; also the verify address.")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="certificates", verbose_name="learner")
    # SET_NULL: a certificate stays valid (from its snapshot) even if the course is later removed.
    playlist = models.ForeignKey(Playlist, null=True, blank=True, on_delete=models.SET_NULL, related_name="certificates", verbose_name="course")
    learner_name = models.CharField(max_length=MAX_CERTIFICATE_NAME, help_text="As printed. The learner can correct it once.")
    name_corrected = models.BooleanField(default=False, help_text="The learner has used their one name correction.")
    snapshot = models.JSONField(default=dict, help_text="Course, instructors and publisher as printed.")
    issued_at = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_VALID, db_index=True)
    revoked_reason = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["-issued_at"]
        constraints = [models.UniqueConstraint(fields=["user", "playlist"], name="one_certificate_per_course")]

    def __str__(self):
        return f"{self.code} · {self.learner_name} · {self.snapshot.get('course', {}).get('title', '')}"


# A course's average rating is only shown once it has this many visible reviews,
# so one early review can't show as 5.0.
MIN_REVIEWS_FOR_RATING = 3
MAX_REVIEW_LENGTH = 2000


class CourseReview(models.Model):
    """
    A learner's rating (1 to 5) and optional written review of a course: one per
    learner per course. Only enrolled learners who have finished at least one
    lesson can review. Reviews show straight away; Genex can hide one in Django admin.
    """
    STATUS_VISIBLE = "visible"
    STATUS_HIDDEN = "hidden"
    STATUS_CHOICES = [(STATUS_VISIBLE, "Visible"), (STATUS_HIDDEN, "Hidden by Genex")]

    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="reviews", verbose_name="course")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="course_reviews")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    body = models.TextField(max_length=MAX_REVIEW_LENGTH, blank=True, verbose_name="review")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_VISIBLE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Course review"
        constraints = [models.UniqueConstraint(fields=["user", "playlist"], name="one_review_per_course")]
        indexes = [models.Index(fields=["playlist", "status"])]

    def __str__(self):
        return f"{self.user} on {self.playlist}: {self.rating}/5"


MAX_REPLY_LENGTH = 1000


class ReviewReply(models.Model):
    """
    The course team's answer under a learner's review: one per review, written
    by the course owner (a company account for a company course) or one of its
    instructors. Genex can hide a reply in Django admin, as with reviews.
    """
    STATUS_VISIBLE = "visible"
    STATUS_HIDDEN = "hidden"
    STATUS_CHOICES = [(STATUS_VISIBLE, "Visible"), (STATUS_HIDDEN, "Hidden by Genex")]

    review = models.OneToOneField(CourseReview, on_delete=models.CASCADE, related_name="reply")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="review_replies")
    body = models.TextField(max_length=MAX_REPLY_LENGTH, verbose_name="reply")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_VISIBLE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Reply to a review"
        verbose_name_plural = "Replies to reviews"

    def __str__(self):
        return f"Reply to {self.review}"

    def clean(self):
        super().clean()
        if self.review_id and self.author_id and not self.review.playlist.relation_to(self.author):
            raise ValidationError({"author": "Only the course's owner or instructors can reply to its reviews."})


@register_snippet
class LiveSession(models.Model):
    """
    A webinar or live talk listed on GeLearn. Registration and the session
    itself happen on the host's own page (`registration_url`); GeLearn only
    lists it. Past sessions drop off the Upcoming rail automatically.
    """
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    starts_at = models.DateTimeField(help_text="Date and time in IST.")
    duration_minutes = models.PositiveSmallIntegerField(default=60)
    speaker = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="live_sessions",
        limit_choices_to={"account_type": "professional"},
        help_text="A Professional on GeLearn. Leave empty and use the name field for an outside speaker.",
    )
    speaker_name = models.CharField(max_length=150, blank=True, help_text="Outside speaker's name.")
    speaker_role = models.CharField(max_length=150, blank=True)
    company = models.ForeignKey(
        "organizations.Company", null=True, blank=True, on_delete=models.PROTECT, related_name="live_sessions",
        help_text="Hosting company. Empty means Genex.",
    )
    registration_url = models.URLField(help_text="Where people register or join (opens in a new tab).")
    image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+",
    )
    topics = models.ManyToManyField("pages.Topic", blank=True, related_name="live_sessions")
    is_published = models.BooleanField(default=True)

    panels = [
        FieldPanel("title"),
        FieldPanel("description"),
        FieldRowPanel([FieldPanel("starts_at"), FieldPanel("duration_minutes")]),
        MultiFieldPanel([
            FieldPanel("speaker"),
            FieldPanel("speaker_name"),
            FieldPanel("speaker_role"),
            FieldPanel("company"),
        ], heading="Speaker & host"),
        FieldPanel("registration_url"),
        FieldPanel("image"),
        FieldPanel("topics", widget=forms.CheckboxSelectMultiple),
        FieldPanel("is_published"),
    ]

    class Meta:
        ordering = ["starts_at"]
        verbose_name = "Live Session"

    def __str__(self):
        return self.title

    @property
    def ends_at(self):
        return self.starts_at + timedelta(minutes=self.duration_minutes)

    def clean(self):
        super().clean()
        if not self.speaker_id and not self.speaker_name.strip():
            raise ValidationError({"speaker_name": "Choose a Professional or enter the speaker's name."})

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(self, self.title, 200, "session")
        super().save(*args, **kwargs)
