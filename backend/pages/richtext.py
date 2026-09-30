"""
Sanitising rich text that comes from the GeLearn frontend (Company Studio,
later Professional submissions). Wagtail's own editor whitelister is used, so
what's stored is exactly what the CMS itself would have allowed: scripts,
event handlers, inline styles, images and javascript: links are stripped.
"""
from wagtail.admin.rich_text.converters.editor_html import EditorHTMLConverter
from wagtail.rich_text import expand_db_html
from wagtail.whitelist import Whitelister, allow_without_attributes

ALLOWED_FEATURES = ["h2", "h3", "h4", "bold", "italic", "ol", "ul", "link", "hr", "blockquote"]

_converter = EditorHTMLConverter(features=ALLOWED_FEATURES)


def sanitize_rich_text(html):
    """Frontend HTML → safe Wagtail database-format rich text."""
    return _converter.to_database_format(html or "").strip()


def rich_text_for_editing(db_html):
    """Stored rich text → plain HTML for the frontend editor."""
    return expand_db_html(db_html) if db_html else ""


class _SubmissionWhitelister(Whitelister):
    """
    Professional blog submissions come from the full GeLearn editor, which
    also offers underline, strikethrough, code blocks and images by URL — keep
    those (image src and link href are still URL-checked), strip everything
    else: scripts, event handlers, inline styles, iframes, javascript: URLs.
    """
    element_rules = {
        **Whitelister.element_rules,
        "u": allow_without_attributes,
        "s": allow_without_attributes,
        "code": allow_without_attributes,
        "pre": allow_without_attributes,
        "blockquote": allow_without_attributes,
    }


_submission_whitelister = _SubmissionWhitelister()


def sanitize_submission_html(html):
    """Frontend blog-submission HTML → safe HTML (stored and rendered as-is)."""
    return _submission_whitelister.clean(html or "").strip()
