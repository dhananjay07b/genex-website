"""
DRF-based REST API for Genex snippet models.
Exposed at /api/snippets/<model>/ — separate from the Wagtail v2 router.
All list views support ?limit= and ?offset= pagination.
"""

from django.utils import timezone
from rest_framework import mixins, permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.throttling import ScopedRateThrottle
from wagtail.rich_text import expand_db_html

from accounts.roles import IsProfessional, display_company, display_publisher, is_admin
from accounts.uploads import save_uploaded_image
from commerce.access import has_access

from .models import (
    AccessControlled,
    BlogPost,
    CaseStudy,
    PodcastEpisode,
    TechArticle,
    Tender,
    Topic,
    UserBlogPost,
    UserVideoPost,
    VideoItem,
    Whitepaper,
)
from .richtext import sanitize_submission_html


def _upload_submission_image(request, obj, field_name):
    """
    Shared body for the per-submission image/thumbnail upload actions below —
    same pattern as accounts/media_views.py's avatar/cover-photo upload,
    scoped to one submission instead of the current user.
    """
    image = save_uploaded_image(request)
    if isinstance(image, Response):
        return image

    old_image = getattr(obj, field_name)
    setattr(obj, field_name, image)
    obj.save(update_fields=[field_name])
    if old_image:
        old_image.delete()

    return image


class GenexPagination(LimitOffsetPagination):
    default_limit = 50
    max_limit = 200


# ---------------------------------------------------------------------------
# Serializers
# ---------------------------------------------------------------------------

class ImageUrlSerializerMixin:
    """Exposes a ForeignKey(wagtailimages.Image) field named `image` as a plain `image_url` string."""
    def get_image_url(self, obj):
        return obj.image.file.url if obj.image else None


class StreamFieldSerializerMixin:
    """Renders a StreamField in the same {type, value, id} shape the Wagtail Page API uses."""
    def _stream_api_representation(self, obj, field_name):
        value = getattr(obj, field_name)
        return value.stream_block.get_api_representation(value)


class RichTextFieldSerializerMixin:
    """Expands a RichTextField's raw DB-format HTML (e.g. `<embed embedtype="image" id="5">`)
    into real <img>/<iframe>/<a href> HTML the frontend can render."""
    def _expand_richtext(self, obj, field_name):
        value = getattr(obj, field_name)
        return expand_db_html(value) if value else value


class PublisherSerializerMixin(serializers.Serializer):
    """`company`: the publishing Company (logo + verified), or null for Genex editorial content."""
    company = serializers.SerializerMethodField()

    def get_company(self, obj):
        return display_publisher(obj.company) if obj.company_id else None


