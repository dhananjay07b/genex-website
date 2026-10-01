from django.urls import path

from . import views

urlpatterns = [
    path("home/", views.HomeView.as_view(), name="discovery-home"),
    path("home/me/", views.MyHomeView.as_view(), name="discovery-home-me"),
    path("search/", views.SearchView.as_view(), name="discovery-search"),
    path("search/trending/", views.TrendingSearchesView.as_view(), name="discovery-trending-searches"),
    path("views/", views.TrackView.as_view(), name="discovery-track-view"),
]
