from django.urls import path

from .activity_views import ActivityFeedView, MyCommentsView, MyPodcastAppearancesView
from .media_views import AvatarUploadView, CoverPhotoUploadView
from .public_views import (
    PublicProfileView,
    PublicUserBlogPostsView,
    PublicUserPodcastAppearancesView,
    PublicUserVideosView,
)
from .views import GoogleLoginView, MeView

urlpatterns = [
    path("me/", MeView.as_view(), name="account-me"),
    path("me/comments/", MyCommentsView.as_view(), name="my-comments"),
    path("me/activity/", ActivityFeedView.as_view(), name="my-activity"),
    path("me/podcast-appearances/", MyPodcastAppearancesView.as_view(), name="my-podcast-appearances"),
    path("me/avatar/", AvatarUploadView.as_view(), name="my-avatar"),
    path("me/cover-photo/", CoverPhotoUploadView.as_view(), name="my-cover-photo"),
    path("google/", GoogleLoginView.as_view(), name="google-login"),
    path("users/<str:username>/", PublicProfileView.as_view(), name="public-profile"),
    path("users/<str:username>/blog-posts/", PublicUserBlogPostsView.as_view(), name="public-user-blog-posts"),
    path("users/<str:username>/videos/", PublicUserVideosView.as_view(), name="public-user-videos"),
    path("users/<str:username>/podcast-appearances/", PublicUserPodcastAppearancesView.as_view(), name="public-user-podcast-appearances"),
]
