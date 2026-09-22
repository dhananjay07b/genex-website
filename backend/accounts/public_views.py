"""
Public-facing profile views — no auth required, no private data (email,
drafts, comments, saved items). Kept separate from activity_views.py, which
is the private "my stuff" surface.
"""
from django.shortcuts import get_object_or_404
from pages.api import BlogPostSerializer, GenexPagination, PodcastEpisodeSerializer, VideoItemSerializer
from pages.models import BlogPost, PodcastEpisode, VideoItem
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from .models import User
from .serializers import PublicProfileSerializer


class PublicProfileView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = PublicProfileSerializer
    permission_classes = [AllowAny]
    lookup_field = "username"


class PublicUserBlogPostsView(ListAPIView):
    serializer_class = BlogPostSerializer
    pagination_class = GenexPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs["username"])
        return BlogPost.objects.filter(
            submission_source__author=user, submission_source__status="published",
        ).order_by("-date")


class PublicUserVideosView(ListAPIView):
    serializer_class = VideoItemSerializer
    pagination_class = GenexPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs["username"])
        return VideoItem.objects.filter(
            submission_source__author=user, submission_source__status="published",
        ).order_by("-date")


class PublicUserPodcastAppearancesView(ListAPIView):
    serializer_class = PodcastEpisodeSerializer
    pagination_class = GenexPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs["username"])
        return PodcastEpisode.objects.filter(guest_user=user).order_by("-date")
