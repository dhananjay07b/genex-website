"""
GeLearn Phase 1 data:
  - seeds the Explore-menu topic groups and the sector topics under them;
  - renames five existing topics to their sector names (their links to blog
    posts and expert profiles are kept; slugs are unchanged);
  - tags existing GeAcademy articles, research, podcasts and whitepapers with
    topics, using a fixed lookup of their old free-text topic/category values
    (values that aren't topics, like video formats, are left alone);
  - parses video and podcast durations into seconds.
The old free-text fields themselves are untouched (removed later, Phase 8).
"""
from django.db import migrations
from django.utils.text import slugify

GROUPS = [
    ("Renewables", ["Solar PV", "Wind Energy", "Energy Storage (BESS)", "Green Hydrogen"]),
    ("Grid & substations", ["Substation Automation", "Protection & Switchgear", "Power Quality",
                            "Smart Grid & Metering", "Grid Modernization"]),
    ("Automation & data", ["SCADA & Monitoring", "Industrial Automation", "Energy Data & Analytics"]),
    ("Operations & compliance", ["Energy Efficiency & Audits", "EV Infrastructure", "Electrical Safety",
                                 "Regulation & Policy", "Maintenance & Ops"]),
]

# Existing topic → its sector name.
RENAMES = {
    "Solar": "Solar PV",
    "SCADA": "SCADA & Monitoring",
    "Safety": "Electrical Safety",
    "Policy": "Regulation & Policy",
}

# Old free-text topic/category value (lower-cased) → topic name(s).
LEGACY = {
    "solar": ["Solar PV"],
    "wind": ["Wind Energy"],
    "bess": ["Energy Storage (BESS)"],
    "energy storage": ["Energy Storage (BESS)"],
    "ev": ["EV Infrastructure"],
    "ev infrastructure": ["EV Infrastructure"],
    "scada": ["SCADA & Monitoring"],
    "edge computing": ["SCADA & Monitoring"],
    "grid": ["Smart Grid & Metering"],
    "grid technology": ["Smart Grid & Metering"],
    "grid & scada": ["SCADA & Monitoring", "Smart Grid & Metering"],
    "iec 61850": ["Substation Automation"],
    "iec 61850 (test)": ["Substation Automation"],
    "regulation": ["Regulation & Policy"],
    "ai & analytics": ["Energy Data & Analytics"],
    "software": ["Energy Data & Analytics"],
}

# (model, old free-text field) pairs whose values describe a topic.
LEGACY_FIELDS = [
    ("TechArticle", "topic"),
    ("CaseStudy", "category"),
    ("PodcastEpisode", "category"),
    ("Whitepaper", "category"),
]


def parse_duration_seconds(text):
    # Frozen copy of pages.durations.parse_duration_seconds (migrations must not track app code).
    import re
    if not text:
        return None
    text = text.strip().lower()
    if ":" in text:
        parts = [int(p) for p in re.findall(r"\d+", text.split(" ")[0])]
        if len(parts) == 2:
            return parts[0] * 60 + parts[1]
        if len(parts) == 3:
            return parts[0] * 3600 + parts[1] * 60 + parts[2]
        return None
    hours = re.search(r"(\d+)\s*h", text)
    minutes = re.search(r"(\d+)\s*m", text)
    if hours or minutes:
        return (int(hours.group(1)) * 3600 if hours else 0) + (int(minutes.group(1)) * 60 if minutes else 0)
    number = re.search(r"\d+", text)
    return int(number.group()) * 60 if number else None


def forwards(apps, schema_editor):
    Topic = apps.get_model("pages", "Topic")
    TopicGroup = apps.get_model("pages", "TopicGroup")

    for old, new in RENAMES.items():
        if not Topic.objects.filter(name=new).exists():
            Topic.objects.filter(name=old).update(name=new)

    for group_order, (group_name, names) in enumerate(GROUPS):
        group, _ = TopicGroup.objects.get_or_create(name=group_name, defaults={"sort_order": group_order})
        for order, name in enumerate(names):
            topic = Topic.objects.filter(name=name).first()
            if topic is None:
                slug, n = slugify(name), 2
                while Topic.objects.filter(slug=slug).exists():
                    slug, n = f"{slugify(name)}-{n}", n + 1
                topic = Topic.objects.create(name=name, slug=slug)
            topic.group = group
            topic.sort_order = order
            topic.save(update_fields=["group", "sort_order"])

    by_name = {t.name: t for t in Topic.objects.all()}
    for model_name, field in LEGACY_FIELDS:
        Model = apps.get_model("pages", model_name)
        for obj in Model.objects.all():
            matched = [by_name[n] for n in LEGACY.get((getattr(obj, field) or "").strip().lower(), []) if n in by_name]
            if matched:
                obj.topics.add(*matched)

    for model_name in ("VideoItem", "PodcastEpisode"):
        Model = apps.get_model("pages", model_name)
        for obj in Model.objects.all():
            obj.duration_seconds = parse_duration_seconds(obj.duration)
            obj.save(update_fields=["duration_seconds"])


def backwards(apps, schema_editor):
    Topic = apps.get_model("pages", "Topic")
    TopicGroup = apps.get_model("pages", "TopicGroup")
    for model_name, _ in LEGACY_FIELDS:
        apps.get_model("pages", model_name).topics.through.objects.all().delete()
    # Topics are never deleted here: some seeded names may have existed before
    # this migration, and an unused extra topic is harmless.
    for old, new in RENAMES.items():
        if not Topic.objects.filter(name=old).exists():
            Topic.objects.filter(name=new).update(name=old)
    Topic.objects.update(group=None, sort_order=0)
    TopicGroup.objects.filter(name__in=[g for g, _ in GROUPS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0038_gelearn_phase1"),
        ("accounts", "0010_gelearn_phase1"),
    ]

    operations = [migrations.RunPython(forwards, backwards)]
