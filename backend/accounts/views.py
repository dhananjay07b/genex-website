from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from django.middleware.csrf import get_token
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

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
