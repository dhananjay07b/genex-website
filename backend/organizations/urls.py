from django.urls import path

from .views import CompanyDetailView, CompanyListView

urlpatterns = [
    path("companies/", CompanyListView.as_view(), name="company-list"),
    path("companies/<slug:slug>/", CompanyDetailView.as_view(), name="company-detail"),
]
