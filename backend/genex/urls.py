from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from wagtail import urls as wagtail_urls
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.api.v2.router import WagtailAPIRouter
from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.documents import urls as wagtaildocs_urls
from wagtail.images.api.v2.views import ImagesAPIViewSet

from accounts.views import (
    GenexLoginView,
    GenexLogoutView,
    GenexPasswordChangeView,
    GenexPasswordResetConfirmView,
    GenexPasswordResetView,
    GenexRegisterView,
    GenexResendEmailView,
    GenexVerifyEmailView,
)
from genex.seo import robots_txt

api_router = WagtailAPIRouter("wagtailapi")
api_router.register_endpoint("pages", PagesAPIViewSet)
api_router.register_endpoint("images", ImagesAPIViewSet)

urlpatterns = [
    path("robots.txt", robots_txt),
    # /admin/ and /cms/ locally, /dj-admin/ and /admin/ in production (settings).
    path(settings.DJANGO_ADMIN_PATH, admin.site.urls),
    path(settings.WAGTAIL_ADMIN_PATH, include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),
    path("api/v2/", api_router.urls),
    path("api/snippets/", include("pages.api")),
    # Overrides (rate limits, full logout) — must precede the dj-rest-auth include they shadow.
    path("api/auth/login/", GenexLoginView.as_view(), name="rest_login"),
    path("api/auth/logout/", GenexLogoutView.as_view(), name="rest_logout"),
    path("api/auth/password/reset/", GenexPasswordResetView.as_view(), name="rest_password_reset"),
    path("api/auth/password/reset/confirm/", GenexPasswordResetConfirmView.as_view(), name="rest_password_reset_confirm"),
    path("api/auth/password/change/", GenexPasswordChangeView.as_view(), name="rest_password_change"),
    path("api/auth/", include("dj_rest_auth.urls")),
    # Throttled overrides — must precede the dj-rest-auth include they shadow.
    path("api/auth/registration/", GenexRegisterView.as_view(), name="rest_register"),
    path("api/auth/registration/resend-email/", GenexResendEmailView.as_view(), name="rest_resend_email"),
    path("api/auth/registration/verify-email/", GenexVerifyEmailView.as_view(), name="rest_verify_email"),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path("api/accounts/", include("accounts.urls")),
    path("api/organizations/", include("organizations.urls")),
    path("api/studio/", include("studio.urls")),
    path("api/learning/", include("learning.urls")),
    path("api/enquiries/", include("enquiries.urls")),
    path("api/comments/", include("comments.urls")),
    path("api/engagement/", include("engagement.urls")),
    path("api/discovery/", include("discovery.urls")),
    path("", include(wagtail_urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
