from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings


class AccountAdapter(DefaultAccountAdapter):
    """
    Points emailed account links at the GeLearn React app's own pages
    instead of allauth's server-rendered fallback templates, which this
    project doesn't use.
    """

    def get_email_confirmation_url(self, request, emailconfirmation):
        return f"{settings.GELEARN_FRONTEND_URL}/verify-email/{emailconfirmation.key}"
