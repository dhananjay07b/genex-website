from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email, user_pk_to_url_str
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import PasswordResetSerializer
from django.conf import settings
from rest_framework import serializers

from .models import MembershipTier, User


class MembershipTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipTier
        fields = ["slug", "name", "rank"]


class UserSerializer(serializers.ModelSerializer):
    membership_tier = MembershipTierSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    cover_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "display_name", "bio", "membership_tier", "avatar_url", "cover_photo_url"]
        read_only_fields = ["id", "email", "membership_tier", "avatar_url", "cover_photo_url"]

    def get_avatar_url(self, obj):
        return obj.avatar.file.url if obj.avatar else None

    def get_cover_photo_url(self, obj):
        return obj.cover_photo.file.url if obj.cover_photo else None


class PublicUserSerializer(serializers.ModelSerializer):
    """
    A user's public-facing identity — no email, no membership tier internals.
    Used for follower/following lists and anywhere else another user's basic
    identity needs to be shown (e.g. a comment author, a podcast guest).
    """
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "display_name", "bio", "avatar_url"]

    def get_avatar_url(self, obj):
        return obj.avatar.file.url if obj.avatar else None


class PublicProfileSerializer(serializers.ModelSerializer):
    """
    The public profile page's identity + stats block. Content lists (blog
    posts, videos, podcast appearances) are separate paginated endpoints —
    see accounts/public_views.py — to keep this payload light.
    """
    membership_tier = MembershipTierSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    cover_photo_url = serializers.SerializerMethodField()
    published_blog_count = serializers.SerializerMethodField()
    published_video_count = serializers.SerializerMethodField()
    podcast_appearance_count = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "display_name", "bio", "avatar_url", "cover_photo_url",
            "membership_tier", "date_joined",
            "published_blog_count", "published_video_count", "podcast_appearance_count",
            "followers_count", "following_count",
        ]

    def get_avatar_url(self, obj):
        return obj.avatar.file.url if obj.avatar else None

    def get_cover_photo_url(self, obj):
        return obj.cover_photo.file.url if obj.cover_photo else None

    def get_published_blog_count(self, obj):
        return obj.blog_submissions.filter(status="published").count()

    def get_published_video_count(self, obj):
        return obj.video_submissions.filter(status="published").count()

    def get_podcast_appearance_count(self, obj):
        return obj.podcast_appearances.count()

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()


def _gelearn_reset_url_generator(request, user, temp_key):
    uid = user_pk_to_url_str(user)
    return f"{settings.GELEARN_FRONTEND_URL}/reset-password/{uid}/{temp_key}"


class GenexPasswordResetSerializer(PasswordResetSerializer):
    """
    dj-rest-auth's default reset-email URL builder reverses a Django URL
    name ('password_reset_confirm') that this project never registers, since
    the confirm step is a POST-only API endpoint handled by a frontend page
    instead of a server-rendered view. Without this override, requesting a
    password reset raises NoReverseMatch. See GELEARN_FRONTEND_URL.
    """

    def get_email_options(self):
        return {"url_generator": _gelearn_reset_url_generator}


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
