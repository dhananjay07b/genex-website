from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.roles import IsContributor, is_admin, is_company
from accounts.uploads import save_uploaded_image
from commerce.access import has_access
from pages.api import GenexPagination
from pages.models import AccessControlled

from .models import ITEM_KINDS, CareerRole, Enrollment, ItemProgress, Playlist, PlaylistItem
from .queries import published_courses
from .serializers import (
    MAX_ITEMS,
    CareerRoleSerializer,
    CourseCardSerializer,
    CourseDetailSerializer,
    ItemRefSerializer,
    MyCourseSerializer,
    library_for,
    library_for_course,
    target_card,
)


def _published():
    return published_courses()


class CareerRoleListView(generics.ListAPIView):
    """Career roles, in editorial order — for course tagging and the role sections."""
    permission_classes = [permissions.AllowAny]
    serializer_class = CareerRoleSerializer
    pagination_class = None
    queryset = CareerRole.objects.select_related("image")


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
    """
    Build, reorder and submit courses. A Professional's courses are their own;
    a Company account's courses belong to its company, so any staff login of
    that company can edit them (as in Company Studio).
    """
    permission_classes = [IsContributor]
    serializer_class = MyCourseSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Playlist.objects.select_related("cover").order_by("-updated_at")
        if is_admin(user) and self.action not in ("list", "create"):
            return qs
        if is_company(user):
            return qs.filter(company_id=user.company_id) if user.company_id else qs.none()
        return qs.filter(owner=user, company__isnull=True)

    def perform_create(self, serializer):
        user = self.request.user
        company = user.company if is_company(user) and user.company_id else None
        serializer.save(owner=user, company=company, status=Playlist.STATUS_DRAFT)

    @action(detail=True, methods=["put"])
    def items(self, request, pk=None):
        """Replace the course's items with `[{kind, id}, …]`, in order."""
        course = self.get_object()
        refs = ItemRefSerializer(data=request.data, many=True)
        refs.is_valid(raise_exception=True)
        if len(refs.validated_data) > MAX_ITEMS:
            return Response({"items": f"A course can hold at most {MAX_ITEMS} items."}, status=400)

        library = library_for_course(course)
        allowed = {kind: set(qs.values_list("pk", flat=True)) for kind, qs in library.items()}
        seen = set()
        for ref in refs.validated_data:
            key = (ref["kind"], ref["id"])
            if ref["id"] not in allowed.get(ref["kind"], ()):
                return Response({"items": "Courses can only include your own published content."}, status=400)
            if key in seen:
                return Response({"items": "Each item can appear only once."}, status=400)
            seen.add(key)

        with transaction.atomic():
            course.items.all().delete()
            PlaylistItem.objects.bulk_create([
                PlaylistItem(playlist=course, position=position, **{f"{ITEM_KINDS[ref['kind']][0]}_id": ref["id"]})
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
            return Response({"items": "Add at least one item before submitting."}, status=400)
        if course.status == Playlist.STATUS_PUBLISHED:
            return Response({"detail": "This course is already live."}, status=400)
        course.status = Playlist.STATUS_PENDING
        course.submitted_at = timezone.now()
        course.rejection_reason = ""
        course.save(update_fields=["status", "submitted_at", "rejection_reason", "updated_at"])
        return Response(self.get_serializer(course).data)


class MyLibraryView(APIView):
    """What this author can put in a course: a Professional's videos and posts, or the company's published content."""
    permission_classes = [IsContributor]

    def get(self, request):
        cards = []
        for kind, qs in library_for(request.user).items():
            cards += [target_card(obj, kind) | {"date": obj.date.isoformat()} for obj in qs]
        cards.sort(key=lambda c: c.pop("date"), reverse=True)
        return Response(cards)
