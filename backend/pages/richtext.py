"""
Sanitising rich text that comes from the GeLearn frontend (Company Studio and
Professional blog submissions). Wagtail's own editor whitelister is used, so
what's stored is exactly what the CMS itself allows for that content: scripts,
event handlers, inline styles and javascript: links are stripped. Images are
kept only as references to uploaded Wagtail images (data-embedtype/data-id).
"""
from functools import cache

from bs4 import BeautifulSoup
from wagtail.admin.rich_text.converters.editor_html import EditorHTMLConverter
from wagtail.whitelist import Whitelister, allow_without_attributes, attribute_rule, check_url

from .editor_features import GELEARN_RICH_TEXT_FEATURES



@cache
def _converter():
    """
    Built on first use, not at import: building it makes Wagtail collect the
    registered rich-text features, and this module is imported while
    pages/wagtail_hooks.py (which registers underline, code block…) is still
    loading. Built then, those features would be missing for good.
    """
    return EditorHTMLConverter(features=GELEARN_RICH_TEXT_FEATURES)


def wagtail_block_shape(html):
    """
    The GeLearn editor wraps text in <p> inside list items and quotes
    (<li><p>One</p></li>, <blockquote><p>A</p><p>B</p></blockquote>). Wagtail's
    editor reads that inner <p> as a new paragraph, so opening and saving in
    the CMS emptied the quote or list item and moved its text below it. Give
    Wagtail its own shape instead: <li>One</li>, and one <blockquote> per
    paragraph. Works on editor HTML and on stored rich text alike.
    """
    if not html or ("<li" not in html and "<blockquote" not in html):
        return html or ""
    soup = BeautifulSoup(html, "html.parser")
    for item in soup.find_all("li"):
        paragraphs = item.find_all("p", recursive=False)
        for index, paragraph in enumerate(paragraphs):
            if index:
                paragraph.insert_before(soup.new_tag("br"))
            paragraph.unwrap()
    for quote in soup.find_all("blockquote"):
        paragraphs = quote.find_all("p", recursive=False)
        if not paragraphs:
            continue
        for paragraph in paragraphs:
            single = soup.new_tag("blockquote")
            single.extend(list(paragraph.contents))
            quote.insert_before(single)
        quote.decompose()
    return str(soup)


def sanitize_rich_text(html):
    """Frontend HTML → safe Wagtail database-format rich text."""
    return _converter().to_database_format(wagtail_block_shape(html)).strip()


def rich_text_for_editing(db_html):
    """
    Stored rich text → HTML for the frontend editor. The editor format keeps
    each image's data-embedtype/data-id, so saving again keeps the image.
    """
    return _converter().from_database_format(db_html) if db_html else ""


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
