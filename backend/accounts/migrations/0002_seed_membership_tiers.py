from django.db import migrations


def seed_tiers(apps, schema_editor):
    MembershipTier = apps.get_model("accounts", "MembershipTier")
    MembershipTier.objects.get_or_create(
        slug="free", defaults={"name": "Free", "rank": 0, "description": "Anonymous / not signed in."},
    )
    MembershipTier.objects.get_or_create(
        slug="registered", defaults={"name": "Registered", "rank": 10, "description": "Signed-in Genex account."},
    )


def unseed_tiers(apps, schema_editor):
    MembershipTier = apps.get_model("accounts", "MembershipTier")
    MembershipTier.objects.filter(slug__in=["free", "registered"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_tiers, unseed_tiers),
    ]
