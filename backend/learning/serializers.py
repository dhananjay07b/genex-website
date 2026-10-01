from rest_framework import serializers

from commerce.access import has_access
from pages.api import author_payload
from pages.models import AccessControlled, BlogPost, Topic, VideoItem

from .models import CareerRole, Playlist, PlaylistItem

MAX_ITEMS = 100
MAX_TOPICS = 5
MAX_ROLES = 3


def target_card(target, kind):
    """A course item's video/post as shown in lists and the builder."""
    image = getattr(target, "image", None)
    return {
        "kind": kind,
        "id": target.pk,
        "title": target.title,
        "image_url": image.file.url if image else None,
        "meta": target.duration if kind == "video" else (target.topic or ""),
        "path": f"/videos/{target.pk}" if kind == "video" else f"/blog/{target.pk}",
        "access": target.access,
        "price": str(target.price) if target.price is not None else None,
        "currency": target.currency,
    }


def cover_url(playlist):
    return playlist.cover.file.url if playlist.cover_id else None


class AccessFieldsMixin(serializers.Serializer):
    access = serializers.ChoiceField(choices=[c[0] for c in AccessControlled.ACCESS_CHOICES], required=False)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1, required=False, allow_null=True)

    def validate(self, attrs):
        attrs = super().validate(attrs)
        access = attrs.get("access", getattr(self.instance, "access", AccessControlled.ACCESS_FREE))
        price = attrs.get("price", getattr(self.instance, "price", None))
        if access == AccessControlled.ACCESS_PAID and not price:
            raise serializers.ValidationError({"price": "Set a price for paid content."})
        if access != AccessControlled.ACCESS_PAID:
            attrs["price"] = None
        return attrs


# ── Public ──────────────────────────────────────────────────────────────────

class CourseCardSerializer(serializers.ModelSerializer):
    cover_url = serializers.SerializerMethodField()
    owner = serializers.SerializerMethodField()
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Playlist
        fields = ["slug", "title", "description", "cover_url", "owner", "access", "price", "currency", "item_count", "updated_at"]

    def get_cover_url(self, obj):
        return cover_url(obj)

    def get_owner(self, obj):
        return author_payload(obj.owner)


class CourseDetailSerializer(CourseCardSerializer):
    is_locked = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()
    enrollment = serializers.SerializerMethodField()

    class Meta(CourseCardSerializer.Meta):
        fields = CourseCardSerializer.Meta.fields + ["is_locked", "items", "enrollment"]

    def _user(self):
        return self.context["request"].user

    def _cache(self):
        return self.context.setdefault("_access_cache", {})

    def get_is_locked(self, obj):
        return not has_access(self._user(), obj, self._cache())

    def _completed_ids(self, obj):
        key = ("completed", obj.pk)
        cache = self._cache()
        if key not in cache:
            user = self._user()
            cache[key] = (
                set(obj.items.filter(progress__user=user).values_list("pk", flat=True))
                if user.is_authenticated else set()
            )
        return cache[key]

    def get_items(self, obj):
        completed = self._completed_ids(obj)
        rows = []
        for item in obj.items.select_related("video__image", "post__image"):
            target = item.target
            card = target_card(target, item.kind)
            card.update(
                item_id=item.pk,
                position=item.position,
                is_locked=not has_access(self._user(), target, self._cache()),
                completed=item.pk in completed,
            )
            rows.append(card)
        return rows

    def get_enrollment(self, obj):
        user = self._user()
        if not user.is_authenticated or not obj.enrollments.filter(user=user).exists():
            return None
        total = obj.items.count()
        done = len(self._completed_ids(obj))
        return {
            "completed_item_ids": sorted(self._completed_ids(obj)),
            "completed": done,
            "total": total,
            "percent": round(done * 100 / total) if total else 0,
        }


class CareerRoleSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CareerRole
        fields = ["id", "name", "slug", "summary", "image_url"]

    def get_image_url(self, obj):
        return obj.image.file.url if obj.image_id else None


# ── Owner (Professional) ────────────────────────────────────────────────────

class MyCourseSerializer(AccessFieldsMixin, serializers.ModelSerializer):
    cover_url = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()
    topics = serializers.PrimaryKeyRelatedField(many=True, queryset=Topic.objects.all(), required=False)
    roles = serializers.PrimaryKeyRelatedField(many=True, queryset=CareerRole.objects.all(), required=False)

    class Meta:
        model = Playlist
        fields = [
            "id", "slug", "title", "description", "cover_url", "level", "topics", "roles",
            "access", "price", "currency",
            "status", "rejection_reason", "items", "submitted_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "currency", "status", "rejection_reason", "submitted_at", "updated_at"]

    def get_cover_url(self, obj):
        return cover_url(obj)

    def get_items(self, obj):
        return [
            {**target_card(item.target, item.kind), "item_id": item.pk}
            for item in obj.items.select_related("video__image", "post__image")
        ]

    def validate_topics(self, value):
        if len(value) > MAX_TOPICS:
            raise serializers.ValidationError(f"Choose at most {MAX_TOPICS} topics.")
        return value

    def validate_roles(self, value):
        if len(value) > MAX_ROLES:
            raise serializers.ValidationError(f"Choose at most {MAX_ROLES} roles.")
        return value

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Give the course a title of at least 3 characters.")
        return value

    def update(self, instance, validated_data):
        # Changing what learners are promised (title, description, price…) on
        # a live course sends it back for review; item order does not.
        if instance.status == Playlist.STATUS_PUBLISHED and any(
            validated_data.get(field, getattr(instance, field)) != getattr(instance, field)
            for field in ("title", "description", "access", "price")
        ):
            validated_data["status"] = Playlist.STATUS_PENDING
        return super().update(instance, validated_data)


class ItemRefSerializer(serializers.Serializer):
    kind = serializers.ChoiceField(choices=["video", "post"])
    id = serializers.IntegerField()


def library_for(user):
    """
    A Professional's own live videos and posts — what a course may contain.
    Anything published from their submissions counts, even while an edit to it
    is back in review (the live version stays up meanwhile).
    """
    videos = VideoItem.objects.filter(submission_source__author=user).select_related("image")
    posts = BlogPost.objects.filter(submission_source__author=user).select_related("image")
    return videos, posts
