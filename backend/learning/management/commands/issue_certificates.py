from django.core.management.base import BaseCommand

from learning.certificates import issue_due
from learning.models import Playlist


class Command(BaseCommand):
    help = "Issue certificates to enrolled learners who have already opened every lesson of a live course. Safe to run again."

    def handle(self, *args, **options):
        total = sum(issue_due(course) for course in Playlist.objects.filter(status=Playlist.STATUS_PUBLISHED))
        self.stdout.write(self.style.SUCCESS(f"Issued {total} certificate(s)."))
