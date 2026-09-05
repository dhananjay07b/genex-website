from django.urls import path

from .views import GoogleLoginView, MeView

urlpatterns = [
    path("me/", MeView.as_view(), name="account-me"),
    path("google/", GoogleLoginView.as_view(), name="google-login"),
]
