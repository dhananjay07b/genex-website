import logging

from django.conf import settings
from django.core.mail import send_mail
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .serializers import EnquirySerializer

logger = logging.getLogger(__name__)


def _email_text(enquiry):
    lines = [f"From: {enquiry.name} <{enquiry.email}>"]
    if enquiry.company:
        lines.append(f"Company: {enquiry.company}")
    lines += [f"Phone: {enquiry.phone}", f"Type: {enquiry.project_type}"]
    if enquiry.subject:
        lines.append(f"About: {enquiry.subject}")
    return "\n".join(lines) + f"\n\n{enquiry.message}\n\n(Saved in Django admin → Enquiries.)"


class EnquiryCreateView(APIView):
    """
    POST from the Contact form. The enquiry is saved before the email is
    attempted, so it reaches Django admin even when email fails.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # a public form: no session or CSRF involved
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "enquiry"

    def post(self, request):
        serializer = EnquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.pop("website", ""):
            return Response({"received": True}, status=status.HTTP_201_CREATED)  # a bot: pretend it worked, keep nothing
        enquiry = serializer.save()
        try:
            send_mail(
                subject=f"Website enquiry: {enquiry.subject or enquiry.project_type} ({enquiry.company or enquiry.name})",
                message=_email_text(enquiry),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ENQUIRY_EMAIL],
                fail_silently=False,
            )
            enquiry.email_sent = True
            enquiry.save(update_fields=["email_sent"])
        except Exception:  # email trouble must never lose the enquiry or fail the visitor
            logger.exception("Enquiry %s saved but the email copy failed", enquiry.pk)
        return Response({"received": True}, status=status.HTTP_201_CREATED)
