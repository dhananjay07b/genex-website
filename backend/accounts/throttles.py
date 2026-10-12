"""
Attempt limits for sign-in and password endpoints. Rates live in
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] and accept a multi-unit window such as
"10/15m" (10 attempts per 15 minutes).
"""
import re

from rest_framework.throttling import SimpleRateThrottle

UNIT_SECONDS = {"s": 1, "m": 60, "h": 3600, "d": 86400}


class WindowRateThrottle(SimpleRateThrottle):
    def parse_rate(self, rate):
        if rate is None:
            return (None, None)
        num, period = rate.split("/")
        match = re.fullmatch(r"(\d*)([smhd])\w*", period)
        return (int(num), int(match.group(1) or 1) * UNIT_SECONDS[match.group(2)])


class IPThrottle(WindowRateThrottle):
    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}


class EmailIPThrottle(WindowRateThrottle):
    """Per address and network, so colleagues behind one office IP don't lock each other out."""

    def get_cache_key(self, request, view):
        email = str(request.data.get("email", "")).strip().lower() if hasattr(request.data, "get") else ""
        return self.cache_format % {"scope": self.scope, "ident": f"{self.get_ident(request)}:{email}"}


class LoginThrottle(EmailIPThrottle):
    scope = "login"


class LoginIPThrottle(IPThrottle):
    """A wider cap per network, against one machine trying many addresses."""
    scope = "login-ip"


class PasswordResetThrottle(EmailIPThrottle):
    scope = "password-reset"


class PasswordResetConfirmThrottle(IPThrottle):
    scope = "password-reset-confirm"


class PasswordChangeThrottle(WindowRateThrottle):
    scope = "password-change"

    def get_cache_key(self, request, view):
        ident = request.user.pk if request.user.is_authenticated else self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}
