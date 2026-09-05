from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.display_name", read_only=True)
    content_type = serializers.SlugRelatedField(slug_field="model", queryset=ContentType.objects.all())

    class Meta:
        model = Comment
        fields = [
            "id", "content_type", "object_id", "author", "author_name",
            "parent", "body", "status", "created_at", "edited_at",
        ]
        read_only_fields = ["id", "author", "author_name", "status", "created_at", "edited_at"]

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)
