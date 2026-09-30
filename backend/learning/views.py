from django.db import transaction
from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.roles import IsProfessional, is_admin
from accounts.uploads import save_uploaded_image
from commerce.access import has_access
from pages.api import GenexPagination
from pages.models import AccessControlled

from .models import Enrollment, ItemProgress, Playlist, PlaylistItem
from .serializers import (
    MAX_ITEMS,
    CourseCardSerializer,
    CourseDetailSerializer,
    ItemRefSerializer,
    MyCourseSerializer,
    library_for,
    target_card,
)


def _published():
    return (
        Playlist.objects.filter(status=Playlist.STATUS_PUBLISHED)
        .select_related("owner__avatar", "owner__company__logo", "cover")
        .annotate(item_count=Count("items"))
    )


class CourseListView(generics.ListAPIView):
    """Published courses; `?owner=<username>` for one professional's."""
    permission_classes = [permissions.AllowAny]
    serializer_class = CourseCardSerializer
    pagination_class = GenexPagination

    def get_queryset(self):
        qs = _published().order_by("-updated_at")
        owner = self.request.query_params.get("owner")
        return qs.filter(owner__username=owner) if owner else qs


class CourseDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CourseDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return _published()


def _locked_reason(course):
    if course.access == AccessControlled.ACCESS_PAID:
        return "This is a paid course. Checkout is coming soon."
    return "Sign in to enroll in this course."


class EnrollView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        course = get_object_or_404(Playlist, slug=slug, status=Playlist.STATUS_PUBLISHED)
        if not has_access(request.user, course):
            return Response({"detail": _locked_reason(course)}, status=status.HTTP_403_FORBIDDEN)
        Enrollment.objects.get_or_create(user=request.user, playlist=course)
        return Response(CourseDetailSerializer(_published().get(pk=course.pk), context={"request": request}).data)

    def delete(self, request, slug):
        course = get_object_or_404(Playlist, slug=slug)
        Enrollment.objects.filter(user=request.user, playlist=course).delete()
        ItemProgress.objects.filter(user=request.user, item__playlist=course).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ItemCompleteView(APIView):
    """Mark (POST) or unmark (DELETE) one course item as done — enrolled learners only."""
    permission_classes = [permissions.IsAuthenticated]

    def _item(self, request, slug, item_id):
        item = get_object_or_404(
            PlaylistItem, pk=item_id, playlist__slug=slug, playlist__status=Playlist.STATUS_PUBLISHED,
        )
        if not Enrollment.objects.filter(user=request.user, playlist=item.playlist).exists():
            return None
        return item

    def post(self, request, slug, item_id):
        item = self._item(request, slug, item_id)
        if item is None:
            return Response({"detail": "Enroll in the course to track progress."}, status=status.HTTP_403_FORBIDDEN)
        ItemProgress.objects.get_or_create(user=request.user, item=item)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request, slug, item_id):
        item = self._item(request, slug, item_id)
        if item is not None:
            ItemProgress.objects.filter(user=request.user, item=item).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MyEnrollmentsView(generics.ListAPIView):
    """The signed-in user's enrolled courses, newest first, with progress."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CourseDetailSerializer
    pagination_class = GenexPagination

    def get_queryset(self):
        return _published().filter(enrollments__user=self.request.user).order_by("-enrollments__enrolled_at")


class MyCourseViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet,
):
    """A Professional's own courses: build, reorder, submit for review."""
    permission_classes = [IsProfessional]
    serializer_class = MyCourseSerializer

    def get_queryset(self):
        qs = Playlist.objects.select_related("cover").order_by("-updated_at")
        return qs if is_admin(self.request.user) and self.action not in ("list", "create") else qs.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, status=Playlist.STATUS_DRAFT)

    @action(detail=True, methods=["put"])
    def items(self, request, pk=None):
        """Replace the course's items with `[{kind, id}, …]`, in order."""
        course = self.get_object()
        refs = ItemRefSerializer(data=request.data, many=True)
        refs.is_valid(raise_exception=True)
        if len(refs.validated_data) > MAX_ITEMS:
            return Response({"items": f"A course can hold at most {MAX_ITEMS} items."}, status=400)

        videos, posts = library_for(course.owner)
        allowed = {"video": set(videos.values_list("pk", flat=True)), "post": set(posts.values_list("pk", flat=True))}
        seen = set()
        for ref in refs.validated_data:
            key = (ref["kind"], ref["id"])
            if ref["id"] not in allowed[ref["kind"]]:
                return Response({"items": "Courses can only include your own published videos and posts."}, status=400)
            if key in seen:
                return Response({"items": "Each video or post can appear only once."}, status=400)
            seen.add(key)

        with transaction.atomic():
            course.items.all().delete()
            PlaylistItem.objects.bulk_create([
                PlaylistItem(
                    playlist=course, position=position,
                    video_id=ref["id"] if ref["kind"] == "video" else None,
                    post_id=ref["id"] if ref["kind"] == "post" else None,
                )
                for position, ref in enumerate(refs.validated_data)
            ])
            course.save(update_fields=["updated_at"])
        return Response(self.get_serializer(course).data)

    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def cover(self, request, pk=None):
        course = self.get_object()
        image = save_uploaded_image(request)
        if isinstance(image, Response):
            return image
        old = course.cover
        course.cover = image
        course.save(update_fields=["cover", "updated_at"])
        if old is not None:
            old.delete()
        return Response(self.get_serializer(course).data)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        course = self.get_object()
        if not course.items.exists():
            return Response({"items": "Add at least one video or post before submitting."}, status=400)
        if course.status == Playlist.STATUS_PUBLISHED:
            return Response({"detail": "This course is already live."}, status=400)
        course.status = Playlist.STATUS_PENDING
        course.submitted_at = timezone.now()
        course.rejection_reason = ""
        course.save(update_fields=["status", "submitted_at", "rejection_reason", "updated_at"])
        return Response(self.get_serializer(course).data)


class MyLibraryView(APIView):
    """What a Professional can put in a course: their own published videos and posts."""
    permission_classes = [IsProfessional]

    def get(self, request):
        videos, posts = library_for(request.user)
        return Response(
            [target_card(v, "video") for v in videos.order_by("-date")]
            + [target_card(p, "post") for p in posts.order_by("-date")]
        )
