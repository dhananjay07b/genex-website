"""
Storage for files that must never be public, such as job applicants' CVs.

MEDIA_ROOT is served by Nginx at /media/ to anyone with the link, so these
live under PRIVATE_MEDIA_ROOT instead, which nothing serves. They're read only
through views that check who is asking (the Django admin's CV download).
"""
import os

from django.conf import settings
from django.core.files.storage import FileSystemStorage


class PrivateStorage(FileSystemStorage):
    def __init__(self):
        super().__init__()

    # Read from settings on use (not fixed at import), so tests can point it elsewhere.
    @property
    def base_location(self):
        return str(settings.PRIVATE_MEDIA_ROOT)

    @property
    def location(self):
        return os.path.abspath(self.base_location)

    def url(self, name):
        raise ValueError("Private files have no public URL; serve them through a view that checks access.")


def private_storage():
    return PrivateStorage()
