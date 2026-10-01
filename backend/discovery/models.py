from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class ViewEvent(models.Model):
    """
    Someone opened a course or a piece of content. Drives "Recently viewed"
    (signed-in users) and "Trending this week" (everyone). A signed-in user's
    repeat view within 30 minutes refreshes the existing row instead of adding one.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="view_events",
    )
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")
    viewed_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-viewed_at"]
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
            models.Index(fields=["user", "-viewed_at"]),
        ]

    def __str__(self):
        return f"{self.user or 'anonymous'} viewed {self.content_type.model}#{self.object_id}"


class SearchQuery(models.Model):
    """A search someone ran; drives "Trending searches"."""
    query = models.CharField(max_length=100, db_index=True, help_text="Lower-cased and trimmed.")
    result_count = models.PositiveIntegerField(default=0)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "search queries"

    def __str__(self):
        return self.query
