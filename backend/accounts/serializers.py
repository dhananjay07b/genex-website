from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers

from .models import MembershipTier, User


class MembershipTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipTier
        fields = ["slug", "name", "rank"]


class UserSerializer(serializers.ModelSerializer):
    membership_tier = MembershipTierSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "display_name", "bio", "membership_tier"]
        read_only_fields = ["id", "email", "membership_tier"]


class GenexRegisterSerializer(RegisterSerializer):
    display_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data["display_name"] = self.validated_data.get("display_name", "")
        return data

    def save(self, request):
        user = super().save(request)
        user.display_name = self.cleaned_data.get("display_name", "")
        user.save(update_fields=["display_name"])
        return user
