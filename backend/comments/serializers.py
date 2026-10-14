from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from rest_framework import serializers

from .models import Comment

# What members can comment on (the GeLearn pages that show a comment section).
COMMENTABLE_MODELS = ("blogpost", "videoitem", "podcastepisode")


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.display_name", read_only=True)
    content_type = serializers.SlugRelatedField(
        slug_field="model",
        queryset=ContentType.objects.filter(app_label="pages", model__in=COMMENTABLE_MODELS),
    )

    class Meta:
        model = Comment
        fields = [
            "id", "content_type", "object_id", "author", "author_name",
            "parent", "body", "status", "created_at", "edited_at",
        ]
        read_only_fields = ["id", "author", "author_name", "status", "created_at", "edited_at"]

    def validate(self, attrs):
        if self.instance:
            # Editing changes the text only; a comment never moves to another item or thread.
            return {"body": attrs["body"]} if "body" in attrs else {}
        content_type, object_id = attrs["content_type"], attrs["object_id"]
        if not content_type.model_class().objects.filter(pk=object_id).exists():
            raise serializers.ValidationError({"object_id": "That item doesn't exist."})
        parent = attrs.get("parent")
        if parent and (
            parent.content_type_id != content_type.pk or parent.object_id != object_id
            or parent.status != "visible" or parent.parent_id is not None
        ):
            # Replies go one level deep, under a visible comment on the same item.
            raise serializers.ValidationError({"parent": "You can only reply to a comment on this item."})
        return attrs

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "body" in validated_data:
            validated_data["edited_at"] = timezone.now()
        return super().update(instance, validated_data)
