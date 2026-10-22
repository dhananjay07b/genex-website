"""
Delete a GeLearn user together with everything they made (Django admin → Users →
"Delete user and all their GeLearn content"). Plain "delete" can't do this: courses
and certificates block it, approved posts stay public, and rows that point at a
deleted course or post through a generic link (comments, saved items, views,
notifications, purchases) would be left behind.

Removed: the account and its activity (enrolments, progress, reviews, comments,
saved items, follows, notifications), the courses they own (with everyone's
enrolments and reviews in them), their certificates, their blog and video
submissions and the public copies of approved ones, and the images and documents
only they used. Kept (user decision, 2026-10-22): content published for a company
(GeAcademy, Research, Policies & Tenders, Whitepapers, Podcasts, live sessions),
which just loses its owner login, and certificates other learners earned in their
courses, which stay valid without the course link.
"""
from dataclasses import dataclass, field

from django.apps import apps
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from wagtail.documents import get_document_model
from wagtail.images import get_image_model
from wagtail.models import ReferenceIndex

from learning.models import Certificate, Playlist
from pages.models import BlogPost, VideoItem

# Models that point at content through content_type + object_id. Deleting the content
# doesn't touch these, so they're cleared by hand.
GENERIC_LINK_MODELS = (
    "comments.Comment",
    "engagement.SavedItem",
    "engagement.Notification",
    "discovery.ViewEvent",
    "commerce.Purchase",
)


@dataclass
class PurgePlan:
    user: object
    courses: list = field(default_factory=list)
    posts: list = field(default_factory=list)
    videos: list = field(default_factory=list)
    certificates: int = 0
    blog_submissions: int = 0
    video_submissions: int = 0
    comments: int = 0
    reviews: int = 0
    enrolments: int = 0
    saved_items: int = 0
    others_enrolments: int = 0
    others_comments: int = 0
    files: int = 0

    def summary(self):
        """(label, count) rows for the confirmation page, leaving out the zeros."""
        rows = [
            ("Courses they own", len(self.courses)),
            ("Other learners' enrolments in those courses", self.others_enrolments),
            ("Published blog posts", len(self.posts)),
            ("Published videos", len(self.videos)),
            ("Comments by other people on those courses and posts", self.others_comments),
            ("Blog submissions", self.blog_submissions),
            ("Video submissions", self.video_submissions),
            ("Their certificates", self.certificates),
            ("Their comments", self.comments),
            ("Their course reviews", self.reviews),
            ("Their enrolments", self.enrolments),
            ("Their saved items", self.saved_items),
            ("Images and documents only they used (at most)", self.files),
        ]
        return [(label, count) for label, count in rows if count]


def build_plan(user):
    """What purge_user would remove, without changing anything."""
    courses = list(Playlist.objects.filter(owner=user))
    posts = list(BlogPost.objects.filter(submission_source__author=user))
    videos = list(VideoItem.objects.filter(submission_source__author=user))
    plan = PurgePlan(user=user, courses=courses, posts=posts, videos=videos)
    plan.certificates = Certificate.objects.filter(user=user).count()
    plan.blog_submissions = user.blog_submissions.count()
    plan.video_submissions = user.video_submissions.count()
    plan.comments = user.comments.count()
    plan.reviews = user.course_reviews.count()
    plan.enrolments = user.enrollments.count()
    plan.saved_items = user.saved_items.count()
    plan.others_enrolments = sum(c.enrollments.exclude(user=user).count() for c in courses)
    Comment = apps.get_model("comments.Comment")
    plan.others_comments = sum(
        Comment.objects.filter(content_type=ContentType.objects.get_for_model(model), object_id__in=[o.pk for o in objs])
        .exclude(author=user).count()
        for model, objs in ((Playlist, courses), (BlogPost, posts), (VideoItem, videos)) if objs
    )
    plan.files = len(_candidate_files(user, plan))
    return plan


@transaction.atomic
def purge_user(user):
    """Delete the user and their GeLearn content. Returns the plan that was carried out."""
    if user.is_superuser:
        raise ValueError("Superusers can't be removed this way.")
    plan = build_plan(user)
    candidates = _candidate_files(user, plan)

    for model, objs in ((Playlist, plan.courses), (BlogPost, plan.posts), (VideoItem, plan.videos)):
        if objs:
            _delete_generic_links(model, [o.pk for o in objs])
    for course in plan.courses:
        course.delete()
    for item in plan.posts + plan.videos:
        item.delete()
    Certificate.objects.filter(user=user).delete()
    user.delete()  # everything else of theirs goes with the account

    for obj in candidates:
        if type(obj).objects.filter(pk=obj.pk).exists() and not _in_use(obj):
            obj.delete()  # Wagtail removes the file (and resized copies) once the transaction commits
    return plan


def _delete_generic_links(model, ids):
    content_type = ContentType.objects.get_for_model(model)
    for label in GENERIC_LINK_MODELS:
        apps.get_model(label).objects.filter(content_type=content_type, object_id__in=ids).delete()


def _candidate_files(user, plan):
    """Images and documents the user uploaded or that their content used. Each is
    only deleted if nothing else still uses it afterwards (see _in_use)."""
    Image, Document = get_image_model(), get_document_model()
    image_ids = set(Image.objects.filter(uploaded_by_user=user).values_list("pk", flat=True))
    image_ids |= {pk for pk in (user.avatar_id, user.cover_photo_id) if pk}
    image_ids |= set(user.blog_submissions.exclude(image=None).values_list("image_id", flat=True))
    image_ids |= set(user.video_submissions.exclude(thumbnail=None).values_list("thumbnail_id", flat=True))
    image_ids |= {c.cover_id for c in plan.courses if c.cover_id}
    image_ids |= {p.image_id for p in plan.posts if p.image_id}
    image_ids |= {v.image_id for v in plan.videos if getattr(v, "image_id", None)}
    documents = list(Document.objects.filter(uploaded_by_user=user))
    return list(Image.objects.filter(pk__in=image_ids)) + documents


def _in_use(obj):
    """True if any model field or any StreamField/rich text still points at obj."""
    model = type(obj)
    for related in apps.get_models():
        for f in related._meta.get_fields():
            remote = getattr(f, "remote_field", None)
            if not (getattr(f, "concrete", False) and remote is not None and remote.model is model):
                continue
            if related._meta.label in ("wagtailimages.Rendition",):
                continue  # resized copies belong to the image and go with it
            if related._base_manager.filter(**{f.name: obj}).exists():
                return True
    return ReferenceIndex.get_references_to(obj).exists()
