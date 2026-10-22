import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Loads backend/.env if present (local dev). In production, real env vars are
# set by the host/process manager instead, so a missing file here is fine —
# load_dotenv() no-ops silently when the file doesn't exist.
load_dotenv(BASE_DIR / ".env")

# SECRET_KEY is set per environment: dev.py has a fixed local key, production.py
# requires DJANGO_SECRET_KEY.

DEBUG = False

ALLOWED_HOSTS = []

INSTALLED_APPS = [
    "accounts",
    "organizations",
    "commerce",
    "studio",
    "learning",
    "enquiries",
    "comments",
    "engagement",
    "discovery",
    "pages",
    "wagtail.contrib.settings",
    "wagtail.contrib.redirects",
    "wagtail.embeds",
    "wagtail.sites",
    "wagtail.users",
    "wagtail.snippets",
    "wagtail.documents",
    "wagtail.images",
    "wagtail.search",
    "wagtail.admin",
    "wagtail",
    "modelcluster",
    "taggit",
    "rest_framework",
    "corsheaders",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
]

SITE_ID = 1

AUTH_USER_MODEL = "accounts.User"

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "accounts.middleware.BackofficeGuardMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "genex.seo.noindex_middleware",
    "wagtail.contrib.redirects.middleware.RedirectMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

ROOT_URLCONF = "genex.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "genex.wsgi.application"

# PostgreSQL, from POSTGRES_* in backend/.env (local) or the server's
# environment. Without POSTGRES_DB, local dev falls back to SQLite; production.py
# refuses to start on SQLite.
if os.environ.get("POSTGRES_DB"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ["POSTGRES_DB"],
            "USER": os.environ.get("POSTGRES_USER", ""),
            "PASSWORD": os.environ.get("POSTGRES_PASSWORD", ""),
            "HOST": os.environ.get("POSTGRES_HOST", "127.0.0.1"),
            "PORT": os.environ.get("POSTGRES_PORT", "5432"),
            # Reuse each worker's connection for a minute instead of reconnecting per
            # request; the health check replaces one that dropped (e.g. after a DB restart).
            "CONN_MAX_AGE": int(os.environ.get("POSTGRES_CONN_MAX_AGE", "60")),
            "CONN_HEALTH_CHECKS": True,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

WAGTAIL_SITE_NAME = "Genex Technocrats"
WAGTAILADMIN_BASE_URL = "http://localhost:8000"

# Where the two back-offices live (no leading slash, trailing slash). Local dev keeps
# Wagtail at /cms/ and Django admin at /admin/; production.py moves them. urls.py,
# the superuser guard (accounts.middleware), robots.txt and the "Admin & CMS" link
# all follow these, so changing them is the whole job.
WAGTAIL_ADMIN_PATH = os.environ.get("WAGTAIL_ADMIN_PATH", "cms/")
DJANGO_ADMIN_PATH = os.environ.get("DJANGO_ADMIN_PATH", "admin/")

WAGTAILIMAGES_IMAGE_MODEL = "wagtailimages.Image"
# SVG allowed so company logos (e.g. Genex's own mark) can be uploaded as vectors.
WAGTAILIMAGES_EXTENSIONS = ["avif", "gif", "jpg", "jpeg", "png", "webp", "svg"]
WAGTAILSEARCH_BACKENDS = {
    "default": {"BACKEND": "wagtail.search.backends.database"}
}

WAGTAILAPI_LIMIT_MAX = 200

# The API serves resized copies of images (pages/images.py). Wagtail remembers
# which copies exist in the "renditions" cache, so a page of 50 cards doesn't
# cost 50 database lookups; its own cache keeps the default one free for other use.
CACHES = {
    "default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"},
    "renditions": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "renditions",
        "TIMEOUT": 60 * 60 * 24 * 7,
        "OPTIONS": {"MAX_ENTRIES": 10_000},
    },
}

