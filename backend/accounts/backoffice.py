"""
The back-office sign-in (Wagtail CMS and Django admin) is kept apart from GeLearn's.

Both live on the API host, so the browser sends the superuser's CMS session cookie
with GeLearn's API requests too. Without this, signing out of GeLearn also signed
them out of the CMS, and a CMS sign-in silently signed them in on GeLearn. GeLearn
still uses the sessions that sign-up and Google sign-in start (see SessionView).
"""
from django.conf import settings
from rest_framework.authentication import SessionAuthentication

SESSION_KEY = "genex_backoffice"


def is_backoffice_path(path):
    return path.startswith(("/" + settings.WAGTAIL_ADMIN_PATH, "/" + settings.DJANGO_ADMIN_PATH))


def mark_backoffice_login(sender, request, user, **kwargs):
    """user_logged_in receiver: a sign-in through a CMS or admin login page is a back-office session."""
    if request is not None and is_backoffice_path(request.path):
        request.session[SESSION_KEY] = True


def is_backoffice_session(request):
    """`request` is Django's HttpRequest (in a DRF view: request._request)."""
    session = getattr(request, "session", None)
    return bool(session and session.get(SESSION_KEY))


class FrontendSessionAuthentication(SessionAuthentication):
    """DRF session sign-in for GeLearn: sign-up and Google sign-in sessions count; a CMS/admin one doesn't."""

    def authenticate(self, request):
        if is_backoffice_session(request._request):
            return None
        return super().authenticate(request)
