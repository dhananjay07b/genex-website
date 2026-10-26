"""
Write serializers for the Company Studio. Company staff author a constrained,
sanitised subset of each content type — rich text goes through Wagtail's own
whitelister (pages.richtext), and editorial
flags (featured, publisher) are never client-writable.
"""
import re

from django.utils import timezone
from rest_framework import serializers

from accounts.models import User
from accounts.roles import display_company
from pages.images import AVATAR, CONTENT, image_url
from pages.models import AccessControlled, CaseStudy, PodcastEpisode, TechArticle, Tender, Topic, Whitepaper
from pages.richtext import rich_text_for_editing, sanitize_rich_text

MAX_SECTIONS = 30
MAX_LIST_ITEMS = 12
MAX_TOPICS = 5


class SectionSerializer(serializers.Serializer):
    # Blanks are allowed so a draft can hold a half-written section; publishing refuses them.
    heading = serializers.CharField(max_length=255, allow_blank=True)
    body = serializers.CharField(allow_blank=True)


def _is_blank_section(section):
    body = section["body"]
    has_text = re.sub(r"<[^>]*>", "", body).strip() or "<img" in body or "<embed" in body
    return not section["heading"].strip() or not has_text


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
    """
    Read-only bits every Studio item returns, and drafts.

    `is_draft`: a draft is saved as it is, so the fields a published item needs
    are relaxed (optional, blank allowed) while saving a draft, and checked when
    it's published. A draft with no date gets today's.
    """
    image_url = serializers.SerializerMethodField()
    owner = serializers.SerializerMethodField()
    is_draft = serializers.BooleanField(required=False)

    def _will_be_draft(self):
        data = getattr(self, "initial_data", None) or {}
        if "is_draft" in data:
            return str(data["is_draft"]).lower() in ("true", "1", "on")
        return bool(getattr(self.instance, "is_draft", False))  # instance may be a list when listing

    def get_fields(self):
        fields = super().get_fields()
        self._needed_to_publish = {name for name, field in fields.items() if field.required and not field.read_only}
        if self._will_be_draft():
            for field in fields.values():
                if field.read_only:
                    continue
                field.required = False
                if hasattr(field, "allow_blank"):
                    field.allow_blank = True
        return fields

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if self._will_be_draft():
            if getattr(self.instance, "is_draft", None) is False:
                self._refuse_unpublishing_course_lessons()
            return attrs
        missing = {}
        for name in self._needed_to_publish:
            value = attrs[name] if name in attrs else getattr(self.instance, name, None)
            if value is None or (isinstance(value, str) and not value.strip()):
                missing[name] = "This field is required to publish."
        if missing:
            raise serializers.ValidationError(missing)
        return attrs

    def _refuse_unpublishing_course_lessons(self):
        """A lesson in a course can't vanish: completion and certificates count every lesson."""
        from learning.models import PlaylistItem
        for field in PlaylistItem._meta.get_fields():
            if getattr(field, "related_model", None) is type(self.instance):
                titles = list(PlaylistItem.objects.filter(**{field.name: self.instance})
                              .values_list("playlist__title", flat=True).distinct()[:3])
                if titles:
                    raise serializers.ValidationError({"is_draft": (
                        f"This is a lesson in {', '.join(titles)}. Remove it from the course "
                        "before moving it back to draft."
                    )})

    def create(self, validated_data):
        if "date" in {f.name for f in self.Meta.model._meta.fields} and not validated_data.get("date"):
            validated_data["date"] = timezone.localdate()
        return super().create(validated_data)

    def get_image_url(self, obj):
        image = getattr(obj, "image", None)
        return image_url(image, CONTENT)

    def get_owner(self, obj):
        return {"username": obj.owner.username, "display_name": obj.owner.display_name} if obj.owner_id else None


class RichContentMixin(serializers.Serializer):
    """`intro` (rich text) + `sections` [{heading, body}] shared by Research and GeAcademy."""
    intro = serializers.CharField(required=False, allow_blank=True)
    sections = SectionSerializer(many=True, required=False, write_only=True)  # read back in to_representation

    def validate_sections(self, value):
        if len(value) > MAX_SECTIONS:
            raise serializers.ValidationError(f"Use at most {MAX_SECTIONS} sections.")
        if not self._will_be_draft() and any(_is_blank_section(s) for s in value):
            raise serializers.ValidationError("Every section needs a heading and some text. Remove empty sections.")
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
            "id", "is_draft", "title", "topics", "excerpt", "date", "read_time",
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
            "id", "is_draft", "title", "topics", "difficulty", "read_time", "date", "excerpt", "tags",
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
        fields = ["id", "is_draft", "title", "authority", "deadline", "value", "status", "sector", "description", "owner"]


class WhitepaperSerializer(TopicsMixin, StudioBaseSerializer):
    document_url = serializers.SerializerMethodField()

    class Meta:
        model = Whitepaper
        fields = ["id", "is_draft", "title", "topics", "date", "pages", "description", "document_url", "owner"]

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
            "avatar_url": image_url(value.avatar, AVATAR),
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
            "id", "is_draft", "title", "topics", "date", "duration", "description", "guest", "guest_role",
            "audio_url", "access", "price", "collaborators", "image_url", "owner",
        ]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        access = attrs.get("access", getattr(self.instance, "access", AccessControlled.ACCESS_FREE))
        price = attrs.get("price", getattr(self.instance, "price", None))
        if access == AccessControlled.ACCESS_PAID and not price and not self._will_be_draft():
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
