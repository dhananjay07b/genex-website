from django.db import migrations

COMPANY_PERSONNEL_GROUP = "GeLearn Company Personnel"


def lock_down(apps, schema_editor):
    """
    /admin and /cms are superuser-only from now on. Company staff publish from
    the GeLearn Studio instead, so the Wagtail-access group created in
    pages/0028 is removed and nobody but a superuser keeps is_staff.
    """
    User = apps.get_model("accounts", "User")
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name=COMPANY_PERSONNEL_GROUP).delete()
    User.objects.filter(is_superuser=False, is_staff=True).update(is_staff=False)
    User.objects.filter(is_superuser=True, is_staff=False).update(is_staff=True)


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0006_account_type_company"),
        ("pages", "0034_rename_geacademy_research_policies"),
    ]

    # Not reversible in a meaningful way (previous is_staff flags aren't
    # recorded); reverse is a no-op so the schema can still be rolled back.
    operations = [
        migrations.RunPython(lock_down, migrations.RunPython.noop),
    ]
