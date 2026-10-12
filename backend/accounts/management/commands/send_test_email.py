from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Send one test email with the current email settings, to check the provider is set up."

    def add_arguments(self, parser):
        parser.add_argument("to", help="Address to send the test email to")

    def handle(self, *args, **options):
        backend = settings.EMAIL_BACKEND.rsplit(".", 2)[-2]
        self.stdout.write(f"Backend: {backend}  host: {getattr(settings, 'EMAIL_HOST', '-')}:{getattr(settings, 'EMAIL_PORT', '-')}  from: {settings.DEFAULT_FROM_EMAIL}")
        try:
            send_mail(
                "GeLearn test email",
                "This is a test from the Genex website backend. If you can read it, email delivery works.",
                settings.DEFAULT_FROM_EMAIL,
                [options["to"]],
            )
        except Exception as exc:
            raise CommandError(f"Sending failed: {exc.__class__.__name__}: {exc}") from exc
        self.stdout.write(self.style.SUCCESS(f"Sent to {options['to']}. Check the inbox (and spam folder)."))
