import math
import re

from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.html import strip_tags
from rest_framework import serializers

from accounts.models import User
from accounts.roles import display_publisher, is_company
from commerce.access import has_access
from pages.api import author_payload
from pages.durations import parse_duration_seconds
from pages.models import AccessControlled, BlogPost, CaseStudy, PodcastEpisode, TechArticle, Topic, VideoItem, Whitepaper

from .models import (
    ITEM_KINDS, MAX_FAQS, MAX_MODULES, MAX_OUTCOMES, MAX_PREREQUISITES, MAX_ROLES, MAX_TOPICS,
    CareerRole, CourseFAQ, CourseModule, Playlist, PlaylistItem, clean_text_lines, eligible_instructors, instructor_problem,
)

MAX_ITEMS = 100

# Editing any of these on a live course sends it back to Genex for review:
# they are what learners are promised. Order, lessons, cover, level, topics,
# roles and instructors go live straight away.
REVIEWED_FIELDS = ("title", "summary", "description", "outcomes", "prerequisites", "access", "price")


def clean_lines(value, limit, label):
    """`clean_text_lines`, reported as an API field error."""
    try:
        return clean_text_lines(value, limit, label)
    except DjangoValidationError as error:
        raise serializers.ValidationError(error.messages)


# Load every possible target (and its image) in one query per course.
ITEM_SELECT = ["video__image", "post__image", "article__image", "research__image", "whitepaper", "podcast__image"]

ITEM_PATHS = {
    "video": "/videos/{id}", "post": "/blog/{id}", "article": "/geacademy/{id}",
    "research": "/research/{id}", "whitepaper": "/whitepapers", "podcast": "/podcasts/{id}",
}


def item_meta(target, kind):
    if kind in ("video", "podcast"):
        return target.duration
    if kind in ("article", "research"):
        return target.read_time
    if kind == "whitepaper":
        return target.pages
    topic = next(iter(target.topics.all()), None)  # a post: its first topic
    return topic.name if topic else ""


WORDS_PER_MINUTE = 200
WHITEPAPER_MINUTES_PER_PAGE = 2


def _first_number(text):
    match = re.search(r"\d+", text or "")
    return int(match.group()) if match else 0


def lesson_minutes(target, kind):
    """
    About how long a lesson takes, in whole minutes (0 when unknown), for
    module and course totals. Videos and podcasts use their length, GeAcademy
    and research their read time, whitepapers 2 minutes a page, and blog
    posts (which store no read time) their word count at 200 words a minute.
    """
    if kind in ("video", "podcast"):
        seconds = target.duration_seconds or parse_duration_seconds(target.duration) or 0
        return math.ceil(seconds / 60)
    if kind in ("article", "research"):
        return _first_number(target.read_time)
    if kind == "whitepaper":
        return _first_number(target.pages) * WHITEPAPER_MINUTES_PER_PAGE
    words = len(strip_tags(str(target.body)).split())
    return max(1, math.ceil(words / WORDS_PER_MINUTE)) if words else 0


