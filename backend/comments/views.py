from django.contrib.contenttypes.models import ContentType
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

    def get_queryset(self):
        qs = Comment.objects.filter(status="visible").select_related("author")
        model_name = self.request.query_params.get("content_type")
        object_id = self.request.query_params.get("object_id")
        if model_name:
            qs = qs.filter(content_type__model=model_name.lower())
        if object_id:
            qs = qs.filter(object_id=object_id)
        return qs
