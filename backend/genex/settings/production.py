from .base import *
import os

DEBUG = False

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", SECRET_KEY)

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")

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
