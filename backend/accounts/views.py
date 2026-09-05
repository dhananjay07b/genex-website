from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

from .serializers import UserSerializer


class MeView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class GoogleLoginView(SocialLoginView):
    """
    Frontend sends the Google ID token it received from Google Identity
    Services (`{"id_token": "..."}`); this exchanges it for a session using
    the same JWT-cookie flow as email/password login.
    """
    adapter_class = GoogleOAuth2Adapter
