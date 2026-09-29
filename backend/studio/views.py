from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.roles import IsCompanyUser, display_company, is_admin, is_company
from accounts.uploads import save_uploaded_document, save_uploaded_image
from organizations.serializers import CompanyDetailSerializer
from pages.api import GenexPagination
from pages.models import CaseStudy, PodcastEpisode, TechArticle, Tender, Whitepaper

from . import serializers as s


class StudioViewSet(viewsets.ModelViewSet):
    """
    CRUD for one content type, scoped to the signed-in staff member's company.
    Content publishes immediately (Company posts aren't reviewed). Any staff
    login of the company may edit or delete its items; Admin may act on all
    of them but publishes new content from the CMS instead.
    """
    permission_classes = [IsCompanyUser]
    pagination_class = GenexPagination
    model = None
    ordering = ("-date", "-id")

    def get_queryset(self):
        qs = self.model.objects.select_related("company", "owner").order_by(*self.ordering)
        if is_admin(self.request.user):
            return qs
        return qs.filter(company_id=self.request.user.company_id)

    def perform_create(self, serializer):
        user = self.request.user
        if not is_company(user):
            raise PermissionDenied("Admin publishes from the CMS. The Studio is for company accounts.")
        serializer.save(owner=user, company=user.company)

    def _replace_file(self, request, field_name, saver):
        obj = self.get_object()
        result = saver(request)
        if isinstance(result, Response):
            return result
        old = getattr(obj, field_name)
        setattr(obj, field_name, result)
        obj.save(update_fields=[field_name])
        if old is not None:
            old.delete()
        return Response(self.get_serializer(obj).data)


class ImageUploadMixin:
    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def image(self, request, pk=None):
        return self._replace_file(request, "image", save_uploaded_image)


class GeAcademyViewSet(ImageUploadMixin, StudioViewSet):
    model = TechArticle
    serializer_class = s.GeAcademySerializer


class ResearchViewSet(ImageUploadMixin, StudioViewSet):
    model = CaseStudy
    serializer_class = s.ResearchSerializer


class PoliciesTendersViewSet(StudioViewSet):
    model = Tender
    serializer_class = s.PolicyTenderSerializer
    ordering = ("-id",)


class WhitepaperViewSet(StudioViewSet):
    model = Whitepaper
    serializer_class = s.WhitepaperSerializer

    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def document(self, request, pk=None):
        return self._replace_file(request, "document", save_uploaded_document)


class PodcastViewSet(ImageUploadMixin, StudioViewSet):
    model = PodcastEpisode
    serializer_class = s.PodcastSerializer

    def get_queryset(self):
        return super().get_queryset().prefetch_related("collaborators__company")


class CompanyOnly(permissions.BasePermission):
    """Company staff only — these views describe 'my company'."""

    def has_permission(self, request, view):
        return is_company(request.user)


class StudioCompanyView(APIView):
    """The signed-in staff member's company, with what it has published."""
    permission_classes = [CompanyOnly]

    def get(self, request):
        company = request.user.company
        data = CompanyDetailSerializer(company).data
        data["counts"] = {
            "geacademy": TechArticle.objects.filter(company=company).count(),
            "research": CaseStudy.objects.filter(company=company).count(),
            "policies_tenders": Tender.objects.filter(company=company).count(),
            "whitepapers": Whitepaper.objects.filter(company=company).count(),
            "podcasts": PodcastEpisode.objects.filter(company=company).count(),
        }
        return Response(data)


def _person(user):
    company = display_company(user)
    return {
        "username": user.username,
        "display_name": user.display_name,
        "avatar_url": user.avatar.file.url if user.avatar else None,
        "role_title": user.role_title,
        "account_type": user.account_type,
        "company": company,
        # What the site shows: Company staff are always verified; a Professional
        # only once they've confirmed an email on the company's domain. (Not the
        # raw `company_verified` column, which only applies to Professionals.)
        "verified": bool(company and company["verified"]),
    }


class StudioTeamView(APIView):
    """Staff logins and Professionals linked to this company (verified or pending)."""
    permission_classes = [CompanyOnly]

    def get(self, request):
        members = (
            User.objects.filter(company=request.user.company, is_active=True)
            .select_related("avatar", "company__logo")
            .order_by("account_type", "-company_verified", "display_name")
        )
        return Response({
            "staff": [_person(u) for u in members if u.account_type == User.ACCOUNT_COMPANY],
            "professionals": [_person(u) for u in members if u.account_type == User.ACCOUNT_PROFESSIONAL],
        })


class ProfessionalSearchView(APIView):
    """Find Professionals to add as podcast collaborators: `?q=` (2+ characters), top 10."""
    permission_classes = [IsCompanyUser]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        if len(q) < 2:
            return Response([])
        users = (
            User.objects.filter(account_type=User.ACCOUNT_PROFESSIONAL, is_active=True)
            .filter(Q(display_name__icontains=q) | Q(username__icontains=q))
            .select_related("avatar", "company__logo")
            .order_by("display_name")[:10]
        )
        return Response([_person(u) for u in users])
