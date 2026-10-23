import logging

from allauth.account import app_settings as allauth_account_settings
from allauth.account.models import EmailAddress
from allauth.socialaccount.adapter import get_adapter as get_social_adapter
from allauth.socialaccount.models import SocialAccount
from dj_rest_auth.registration.views import RegisterView, ResendEmailVerificationView, VerifyEmailView
from dj_rest_auth.jwt_auth import JWTCookieAuthentication, set_jwt_cookies
from dj_rest_auth.utils import jwt_encode
from dj_rest_auth.views import LoginView, LogoutView, PasswordChangeView, PasswordResetConfirmView, PasswordResetView
from django.conf import settings
from django.core import signing
from django.contrib.auth import get_user, logout as django_logout
from django.contrib.auth.models import update_last_login
from django.core.exceptions import ImproperlyConfigured
from django.http import Http404
from django.db import IntegrityError, transaction
from django.middleware.csrf import get_token
import requests
from rest_framework import exceptions, serializers, status
from rest_framework.generics import DestroyAPIView, ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .backoffice import is_backoffice_session
from .models import User
from .roles import display_company
from .serializers import UserSerializer, validate_account_type_choice
from .verification import refresh_company_verification, resolve_professional_company
from .throttles import (
    LoginIPThrottle,
    LoginThrottle,
    PasswordChangeThrottle,
    PasswordResetConfirmThrottle,
    PasswordResetThrottle,
)

logger = logging.getLogger(__name__)


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
            # A CMS/admin session doesn't count: that's the back-office sign-in (accounts/backoffice.py).
            session_user = get_user(request._request)
            if session_user.is_authenticated and session_user.is_active and not is_backoffice_session(request._request):
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
        user = self.request.user
        if self.request.method == "GET" and user.account_type == User.ACCOUNT_PROFESSIONAL:
            # Loaded on every page: a badge that fell out of step corrects itself here.
            refresh_company_verification(user)
        return user

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


class GoogleProfileSerializer(serializers.Serializer):
    """What a new Google user adds in the "Finish creating your account" step."""
    account_type = serializers.CharField()
    display_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    company_id = serializers.IntegerField(required=False, allow_null=True)
    company_other = serializers.CharField(max_length=150, required=False, allow_blank=True)
    role_title = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_account_type(self, value):
        return validate_account_type_choice(value)

    def validate(self, data):
        if data["account_type"] == User.ACCOUNT_PROFESSIONAL:
            # Any registered company may be linked; the badge needs a confirmed company email (verification.py).
            data["company"], data["company_other"] = resolve_professional_company(data.get("company_id"), data.get("company_other", ""))
            if not (data.get("role_title") or "").strip():
                raise serializers.ValidationError({"role_title": "Role is required for a Professional profile."})
        else:
            data["company"], data["company_other"], data["role_title"] = None, "", ""
        return data


GOOGLE_SIGNUP_SALT = "accounts.google-signup"
GOOGLE_SIGNUP_MAX_AGE = 30 * 60  # seconds the profile step may take


GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"


def _exchange_google_code(provider, code):
    """
    The ID token for a one-time code from Google's sign-in popup (our own
    "Continue with Google" button). The popup flow's redirect_uri is always
    "postmessage"; the client secret proves the request comes from this site.
    """
    response = requests.post(GOOGLE_TOKEN_URL, data={
        "code": code,
        "client_id": provider.app.client_id,
        "client_secret": provider.app.secret,
        "redirect_uri": "postmessage",
        "grant_type": "authorization_code",
    }, timeout=10)
    if response.status_code != 200:
        raise ValueError(f"code exchange refused ({response.status_code}): {response.text[:200]}")
    id_token = response.json().get("id_token")
    if not id_token:
        raise ValueError("code exchange returned no id_token")
    return id_token


