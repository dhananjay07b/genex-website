"""
Job applications get their own Apply form: the CV moves from a (public) Wagtail
document to private storage, plus status, email_sent and consent_at. The table
is empty on every server (applications went through the Contact form until now).
"""
import django.utils.timezone
from django.db import migrations, models

import pages.models
import pages.private_files


class Migration(migrations.Migration):
    dependencies = [("pages", "0062_remove_contactlead")]

    operations = [
        migrations.RemoveField(model_name="jobapplication", name="resume"),
        migrations.AddField(
            model_name="jobapplication", name="cv",
            field=models.FileField(default="", storage=pages.private_files.private_storage,
                                   upload_to=pages.models.cv_upload_path, verbose_name="CV"),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="jobapplication", name="status",
            field=models.CharField(choices=[("new", "New"), ("reviewed", "Reviewed"), ("shortlisted", "Shortlisted"),
                                            ("rejected", "Not taken forward")], db_index=True, default="new", max_length=12),
        ),
        migrations.AddField(
            model_name="jobapplication", name="email_sent",
            field=models.BooleanField(default=False, help_text="Whether the notification to the Genex inbox was sent."),
        ),
        migrations.AddField(
            model_name="jobapplication", name="consent_at",
            field=models.DateTimeField(default=django.utils.timezone.now, help_text="When the applicant agreed to the Privacy Policy."),
            preserve_default=False,
        ),
        migrations.AlterField(model_name="jobapplication", name="phone", field=models.CharField(max_length=40)),
        migrations.AlterField(model_name="jobapplication", name="linkedin", field=models.URLField(blank=True, verbose_name="LinkedIn")),
        migrations.AlterField(model_name="jobapplication", name="experience",
                              field=models.CharField(blank=True, help_text="As the applicant wrote it, e.g. '6 years'.", max_length=100)),
        migrations.AlterField(model_name="jobapplication", name="message", field=models.TextField(blank=True, max_length=5000)),
        migrations.AlterModelOptions(name="jobapplication", options={"ordering": ["-created_at"], "verbose_name": "Job application"}),
    ]
