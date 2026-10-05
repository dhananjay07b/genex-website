from django.urls import path

from . import views

urlpatterns = [
    path("explore/", views.ExploreMenuView.as_view(), name="discovery-explore"),
    path("home/", views.HomeView.as_view(), name="discovery-home"),
    path("home/me/", views.MyHomeView.as_view(), name="discovery-home-me"),
    path("search/", views.SearchView.as_view(), name="discovery-search"),
    path("search/trending/", views.TrendingSearchesView.as_view(), name="discovery-trending-searches"),
    path("views/", views.TrackView.as_view(), name="discovery-track-view"),
    path("topics/", views.TopicListView.as_view(), name="discovery-topics"),
    path("topics/<slug:slug>/", views.TopicDetailView.as_view(), name="discovery-topic"),
    path("roles/", views.RoleListView.as_view(), name="discovery-roles"),
    path("roles/<slug:slug>/", views.RoleDetailView.as_view(), name="discovery-role"),
    path("professionals/", views.ProfessionalListView.as_view(), name="discovery-professionals"),
    path("companies/", views.CompanyListView.as_view(), name="discovery-companies"),
    path("live-sessions/", views.LiveSessionListView.as_view(), name="discovery-live-sessions"),
    path("landing/<str:audience>/", views.LandingView.as_view(), name="discovery-landing"),
]
