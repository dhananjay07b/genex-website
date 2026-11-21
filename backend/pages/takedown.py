"""
Taking a Professional's published post or video off GeLearn when they delete
its submission (pages.api UserBlogPostViewSet / UserVideoPostViewSet).
"""
from django.contrib.contenttypes.models import ContentType
from django.db import transaction


@transaction.atomic
def take_down(published):
    """
    Delete a published BlogPost or VideoItem and what only made sense with it:
    saves, comments and view history. Purchases (a money record) and
    notifications (plain text) are kept. Courses list it only as further
    reading (learning.CourseReading), which goes with it; progress and
    certificates never depend on it.
    """
    from comments.models import Comment
    from discovery.models import ViewEvent
    from engagement.models import SavedItem

    refs = {"content_type": ContentType.objects.get_for_model(published), "object_id": published.pk}
    for model in (SavedItem, Comment, ViewEvent):
        model.objects.filter(**refs).delete()
    published.delete()
