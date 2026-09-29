from .base import *

DEBUG = True

ALLOWED_HOSTS = ["*"]

SECRET_KEY = "django-insecure-dev-key-not-for-production"

CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = ["http://localhost:5173"]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Looser auth throttles locally so testing sign-ups doesn't lock you out.
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    "DEFAULT_THROTTLE_RATES": {
        **REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"],
        "registration": "100/hour",
        "resend-email": "30/hour",
    },
}
