import math

from rest_framework.exceptions import Throttled
from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    """DRF's handler, with a plain-language message when a rate limit is hit."""
    if isinstance(exc, Throttled):
        minutes = max(1, math.ceil((exc.wait or 60) / 60))
        when = "in a minute" if minutes == 1 else f"in {minutes} minutes"
        exc.detail = f"Too many attempts. Please try again {when}."
    return exception_handler(exc, context)
