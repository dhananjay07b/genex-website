"""Starting set of career roles for GeLearn's "Learn for a role" sections. Editable in the CMS."""
from django.db import migrations

ROLES = [
    ("Solar O&M Engineer", "solar-om-engineer",
     "Keeps PV plants generating: inspections, fault response and performance reporting."),
    ("SCADA Engineer", "scada-engineer",
     "Builds and maintains the monitoring and control layer across plants and substations."),
    ("Protection & Testing Engineer", "protection-testing-engineer",
     "Sets, tests and coordinates relays so faults are cleared safely and selectively."),
    ("Energy Auditor", "energy-auditor",
     "Measures where energy is lost and makes the case for efficiency upgrades."),
    ("Automation (PLC) Engineer", "automation-plc-engineer",
     "Programs and commissions PLC and DCS systems for plants and process lines."),
    ("Plant Manager", "plant-manager",
     "Runs a generating asset end to end: people, performance, safety and compliance."),
]


def forwards(apps, schema_editor):
    CareerRole = apps.get_model("learning", "CareerRole")
    for order, (name, slug, summary) in enumerate(ROLES):
        CareerRole.objects.get_or_create(name=name, defaults={"slug": slug, "summary": summary, "sort_order": order})


def backwards(apps, schema_editor):
    CareerRole = apps.get_model("learning", "CareerRole")
    CareerRole.objects.filter(slug__in=[slug for _, slug, _ in ROLES], courses__isnull=True).delete()


class Migration(migrations.Migration):

    dependencies = [("learning", "0002_gelearn_phase1")]

    operations = [migrations.RunPython(forwards, backwards)]
