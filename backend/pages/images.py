"""
Resized copies (Wagtail renditions) of uploaded images for API responses.

Editors and members upload photos straight from cameras and design tools
(often 2–5 MB PNGs); sending those originals to a 300 px card made pages slow.
Every image URL the API returns goes through image_url() with the size its
largest use needs. A copy is made the first time it's asked for, then reused.
"""
import logging

from wagtail.images.models import SourceImageIOError

logger = logging.getLogger(__name__)

# Sizes by role, about twice the largest display size (sharp on high-DPI screens).
AVATAR = "fill-256x256"   # round profile pictures and testimonial photos (square crop)
LOGO = "max-480x480"      # company and partner logos
CONTENT = "max-1200x1200" # cards, course covers and content detail images
HERO = "max-2000x2000"    # full-width banners, slideshows and profile cover photos

WEBP = "format-webp|webpquality-80"


def _resized(image, size):
    """The rendition to serve, or the original image itself when it shouldn't or can't be resized."""
    # Vectors are already small and sharp at any size; GIFs may be animated,
    # which resizing would flatten to one frame.
    if image.is_svg() or image.file.name.lower().endswith(".gif"):
        return image
    try:
        return image.get_rendition(f"{size}|{WEBP}")
    except (SourceImageIOError, OSError):
        # The original file is missing or unreadable: return its URL as before
        # instead of failing the whole response over one picture.
        logger.warning("Could not resize image %s (%s)", image.pk, image.file.name, exc_info=True)
        return image


def image_url(image, size=CONTENT):
    """URL of `image` resized to `size` (one of the constants above), or None for no image."""
    return _resized(image, size).file.url if image else None


def image_payload(image, size=CONTENT):
    """{url, width, height, alt} for StreamField image fields; width/height are the served file's."""
    served = _resized(image, size)
    return {"url": served.file.url, "width": served.width, "height": served.height, "alt": image.title}
