from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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
