"""
Courses on GeLearn are playlists: an ordered set of a Professional's own
published videos and blog posts, with a cover and an access level. Learners
enroll and tick items off as they go.
"""
from datetime import timedelta

from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.utils.text import slugify
from wagtail.admin.panels import FieldPanel, FieldRowPanel, MultiFieldPanel
from wagtail.snippets.models import register_snippet

from pages.models import AccessControlled


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

    panels = [FieldPanel("name"), FieldPanel("summary"), FieldPanel("image"), FieldPanel("sort_order")]

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

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="playlists")
    company = models.ForeignKey(
        "organizations.Company", null=True, blank=True, on_delete=models.PROTECT, related_name="courses",
        help_text="Set for courses a company builds in Company Studio; shown as 'Course by <company>'. "
                  "Empty for a Professional's own course.",
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
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


class PlaylistItem(models.Model):
    """One published video or blog post, at a position in the course."""
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="items")
    video = models.ForeignKey("pages.VideoItem", null=True, blank=True, on_delete=models.CASCADE, related_name="+")
    post = models.ForeignKey("pages.BlogPost", null=True, blank=True, on_delete=models.CASCADE, related_name="+")
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]
        constraints = [
            models.CheckConstraint(
                condition=(Q(video__isnull=False, post__isnull=True) | Q(video__isnull=True, post__isnull=False)),
                name="playlist_item_exactly_one_target",
            ),
            models.UniqueConstraint(fields=["playlist", "video"], condition=Q(video__isnull=False), name="playlist_unique_video"),
            models.UniqueConstraint(fields=["playlist", "post"], condition=Q(post__isnull=False), name="playlist_unique_post"),
        ]

    @property
    def kind(self):
        return "video" if self.video_id else "post"

    @property
    def target(self):
        return self.video if self.video_id else self.post

    def __str__(self):
        return f"{self.playlist} #{self.position}: {self.target}"


class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enrollments")
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="enrollments")
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-enrolled_at"]
        constraints = [models.UniqueConstraint(fields=["user", "playlist"], name="one_enrollment_per_course")]


class ItemProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="course_progress")
    item = models.ForeignKey(PlaylistItem, on_delete=models.CASCADE, related_name="progress")
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "item"], name="one_completion_per_item")]


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
