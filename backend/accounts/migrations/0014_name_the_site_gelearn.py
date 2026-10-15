from django.db import migrations


def name_the_site(apps, schema_editor):
    """allauth reads the Sites framework's name; it was still Django's default "example.com"."""
    Site = apps.get_model("sites", "Site")
    Site.objects.update_or_create(id=1, defaults={"domain": "gelearn.genextechnocrats.com", "name": "GeLearn by Genex"})


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0013_user_accounts_user_email_ci_unique"),
        ("sites", "0002_alter_domain_unique"),
    ]

    operations = [migrations.RunPython(name_the_site, migrations.RunPython.noop)]
