from rest_framework import serializers

from .models import Company


class CompanyListSerializer(serializers.ModelSerializer):
    """Registration dropdown row — domains are shown so professionals know which email to use."""
    logo_url = serializers.CharField(read_only=True)
    domains = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ["id", "name", "slug", "logo_url", "domains"]

    def get_domains(self, obj):
        return [d.domain for d in obj.domains.all()]


class CompanyDetailSerializer(serializers.ModelSerializer):
    logo_url = serializers.CharField(read_only=True)

    class Meta:
        model = Company
        fields = ["id", "name", "slug", "logo_url", "website", "description"]
