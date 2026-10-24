"""
CMS edits to a live post or video flow back to the author's submission.

A Professional's blog post or video lives twice: the submission they edit from
their dashboard (UserBlogPost / UserVideoPost) and the live copy approval
creates (BlogPost / VideoItem). Approval copies submission → live. When an
admin then edits the live copy in Wagtail, this copies it back, so the
dashboard's "Edit" starts from what readers see, not from the author's
original draft.

Only while the submission is "published" (no edits of the author's own
waiting): a pending, draft or rejected submission holds changes that would be
overwritten, so it's left alone and the caller says so.
"""
from django.utils.html import escape

from .richtext import rich_text_for_editing

ACCESS_FIELDS = ("access", "price", "currency")


def _blog_body_html(post):
    """The live post's body as GeLearn editor HTML (images keep their Wagtail ids)."""
    parts = []
    for block in post.body:
        if block.block_type == "rich_text":
            parts.append(rich_text_for_editing(block.value.source))
        elif block.block_type == "image" and block.value.get("image"):
            # Older posts' URL images (a StructBlock of URL + caption).
            parts.append(f'<img src="{escape(block.value["image"])}" alt="{escape(block.value.get("caption") or "")}">')
    return "".join(parts)


def sync_blog_post_to_submission(post):
    """Returns "synced", "skipped" (author has unpublished edits) or None (no submission)."""
    submission = getattr(post, "submission_source", None)
    if submission is None:
        return None
    if submission.status != "published":
        return "skipped"
    submission.title, submission.excerpt, submission.image = post.title, post.excerpt, post.image
    submission.body = _blog_body_html(post)
    for field in ACCESS_FIELDS:
        setattr(submission, field, getattr(post, field))
    submission.save(update_fields=["title", "excerpt", "image", "body", *ACCESS_FIELDS])
    submission.topics.set(post.topics.all())
    return "synced"


def sync_video_to_submission(video):
    """Returns "synced", "skipped" (author has unpublished edits) or None (no submission)."""
    submission = getattr(video, "submission_source", None)
    if submission is None:
        return None
    if submission.status != "published":
        return "skipped"
    submission.title, submission.excerpt = video.title, video.excerpt
    submission.duration, submission.video_url, submission.thumbnail = video.duration, video.video_url, video.image
    for field in ACCESS_FIELDS:
        setattr(submission, field, getattr(video, field))
    submission.save(update_fields=["title", "excerpt", "duration", "video_url", "thumbnail", *ACCESS_FIELDS])
    submission.topics.set(video.topics.all())
    return "synced"
