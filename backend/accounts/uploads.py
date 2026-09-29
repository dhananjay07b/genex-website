"""
Image/document uploads made from the GeLearn frontend (avatars, submission
images, Company Studio media). Everything goes through here so the same rules
apply everywhere.
"""
import os

from django.core.exceptions import ValidationError
from rest_framework.response import Response
from wagtail.documents import get_document_model
from wagtail.images import get_image_model

from .roles import is_admin

MAX_DOCUMENT_BYTES = 25 * 1024 * 1024
DOCUMENT_EXTENSIONS = {".pdf"}


def _is_svg(upload):
    name = (upload.name or "").lower()
    return name.endswith((".svg", ".svgz")) or (getattr(upload, "content_type", "") or "").startswith("image/svg")


def save_uploaded_image(request):
    """
    Returns a saved wagtailimages Image, or a 400 Response to return as-is.
    SVG is allowed only for Admin (company logos): an SVG can carry script,
    and uploads are served from the backend's own origin.
    """
    upload = request.FILES.get("file")
    if not upload:
        return Response({"detail": "No file uploaded."}, status=400)
    if _is_svg(upload) and not is_admin(request.user):
        return Response({"detail": "SVG images aren't accepted. Upload a PNG, JPG or WebP instead."}, status=400)

    image = get_image_model()(title=upload.name, file=upload, uploaded_by_user=request.user)
    try:
        image.full_clean()
    except ValidationError as exc:
        return Response({"detail": exc.messages}, status=400)
    image.save()
    return image


def save_uploaded_document(request):
    """Returns a saved wagtaildocs Document (PDF only, ≤25 MB), or a 400 Response."""
    upload = request.FILES.get("file")
    if not upload:
        return Response({"detail": "No file uploaded."}, status=400)
    if os.path.splitext(upload.name or "")[1].lower() not in DOCUMENT_EXTENSIONS:
        return Response({"detail": "Upload a PDF document."}, status=400)
    if upload.size > MAX_DOCUMENT_BYTES:
        return Response({"detail": "Documents must be 25 MB or smaller."}, status=400)

    document = get_document_model()(title=upload.name, file=upload, uploaded_by_user=request.user)
    try:
        document.full_clean()
    except ValidationError as exc:
        return Response({"detail": exc.messages}, status=400)
    document.save()
    return document
