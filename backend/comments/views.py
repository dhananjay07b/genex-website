from django.contrib.contenttypes.models import ContentType
from engagement.models import Notification
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import Comment
from .permissions import IsOwnerOrReadOnly
from .serializers import CommentSerializer
from .throttles import CommentCreateThrottle


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    http_method_names = ["get", "post", "patch", "delete"]

    def get_throttles(self):
        if self.request.method == "POST":
            return [CommentCreateThrottle()]
        return super().get_throttles()

    def perform_create(self, serializer):
        comment = serializer.save()
        parent = comment.parent
        if parent and parent.author_id != comment.author_id:
            Notification.objects.create(
                recipient=parent.author,
                kind="comment_reply",
                text=f"{comment.author.display_name or comment.author.username} replied to your comment.",
                content_type=ContentType.objects.get_for_model(comment),
                object_id=comment.pk,
            )

    def get_queryset(self):
        qs = Comment.objects.filter(status="visible").select_related("author")
        model_name = self.request.query_params.get("content_type")
        object_id = self.request.query_params.get("object_id")
        if model_name:
            qs = qs.filter(content_type__model=model_name.lower())
        if object_id:
            qs = qs.filter(object_id=object_id)
        return qs
