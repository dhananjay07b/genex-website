from django.db import migrations

GROUP_NAME = "GeLearn Company Personnel"
SCOPED_MODELS = [
    ("pages", "tender"),
    ("pages", "whitepaper"),
    ("pages", "casestudy"),
]
SCOPED_ACTIONS = ["add", "change", "delete", "view"]


def create_group(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")
    ContentType = apps.get_model("contenttypes", "ContentType")

    group, _ = Group.objects.get_or_create(name=GROUP_NAME)

    codenames = []
    for app_label, model_name in SCOPED_MODELS:
        ct = ContentType.objects.get(app_label=app_label, model=model_name)
        codenames.extend(f"{action}_{model_name}" for action in SCOPED_ACTIONS)
        group.permissions.add(*Permission.objects.filter(
            content_type=ct, codename__in=[f"{action}_{model_name}" for action in SCOPED_ACTIONS],
        ))

    access_admin = Permission.objects.filter(
        content_type__app_label="wagtailadmin", codename="access_admin",
    ).first()
    if access_admin:
        group.permissions.add(access_admin)


def remove_group(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name=GROUP_NAME).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0027_tender_whitepaper_casestudy_updated_by_guest_user"),
        ("auth", "0012_alter_user_first_name_max_length"),
        ("contenttypes", "0002_remove_content_type_name"),
        ("wagtailadmin", "0001_create_admin_access_permissions"),
    ]

    operations = [
        migrations.RunPython(create_group, remove_group),
    ]
