from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    FollowersListView,
    FollowingListView,
    FollowToggleView,
    NotificationListView,
    NotificationMarkReadView,
    SavedItemViewSet,
)

router = DefaultRouter()
router.register(r"saved-items", SavedItemViewSet, basename="saveditem")

urlpatterns = router.urls + [
    path("follow/<str:username>/toggle/", FollowToggleView.as_view(), name="follow-toggle"),
    path("users/<str:username>/followers/", FollowersListView.as_view(), name="followers-list"),
    path("users/<str:username>/following/", FollowingListView.as_view(), name="following-list"),
    path("notifications/", NotificationListView.as_view(), name="notifications-list"),
    path("notifications/mark-read/", NotificationMarkReadView.as_view(), name="notifications-mark-read"),
]
