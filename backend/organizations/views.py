from rest_framework import generics, permissions

from .models import Company
from .serializers import CompanyDetailSerializer, CompanyListSerializer


class CompanyListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CompanyListSerializer
    pagination_class = None
    queryset = Company.objects.filter(is_active=True).select_related("logo").prefetch_related("domains")


class CompanyDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CompanyDetailSerializer
    lookup_field = "slug"
    queryset = Company.objects.filter(is_active=True).select_related("logo")
