import django.db.models.deletion
from django.db import migrations, models


def occupation_to_account_type(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    User.objects.filter(occupation="professional").update(account_type="professional")


def account_type_to_occupation(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    User.objects.filter(account_type="professional").update(occupation="professional")


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0005_user_occupation"),
        ("organizations", "0001_initial"),
    ]

    operations = [
        # The old free-text `company` becomes the unverified "Other" name; the
        # `company` name is reused for the real FK below.
        migrations.RenameField(model_name="user", old_name="company", new_name="company_other"),
        migrations.AlterField(
            model_name="user",
            name="company_other",
            field=models.CharField(
                blank=True, max_length=150,
                help_text="Professionals only: an unlisted company name. Never verified, shown without a logo or badge.",
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="account_type",
            field=models.CharField(
                choices=[("learner", "Learner"), ("professional", "Professional"), ("company", "Company")],
                db_index=True, default="learner", max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="company",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.PROTECT,
                related_name="members", to="organizations.company",
                help_text="Required for Company accounts. For Professionals, the registered company they claim to work for.",
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="company_verified",
            field=models.BooleanField(
                default=False,
                help_text="Professionals only: email domain matched the company and the email was confirmed.",
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="company_verified_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(occupation_to_account_type, account_type_to_occupation),
        migrations.RemoveField(model_name="user", name="occupation"),
    ]
