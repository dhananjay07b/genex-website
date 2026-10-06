from django.db import transaction
from django.db.models import Q
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
from pages.api import GenexPagination, author_payload
from pages.models import AccessControlled

from .models import ITEM_KINDS, CareerRole, CourseFAQ, CourseModule, Enrollment, ItemProgress, Playlist, PlaylistItem
from .queries import course_queryset, published_courses
from .serializers import (
    MAX_FAQS,
    MAX_ITEMS,
    CareerRoleSerializer,
    CourseCardSerializer,
    CourseDetailSerializer,
    FaqInputSerializer,
    ItemRefSerializer,
    MyCourseSerializer,
    OutlineSerializer,
    eligible_instructors,
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
    """
    A live course for anyone. Its owner (or, for a company course, any staff
    login of that company) and Admin can also open it as a draft or while in
    review, to preview the page; the response then has `is_preview: true`.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CourseDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            return course_queryset()
        visible = Q(status=Playlist.STATUS_PUBLISHED)
        if is_company(user):
            visible |= Q(company_id=user.company_id)
        elif user.is_authenticated:
            visible |= Q(owner=user, company__isnull=True)
        return course_queryset().filter(visible)


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

    def _check_refs(self, course, refs):
        """An error message if `refs` ({kind, id} dicts) aren't this author's own content, once each and within the limit."""
        if len(refs) > MAX_ITEMS:
            return f"A course can hold at most {MAX_ITEMS} items."
        library = library_for_course(course)
        allowed = {kind: set(qs.values_list("pk", flat=True)) for kind, qs in library.items()}
        seen = set()
        for ref in refs:
            key = (ref["kind"], ref["id"])
            if ref["id"] not in allowed.get(ref["kind"], ()):
                return "Courses can only include your own published content."
            if key in seen:
                return "Each item can appear only once."
            seen.add(key)
        return None

    def _sync_items(self, course, rows):
        """
        Make the course's lessons exactly `rows` — (ref, module_id) pairs, in
        order — updating rows that already exist instead of recreating them, so
        learners keep the lessons they've ticked off. Lessons no longer listed
        are removed (with their progress).
        """
        existing = {}
        for item in course.items.all():
            field = ITEM_KINDS[item.kind][0]
            existing[(item.kind, getattr(item, f"{field}_id"))] = item
        keep, changed, new = set(), [], []
        for position, (ref, module_id) in enumerate(rows):
            key = (ref["kind"], ref["id"])
            item = existing.get(key)
            if item is None:
                new.append(PlaylistItem(playlist=course, position=position, module_id=module_id,
                                        **{f"{ITEM_KINDS[ref['kind']][0]}_id": ref["id"]}))
                continue
            keep.add(item.pk)
            if (item.position, item.module_id) != (position, module_id):
                item.position, item.module_id = position, module_id
                changed.append(item)
        course.items.exclude(pk__in=keep).delete()
        PlaylistItem.objects.bulk_update(changed, ["position", "module"])
        PlaylistItem.objects.bulk_create(new)

    def _send_back_for_review(self, course):
        if course.status == Playlist.STATUS_PUBLISHED:
            course.status = Playlist.STATUS_PENDING
            course.save(update_fields=["status", "updated_at"])

    @action(detail=True, methods=["put"])
    def items(self, request, pk=None):
        """
        Replace the course's lessons with `[{kind, id}, …]`, in order. Lessons
        already in the course keep their module and learners' progress.
        (Superseded by `outline`, which also sets modules.)
        """
        course = self.get_object()
        refs = ItemRefSerializer(data=request.data, many=True)
        refs.is_valid(raise_exception=True)
        error = self._check_refs(course, refs.validated_data)
        if error:
            return Response({"items": error}, status=400)

        modules = {}
        for item in course.items.all():
            modules[(item.kind, getattr(item, f"{ITEM_KINDS[item.kind][0]}_id"))] = item.module_id
        with transaction.atomic():
            self._sync_items(course, [(ref, modules.get((ref["kind"], ref["id"]))) for ref in refs.validated_data])
            course.save(update_fields=["updated_at"])
        return Response(self.get_serializer(course).data)

    @action(detail=True, methods=["put"])
    def outline(self, request, pk=None):
        """
        Replace the course's modules and lessons:
        `{modules: [{id?, title, summary, items: [{kind, id}]}], loose_items: [{kind, id}]}`.
        Modules without an `id` are created; modules left out are deleted.
        Lessons keep learners' progress. New or reworded modules send a live
        course back for review; reordering and moving lessons don't.
        """
        course = self.get_object()
        data = OutlineSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        modules_in = data.validated_data["modules"]
        loose = data.validated_data["loose_items"]
        error = self._check_refs(course, [ref for m in modules_in for ref in m["items"]] + loose)
        if error:
            return Response({"items": error}, status=400)

        current = {m.pk: m for m in course.modules.all()}
        ids = [m.get("id") for m in modules_in if m.get("id")]
        if any(mid not in current for mid in ids) or len(ids) != len(set(ids)):
            return Response({"modules": "That module isn't part of this course."}, status=400)

        reworded = False
        with transaction.atomic():
            rows, kept = [], []
            for position, spec in enumerate(modules_in):
                title, summary = spec["title"].strip(), spec["summary"].strip()
                module = current.get(spec.get("id"))
                if module is None:
                    module = CourseModule.objects.create(playlist=course, title=title, summary=summary, position=position)
                    reworded = True
                else:
                    if (module.title, module.summary) != (title, summary):
                        reworded = True
                    module.title, module.summary, module.position = title, summary, position
                    module.save(update_fields=["title", "summary", "position"])
                kept.append(module.pk)
                rows += [(ref, module.pk) for ref in spec["items"]]
            rows += [(ref, None) for ref in loose]
            course.modules.exclude(pk__in=kept).delete()
            self._sync_items(course, rows)
            course.save(update_fields=["updated_at"])
            if reworded:
                self._send_back_for_review(course)
        return Response(self.get_serializer(course).data)

    @action(detail=True, methods=["put"])
    def faqs(self, request, pk=None):
        """Replace the course's own FAQs with `[{question, answer}, …]` (at most 6). Changes send a live course back for review."""
        course = self.get_object()
        data = FaqInputSerializer(data=request.data, many=True)
        data.is_valid(raise_exception=True)
        faqs = [(f["question"].strip(), f["answer"].strip()) for f in data.validated_data]
        if len(faqs) > MAX_FAQS:
            return Response({"faqs": f"A course can have at most {MAX_FAQS} questions."}, status=400)
        before = list(course.faqs.values_list("question", "answer"))
        if faqs != before:
            with transaction.atomic():
                course.faqs.all().delete()
                CourseFAQ.objects.bulk_create([
                    CourseFAQ(playlist=course, question=q, answer=a, position=i) for i, (q, a) in enumerate(faqs)
                ])
                course.save(update_fields=["updated_at"])
                self._send_back_for_review(course)
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


class CompanyProfessionalsView(APIView):
    """Company Studio: the company's verified Professionals, who can be listed as a course's instructors."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not is_company(request.user):
            return Response({"detail": "Only company accounts choose instructors."}, status=status.HTTP_403_FORBIDDEN)
        people = (
            eligible_instructors(request.user.company)
            .select_related("avatar", "company__logo").prefetch_related("expertise")
            .order_by("display_name", "username")
        )
        return Response([{"id": person.pk, **author_payload(person)} for person in people])


class MyLibraryView(APIView):
    """What this author can put in a course: a Professional's videos and posts, or the company's published content."""
    permission_classes = [IsContributor]

    def get(self, request):
        cards = []
        for kind, qs in library_for(request.user).items():
            cards += [target_card(obj, kind) | {"date": obj.date.isoformat()} for obj in qs]
        cards.sort(key=lambda c: c.pop("date"), reverse=True)
        return Response(cards)
