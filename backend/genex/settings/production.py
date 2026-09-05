from .base import *
import os

DEBUG = False

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", SECRET_KEY)

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")

# Lock CORS to the Vercel frontend domain
CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS", "https://genextechnocrats.vercel.app"
).split(",")

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
CORS_ALLOW_CREDENTIALS = True

WAGTAILADMIN_BASE_URL = os.environ.get("WAGTAILADMIN_BASE_URL", "https://genextechnocrats.in")
