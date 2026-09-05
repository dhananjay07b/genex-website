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

api_router = WagtailAPIRouter("wagtailapi")
api_router.register_endpoint("pages", PagesAPIViewSet)
api_router.register_endpoint("images", ImagesAPIViewSet)

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("cms/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),
    path("api/v2/", api_router.urls),
    path("api/snippets/", include("pages.api")),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path("api/accounts/", include("accounts.urls")),
    path("api/comments/", include("comments.urls")),
    path("", include(wagtail_urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