def target_card(target, kind):
    """A course item's content as shown in course pages and the builder."""
    image = getattr(target, "image", None)
    price = getattr(target, "price", None)
    return {
        "kind": kind,
        "id": target.pk,
        "title": target.title,
        "image_url": image.file.url if image else None,
        "meta": item_meta(target, kind),
        "minutes": lesson_minutes(target, kind),
        "path": ITEM_PATHS[kind].format(id=target.pk),
        # GeAcademy, research and whitepapers have no access setting: always open.
        "access": getattr(target, "access", "free"),
        "price": str(price) if price is not None else None,
        "currency": getattr(target, "currency", "INR"),
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
    company = serializers.SerializerMethodField()
    topics = serializers.SerializerMethodField()
    item_count = serializers.IntegerField(read_only=True)
    enrolled_count = serializers.IntegerField(read_only=True)
    video_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = [
            "id", "slug", "title", "description", "cover_url", "owner", "company", "level", "topics",
            "access", "price", "currency", "item_count", "enrolled_count", "video_minutes", "featured", "updated_at",
        ]

    def get_cover_url(self, obj):
        return cover_url(obj)

    def get_owner(self, obj):
        return author_payload(obj.owner)

    def get_company(self, obj):
        """Company Studio courses are shown as 'Course by <company>'; null for a Professional's own course."""
        return display_publisher(obj.company) if obj.company_id else None

    def get_topics(self, obj):
        return [{"id": t.id, "name": t.name, "slug": t.slug} for t in obj.topics.all()]

    def get_video_minutes(self, obj):
        seconds = getattr(obj, "video_seconds", None) or 0
        return round(seconds / 60)


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
        for item in obj.items.select_related(*ITEM_SELECT):
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
    instructors = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), required=False)
    modules = serializers.SerializerMethodField()
    faqs = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = [
            "id", "slug", "title", "summary", "description", "outcomes", "prerequisites", "language",
            "cover_url", "level", "topics", "roles", "instructors",
            "access", "price", "currency",
            "status", "rejection_reason", "modules", "items", "faqs",
            "enrolled_count", "can_delete", "submitted_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "currency", "status", "rejection_reason", "submitted_at", "updated_at"]
        extra_kwargs = {"language": {"allow_blank": True}}  # blank falls back to English

    def get_cover_url(self, obj):
        return cover_url(obj)

    def get_items(self, obj):
        return [
            {**target_card(item.target, item.kind), "item_id": item.pk, "module_id": item.module_id}
            for item in obj.items.select_related(*ITEM_SELECT)
        ]

    def get_enrolled_count(self, obj):
        return obj.enrollments.count()

    def get_can_delete(self, obj):
        """A live course with learners can't be deleted by its author (Genex unpublishes it instead)."""
        return not (obj.status == Playlist.STATUS_PUBLISHED and obj.enrollments.exists())

    def get_modules(self, obj):
        return [{"id": m.id, "title": m.title, "summary": m.summary} for m in obj.modules.all()]

    def get_faqs(self, obj):
        return [{"id": f.id, "question": f.question, "answer": f.answer} for f in obj.faqs.all()]

    def validate_outcomes(self, value):
        return clean_lines(value, MAX_OUTCOMES, "outcomes")

    def validate_prerequisites(self, value):
        return clean_lines(value, MAX_PREREQUISITES, "prerequisites")

    def validate_summary(self, value):
        return value.strip()

    def validate_language(self, value):
        return value.strip() or "English"

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if "instructors" in attrs:
            attrs["instructors"] = self._check_instructors(attrs["instructors"])
        return attrs

    def _check_instructors(self, people):
        """Company courses may list up to 3 of the company's verified Professionals; a Professional's course lists none."""
        if self.instance is not None:
            company = self.instance.company
        else:
            user = self.context["request"].user
            company = user.company if is_company(user) else None
        problem = instructor_problem(company, people)
        if problem:
            raise serializers.ValidationError({"instructors": problem})
        return people

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
        # Changing what learners are promised (see REVIEWED_FIELDS) on a live
        # course sends it back for review; item order does not.
        if instance.status == Playlist.STATUS_PUBLISHED and any(
            validated_data.get(field, getattr(instance, field)) != getattr(instance, field)
            for field in REVIEWED_FIELDS
        ):
            validated_data["status"] = Playlist.STATUS_PENDING
        return super().update(instance, validated_data)


class ItemRefSerializer(serializers.Serializer):
    kind = serializers.ChoiceField(choices=list(ITEM_KINDS))
    id = serializers.IntegerField()


class OutlineModuleSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    title = serializers.CharField(max_length=CourseModule._meta.get_field("title").max_length)
    summary = serializers.CharField(max_length=CourseModule._meta.get_field("summary").max_length, required=False, allow_blank=True, default="")
    items = ItemRefSerializer(many=True)


class OutlineSerializer(serializers.Serializer):
    """The whole lesson outline: modules in order, each with its lessons, plus lessons in no module (shown after them)."""
    modules = OutlineModuleSerializer(many=True, required=False, default=list)
    loose_items = ItemRefSerializer(many=True, required=False, default=list)

    def validate_modules(self, value):
        if len(value) > MAX_MODULES:
            raise serializers.ValidationError(f"A course can have at most {MAX_MODULES} modules.")
        return value


class FaqInputSerializer(serializers.Serializer):
    question = serializers.CharField(max_length=CourseFAQ._meta.get_field("question").max_length)
    answer = serializers.CharField(max_length=CourseFAQ._meta.get_field("answer").max_length)


def professional_library(user):
    """A Professional's own live videos and posts (published from their submissions, even while an edit is in review)."""
    return {
        "video": VideoItem.objects.filter(submission_source__author=user).select_related("image"),
        "post": BlogPost.objects.filter(submission_source__author=user).select_related("image"),
    }


def company_library(company):
    """A company's published GeAcademy articles, research, whitepapers and podcasts."""
    return {
        "article": TechArticle.objects.filter(company=company).select_related("image"),
        "research": CaseStudy.objects.filter(company=company).select_related("image"),
        "whitepaper": Whitepaper.objects.filter(company=company),
        "podcast": PodcastEpisode.objects.filter(company=company).select_related("image"),
    }


def library_for(user):
    """What this author can put in a course: {kind: queryset}."""
    if user.account_type == "company" and user.company_id:
        return company_library(user.company)
    return professional_library(user)


def library_for_course(course):
    return company_library(course.company) if course.company_id else professional_library(course.owner)
