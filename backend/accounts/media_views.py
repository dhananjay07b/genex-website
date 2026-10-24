from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from pages.images import CONTENT, image_payload

from .serializers import UserSerializer
from .uploads import save_uploaded_image


class _UserImageUploadView(APIView):
    """
    Shared base for the avatar/cover-photo upload endpoints: accepts a single
    multipart `file`, wraps it in a wagtailimages.Image, and points the given
    User field at it. Subclasses only need to name the field.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    user_field_name = None

    def post(self, request):
        image = save_uploaded_image(request)
        if isinstance(image, Response):
            return image

        old_image = getattr(request.user, self.user_field_name)
        setattr(request.user, self.user_field_name, image)
        request.user.save(update_fields=[self.user_field_name])
        if old_image:
            old_image.delete()

        return Response(UserSerializer(request.user).data)

    def delete(self, request):
        old_image = getattr(request.user, self.user_field_name)
        if old_image:
            setattr(request.user, self.user_field_name, None)
            request.user.save(update_fields=[self.user_field_name])
            old_image.delete()
        return Response(UserSerializer(request.user).data)


class AvatarUploadView(_UserImageUploadView):
    user_field_name = "avatar"


class CoverPhotoUploadView(_UserImageUploadView):
    user_field_name = "cover_photo"


class EditorImageUploadView(APIView):
    """
    POST a multipart `file` → a new Wagtail image for the GeLearn rich-text
    editor (blog posts, Company Studio). Returns what the editor needs to
    insert it as a Wagtail image reference: {id, url, width, height}. Owned
    by the uploader (uploaded_by_user), so deleting the user removes it.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "editor-image"

    def post(self, request):
        image = save_uploaded_image(request)
        if isinstance(image, Response):
            return image
        served = image_payload(image, CONTENT)  # the resized copy pages show, and its size
        return Response({"id": image.pk, "url": served["url"], "width": served["width"], "height": served["height"]}, status=201)
