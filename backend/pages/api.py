"""
DRF-based REST API for Genex snippet models.
Exposed at /api/snippets/<model>/ — separate from the Wagtail v2 router.
All list views support ?limit= and ?offset= pagination.
"""

from django.utils import timezone
from rest_framework import mixins, permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.throttling import ScopedRateThrottle

from .models import (
    BlogPost,
    CaseStudy,
    PodcastEpisode,
    TechArticle,
    Tender,
    UserBlogPost,
    VideoItem,
    Whitepaper,
)


class GenexPagination(LimitOffsetPagination):
    default_limit = 50
    max_limit = 200


# ---------------------------------------------------------------------------
# Serializers
# ---------------------------------------------------------------------------

class CaseStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseStudy
        fields = ["id", "title", "category", "category_color", "excerpt", "date", "read_time"]


class TechArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechArticle
        fields = ["id", "title", "topic", "difficulty", "read_time", "date", "excerpt", "featured"]


class TenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tender
        fields = ["id", "title", "authority", "deadline", "value", "status", "sector", "description"]


class WhitepaperSerializer(serializers.ModelSerializer):
    class Meta:
        model = Whitepaper
        fields = ["id", "title", "category", "category_bg", "category_text", "date", "pages", "description"]


class GatedContentSerializerMixin:
    """
    Never trust the frontend alone: the lock state and the actual media URL
    are both computed server-side from the requesting user's tier, regardless
    of what the client renders.
    """
    def _is_locked(self, obj):
        if obj.required_tier_id is None:
            return False
        user = self.context["request"].user
        if not user.is_authenticated:
            return True
        return user.membership_tier.rank < obj.required_tier.rank

    def get_is_locked(self, obj):
        return self._is_locked(obj)


class VideoItemSerializer(GatedContentSerializerMixin, serializers.ModelSerializer):
    is_locked = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = VideoItem
        fields = ["id", "title", "category", "category_color", "category_text_color", "date", "duration", "excerpt", "video_url", "is_locked"]

    def get_video_url(self, obj):
        return None if self._is_locked(obj) else obj.video_url


class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ["id", "title", "topic", "date", "excerpt"]


class PodcastEpisodeSerializer(GatedContentSerializerMixin, serializers.ModelSerializer):
    is_locked = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = PodcastEpisode
        fields = ["id", "title", "category", "category_bg", "category_text", "date", "duration", "description", "guest", "guest_role", "audio_url", "is_locked"]

    def get_audio_url(self, obj):
        return None if self._is_locked(obj) else obj.audio_url


class UserBlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBlogPost
        fields = ["id", "title", "excerpt", "body", "topic", "status", "rejection_reason", "created_at", "submitted_at"]
        read_only_fields = ["id", "status", "rejection_reason", "created_at", "submitted_at"]

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        validated_data["status"] = "pending"
        validated_data["submitted_at"] = timezone.now()
        return super().create(validated_data)


# ---------------------------------------------------------------------------
# ViewSets (read-only)
# ---------------------------------------------------------------------------

class CaseStudyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CaseStudy.objects.all().order_by("-date")
    serializer_class = CaseStudySerializer
    pagination_class = GenexPagination


class TechArticleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TechArticle.objects.all().order_by("-date")
    serializer_class = TechArticleSerializer
    pagination_class = GenexPagination


class TenderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tender.objects.all().order_by("status")
    serializer_class = TenderSerializer
    pagination_class = GenexPagination


class WhitepaperViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Whitepaper.objects.all().order_by("-date")
    serializer_class = WhitepaperSerializer
    pagination_class = GenexPagination


class VideoItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VideoItem.objects.all().order_by("-date")
    serializer_class = VideoItemSerializer
    pagination_class = GenexPagination


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlogPost.objects.all().order_by("-date")
    serializer_class = BlogPostSerializer
    pagination_class = GenexPagination


class PodcastEpisodeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PodcastEpisode.objects.all().order_by("-date")
    serializer_class = PodcastEpisodeSerializer
    pagination_class = GenexPagination


class BlogSubmissionThrottle(ScopedRateThrottle):
    scope = "blog-submission"


class UserBlogPostViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet,
):
    serializer_class = UserBlogPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_throttles(self):
        if self.request.method == "POST":
            return [BlogSubmissionThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        return UserBlogPost.objects.filter(author=self.request.user).order_by("-created_at")

    @action(detail=False, methods=["get"])
    def mine(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)


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
router.register(r"podcasts", PodcastEpisodeViewSet, basename="podcast")
router.register(r"blog-submissions", UserBlogPostViewSet, basename="userblogpost")

urlpatterns = router.urls
