from django.db import migrations
from django.utils.text import slugify

TOPICS = [
    "Policy", "Engineering", "Field Notes", "Solar", "SCADA",
    "Grid Modernization", "Maintenance & Ops", "Safety", "Case Studies",
    "Product Updates", "Sustainability", "Training",
]


def seed_topics(apps, schema_editor):
    Topic = apps.get_model("pages", "Topic")
    for name in TOPICS:
        Topic.objects.get_or_create(name=name, defaults={"slug": slugify(name)})


def remove_topics(apps, schema_editor):
    Topic = apps.get_model("pages", "Topic")
    Topic.objects.filter(name__in=TOPICS).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0031_videoitem_podcast_topics_duration"),
    ]

    operations = [
        migrations.RunPython(seed_topics, remove_topics),
    ]
