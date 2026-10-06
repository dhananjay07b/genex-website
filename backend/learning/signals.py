"""
Keep course instructor lists valid when the people on them change. An
instructor must stay a verified, active Professional at the course's company;
when that stops being true (account type, company or verification changes,
or the company is deactivated) they are taken off the course.
"""
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.verification import company_verification_changed

from .models import eligible_instructors


def prune_instructor(user):
    for course in user.taught_courses.select_related("company"):
        if course.company_id is None or not eligible_instructors(course.company).filter(pk=user.pk).exists():
            course.instructors.remove(user)


@receiver(post_save, sender=settings.AUTH_USER_MODEL, dispatch_uid="learning-prune-instructor-on-save")
def _on_user_saved(sender, instance, created, **kwargs):
    if not created:
        prune_instructor(instance)


@receiver(company_verification_changed, dispatch_uid="learning-prune-instructor-on-verification")
def _on_verification_changed(sender, user, **kwargs):
    prune_instructor(user)