def _verify_google_id_token(provider, id_token):
    """Google's identity claims from an ID token, after checking its signature, issuer, audience and expiry."""
    from allauth.socialaccount.providers.google import views as google_views
    if not id_token:
        raise ValueError("no id_token sent")
    return google_views._verify_and_decode(app=provider.app, credential=id_token)


class GoogleLoginView(APIView):
    """
    Sign in with Google. The frontend sends the ID token from Google Identity
    Services (`{"id_token": ...}`); it's verified against Google's keys and this
    site's client ID. Then:

    - Google account already linked → signed in.
    - Same email as an existing account → linked and signed in, but only when
      Google says it has verified the email (otherwise: use your password).
    - New person → nothing is created yet: the reply asks for a profile
      (`status: "needs_profile"`), the frontend shows the "Finish creating your
      account" step, and sends the token again with `account_type` (plus company
      and role for a Professional). Account types can't change later, so they
      are always chosen, never defaulted to Learner.

    Signs in with the same JWT cookies as the email/password login.
    """
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [LoginIPThrottle]

    def post(self, request):
        try:
            provider = get_social_adapter(request).get_provider(request, "google")
        except ImproperlyConfigured:
            return Response({"detail": "Google sign-in isn't set up yet."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        signup_token = request.data.get("signup_token")
        if signup_token:
            # Second step of a new sign-up: Google's token was verified in the first request,
            # and can't be checked again (allauth refuses a token it has already seen).
            try:
                identity = signing.loads(signup_token, salt=GOOGLE_SIGNUP_SALT, max_age=GOOGLE_SIGNUP_MAX_AGE)
            except signing.BadSignature:  # tampered with, or older than half an hour
                return Response(
                    {"detail": "Your Google sign-in has expired. Please continue with Google again."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            login = provider.sociallogin_from_response(request, identity)
        else:
            try:
                # Our "Continue with Google" button sends a one-time code; an ID token works too.
                code = request.data.get("code")
                id_token = _exchange_google_code(provider, code) if code else request.data.get("id_token", "")
                identity = _verify_google_id_token(provider, id_token)
                login = provider.sociallogin_from_response(request, identity)
            except Exception as exc:  # expired, forged, for another site's client ID, or verification broken
                logger.warning("Google sign-in token refused: %s: %s", type(exc).__name__, exc.__cause__ or exc)
                return Response({"detail": "Google couldn't confirm your sign-in. Please try again."}, status=status.HTTP_400_BAD_REQUEST)

        login.lookup()
        if login.is_existing:
            return self._signed_in(login.user, created=False)

        email = login.user.email
        if not email:
            return Response({"detail": "Your Google account has no email address to sign in with."}, status=status.HTTP_400_BAD_REQUEST)
        google_verified = any(a.verified for a in login.email_addresses if a.email.lower() == email.lower())

        existing = User.objects.filter(email__iexact=email).first()
        if existing is not None:
            if not google_verified:
                return Response(
                    {"detail": "An account already uses this email. Log in with your password, then connect Google in Settings."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            login.connect(request, existing)
            self._confirm_email(existing, email)
            return self._signed_in(existing, created=False)

        # Google's full name, whichever way it arrived (given/family names, or just "name").
        google_name = login.user.display_name or login.account.extra_data.get("name", "")
        if not request.data.get("account_type"):
            # Nothing is created yet. The signed ticket lets the profile step finish the
            # sign-up within half an hour without Google's token being checked twice.
            return Response({
                "status": "needs_profile", "email": email, "name": google_name,
                "signup_token": signing.dumps(identity, salt=GOOGLE_SIGNUP_SALT),
            })

        profile = GoogleProfileSerializer(data=request.data, context={"email": email})
        profile.is_valid(raise_exception=True)
        user = login.user
        data = profile.validated_data
        user.account_type = data["account_type"]
        user.display_name = data.get("display_name", "").strip() or google_name
        user.company, user.company_other, user.role_title = data["company"], data["company_other"], data["role_title"]
        try:
            with transaction.atomic():
                login.save(request)  # the user, the Google link and the email address (verified when Google says so)
        except IntegrityError:  # the same email signed up a moment ago
            return Response({"detail": "An account already uses this email. Please log in."}, status=status.HTTP_400_BAD_REQUEST)
        refresh_company_verification(user)  # a Professional on their company's domain is verified straight away
        return self._signed_in(user, created=True)

    @staticmethod
    def _confirm_email(user, email):
        """Google has verified this address: record it, so company verification can use it."""
        address, _ = EmailAddress.objects.get_or_create(user=user, email__iexact=email, defaults={"email": email, "primary": True})
        if not address.verified:
            address.verified = True
            address.save(update_fields=["verified"])
        refresh_company_verification(user)

    @staticmethod
    def _signed_in(user, created):
        if not user.is_active:
            return Response({"detail": "This account has been deactivated."}, status=status.HTTP_403_FORBIDDEN)
        update_last_login(None, user)
        access, refresh = jwt_encode(user)
        response = Response({"status": "signed_in", "created": created})
        set_jwt_cookies(response, access, refresh)
        return response


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
        # The superuser's CMS/admin session comes along on this request (same API host):
        # signing out of GeLearn must not sign them out of the CMS.
        if not is_backoffice_session(request._request):
            django_logout(request._request)
        return response


class GenexVerifyEmailView(VerifyEmailView):
    """
    Confirms an email from its link and says exactly what happened, so the page
    can tell the person: which address, whether it's the account's sign-in email
    or a work email (often opened by a colleague, not the account holder), and
    whether that made the account a verified company expert.

    Opening a link whose address is already confirmed (a second click, a
    forwarded link) answers "already confirmed" instead of the "invalid link"
    error allauth gives once the address is verified. Tampered or expired links
    still fail (404).
    """
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        key = serializer.validated_data["key"]
        self.kwargs["key"] = key
        try:
            confirmation = self.get_object()
        except Http404:
            address = self._already_confirmed_address(key)
            if address is None:
                raise
            return Response(self._result(address, already_confirmed=True))
        confirmation.confirm(self.request)
        return Response(self._result(confirmation.email_address, already_confirmed=False))

    @staticmethod
    def _already_confirmed_address(key):
        """The address behind a genuine, unexpired key when it's already confirmed; else None."""
        max_age = 60 * 60 * 24 * allauth_account_settings.EMAIL_CONFIRMATION_EXPIRE_DAYS
        try:
            pk = signing.loads(key, salt=allauth_account_settings.SALT, max_age=max_age)
        except signing.BadSignature:  # includes expired
            return None
        return EmailAddress.objects.filter(pk=pk, verified=True).select_related("user").first()

    @staticmethod
    def _result(address, *, already_confirmed):
        user = User.objects.select_related("company").get(pk=address.user_id)  # fresh: confirming may have verified them
        company = display_company(user)
        return {
            "detail": "ok",
            "already_confirmed": already_confirmed,
            "email": address.email,
            "kind": "sign_in" if address.email.lower() == (user.email or "").lower() else "work",
            "account": {"username": user.username, "display_name": user.display_name or user.username},
            # Set when the account now shows as a verified expert of a company.
            "verified_company": company["name"] if company and company["verified"] and user.account_type == User.ACCOUNT_PROFESSIONAL else None,
        }


class GenexResendEmailView(ResendEmailVerificationView):
    """
    dj-rest-auth answers "ok" whether or not it sent anything. A signed-in user
    asking for their own already-confirmed address is told so instead (and their
    verification re-checked); anyone else still gets "ok", so the endpoint
    doesn't reveal which addresses exist.
    """
    throttle_scope = "resend-email"

    def create(self, request, *args, **kwargs):
        user = request.user
        email = str(request.data.get("email", "")).strip()
        if user.is_authenticated and email and EmailAddress.objects.filter(user=user, email__iexact=email, verified=True).exists():
            refresh_company_verification(user)
            return Response({"detail": "already_confirmed"})
        return super().create(request, *args, **kwargs)
