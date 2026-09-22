from django.core.exceptions import ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from wagtail.images import get_image_model

from .serializers import UserSerializer

Image = get_image_model()


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
        upload = request.FILES.get("file")
        if not upload:
            return Response({"detail": "No file uploaded."}, status=400)

        image = Image(title=upload.name, file=upload, uploaded_by_user=request.user)
        try:
            image.full_clean()
        except ValidationError as exc:
            return Response({"detail": exc.messages}, status=400)
        image.save()

        old_image = getattr(request.user, self.user_field_name)
        setattr(request.user, self.user_field_name, image)
        request.user.save(update_fields=[self.user_field_name])
        if old_image:
            old_image.delete()

        return Response(UserSerializer(request.user).data)


class AvatarUploadView(_UserImageUploadView):
    user_field_name = "avatar"


class CoverPhotoUploadView(_UserImageUploadView):
    user_field_name = "cover_photo"
