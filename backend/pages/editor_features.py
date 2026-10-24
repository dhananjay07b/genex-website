"""
The one set of rich-text tools GeLearn content uses, everywhere: the GeLearn
editor (Blog posts, Company Studio) and the Wagtail editor for the same
content. Kept in its own module so models can import it without loading
Wagtail's admin. `underline` and `code-block` are registered in
pages/wagtail_hooks.py; the rest are Wagtail's own.
"""

GELEARN_RICH_TEXT_FEATURES = [
    "h2", "h3", "h4",
    "bold", "italic", "underline", "strikethrough",
    "ol", "ul", "blockquote", "code-block", "hr",
    "link", "image",
]
