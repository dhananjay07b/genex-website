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

if DATABASES["default"]["ENGINE"] != "django.db.backends.postgresql":
    raise ImproperlyConfigured("Set POSTGRES_DB, POSTGRES_USER and POSTGRES_PASSWORD: production runs on PostgreSQL, not SQLite.")

ALLOWED_HOSTS = [host.strip() for host in os.environ.get("ALLOWED_HOSTS", "").split(",") if host.strip()]
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured("Set ALLOWED_HOSTS to the site's domains, comma-separated.")

# Reverse proxies in front of Django. Each must send X-Forwarded-For and
# X-Forwarded-Proto (deploy/nginx/sites-available/cms.genextechnocrats.com.conf does).
# 1 is our setup (Nginx on the server); 2 if an AWS load balancer is added in front
# of it; 0 if Django faces the internet directly. Visitor IPs for rate limits come from this.
NUM_PROXIES = int(os.environ.get("NUM_PROXIES", "1"))
REST_FRAMEWORK = {**REST_FRAMEWORK, "NUM_PROXIES": NUM_PROXIES}

# --- HTTPS -----------------------------------------------------------------
# The proxy handles TLS and tells Django the original scheme; without this,
# Django would treat every request as plain HTTP and redirect forever. With no
# proxy the header isn't trusted, since a visitor could fake it.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https") if NUM_PROXIES else None
SECURE_SSL_REDIRECT = os.environ.get("SECURE_SSL_REDIRECT", "true").lower() == "true"
# Browsers remember to use HTTPS only. Subdomains and preload stay off until
# every *.genextechnocrats.com host is confirmed to serve HTTPS — they're hard to undo.
SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", "31536000"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = os.environ.get("SECURE_HSTS_INCLUDE_SUBDOMAINS", "false").lower() == "true"

# --- Cookies ---------------------------------------------------------------
# Sent over HTTPS only. The csrftoken cookie stays readable by JavaScript: the
# frontend copies it into the X-CSRFToken header (lib/api/client.ts).
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
# The API and the frontends live on different subdomains, so the frontend can
# only read csrftoken if it's shared across them: set COOKIE_DOMAIN to
# ".genextechnocrats.com" (leading dot) once the real domains are live.
COOKIE_DOMAIN = os.environ.get("COOKIE_DOMAIN") or None
SESSION_COOKIE_DOMAIN = COOKIE_DOMAIN
CSRF_COOKIE_DOMAIN = COOKIE_DOMAIN
REST_AUTH = {**REST_AUTH, "JWT_AUTH_SECURE": True, "JWT_AUTH_COOKIE_DOMAIN": COOKIE_DOMAIN}

# --- Email -----------------------------------------------------------------
# SMTP settings come from base.py. Without a host every email (password resets,
# verification, enquiry copies) would be lost, so the server refuses to start.
if not EMAIL_HOST:
    raise ImproperlyConfigured("Set EMAIL_HOST (and EMAIL_HOST_USER / EMAIL_HOST_PASSWORD) to your email provider's SMTP details.")
SERVER_EMAIL = DEFAULT_FROM_EMAIL

# Lock CORS to the two frontend sites. No default: the hostnames differ between
# the test sites (test., test-gelearn.) and the live ones, and a wrong guess only
# shows up later as confusing CORS errors in the browser.
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",") if origin.strip()]
if not CORS_ALLOWED_ORIGINS:
    raise ImproperlyConfigured(
        "Set CORS_ALLOWED_ORIGINS to the marketing and GeLearn site addresses, comma-separated "
        "(e.g. https://test.genextechnocrats.com,https://test-gelearn.genextechnocrats.com)."
    )

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
CORS_ALLOW_CREDENTIALS = True

WAGTAILADMIN_BASE_URL = os.environ.get("WAGTAILADMIN_BASE_URL", "https://cms.genextechnocrats.com")

# Back-office paths on cms.genextechnocrats.com (local dev keeps /cms/ and /admin/, see base.py).
WAGTAIL_ADMIN_PATH = os.environ.get("WAGTAIL_ADMIN_PATH", "admin/")
DJANGO_ADMIN_PATH = os.environ.get("DJANGO_ADMIN_PATH", "dj-admin/")

# Where emailed links point. MARKETING_FRONTEND_URL comes from env in base.py.
GELEARN_FRONTEND_URL = os.environ.get("GELEARN_FRONTEND_URL", "https://gelearn.genextechnocrats.com")
