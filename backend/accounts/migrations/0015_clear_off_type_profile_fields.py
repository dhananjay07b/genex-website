from django.db import migrations


def clear(apps, schema_editor):
    """Experience and expertise are Professional-only, a career goal Learner-only (accounts.serializers.UserSerializer)."""
    User = apps.get_model("accounts", "User")
    others = User.objects.exclude(account_type="professional")
    others.exclude(years_experience=None).update(years_experience=None)
    User.expertise.through.objects.filter(user__in=others).delete()
    User.objects.exclude(account_type="learner").exclude(career_goal=None).update(career_goal=None)


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0014_name_the_site_gelearn"),
    ]

    operations = [
        migrations.RunPython(clear, migrations.RunPython.noop),
    ]
