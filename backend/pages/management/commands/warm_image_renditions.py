from django.core.management.base import BaseCommand
from wagtail.images.models import Image

from pages.images import AVATAR, CONTENT, HERO, LOGO, image_url


class Command(BaseCommand):
    help = (
        "Make the resized copies the API serves for every uploaded image, so the first visitors after a "
        "deploy don't wait for them to be made. Run after migrate. Safe to run again: existing copies are kept."
    )

    def handle(self, *args, **options):
        images = Image.objects.all()
        for image in images.iterator():
            for size in (AVATAR, LOGO, CONTENT, HERO):
                image_url(image, size)
        self.stdout.write(self.style.SUCCESS(f"Resized copies ready for {images.count()} image(s)."))
