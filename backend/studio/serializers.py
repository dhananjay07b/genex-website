"""
Write serializers for the Company Studio. Company staff author a constrained,
sanitised subset of each content type — rich text goes through Wagtail's own
whitelister (pages.richtext), and editorial
flags (featured, publisher) are never client-writable.
"""
from rest_framework import serializers

from accounts.models import User
from accounts.roles import display_company
from pages.models import AccessControlled, CaseStudy, PodcastEpisode, TechArticle, Tender, Topic, Whitepaper
from pages.richtext import rich_text_for_editing, sanitize_rich_text

MAX_SECTIONS = 30
MAX_LIST_ITEMS = 12
MAX_TOPICS = 5


class SectionSerializer(serializers.Serializer):
    heading = serializers.CharField(max_length=255)
    body = serializers.CharField()


def sections_to_stream(sections):
    return [
        {"type": "section", "value": {"heading": s["heading"].strip(), "body": sanitize_rich_text(s["body"])}}
        for s in sections
    ]


def stream_to_sections(stream):
    return [
        {"heading": block.value["heading"], "body": rich_text_for_editing(block.value["body"].source)}
        for block in stream
        if block.block_type == "section"
    ]


class TopicsMixin(serializers.Serializer):
    """Topic ids (from /api/snippets/topics/) the item is tagged with."""
    topics = serializers.PrimaryKeyRelatedField(many=True, queryset=Topic.objects.all(), required=False)

    def validate_topics(self, value):
        if len(value) > MAX_TOPICS:
            raise serializers.ValidationError(f"Choose at most {MAX_TOPICS} topics.")
        return value


class StudioBaseSerializer(serializers.ModelSerializer):
    """Read-only bits every Studio item returns."""
    image_url = serializers.SerializerMethodField()
    owner = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        image = getattr(obj, "image", None)
        return image.file.url if image else None

    def get_owner(self, obj):
        return {"username": obj.owner.username, "display_name": obj.owner.display_name} if obj.owner_id else None


class RichContentMixin(serializers.Serializer):
    """`intro` (rich text) + `sections` [{heading, body}] shared by Research and GeAcademy."""
    intro = serializers.CharField(required=False, allow_blank=True)
    sections = SectionSerializer(many=True, required=False, write_only=True)  # read back in to_representation

    def validate_sections(self, value):
        if len(value) > MAX_SECTIONS:
            raise serializers.ValidationError(f"Use at most {MAX_SECTIONS} sections.")
        return value

    def _apply_rich(self, validated_data):
        if "intro" in validated_data:
            validated_data["intro"] = sanitize_rich_text(validated_data["intro"])
        if "sections" in validated_data:
            validated_data["sections"] = sections_to_stream(validated_data["sections"])
        return validated_data

    def create(self, validated_data):
        return super().create(self._apply_rich(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._apply_rich(validated_data))

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["intro"] = rich_text_for_editing(instance.intro)
        data["sections"] = stream_to_sections(instance.sections)
        return data


class ResearchSerializer(RichContentMixin, TopicsMixin, StudioBaseSerializer):
    class Meta:
        model = CaseStudy
        fields = [
            "id", "title", "topics", "excerpt", "date", "read_time",
            "intro", "sections", "image_url", "owner",
        ]


class GeAcademySerializer(RichContentMixin, TopicsMixin, StudioBaseSerializer):
    # Write-only: read back in to_representation (a manager / StreamValue isn't a plain list).
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50, allow_blank=True), required=False,
        max_length=MAX_LIST_ITEMS, write_only=True,
    )
    takeaways = serializers.ListField(
        child=serializers.CharField(max_length=255, allow_blank=True), required=False,
        max_length=MAX_LIST_ITEMS, write_only=True,
    )

    class Meta:
        model = TechArticle
        fields = [
            "id", "title", "topics", "difficulty", "read_time", "date", "excerpt", "tags",
            "intro", "sections", "callout_label", "callout_content", "takeaways", "image_url", "owner",
        ]

    def _split(self, validated_data):
        tags = validated_data.pop("tags", None)
        if "takeaways" in validated_data:
            validated_data["takeaways"] = [
                {"type": "point", "value": t.strip()} for t in validated_data["takeaways"] if t.strip()
            ]
        return tags

    def create(self, validated_data):
        tags = self._split(validated_data)
        instance = super().create(validated_data)
        if tags is not None:
            instance.tags.set([t.strip() for t in tags if t.strip()])
        return instance

    def update(self, instance, validated_data):
        tags = self._split(validated_data)
        instance = super().update(instance, validated_data)
        if tags is not None:
            instance.tags.set([t.strip() for t in tags if t.strip()])
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["tags"] = [tag.name for tag in instance.tags.all()]
        data["takeaways"] = [block.value for block in instance.takeaways]
        return data


class PolicyTenderSerializer(StudioBaseSerializer):
    class Meta:
        model = Tender
        fields = ["id", "title", "authority", "deadline", "value", "status", "sector", "description", "owner"]


class WhitepaperSerializer(TopicsMixin, StudioBaseSerializer):
    document_url = serializers.SerializerMethodField()

    class Meta:
        model = Whitepaper
        fields = ["id", "title", "topics", "date", "pages", "description", "document_url", "owner"]

    def get_document_url(self, obj):
        return obj.document.url if obj.document_id else None


class CollaboratorField(serializers.SlugRelatedField):
    """Collaborators are referenced by username and must be Professionals."""

    def __init__(self, **kwargs):
        super().__init__(
            slug_field="username",
            queryset=User.objects.filter(account_type=User.ACCOUNT_PROFESSIONAL, is_active=True),
            **kwargs,
        )

    def to_representation(self, value):
        return {
            "username": value.username,
            "display_name": value.display_name,
            "avatar_url": value.avatar.file.url if value.avatar else None,
            "company": display_company(value),
        }


class PodcastSerializer(TopicsMixin, StudioBaseSerializer):
    collaborators = serializers.ListField(
        child=CollaboratorField(), required=False, max_length=MAX_LIST_ITEMS, write_only=True,
    )
    access = serializers.ChoiceField(choices=[c[0] for c in AccessControlled.ACCESS_CHOICES], required=False)

    class Meta:
        model = PodcastEpisode
        fields = [
            "id", "title", "topics", "date", "duration", "description", "guest", "guest_role",
            "audio_url", "access", "price", "collaborators", "image_url", "owner",
        ]

    def validate(self, attrs):
        access = attrs.get("access", getattr(self.instance, "access", AccessControlled.ACCESS_FREE))
        price = attrs.get("price", getattr(self.instance, "price", None))
        if access == AccessControlled.ACCESS_PAID and not price:
            raise serializers.ValidationError({"price": "Set a price for paid content."})
        if access != AccessControlled.ACCESS_PAID:
            attrs["price"] = None
        return attrs

    def create(self, validated_data):
        collaborators = validated_data.pop("collaborators", None)
        instance = super().create(validated_data)
        if collaborators is not None:
            instance.collaborators.set(collaborators)
        return instance

    def update(self, instance, validated_data):
        collaborators = validated_data.pop("collaborators", None)
        instance = super().update(instance, validated_data)
        if collaborators is not None:
            instance.collaborators.set(collaborators)
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["collaborators"] = [CollaboratorField().to_representation(u) for u in instance.collaborators.all()]
        return data
