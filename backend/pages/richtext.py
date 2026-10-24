"""
Sanitising rich text that comes from the GeLearn frontend (Company Studio and
Professional blog submissions). Wagtail's own editor whitelister is used, so
what's stored is exactly what the CMS itself allows for that content: scripts,
event handlers, inline styles and javascript: links are stripped. Images are
kept only as references to uploaded Wagtail images (data-embedtype/data-id).
"""
from wagtail.admin.rich_text.converters.editor_html import EditorHTMLConverter
from wagtail.whitelist import Whitelister, allow_without_attributes, attribute_rule, check_url

from .editor_features import GELEARN_RICH_TEXT_FEATURES

_converter = EditorHTMLConverter(features=GELEARN_RICH_TEXT_FEATURES)


def sanitize_rich_text(html):
    """Frontend HTML → safe Wagtail database-format rich text."""
    return _converter.to_database_format(html or "").strip()


def rich_text_for_editing(db_html):
    """
    Stored rich text → HTML for the frontend editor. The editor format keeps
    each image's data-embedtype/data-id, so saving again keeps the image.
    """
    return _converter.from_database_format(db_html) if db_html else ""


class _SubmissionWhitelister(Whitelister):
    """
    Professional blog submissions are stored as HTML (the author's preview
    renders it as-is) and converted to Wagtail rich text when published. Keep
    the GeLearn editor's tools, and images with the data-* attributes that say
    which uploaded image they are (src and href are still URL-checked); strip
    everything else: scripts, event handlers, inline styles, iframes,
    javascript: URLs.
    """
    element_rules = {
        **Whitelister.element_rules,
        "img": attribute_rule({
            "src": check_url, "alt": True, "width": True, "height": True,
            "data-embedtype": True, "data-id": True, "data-format": True, "data-alt": True,
        }),
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
