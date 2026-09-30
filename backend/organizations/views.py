from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Company
from .public import company_page
from .serializers import CompanyListSerializer


class CompanyListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CompanyListSerializer
    pagination_class = None
    queryset = Company.objects.filter(is_active=True).select_related("logo").prefetch_related("domains")


class CompanyDetailView(APIView):
    """Public company page: profile, published content, verified experts and their courses."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        company = get_object_or_404(Company.objects.select_related("logo"), slug=slug, is_active=True)
        return Response(company_page(company))
