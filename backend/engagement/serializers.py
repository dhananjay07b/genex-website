from accounts.serializers import PublicUserSerializer
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from .models import Follow, Notification, SavedItem


class SavedItemSerializer(serializers.ModelSerializer):
    content_type = serializers.SlugRelatedField(slug_field="model", queryset=ContentType.objects.all())
    title = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()

    class Meta:
        model = SavedItem
        fields = ["id", "content_type", "object_id", "title", "image_url", "path", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_title(self, obj):
        return str(obj.content_object) if obj.content_object else None

    def get_image_url(self, obj):
        # Not every saved content type carries an image (Tender/Whitepaper don't);
        # `image` is only present on BlogPost, PodcastEpisode, VideoItem, CaseStudy.
        image = getattr(obj.content_object, "image", None) or getattr(obj.content_object, "cover", None)
        return image.file.url if image else None

    def get_path(self, obj):
        """GeLearn link for items addressed by slug (courses); other types build their link from object_id."""
        target = obj.content_object
        if obj.content_type.model == "playlist" and target is not None:
            # Only live courses have a page.
            return f"/courses/{target.slug}" if target.status == "published" else None
        return None

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class FollowerSerializer(serializers.ModelSerializer):
    """A row in someone's followers list — the *follower*'s public identity."""
    user = PublicUserSerializer(source="follower", read_only=True)

    class Meta:
        model = Follow
        fields = ["user", "created_at"]


class FollowingSerializer(serializers.ModelSerializer):
    """A row in someone's following list — the *followed*'s public identity."""
    user = PublicUserSerializer(source="followed", read_only=True)

    class Meta:
        model = Follow
        fields = ["user", "created_at"]


REVIEW_KINDS = ("course_review", "review_reply")


def notification_path(notification):
    """Where a review notification leads: the live course's Reviews section (to read or reply). None for other kinds."""
    course = notification.content_object if notification.kind in REVIEW_KINDS else None
    if course is None or getattr(course, "status", None) != "published":
        return None
    return f"/courses/{course.slug}#cp-reviews"


class NotificationSerializer(serializers.ModelSerializer):
    content_type = serializers.SlugRelatedField(slug_field="model", read_only=True)
    path = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ["id", "kind", "text", "content_type", "object_id", "path", "is_read", "created_at"]
        read_only_fields = fields

    def get_path(self, obj):
        return notification_path(obj)
