from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.contenttypes.models import ContentType

from accounts.roles import IsContributor, is_admin, is_company
from engagement.models import Notification
from accounts.uploads import save_uploaded_image
from commerce.access import has_access
from pages.api import GenexPagination, author_payload
from pages.models import AccessControlled

from .models import MAX_REPLY_LENGTH, CareerRole, CourseReview, Enrollment, ItemProgress, Playlist, PlaylistItem, ReviewReply
from . import course_page
from .queries import published_courses
from .reviews import REVIEW_SELECT, review_block_reason, review_payload, with_progress
from .revisions import apply_faqs, apply_outline, is_live, live_value, normalise_outline, revision_of, rewords, stage
from .serializers import (
    MAX_FAQS,
    MAX_ITEMS,
    CareerRoleSerializer,
    CourseCardSerializer,
    CourseDetailSerializer,
    CourseProgressSerializer,
    FaqInputSerializer,
    MyCourseSerializer,
    OutlineSerializer,
    ReviewInputSerializer,
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
    Live courses only, for everyone. A draft or a course in review has no public
    page, not even for its owner: authors preview it inside the course builder,
    so an unpublished course never has a working address.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CourseDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return _published().prefetch_related("modules", "faqs")


class CourseRelatedView(APIView):
    """Other live courses for the course page's "Explore more" tabs: same topic, same role, same publisher."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        course = get_object_or_404(_published().select_related("company"), slug=slug)
        return Response(course_page.related_courses(course))


def _locked_reason(course):
    if course.access == AccessControlled.ACCESS_PAID:
        return "This is a paid course. Checkout is coming soon."
    return "Sign in to enroll in this course."


class EnrollView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        course = get_object_or_404(Playlist, slug=slug, status=Playlist.STATUS_PUBLISHED)
        relation = course.relation_to(request.user)
        if relation:
            detail = "You can't enroll in your own course." if relation == "owner" else "You can't enroll in a course you teach."
            return Response({"detail": detail}, status=status.HTTP_403_FORBIDDEN)
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
    serializer_class = CourseProgressSerializer
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

    def destroy(self, request, *args, **kwargs):
        course = self.get_object()
        if course.status == Playlist.STATUS_PUBLISHED and course.enrollments.exists():
            return Response(
                {"detail": "This course is live and learners are enrolled, so it can't be deleted. Ask Genex to unpublish it."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)

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

    @action(detail=True, methods=["put"])
    def outline(self, request, pk=None):
        """
        Replace the course's modules and lessons:
        `{modules: [{id?, title, summary, items: [{kind, id}]}], loose_items: [{kind, id}]}`.
        Modules without an `id` are created; modules left out are deleted. Lessons
        keep learners' progress. On a live course, new or reworded modules wait
        for Genex review (with the rest of this outline) while the live version
        stays up; reordering and moving lessons go live straight away.
        """
        course = self.get_object()
        data = OutlineSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        modules_in = data.validated_data["modules"]
        loose = data.validated_data["loose_items"]
        error = self._check_refs(course, [ref for m in modules_in for ref in m["items"]] + loose)
        if error:
            return Response({"items": error}, status=400)

        # Known modules: the live ones, plus those already held in a revision (ids below zero are new).
        known = set(course.modules.values_list("pk", flat=True))
        held = revision_of(course)
        if held and "outline" in held.changes:
            known |= {m["id"] for m in held.changes["outline"]["modules"]}
        ids = [m.get("id") for m in modules_in if m.get("id") and m["id"] > 0]
        if any(mid not in known for mid in ids) or len(ids) != len(set(ids)):
            return Response({"modules": "That module isn't part of this course."}, status=400)

        outline = normalise_outline(modules_in, loose)
        with transaction.atomic():
            if is_live(course) and ((held and "outline" in held.changes) or rewords(course, outline)):
                stage(course, request.user, {"outline": outline})
            else:
                apply_outline(course, outline)
                course.save(update_fields=["updated_at"])
        return Response(self.get_serializer(course).data)

    @action(detail=True, methods=["put"])
    def faqs(self, request, pk=None):
        """Replace the course's own FAQs with `[{question, answer}, …]` (at most 6). On a live course, changes wait for Genex review."""
        course = self.get_object()
        data = FaqInputSerializer(data=request.data, many=True)
        data.is_valid(raise_exception=True)
        faqs = [[f["question"].strip(), f["answer"].strip()] for f in data.validated_data]
        if len(faqs) > MAX_FAQS:
            return Response({"faqs": f"A course can have at most {MAX_FAQS} questions."}, status=400)
        with transaction.atomic():
            if is_live(course):
                stage(course, request.user, {"faqs": faqs})
            elif faqs != live_value(course, "faqs"):
                apply_faqs(course, faqs)
                course.save(update_fields=["updated_at"])
        return Response(self.get_serializer(course).data)

    @action(detail=True, methods=["delete"], url_path="revision")
    def withdraw_revision(self, request, pk=None):
        """Drop a live course's changes that are waiting for review (or were sent back); the live version is unchanged."""
        course = self.get_object()
        revision = revision_of(course)
        if revision:
            revision.delete()
            course = self.get_object()  # drop the cached revision
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


def _published_course(slug):
    return get_object_or_404(Playlist, slug=slug, status=Playlist.STATUS_PUBLISHED)


class CourseReviewListView(generics.ListAPIView):
    """
    A live course's visible reviews, newest first. Filters: `rating` (exact stars),
    `rating_max` (that many stars or fewer), `completed=1` (authors who finished the course).
    """
    permission_classes = [permissions.AllowAny]
    pagination_class = GenexPagination

    def get_queryset(self):
        self.course = _published_course(self.kwargs["slug"])
        self.lesson_count = self.course.items.count()
        reviews = with_progress(self.course.reviews.filter(status=CourseReview.STATUS_VISIBLE).select_related(*REVIEW_SELECT))
        params = self.request.query_params
        if params.get("rating", "").isdigit():
            reviews = reviews.filter(rating=int(params["rating"]))
        if params.get("rating_max", "").isdigit():
            reviews = reviews.filter(rating__lte=int(params["rating_max"]))
        if params.get("completed") == "1":
            reviews = reviews.filter(lessons_done__gte=self.lesson_count) if self.lesson_count else reviews.none()
        return reviews

    def list(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.get_queryset())
        team = bool(self.course.relation_to(request.user))
        return self.get_paginated_response([review_payload(r, self.lesson_count, request.user, can_reply=team) for r in page])


class MyCourseReviewView(APIView):
    """
    The signed-in learner's own review of a live course: GET it (with whether they
    may review), PUT to create or edit it, DELETE to remove it.
    """
    permission_classes = [permissions.IsAuthenticated]

    def _state(self, request, course):
        review = CourseReview.objects.filter(user=request.user, playlist=course).select_related("user__avatar").first()
        reason = review_block_reason(request.user, course)
        return {
            "review": review_payload(review, course.items.count(), request.user) if review else None,
            "can_review": reason is None,
            "reason": reason or "",
        }

    def get(self, request, slug):
        course = _published_course(slug)
        return Response(self._state(request, course))

    def put(self, request, slug):
        course = _published_course(slug)
        reason = review_block_reason(request.user, course)
        if reason:
            return Response({"detail": reason}, status=status.HTTP_403_FORBIDDEN)
        data = ReviewInputSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        _, created = CourseReview.objects.update_or_create(
            user=request.user, playlist=course,
            defaults={"rating": data.validated_data["rating"], "body": data.validated_data["body"].strip()},
        )
        if created:
            name = request.user.display_name or request.user.username
            Notification.objects.create(
                recipient=course.owner, kind="course_review",
                text=f'{name} rated "{course.title}" {data.validated_data["rating"]} out of 5.'[:300],
                content_type=ContentType.objects.get_for_model(course), object_id=course.pk,
            )
        return Response(self._state(request, course), status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, slug):
        course = _published_course(slug)
        CourseReview.objects.filter(user=request.user, playlist=course).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReviewReplyView(APIView):
    """
    The course team's reply under one review of a live course: PUT `{body}` to
    write or edit it, DELETE to remove it. The owner (any company account, for a
    company course) and listed instructors share one reply per review.
    """
    permission_classes = [permissions.IsAuthenticated]

    def _review(self, request, slug, review_id):
        course = _published_course(slug)
        if not course.relation_to(request.user):
            return course, None, Response({"detail": "Only the course's owner or instructors can reply to its reviews."}, status=status.HTTP_403_FORBIDDEN)
        review = get_object_or_404(course.reviews.select_related(*REVIEW_SELECT), pk=review_id, status=CourseReview.STATUS_VISIBLE)
        return course, review, None

    def put(self, request, slug, review_id):
        course, review, refused = self._review(request, slug, review_id)
        if refused:
            return refused
        body = str(request.data.get("body", "")).strip()
        if not body:
            return Response({"body": "Write a reply, or delete it instead."}, status=status.HTTP_400_BAD_REQUEST)
        if len(body) > MAX_REPLY_LENGTH:
            return Response({"body": f"Keep the reply under {MAX_REPLY_LENGTH} characters."}, status=status.HTTP_400_BAD_REQUEST)
        reply, created = ReviewReply.objects.update_or_create(review=review, defaults={"author": request.user, "body": body})
        if created:
            name = course.company.name if request.user.account_type == "company" and course.company_id else (request.user.display_name or request.user.username)
            Notification.objects.create(
                recipient=review.user, kind="review_reply",
                text=f'{name} replied to your review of "{course.title}".'[:300],
                content_type=ContentType.objects.get_for_model(course), object_id=course.pk,
            )
        review.reply = reply
        return Response(review_payload(review, course.items.count(), request.user, can_reply=True),
                        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, slug, review_id):
        _, review, refused = self._review(request, slug, review_id)
        if refused:
            return refused
        ReviewReply.objects.filter(review=review).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
