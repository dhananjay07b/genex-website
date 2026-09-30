"""
Courses on GeLearn are playlists: an ordered set of a Professional's own
published videos and blog posts, with a cover and an access level. Learners
enroll and tick items off as they go.
"""
from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils.text import slugify

from pages.models import AccessControlled


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

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="playlists")
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    cover = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+",
    )
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
            base = slugify(self.title)[:200] or "course"
            slug, n = base, 2
            while type(self).objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug, n = f"{base}-{n}", n + 1
            self.slug = slug
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
