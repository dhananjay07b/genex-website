from comments.models import Comment
from comments.serializers import CommentSerializer
from engagement.models import Notification
from pages.api import PodcastEpisodeSerializer
from pages.models import PodcastEpisode, UserBlogPost, UserVideoPost
from rest_framework.generics import ListAPIView
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


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


def _image_url(obj):
    image = getattr(obj, "image", None) or getattr(obj, "thumbnail", None)
    return image.file.url if image else None


def _notification_entry(notification):
    """Resolves a Notification's generic FK into a real image + link — every
    kind here has a defined real image source, never a decorative placeholder."""
    model_name = notification.content_type.model if notification.content_type else None
    obj = notification.content_object

    if model_name == "blogpost" and obj:
        image_url, link = _image_url(obj), f"/blog/{obj.id}"
    elif model_name == "videoitem" and obj:
        image_url, link = _image_url(obj), f"/videos/{obj.id}"
    elif model_name == "comment" and obj:
        # comment_reply: image the replier's avatar, link to the content they replied on
        replier = obj.author
        image_url = replier.avatar.file.url if replier and replier.avatar else None
        parent_model = obj.content_type.model if obj.content_type else None
        link = f"/blog/{obj.object_id}" if parent_model == "blogpost" else f"/videos/{obj.object_id}" if parent_model == "videoitem" else "/account"
    else:
        image_url, link = None, "/account"

    return {
        "id": f"notification-{notification.id}",
        "type": notification.kind,
        "title": notification.text,
        "description": None,
        "image_url": image_url,
        "timestamp": notification.created_at.isoformat(),
        "link": link,
    }


def _submission_entry(submission, kind, link_prefix, published_id):
    return {
        "id": f"{kind}-{submission.id}",
        "type": kind,
        "title": submission.title,
        "description": f"Submission {submission.get_status_display().lower()}",
        "image_url": _image_url(submission),
        "timestamp": (submission.submitted_at or submission.created_at).isoformat(),
        "link": f"{link_prefix}/{published_id}" if submission.status == "published" and published_id else "/account",
    }


def _comment_entry(comment, avatar_url):
    parent_model = comment.content_type.model if comment.content_type else None
    link = f"/blog/{comment.object_id}" if parent_model == "blogpost" else f"/videos/{comment.object_id}" if parent_model == "videoitem" else "/account"
    return {
        "id": f"comment-{comment.id}",
        "type": "comment",
        "title": comment.body[:80],
        "description": "You left a comment",
        "image_url": avatar_url,
        "timestamp": comment.created_at.isoformat(),
        "link": link,
    }


class ActivityFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        entries = []

        notifications = Notification.objects.filter(recipient=user).select_related("content_type").order_by("-created_at")[:20]
        entries += [_notification_entry(n) for n in notifications]

        blog_subs = UserBlogPost.objects.filter(author=user).order_by("-created_at")[:10]
        entries += [_submission_entry(s, "blog_submission", "/blog", s.published_post_id) for s in blog_subs]

        video_subs = UserVideoPost.objects.filter(author=user).order_by("-created_at")[:10]
        entries += [_submission_entry(s, "video_submission", "/videos", s.published_video_id) for s in video_subs]

        avatar_url = user.avatar.file.url if user.avatar else None
        comments = Comment.objects.filter(author=user).select_related("content_type").order_by("-created_at")[:10]
        entries += [_comment_entry(c, avatar_url) for c in comments]

        entries.sort(key=lambda e: e["timestamp"], reverse=True)
        return Response(entries[:20])
