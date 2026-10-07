from django.db import migrations
from django.db.models import F, Q


def remove_self_enrolments(apps, schema_editor):
    """Owners and instructors can no longer enroll in their own course: drop any such enrolments and their progress."""
    Enrollment = apps.get_model("learning", "Enrollment")
    ItemProgress = apps.get_model("learning", "ItemProgress")
    own = Enrollment.objects.filter(
        Q(user_id=F("playlist__owner_id"))
        | Q(user__account_type="company", playlist__company_id__isnull=False, user__company_id=F("playlist__company_id"))
        | Q(playlist__instructors=F("user_id"))
    ).distinct()
    for enrolment in own:
        ItemProgress.objects.filter(user_id=enrolment.user_id, item__playlist_id=enrolment.playlist_id).delete()
        enrolment.delete()


class Migration(migrations.Migration):
    dependencies = [("learning", "0008_course_reviews")]
    operations = [migrations.RunPython(remove_self_enrolments, migrations.RunPython.noop)]
