import re

from rest_framework import serializers

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