class CaseStudySerializer(PublisherSerializerMixin, ImageUrlSerializerMixin, StreamFieldSerializerMixin, RichTextFieldSerializerMixin, serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    intro = serializers.SerializerMethodField()
    sections = serializers.SerializerMethodField()

    class Meta:
        model = CaseStudy
        fields = ["id", "title", "category", "category_color", "excerpt", "date", "read_time", "featured", "image_url", "intro", "sections", "company"]

    def get_intro(self, obj):
        return self._expand_richtext(obj, "intro")

    def get_sections(self, obj):
        return self._stream_api_representation(obj, "sections")


class TechArticleSerializer(PublisherSerializerMixin, ImageUrlSerializerMixin, StreamFieldSerializerMixin, RichTextFieldSerializerMixin, serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    intro = serializers.SerializerMethodField()
    sections = serializers.SerializerMethodField()
    takeaways = serializers.SerializerMethodField()

    class Meta:
        model = TechArticle
        fields = [
            "id", "title", "topic", "difficulty", "read_time", "date", "excerpt", "featured",
            "image_url", "tags", "intro", "sections", "callout_label", "callout_content", "takeaways", "company",
        ]

    def get_tags(self, obj):
        return [tag.name for tag in obj.tags.all()]

    def get_intro(self, obj):
        return self._expand_richtext(obj, "intro")

    def get_sections(self, obj):
        return self._stream_api_representation(obj, "sections")

    def get_takeaways(self, obj):
        return self._stream_api_representation(obj, "takeaways")


class TenderSerializer(PublisherSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Tender
        fields = ["id", "title", "authority", "deadline", "value", "status", "sector", "description", "company"]


class WhitepaperSerializer(PublisherSerializerMixin, serializers.ModelSerializer):
    document_url = serializers.SerializerMethodField()

    class Meta:
        model = Whitepaper
        fields = ["id", "title", "category", "category_bg", "category_text", "date", "pages", "description", "document_url", "company"]

    def get_document_url(self, obj):
        return obj.document.url if obj.document else None


def author_payload(user):
    """Public identity card for a content author / podcast guest (the frontend's ContentAuthor)."""
    return {
        "username": user.username,
        "display_name": user.display_name,
        "avatar_url": user.avatar.file.url if user.avatar else None,
        "account_type": user.account_type,
        "company": display_company(user),
        "role_title": user.role_title,
        "years_experience": user.years_experience,
        "bio": user.bio,
        "expertise": [{"id": t.id, "name": t.name, "slug": t.slug} for t in user.expertise.all()[:3]],
    }


class AuthorSerializerMixin:
    """
    Resolves the real submitter behind a published BlogPost/VideoItem via the
    reverse `submission_source` OneToOne (set by approve_and_publish) — falls
    back to None (frontend shows the generic editorial byline) for content
    created directly in Wagtail with no submission behind it.
    """
    def get_author(self, obj):
        submission = getattr(obj, "submission_source", None)
        if submission is None or submission.author is None:
            return None
        return author_payload(submission.author)


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ["id", "name", "slug"]


class GatedContentSerializerMixin(serializers.Serializer):
    """
    Never trust the frontend alone: the lock state and the gated payload
    (media URL / body) are computed server-side from the requesting user via
    commerce.access.has_access, regardless of what the client renders.
    """
    access = serializers.CharField(read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, allow_null=True)
    currency = serializers.CharField(read_only=True)
    is_locked = serializers.SerializerMethodField()

    ACCESS_FIELDS = ["access", "price", "currency", "is_locked"]

    def _is_locked(self, obj):
        # The serializer context is shared by every item in a list response,
        # so purchase lookups are memoised there (one query per list).
        cache = self.context.setdefault("_access_cache", {})
        key = ("locked", type(obj).__name__, obj.pk)
        if key not in cache:
            cache[key] = not has_access(self.context["request"].user, obj, cache)
        return cache[key]

    def get_is_locked(self, obj):
        return self._is_locked(obj)


class VideoItemSerializer(GatedContentSerializerMixin, ImageUrlSerializerMixin, AuthorSerializerMixin, serializers.ModelSerializer):
    video_url = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()

    class Meta:
        model = VideoItem
        fields = ["id", "title", "category", "date", "duration", "excerpt", "featured", "image_url", "video_url", "author",
                  *GatedContentSerializerMixin.ACCESS_FIELDS]

    def get_video_url(self, obj):
        return None if self._is_locked(obj) else obj.video_url


class BlogPostSerializer(GatedContentSerializerMixin, ImageUrlSerializerMixin, StreamFieldSerializerMixin, AuthorSerializerMixin, serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    body = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = BlogPost
        fields = ["id", "title", "topic", "topics", "date", "excerpt", "featured", "image_url", "body", "author",
                  *GatedContentSerializerMixin.ACCESS_FIELDS]

    def get_body(self, obj):
        # Locked posts keep their title/excerpt (the teaser) but not the body.
        return [] if self._is_locked(obj) else self._stream_api_representation(obj, "body")


class PodcastEpisodeSerializer(PublisherSerializerMixin, GatedContentSerializerMixin, ImageUrlSerializerMixin, serializers.ModelSerializer):
    audio_url = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    collaborators = serializers.SerializerMethodField()

    class Meta:
        model = PodcastEpisode
        fields = [
            "id", "title", "category", "date", "duration", "description", "guest", "guest_role", "featured",
            "image_url", "audio_url", "collaborators", "company", *GatedContentSerializerMixin.ACCESS_FIELDS,
        ]

    def get_audio_url(self, obj):
        return None if self._is_locked(obj) else obj.audio_url

    def get_collaborators(self, obj):
        return [author_payload(user) for user in obj.collaborators.all()]


class SubmissionAccessMixin(serializers.Serializer):
    """Professionals choose who can open their post/video once it's published."""
    access = serializers.ChoiceField(choices=[c[0] for c in AccessControlled.ACCESS_CHOICES], required=False)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1, required=False, allow_null=True)

    ACCESS_FIELDS = ["access", "price", "currency"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        access = attrs.get("access", getattr(self.instance, "access", AccessControlled.ACCESS_FREE))
        price = attrs.get("price", getattr(self.instance, "price", None))
        if access == AccessControlled.ACCESS_PAID and not price:
            raise serializers.ValidationError({"price": "Set a price for paid content."})
        if access != AccessControlled.ACCESS_PAID:
            attrs["price"] = None
        return attrs


class UserBlogPostSerializer(SubmissionAccessMixin, serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    topics = serializers.PrimaryKeyRelatedField(queryset=Topic.objects.all(), many=True, required=False)

    class Meta:
        model = UserBlogPost
        fields = ["id", "title", "excerpt", "body", "topics", "other_topic", "image_url", "status", "rejection_reason", "created_at", "submitted_at",
                  *SubmissionAccessMixin.ACCESS_FIELDS]
        read_only_fields = ["id", "image_url", "status", "rejection_reason", "created_at", "submitted_at"]

    def get_image_url(self, obj):
        return obj.image.file.url if obj.image else None

    def validate_topics(self, value):
        if len(value) > 3:
            raise serializers.ValidationError("Select at most 3 topics.")
        return value

    def validate_body(self, value):
        return sanitize_submission_html(value)

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        requested_status = self.initial_data.get("status")
        validated_data["status"] = requested_status if requested_status in ("draft", "pending") else "pending"
        validated_data["submitted_at"] = timezone.now()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if instance.status == "published":
            validated_data["status"] = "pending"
            validated_data["reviewed_at"] = None
            validated_data["reviewed_by"] = None
            validated_data["rejection_reason"] = ""
        else:
            requested_status = self.initial_data.get("status")
            if requested_status in ("draft", "pending"):
                validated_data["status"] = requested_status
        validated_data["submitted_at"] = timezone.now()
        return super().update(instance, validated_data)


# ---------------------------------------------------------------------------
# ViewSets (read-only)
# ---------------------------------------------------------------------------

class CaseStudyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CaseStudy.objects.all().order_by("-date").select_related("company__logo")
    serializer_class = CaseStudySerializer
    pagination_class = GenexPagination


class TechArticleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TechArticle.objects.all().order_by("-date").select_related("company__logo")
    serializer_class = TechArticleSerializer
    pagination_class = GenexPagination


class TenderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tender.objects.all().order_by("status").select_related("company__logo")
    serializer_class = TenderSerializer
    pagination_class = GenexPagination


class WhitepaperViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Whitepaper.objects.all().order_by("-date").select_related("company__logo")
    serializer_class = WhitepaperSerializer
    pagination_class = GenexPagination


class VideoItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VideoItem.objects.all().order_by("-date")
    serializer_class = VideoItemSerializer
    pagination_class = GenexPagination


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BlogPostSerializer
    pagination_class = GenexPagination

    def get_queryset(self):
        queryset = BlogPost.objects.all().order_by("-date")
        topic_slug = self.request.query_params.get("topic")
        if topic_slug:
            queryset = queryset.filter(topics__slug=topic_slug)
        return queryset


class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Topic.objects.all().order_by("name")
    serializer_class = TopicSerializer
    pagination_class = None


class PodcastEpisodeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PodcastEpisode.objects.all().order_by("-date").select_related("company__logo").prefetch_related("collaborators__company__logo", "collaborators__expertise")
    serializer_class = PodcastEpisodeSerializer
    pagination_class = GenexPagination


class BlogSubmissionThrottle(ScopedRateThrottle):
    scope = "blog-submission"


class UserBlogPostViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet,
):
    serializer_class = UserBlogPostSerializer
    # Posting is a Professional feature; Learners get 403, Company staff use the Studio.
    permission_classes = [IsProfessional]

    def get_throttles(self):
        if self.request.method == "POST":
            return [BlogSubmissionThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        qs = UserBlogPost.objects.order_by("-created_at")
        if is_admin(self.request.user) and self.action not in ("list", "mine"):
            return qs  # Admin can open/edit/delete anyone's submission by id; lists stay personal.
        return qs.filter(author=self.request.user)

    @action(detail=False, methods=["get"])
    def mine(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def image(self, request, pk=None):
        submission = self.get_object()
        result = _upload_submission_image(request, submission, "image")
        if isinstance(result, Response):
            return result
        return Response(self.get_serializer(submission).data)


class UserVideoPostSerializer(SubmissionAccessMixin, serializers.ModelSerializer):
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = UserVideoPost
        fields = ["id", "title", "excerpt", "video_url", "topic", "duration", "thumbnail_url", "status", "rejection_reason", "created_at", "submitted_at",
                  *SubmissionAccessMixin.ACCESS_FIELDS]
        read_only_fields = ["id", "thumbnail_url", "status", "rejection_reason", "created_at", "submitted_at"]

    def get_thumbnail_url(self, obj):
        return obj.thumbnail.file.url if obj.thumbnail else None

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        requested_status = self.initial_data.get("status")
        validated_data["status"] = requested_status if requested_status in ("draft", "pending") else "pending"
        validated_data["submitted_at"] = timezone.now()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if instance.status == "published":
            validated_data["status"] = "pending"
            validated_data["reviewed_at"] = None
            validated_data["reviewed_by"] = None
            validated_data["rejection_reason"] = ""
        else:
            requested_status = self.initial_data.get("status")
            if requested_status in ("draft", "pending"):
                validated_data["status"] = requested_status
        validated_data["submitted_at"] = timezone.now()
        return super().update(instance, validated_data)


class VideoSubmissionThrottle(ScopedRateThrottle):
    scope = "video-submission"


class UserVideoPostViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet,
):
    serializer_class = UserVideoPostSerializer
    permission_classes = [IsProfessional]

    def get_throttles(self):
        if self.request.method == "POST":
            return [VideoSubmissionThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        qs = UserVideoPost.objects.order_by("-created_at")
        if is_admin(self.request.user) and self.action not in ("list", "mine"):
            return qs  # Admin can open/edit/delete anyone's submission by id; lists stay personal.
        return qs.filter(author=self.request.user)

    @action(detail=False, methods=["get"])
    def mine(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def thumbnail(self, request, pk=None):
        submission = self.get_object()
        result = _upload_submission_image(request, submission, "thumbnail")
        if isinstance(result, Response):
            return result
        return Response(self.get_serializer(submission).data)


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = DefaultRouter()
router.register(r"case-studies", CaseStudyViewSet, basename="casestudy")
router.register(r"tech-articles", TechArticleViewSet, basename="techarticle")
router.register(r"tenders", TenderViewSet, basename="tender")
router.register(r"whitepapers", WhitepaperViewSet, basename="whitepaper")
router.register(r"videos", VideoItemViewSet, basename="videoitem")
router.register(r"blog-posts", BlogPostViewSet, basename="blogpost")
router.register(r"topics", TopicViewSet, basename="topic")
router.register(r"podcasts", PodcastEpisodeViewSet, basename="podcast")
router.register(r"blog-submissions", UserBlogPostViewSet, basename="userblogpost")
router.register(r"video-submissions", UserVideoPostViewSet, basename="uservideopost")

urlpatterns = router.urls
