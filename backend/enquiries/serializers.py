import re

from django.utils import timezone
from rest_framework import serializers

from pages.models import JobApplication, JobPage

from .models import Enquiry


class EnquirySerializer(serializers.ModelSerializer):
    # A field real visitors never see: bots that fill in every field give themselves away.
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Enquiry
        fields = ["name", "company", "email", "phone", "project_type", "subject", "message", "website"]

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Name is required.")
        return value

    def validate_company(self, value):
        return value.strip()

    def validate(self, attrs):
        # Job applications (opened from Careers → Apply) may come from someone between jobs.
        if not attrs.get("company") and not attrs.get("subject", "").startswith("Application:"):
            raise serializers.ValidationError({"company": "Company name is required."})
        return attrs

    def validate_phone(self, value):
        value = value.strip()
        if not re.fullmatch(r"[+\d\s\-()]{7,40}", value):
            raise serializers.ValidationError("Enter a valid phone number.")
        return value

    def validate_message(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters.")
        return value


MAX_CV_BYTES = 5 * 1024 * 1024


class JobApplicationSerializer(serializers.ModelSerializer):
    """The Apply form on a job page. Only open, published jobs accept applications."""
    job = serializers.PrimaryKeyRelatedField(
        queryset=JobPage.objects.live().filter(is_open=True),
        error_messages={"does_not_exist": "This role is no longer open for applications."},
    )
    consent = serializers.BooleanField(write_only=True)
    # Honeypot, as on the Contact form.
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = JobApplication
        fields = ["job", "name", "email", "phone", "linkedin", "portfolio", "experience", "message", "cv", "consent", "website"]

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Name is required.")
        return value

    def validate_phone(self, value):
        value = value.strip()
        if not re.fullmatch(r"[+\d\s\-()]{7,40}", value):
            raise serializers.ValidationError("Enter a valid phone number.")
        return value

    def validate_cv(self, value):
        if value.size > MAX_CV_BYTES:
            raise serializers.ValidationError("Your CV must be 5 MB or smaller.")
        head = value.read(5)
        value.seek(0)
        if not (value.name or "").lower().endswith(".pdf") or head != b"%PDF-":
            raise serializers.ValidationError("Upload your CV as a PDF.")
        return value

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError("Please agree to the Privacy Policy to apply.")
        return value

    def create(self, validated_data):
        validated_data.pop("consent")
        return JobApplication.objects.create(consent_at=timezone.now(), **validated_data)
