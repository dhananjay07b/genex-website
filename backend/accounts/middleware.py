from django.conf import settings
from django.http import Http404


class BackofficeGuardMiddleware:
    """
    /admin and /cms belong to the superuser alone. A signed-in user who isn't
    one gets a 404 (not 403) so the back-office doesn't advertise itself.
    Anonymous requests pass through so the superuser can still reach the
    login pages — and those login forms reject everyone else (see
    accounts.apps.superuser_only_admin and the 0007 is_staff cleanup).
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.prefixes = tuple(getattr(settings, "BACKOFFICE_PATH_PREFIXES", ("/admin/", "/cms/")))

    def __call__(self, request):
        if request.path.startswith(self.prefixes):
            user = getattr(request, "user", None)
            if user is not None and user.is_authenticated and not user.is_superuser:
                raise Http404
        return self.get_response(request)
