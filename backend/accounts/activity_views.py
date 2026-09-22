from comments.models import Comment
from comments.serializers import CommentSerializer
from pages.api import PodcastEpisodeSerializer
from pages.models import PodcastEpisode
from rest_framework.generics import ListAPIView
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import IsAuthenticated


class AccountsPagination(LimitOffsetPagination):
    default_limit = 50
    max_limit = 200


class MyCommentsView(ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AccountsPagination

    def get_queryset(self):
        return Comment.objects.filter(author=self.request.user).select_related("content_type").order_by("-created_at")


class MyPodcastAppearancesView(ListAPIView):
    serializer_class = PodcastEpisodeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AccountsPagination

    def get_queryset(self):
        return PodcastEpisode.objects.filter(guest_user=self.request.user).order_by("-date")
