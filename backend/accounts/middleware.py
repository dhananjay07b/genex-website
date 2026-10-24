from django.conf import settings
from django.contrib.auth.models import AnonymousUser


class BackofficeGuardMiddleware:
    """
    The Wagtail and Django admins (settings.WAGTAIL_ADMIN_PATH / DJANGO_ADMIN_PATH)
    belong to the superuser alone. On those paths a signed-in user who isn't one
    is treated as signed out, so they get the admin's login page. That page
    rejects everyone but a superuser (accounts.apps.superuser_only_admin and the
    0007 is_staff cleanup).

    Why not a 404: the session cookie is shared across *.genextechnocrats.com, so
    a GeLearn sign-in in the same browser used to hide the CMS from the superuser
    behind a page that looked like a broken server. Their GeLearn session itself
    is left alone; only this request ignores it.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.prefixes = ("/" + settings.WAGTAIL_ADMIN_PATH, "/" + settings.DJANGO_ADMIN_PATH)

    def __call__(self, request):
        if request.path.startswith(self.prefixes):
            user = getattr(request, "user", None)
            if user is not None and user.is_authenticated and not user.is_superuser:
                request.user = AnonymousUser()

                async def anonymous():
                    return request.user

                request.auser = anonymous
        return self.get_response(request)
