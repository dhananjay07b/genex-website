from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import RegisterView, ResendEmailVerificationView, SocialLoginView
from django.middleware.csrf import get_token
from rest_framework import serializers, status
from rest_framework.generics import DestroyAPIView, ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import UserSerializer


class MeView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def finalize_response(self, request, response, *args, **kwargs):
        # This is the endpoint the frontend calls on every page load to decide
        # whether the visitor is logged in — without an explicit no-store, a
        # browser can serve a cached 200 from a previous tab/session instead
        # of re-checking with the server, so a refresh after logging out
        # elsewhere can still show stale "logged in" state.
        response = super().finalize_response(request, response, *args, **kwargs)
        response["Cache-Control"] = "no-store"
        # Nothing in this API-only project ever triggers Django to set the
        # csrftoken cookie (no server-rendered template calls {% csrf_token %}),
        # so JWT_AUTH_COOKIE_USE_CSRF's protection on cookie-authenticated
        # mutations (logout, profile updates, etc.) had no cookie to check
        # against and always 403'd. get_token() marks it to be set on this
        # response, so it's ready before the user's first mutating request.
        get_token(request)
        return response


class GoogleLoginView(SocialLoginView):
    """
    Frontend sends the Google ID token it received from Google Identity
    Services (`{"id_token": "..."}`); this exchanges it for a session using
    the same JWT-cookie flow as email/password login.
    """
    adapter_class = GoogleOAuth2Adapter


class SocialAccountSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()

    class Meta:
        model = SocialAccount
        fields = ["id", "provider", "email", "date_joined"]

    def get_email(self, obj):
        return obj.extra_data.get("email", "")


class SocialAccountListView(ListAPIView):
    """The "Connected Socials" list in account settings."""
    serializer_class = SocialAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SocialAccount.objects.filter(user=self.request.user).order_by("-date_joined")


class SocialAccountDisconnectView(DestroyAPIView):
    """
    Refuses to disconnect a user's only sign-in method — a Google-only
    signup has an unusable password (see SocialAccountAdapter.save_user via
    the base allauth adapter), so removing their last SocialAccount with no
    password set would lock them out of their own account entirely.
    """
    serializer_class = SocialAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SocialAccount.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        remaining = SocialAccount.objects.filter(user=request.user).exclude(pk=instance.pk).count()
        if not request.user.has_usable_password() and remaining == 0:
            return Response(
                {"detail": "Set a password for your account before disconnecting your only sign-in method."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GenexRegisterView(RegisterView):
    """dj-rest-auth hardcodes throttle_scope='dj_rest_auth' (disabled) — use our own scope."""
    throttle_scope = "registration"


class GenexResendEmailView(ResendEmailVerificationView):
    throttle_scope = "resend-email"
