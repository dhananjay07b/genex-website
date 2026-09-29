from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"geacademy", views.GeAcademyViewSet, basename="studio-geacademy")
router.register(r"research", views.ResearchViewSet, basename="studio-research")
router.register(r"policies-tenders", views.PoliciesTendersViewSet, basename="studio-policies-tenders")
router.register(r"whitepapers", views.WhitepaperViewSet, basename="studio-whitepapers")
router.register(r"podcasts", views.PodcastViewSet, basename="studio-podcasts")

urlpatterns = [
    path("company/", views.StudioCompanyView.as_view(), name="studio-company"),
    path("team/", views.StudioTeamView.as_view(), name="studio-team"),
    path("professionals/", views.ProfessionalSearchView.as_view(), name="studio-professionals"),
    *router.urls,
]