# Django's default (1000) is too low for the CMS: the GeLearn index page's two
# section lists post a field per block child (every link picker alone is ~10),
# so saving it raised TooManyFieldsSent. Wagtail's docs recommend 10000.
DATA_UPLOAD_MAX_NUMBER_FIELDS = 10_000

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "dj_rest_auth.jwt_auth.JWTCookieAuthentication",
        # Sign-up/Google sessions only; a CMS/admin session isn't a GeLearn sign-in.
        "accounts.backoffice.FrontendSessionAuthentication",
    ],
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.ScopedRateThrottle"],
    "EXCEPTION_HANDLER": "genex.exceptions.api_exception_handler",
    # How many proxies sit in front of Django. 0 = use the connection's own IP and
    # ignore X-Forwarded-For, which a visitor can fake to dodge every rate limit.
    # Production sets this to the real proxy count (production.py).
    "NUM_PROXIES": int(os.environ.get("NUM_PROXIES", "0")),
    "DEFAULT_THROTTLE_RATES": {
        "registration": "5/hour",
        "resend-email": "3/hour",
        "work-email": "5/hour",
        # None (not removed) — dj-rest-auth's views all hardcode
        # throttle_scope="dj_rest_auth", so the scope must stay registered; our
        # overrides in accounts/views.py set real limits (accounts/throttles.py).
        "dj_rest_auth": None,
        "login": "10/15m",
        "login-ip": "50/15m",
        "password-reset": "10/15m",
        "password-reset-confirm": "10/15m",
        "password-change": "10/15m",
        "comment-create": "20/hour",
        "blog-submission": "5/day",
        "video-submission": "5/day",
        "view-track": "120/hour",
        "search": "60/minute",
        "enquiry": "10/hour",
    },
}

# --- Accounts / auth (django-allauth + dj-rest-auth + simplejwt) ----------
ACCOUNT_EMAIL_VERIFICATION = "optional"
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = "username"
ACCOUNT_ADAPTER = "accounts.adapters.AccountAdapter"
# Subjects are written in full in accounts/templates/account/email/ (no "[example.com]" prefix).
ACCOUNT_EMAIL_SUBJECT_PREFIX = ""
SOCIALACCOUNT_ADAPTER = "accounts.adapters.SocialAccountAdapter"

# Base URL of the GeLearn React app. Emailed links (password reset, email
# verification) point here instead of allauth's server-rendered pages, since
# those flows are handled by dedicated frontend pages. Overridden per
# environment in dev.py / production.py.
GELEARN_FRONTEND_URL = os.environ.get("GELEARN_FRONTEND_URL", "http://localhost:5173")
# The marketing site, for CMS links from GeLearn to a Genex website page (pages/links.py).
MARKETING_FRONTEND_URL = os.environ.get("MARKETING_FRONTEND_URL", "https://genextechnocrats.com")

REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_COOKIE": "genex-auth",
    "JWT_AUTH_REFRESH_COOKIE": "genex-refresh",
    "JWT_AUTH_HTTPONLY": True,
    "JWT_AUTH_SAMESITE": "Lax",
    "JWT_AUTH_COOKIE_USE_CSRF": True,
    "REGISTER_SERIALIZER": "accounts.serializers.GenexRegisterSerializer",
    "USER_DETAILS_SERIALIZER": "accounts.serializers.UserSerializer",
    "PASSWORD_RESET_SERIALIZER": "accounts.serializers.GenexPasswordResetSerializer",
    "SESSION_LOGIN": False,
    "TOKEN_MODEL": None,
}

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APP": {
            "client_id": os.environ.get("GOOGLE_OAUTH_CLIENT_ID", ""),
            "secret": os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET", ""),
            "key": "",
        },
        "SCOPE": ["profile", "email"],
    },
}

# --- Contact form ----------------------------------------------------------
# Website enquiries (Contact page, Careers applications) are saved in Django
# admin and a copy is emailed here.
ENQUIRY_EMAIL = os.environ.get("ENQUIRY_EMAIL", "info@genextechnocrats.com")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "GeLearn by Genex <no-reply@genextechnocrats.com>")

# --- Email delivery (SMTP) ---------------------------------------------------
# Any provider with SMTP works (Hostinger, Zoho, Google Workspace, SES, Brevo…).
# With no EMAIL_HOST, emails are printed to the terminal instead of sent —
# the local default; production.py refuses to start without one.
EMAIL_HOST = os.environ.get("EMAIL_HOST", "").strip()
EMAIL_BACKEND = (
    "django.core.mail.backends.smtp.EmailBackend" if EMAIL_HOST
    else "django.core.mail.backends.console.EmailBackend"
)
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
# Port 465 uses SSL from the start; 587 upgrades with STARTTLS.
EMAIL_USE_SSL = os.environ.get("EMAIL_USE_SSL", str(EMAIL_PORT == 465)).lower() == "true"
EMAIL_USE_TLS = not EMAIL_USE_SSL and os.environ.get("EMAIL_USE_TLS", "true").lower() == "true"
# Emails go out during the request (sign-up, reset, contact form): don't let a
# slow mail server hang them for minutes.
EMAIL_TIMEOUT = int(os.environ.get("EMAIL_TIMEOUT", "10"))
