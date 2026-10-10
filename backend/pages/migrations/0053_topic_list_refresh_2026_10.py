"""
Apply the signed-off "Topic list" refresh from the GeLearn Home Redesign
plan (2026-10-10): 3 groups renamed, 3 new groups, 3 topics renamed/moved
into a new group, 3 moved into a new group without renaming, 22 new topics,
Grid Modernization merged into Smart Grid & Metering, and Case
Studies/Training/Engineering removed (they're formats/labels, not subjects
— Field Notes/Product Updates stay as the "Hide" decision intends: no
group, so they already don't show in the Explore menu).
"""
from django.db import migrations
from django.utils.text import slugify


GROUP_RENAMES = {
    "Renewables": "Solar & Renewables",
    "Automation & data": "Monitoring, Automation & IoT",
    "Operations & compliance": "Operations & Safety",
}
GROUP_SORT_ORDER = {
    "Solar & Renewables": 0,
    "Storage & E-Mobility": 1,
    "Grid & substations": 2,
    "Monitoring, Automation & IoT": 3,
    "Data & Digital": 4,
    "Operations & Safety": 5,
    "Policy & Markets": 6,
}
NEW_GROUPS = ["Storage & E-Mobility", "Data & Digital", "Policy & Markets"]

# (topic name, new group name or None to keep, new sort_order, new name or None to keep)
TOPIC_CHANGES = [
    ("Solar PV", None, 0, None),
    ("Wind Energy", None, 3, None),
    ("Green Hydrogen", None, 5, None),
    ("Energy Storage (BESS)", "Storage & E-Mobility", 0, None),
    ("EV Infrastructure", "Storage & E-Mobility", 4, "EV Charging Infrastructure"),
    ("Substation Automation", None, 0, None),
    ("Protection & Switchgear", None, 1, None),
    ("Power Quality", None, 2, None),
    ("Smart Grid & Metering", None, 3, None),
    ("SCADA & Monitoring", None, 0, None),
    ("Industrial Automation", None, 3, None),
    ("Energy Data & Analytics", "Data & Digital", 0, None),
    ("Energy Efficiency & Audits", None, 4, None),
    ("Electrical Safety", None, 3, None),
    ("Regulation & Policy", "Policy & Markets", 0, None),
    ("Maintenance & Ops", None, 0, "Plant O&M"),
    ("Sustainability", "Policy & Markets", 3, "ESG & Sustainability"),
]

NEW_TOPICS = [
    ("Rooftop & C&I Solar", "Solar & Renewables", 1),
    ("Solar Pumps & PM-KUSUM", "Solar & Renewables", 2),
    ("Hybrid Plants", "Solar & Renewables", 4),
    ("Pumped Hydro Storage", "Storage & E-Mobility", 1),
    ("Virtual Power Plants (VPP)", "Storage & E-Mobility", 2),
    ("Battery Management Systems", "Storage & E-Mobility", 3),
    ("EV Fleet Management", "Storage & E-Mobility", 5),
    ("Grid Integration & Grid Codes", "Grid & substations", 4),
    ("Grid-Forming Inverters", "Grid & substations", 5),
    ("Remote Monitoring (RMS)", "Monitoring, Automation & IoT", 1),
    ("Data Loggers & IoT Gateways", "Monitoring, Automation & IoT", 2),
    ("Communication Protocols", "Monitoring, Automation & IoT", 4),
    ("OT Cybersecurity", "Monitoring, Automation & IoT", 5),
    ("Forecasting & Scheduling", "Data & Digital", 1),
    ("AI in Energy", "Data & Digital", 2),
    ("Energy Management Systems", "Data & Digital", 3),
    ("Digital Twins", "Data & Digital", 4),
    ("Commissioning & Testing", "Operations & Safety", 1),
    ("Asset Health & Diagnostics", "Operations & Safety", 2),
    ("Tenders & Procurement", "Policy & Markets", 1),
    ("Power Markets & Trading", "Policy & Markets", 2),
    ("Data Center & C&I Power Demand", "Policy & Markets", 4),
]

REMOVED_TOPICS = ["Case Studies", "Training", "Engineering"]


def _topic_relations(Topic):
    """Same introspection as pages.topics._topic_relations, but on the historical model."""
    relations = []
    for rel in Topic._meta.related_objects:
        if not rel.many_to_many:
            continue
        through = rel.through
        topic_fk = next(f.name for f in through._meta.fields if f.is_relation and f.related_model is Topic)
        other_fk = next(
            f.name for f in through._meta.fields
            if f.is_relation and f.name != topic_fk and f.related_model is not None
        )
        relations.append((through, topic_fk, other_fk))
    return relations


def apply_refresh(apps, schema_editor):
    Topic = apps.get_model("pages", "Topic")
    TopicGroup = apps.get_model("pages", "TopicGroup")

    groups = {g.name: g for g in TopicGroup.objects.all()}
    for old_name, new_name in GROUP_RENAMES.items():
        g = groups.pop(old_name)
        g.name = new_name
        g.save()
        groups[new_name] = g
    for name in NEW_GROUPS:
        groups[name] = TopicGroup.objects.create(name=name, sort_order=0)
    for name, g in groups.items():
        g.sort_order = GROUP_SORT_ORDER[name]
        g.save()

    topics = {t.name: t for t in Topic.objects.all()}
    for old_name, new_group, sort_order, new_name in TOPIC_CHANGES:
        t = topics[old_name]
        if new_name:
            t.name = new_name
        if new_group:
            t.group = groups[new_group]
        t.sort_order = sort_order
        t.save()

    # Merge Grid Modernization's tags onto Smart Grid & Metering, then drop it.
    grid_mod = Topic.objects.get(name="Grid Modernization")
    smart_grid = Topic.objects.get(name="Smart Grid & Metering")
    for through, topic_fk, other_fk in _topic_relations(Topic):
        already = list(through.objects.filter(**{topic_fk: smart_grid}).values_list(f"{other_fk}_id", flat=True))
        rows = through.objects.filter(**{f"{topic_fk}_id": grid_mod.pk})
        rows.exclude(**{f"{other_fk}_id__in": already}).update(**{topic_fk: smart_grid})
        rows.delete()
    grid_mod.delete()

    Topic.objects.filter(name__in=REMOVED_TOPICS).delete()

    for name, group_name, sort_order in NEW_TOPICS:
        # Historical models skip Topic.save()'s auto-slug, so set it here (same rule: slugify(name)).
        Topic.objects.create(name=name, slug=slugify(name), group=groups[group_name], sort_order=sort_order)


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0052_remove_legacy_topic_fields"),
    ]

    operations = [
        # Renames, re-groupings, a merge and 3 removals aren't meaningfully
        # reversible (tag history and the removed topics' identities are
        # gone), matching 0052's own RunPython.noop for the same reason.
        migrations.RunPython(apply_refresh, migrations.RunPython.noop),
    ]
