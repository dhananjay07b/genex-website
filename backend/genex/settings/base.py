import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = "django-insecure-change-this-in-production"

DEBUG = False

ALLOWED_HOSTS = []

INSTALLED_APPS = [
    "accounts",
    "comments",
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
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
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

WAGTAILIMAGES_IMAGE_MODEL = "wagtailimages.Image"
WAGTAILSEARCH_BACKENDS = {
    "default": {"BACKEND": "wagtail.search.backends.database"}
}

WAGTAILAPI_LIMIT_MAX = 200

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "dj_rest_auth.jwt_auth.JWTCookieAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.ScopedRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {
        "registration": "5/hour",
        "dj_rest_auth": "10/hour",
        "dj_rest_auth_login_failed": "5/hour",
        "comment-create": "20/hour",
        "blog-submission": "5/day",
    },
}

# --- Accounts / auth (django-allauth + dj-rest-auth + simplejwt) ----------
ACCOUNT_EMAIL_VERIFICATION = "optional"
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = "username"

REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_COOKIE": "genex-auth",
    "JWT_AUTH_REFRESH_COOKIE": "genex-refresh",
    "JWT_AUTH_HTTPONLY": True,
    "JWT_AUTH_SAMESITE": "Lax",
    "JWT_AUTH_COOKIE_USE_CSRF": True,
    "REGISTER_SERIALIZER": "accounts.serializers.GenexRegisterSerializer",
    "USER_DETAILS_SERIALIZER": "accounts.serializers.UserSerializer",
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
