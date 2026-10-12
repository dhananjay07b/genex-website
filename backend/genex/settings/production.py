from .base import *
import os

from django.core.exceptions import ImproperlyConfigured

DEBUG = False

# No fallback: a missing or placeholder key would let anyone forge sign-in
# tokens and password-reset links, so the server refuses to start instead.
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "").strip()
if len(SECRET_KEY) < 50 or SECRET_KEY.startswith("django-insecure"):
    raise ImproperlyConfigured(
        "Set DJANGO_SECRET_KEY to a long random value (50+ characters). Generate one with: "
        "python -c \"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())\""
    )

ALLOWED_HOSTS = [host.strip() for host in os.environ.get("ALLOWED_HOSTS", "").split(",") if host.strip()]
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured("Set ALLOWED_HOSTS to the site's domains, comma-separated.")

# Lock CORS to the marketing site and the GeLearn subdomain (the only origin that
# calls the auth/comments/blog-submission endpoints). The .vercel.app entry is
# the temporary pre-launch deployment — drop it once the real domains are live
# on the in-house server, by overriding CORS_ALLOWED_ORIGINS via env var.
CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS",
    "https://genextechnocrats.vercel.app,https://genextechnocrats.com,https://gelearn.genextechnocrats.com",
).split(",")

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
CORS_ALLOW_CREDENTIALS = True

WAGTAILADMIN_BASE_URL = os.environ.get("WAGTAILADMIN_BASE_URL", "https://cms.genextechnocrats.com")

GELEARN_FRONTEND_URL = os.environ.get("GELEARN_FRONTEND_URL", "https://gelearn.genextechnocrats.com")
