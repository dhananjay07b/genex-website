from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import RegisterView, ResendEmailVerificationView, SocialLoginView
from dj_rest_auth.jwt_auth import JWTCookieAuthentication
from dj_rest_auth.views import LoginView, LogoutView, PasswordChangeView, PasswordResetConfirmView, PasswordResetView
from django.conf import settings
from django.contrib.auth import get_user, logout as django_logout
from django.middleware.csrf import get_token
from rest_framework import exceptions, serializers, status
from rest_framework.generics import DestroyAPIView, ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer
from .throttles import (
    LoginIPThrottle,
    LoginThrottle,
    PasswordChangeThrottle,
    PasswordResetConfirmThrottle,
    PasswordResetThrottle,
)


class SessionView(APIView):
    """
    Who is signed in, without ever answering 401. The frontend calls this on
    every page load: /me/ refuses visitors, which made every visitor page log
    two failed requests (the 401 and the refresh attempt it triggered).

    `can_refresh` says whether a still-valid refresh cookie exists, so the
    frontend renews an expired sign-in only when that can actually work. The
    browser can't tell — the cookie is HTTP-only.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        user = None
        try:
            result = JWTCookieAuthentication().authenticate(request)
        except exceptions.APIException:  # expired or invalid sign-in cookie: not signed in
            result = None
        if result:
            user = result[0]
        else:
            # A Django session (registration, email confirmation and Google sign-in start one).
            # Read it directly: with no authentication classes DRF has already set request.user
            # to anonymous. A GET needs no CSRF check.
            session_user = get_user(request._request)
            if session_user.is_authenticated and session_user.is_active:
                user = session_user

        can_refresh = False
        raw_refresh = request.COOKIES.get(settings.REST_AUTH["JWT_AUTH_REFRESH_COOKIE"])
        if user is None and raw_refresh:
            try:
                RefreshToken(raw_refresh)  # checks its signature and expiry
                can_refresh = True
            except TokenError:
                pass

        response = Response({
            "user": UserSerializer(user, context={"request": request}).data if user else None,
            "can_refresh": can_refresh,
        })
        response["Cache-Control"] = "no-store"
        get_token(request)  # visitors need the csrftoken cookie before signing in (see MeView)
        return response


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
    throttle_classes = [LoginIPThrottle]


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


# dj-rest-auth's own views use the disabled "dj_rest_auth" scope; these add attempt limits.
class GenexLoginView(LoginView):
    throttle_classes = [LoginThrottle, LoginIPThrottle]


class GenexPasswordResetView(PasswordResetView):
    throttle_classes = [PasswordResetThrottle]


class GenexPasswordResetConfirmView(PasswordResetConfirmView):
    throttle_classes = [PasswordResetConfirmThrottle]


class GenexPasswordChangeView(PasswordChangeView):
    throttle_classes = [PasswordChangeThrottle]


class GenexLogoutView(LogoutView):
    """
    Signs the visitor out completely. dj-rest-auth only clears the JWT cookies,
    but registration, email confirmation and Google sign-in also start a Django
    session (allauth logs the new user in), and SessionAuthentication keeps
    accepting it — so after a logout a refresh came back signed in.

    No authentication runs here, so an expired access cookie can't turn the
    logout into a 401 and leave the visitor stuck signed in.
    """
    authentication_classes = []

    def logout(self, request):
        response = super().logout(request)
        django_logout(request._request)
        return response


class GenexResendEmailView(ResendEmailVerificationView):
    throttle_scope = "resend-email"
