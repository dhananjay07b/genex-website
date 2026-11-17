"""
GeLearn's JWT cookie sign-in, tolerant of sign-ins that can never work again.

simplejwt refuses the whole request when the cookie's user was deleted, has been
deactivated, or changed their password since. The browser keeps sending that
cookie, so every API call failed, public pages and the login form included, until
the cookie expired. Such a sign-in now counts as no sign-in at all: public pages
load, the login form works, and SessionView clears the cookies.
"""
from dj_rest_auth.jwt_auth import JWTCookieAuthentication
from rest_framework.exceptions import AuthenticationFailed

# simplejwt's codes for a valid token whose user can no longer be signed in.
ENDED_SIGN_IN_CODES = {"user_not_found", "user_inactive", "password_changed"}


class GenexJWTCookieAuthentication(JWTCookieAuthentication):
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except AuthenticationFailed as exc:
            # simplejwt's errors carry {"detail": message, "code": code}.
            if isinstance(exc.detail, dict) and exc.detail.get("code") in ENDED_SIGN_IN_CODES:
                return None
            raise  # expired or invalid: the frontend renews it with the refresh cookie
