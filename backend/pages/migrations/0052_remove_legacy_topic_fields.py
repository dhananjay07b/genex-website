"""
GeLearn redesign Phase 8: remove the fields the shared Topic list replaced.

- Video submissions gain `topics` and `other_topic`, like post submissions.
- A last tagging pass: anything still without topics is tagged from its old
  free-text value, through the Phase 1 lookup or an exact topic name.
- Then the old free-text topic/category fields, the whitepaper and research
  category colours, and the GeLearn index page's old intro and body go.
"""
from importlib import import_module

from django.db import migrations, models

# The Phase 1 lookup of old free-text values → topic names.
LEGACY = {
    **import_module("pages.migrations.0039_gelearn_topics_data").LEGACY,
    # Blog labels whose topics were renamed in Phase 1.
    "policy": ["Regulation & Policy"],
    "operations": ["Maintenance & Ops"],
}

# (model, old free-text field) for every model that loses one.
LEGACY_FIELDS = [
    ("TechArticle", "topic"),
    ("CaseStudy", "category"),
    ("PodcastEpisode", "category"),
    ("Whitepaper", "category"),
    ("VideoItem", "category"),
    ("BlogPost", "topic"),
    ("UserBlogPost", "topic"),
    ("UserVideoPost", "topic"),
]


def tag_untagged(apps, schema_editor):
    Topic = apps.get_model("pages", "Topic")
    by_name = {t.name.lower(): t for t in Topic.objects.all()}
    for model_name, field in LEGACY_FIELDS:
        Model = apps.get_model("pages", model_name)
        for obj in Model.objects.filter(topics__isnull=True).exclude(**{field: ""}):
            value = getattr(obj, field).strip().lower()
            names = [n.lower() for n in LEGACY.get(value, [])] or [value]
            matched = [by_name[n] for n in names if n in by_name]
            if matched:
                obj.topics.add(*matched)


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0051_seed_landing_pages"),
    ]

    operations = [
        migrations.AddField(
            model_name="uservideopost",
            name="topics",
            field=models.ManyToManyField(blank=True, related_name="video_submissions", to="pages.topic"),
        ),
        migrations.AddField(
            model_name="uservideopost",
            name="other_topic",
            field=models.CharField(blank=True, help_text="Author-suggested new topic, reviewed alongside the rest of the submission", max_length=100),
        ),
        # Nothing to undo: the tags stay valid if the old fields come back.
        migrations.RunPython(tag_untagged, migrations.RunPython.noop),
        migrations.RemoveField(model_name="techarticle", name="topic"),
        migrations.RemoveField(model_name="casestudy", name="category"),
        migrations.RemoveField(model_name="casestudy", name="category_color"),
        migrations.RemoveField(model_name="podcastepisode", name="category"),
        migrations.RemoveField(model_name="whitepaper", name="category"),
        migrations.RemoveField(model_name="whitepaper", name="category_bg"),
        migrations.RemoveField(model_name="whitepaper", name="category_text"),
        migrations.RemoveField(model_name="videoitem", name="category"),
        migrations.RemoveField(model_name="blogpost", name="topic"),
        migrations.RemoveField(model_name="userblogpost", name="topic"),
        migrations.RemoveField(model_name="uservideopost", name="topic"),
        migrations.RemoveField(model_name="gelearnindexpage", name="intro_headline"),
        migrations.RemoveField(model_name="gelearnindexpage", name="body"),
    ]
