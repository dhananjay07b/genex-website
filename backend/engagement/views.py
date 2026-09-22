from accounts.models import User
from django.contrib.contenttypes.models import ContentType
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Follow, Notification, SavedItem
from .serializers import FollowerSerializer, FollowingSerializer, NotificationSerializer, SavedItemSerializer


class SavedItemViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet,
):
    serializer_class = SavedItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedItem.objects.filter(user=self.request.user).select_related("content_type")

    def perform_create(self, serializer):
        try:
            with transaction.atomic():
                serializer.save()
        except IntegrityError:
            # Already saved (unique_together on user/content_type/object_id) — not an error,
            # a double-click/retry should behave the same as the first successful save.
            existing = self.get_queryset().get(
                content_type=serializer.validated_data["content_type"],
                object_id=serializer.validated_data["object_id"],
            )
            serializer.instance = existing

    @action(detail=False, methods=["post"])
    def toggle(self, request):
        model_name = request.data.get("content_type")
        object_id = request.data.get("object_id")
        if not model_name or not object_id:
            return Response({"detail": "content_type and object_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        content_type = get_object_or_404(ContentType, model=str(model_name).lower())
        existing = self.get_queryset().filter(content_type=content_type, object_id=object_id).first()

        if existing:
            existing.delete()
            return Response({"saved": False}, status=status.HTTP_200_OK)

        item = SavedItem.objects.create(user=request.user, content_type=content_type, object_id=object_id)
        return Response({"saved": True, "item": self.get_serializer(item).data}, status=status.HTTP_201_CREATED)


class EngagementPagination(LimitOffsetPagination):
    default_limit = 50
    max_limit = 200


class FollowToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        target = get_object_or_404(User, username=username)
        if target.id == request.user.id:
            return Response({"detail": "You can't follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        existing = Follow.objects.filter(follower=request.user, followed=target).first()
        if existing:
            existing.delete()
            return Response({"following": False})

        try:
            with transaction.atomic():
                Follow.objects.create(follower=request.user, followed=target)
        except IntegrityError:
            pass  # already following — treat as success, matching SavedItem's toggle behavior
        return Response({"following": True}, status=status.HTTP_201_CREATED)


class FollowersListView(ListAPIView):
    serializer_class = FollowerSerializer
    pagination_class = EngagementPagination
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        target = get_object_or_404(User, username=self.kwargs["username"])
        return Follow.objects.filter(followed=target).select_related("follower")


class FollowingListView(ListAPIView):
    serializer_class = FollowingSerializer
    pagination_class = EngagementPagination
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        target = get_object_or_404(User, username=self.kwargs["username"])
        return Follow.objects.filter(follower=target).select_related("followed")


class NotificationListView(ListAPIView):
    serializer_class = NotificationSerializer
    pagination_class = EngagementPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).select_related("content_type")


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ids = request.data.get("ids")
        qs = Notification.objects.filter(recipient=request.user)
        if ids is not None:
            qs = qs.filter(id__in=ids)
        updated = qs.update(is_read=True)
        return Response({"marked_read": updated})
