from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email, user_pk_to_url_str
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import PasswordResetSerializer
from django.conf import settings
from pages.api import TopicSerializer
from pages.models import Topic
from rest_framework import serializers

from .models import User
from .roles import display_company, is_admin
from .verification import refresh_company_verification, resolve_professional_company


def validate_account_type_choice(value, current=None):
    """Self-service users may only be Learner or Professional; Company accounts are Admin-made and fixed."""
    if current == User.ACCOUNT_COMPANY:
        if value != User.ACCOUNT_COMPANY:
            raise serializers.ValidationError("Company accounts are managed by Genex and can't change type.")
        return value
    if value not in User.SELF_SERVICE_ACCOUNT_TYPES:
        raise serializers.ValidationError(
            "Company accounts are created by Genex. Contact us if your organisation wants to publish on GeLearn."
        )
    return value


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    cover_photo_url = serializers.SerializerMethodField()
    expertise = serializers.PrimaryKeyRelatedField(queryset=Topic.objects.all(), many=True, required=False)
    account_type = serializers.CharField(required=False)
    is_admin = serializers.SerializerMethodField()
    company = serializers.SerializerMethodField()
    # Effective status, as shown on the site (Company staff are always verified).
    company_verified = serializers.SerializerMethodField()
    # Write: pick a registered company (null to clear). Read: `company` above.
    company_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "display_name", "bio", "avatar_url", "cover_photo_url",
            "account_type", "is_admin", "company", "company_id", "company_other", "company_verified",
            "role_title", "years_experience", "linkedin_url", "expertise",
        ]
        read_only_fields = ["id", "email", "avatar_url", "cover_photo_url", "company_verified"]

    def get_is_admin(self, obj):
        return is_admin(obj)

    def get_company(self, obj):
        return display_company(obj)

    def get_company_verified(self, obj):
        company = display_company(obj)
        return bool(company and company["verified"])

    def validate_account_type(self, value):
        return validate_account_type_choice(value, current=getattr(self.instance, "account_type", None))

    def get_avatar_url(self, obj):
        return obj.avatar.file.url if obj.avatar else None

    def get_cover_photo_url(self, obj):
        return obj.cover_photo.file.url if obj.cover_photo else None

    def validate_expertise(self, value):
        if len(value) > 3:
            raise serializers.ValidationError("Select at most 3 areas of expertise.")
        return value

    def validate(self, attrs):
        instance = self.instance
        account_type = attrs.get("account_type", instance.account_type)

        if account_type == User.ACCOUNT_COMPANY:
            # Company staff: their company is set by Admin only.
            attrs.pop("company_id", None)
            attrs.pop("company_other", None)
            return attrs

        if account_type == User.ACCOUNT_LEARNER:
            # Workplace details describe a Professional; a Learner carries none.
            attrs.pop("company_id", None)
            attrs["_company"] = None
            attrs["company_other"] = ""
            return attrs

        # Professional.
        if "company_id" in attrs or "company_other" in attrs:
            company_id = attrs.pop("company_id", None)
            company_other = attrs.get("company_other", "")
            if company_id and company_id == instance.company_id:
                # Unchanged link — don't re-run the domain check against it.
                company, company_other = instance.company, ""
            else:
                company, company_other = resolve_professional_company(
                    instance.email, company_id, company_other, email_field="company_id",
                )
            attrs["_company"] = company
            attrs["company_other"] = company_other
        elif not instance.company_id and not instance.company_other:
            raise serializers.ValidationError({"company_id": "Select your company, or choose 'Other' and type its name."})

        if not attrs.get("role_title", instance.role_title):
            raise serializers.ValidationError({"role_title": "Role is required for a Professional profile."})
        return attrs

    def update(self, instance, validated_data):
        if "_company" in validated_data:
            instance.company = validated_data.pop("_company")
        user = super().update(instance, validated_data)
        refresh_company_verification(user)
        return user


class PublicUserSerializer(serializers.ModelSerializer):
    """
    A user's public-facing identity — no email or private account details.
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
    avatar_url = serializers.SerializerMethodField()
    cover_photo_url = serializers.SerializerMethodField()
    expertise = TopicSerializer(many=True, read_only=True)
    is_admin = serializers.SerializerMethodField()
    company = serializers.SerializerMethodField()
    published_blog_count = serializers.SerializerMethodField()
    published_video_count = serializers.SerializerMethodField()
    podcast_appearance_count = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "display_name", "bio", "avatar_url", "cover_photo_url",
            "date_joined", "account_type", "is_admin",
            "company", "role_title", "years_experience", "linkedin_url", "expertise",
            "published_blog_count", "published_video_count", "podcast_appearance_count",
            "followers_count", "following_count",
        ]

    def get_avatar_url(self, obj):
        return obj.avatar.file.url if obj.avatar else None

    def get_cover_photo_url(self, obj):
        return obj.cover_photo.file.url if obj.cover_photo else None

    def get_is_admin(self, obj):
        return is_admin(obj)

    def get_company(self, obj):
        return display_company(obj)

    def get_published_blog_count(self, obj):
        return obj.blog_submissions.filter(status="published").count()

    def get_published_video_count(self, obj):
        return obj.video_submissions.filter(status="published").count()

    def get_podcast_appearance_count(self, obj):
        return obj.podcast_collaborations.count()

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
    account_type = serializers.CharField(required=False, default=User.ACCOUNT_LEARNER)
    company_id = serializers.IntegerField(required=False, allow_null=True)
    company_other = serializers.CharField(max_length=150, required=False, allow_blank=True)
    role_title = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_account_type(self, value):
        return validate_account_type_choice(value)

    def validate(self, data):
        data = super().validate(data)
        if data.get("account_type") == User.ACCOUNT_PROFESSIONAL:
            data["_company"], data["company_other"] = resolve_professional_company(
                data.get("email", ""), data.get("company_id"), data.get("company_other", ""),
            )
            if not (data.get("role_title") or "").strip():
                raise serializers.ValidationError({"role_title": "Role is required for a Professional profile."})
        else:
            data["_company"], data["company_other"] = None, ""
        return data

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data["display_name"] = self.validated_data.get("display_name", "")
        data["account_type"] = self.validated_data.get("account_type", User.ACCOUNT_LEARNER)
        data["company"] = self.validated_data.get("_company")
        data["company_other"] = self.validated_data.get("company_other", "")
        data["role_title"] = self.validated_data.get("role_title", "")
        return data

    def save(self, request):
        user = super().save(request)
        user.display_name = self.cleaned_data.get("display_name", "")
        user.account_type = self.cleaned_data.get("account_type", User.ACCOUNT_LEARNER)
        # A Learner's stray company/role_title (if any were somehow sent) are
        # intentionally dropped, not stored — those fields describe a
        # Professional's workplace, not a Learner's.
        if user.account_type == User.ACCOUNT_PROFESSIONAL:
            user.company = self.cleaned_data.get("company")
            user.company_other = self.cleaned_data.get("company_other", "")
            user.role_title = self.cleaned_data.get("role_title", "")
        user.save(update_fields=["display_name", "account_type", "company", "company_other", "role_title"])
        # Unverified until the confirmation email (sent by allauth) is clicked.
        refresh_company_verification(user)
        return user
