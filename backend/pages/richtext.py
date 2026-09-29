"""
Sanitising rich text that comes from the GeLearn frontend (Company Studio,
later Professional submissions). Wagtail's own editor whitelister is used, so
what's stored is exactly what the CMS itself would have allowed: scripts,
event handlers, inline styles, images and javascript: links are stripped.
"""
from wagtail.admin.rich_text.converters.editor_html import EditorHTMLConverter
from wagtail.rich_text import expand_db_html

ALLOWED_FEATURES = ["h2", "h3", "h4", "bold", "italic", "ol", "ul", "link", "hr", "blockquote"]

_converter = EditorHTMLConverter(features=ALLOWED_FEATURES)


def sanitize_rich_text(html):
    """Frontend HTML → safe Wagtail database-format rich text."""
    return _converter.to_database_format(html or "").strip()


def rich_text_for_editing(db_html):
    """Stored rich text → plain HTML for the frontend editor."""
    return expand_db_html(db_html) if db_html else ""
