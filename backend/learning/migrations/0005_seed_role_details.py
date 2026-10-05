"""Starting duties and skills for the six seeded career roles. Editable in the CMS; only fills empty roles."""
from django.db import migrations

ROLES = {
    "solar-om-engineer": (
        ["Runs preventive and corrective maintenance on inverters, strings, trackers and transformers.",
         "Tracks performance ratio, availability and soiling losses, and finds the causes of underperformance.",
         "Responds to SCADA alarms and coordinates field teams to restore generation.",
         "Reports plant performance to asset owners and lenders."],
        ["Solar PV", "SCADA & Monitoring", "Electrical Safety", "Energy Data & Analytics"]),
    "scada-engineer": (
        ["Configures SCADA servers, HMIs and historians for solar, wind and substation sites.",
         "Integrates field devices over Modbus, DNP3 and IEC 60870-5-104, and maps their data points.",
         "Builds alarm lists and dashboards that operators can act on.",
         "Commissions communication links and troubleshoots data gaps."],
        ["SCADA & Monitoring", "Substation Automation", "Industrial Automation", "Energy Data & Analytics"]),
    "protection-testing-engineer": (
        ["Calculates and applies relay settings for feeders, transformers and generators.",
         "Tests relays with secondary injection and verifies trip logic before energisation.",
         "Analyses disturbance records after a trip and recommends setting changes.",
         "Coordinates protection between the plant and the utility grid."],
        ["Protection & Switchgear", "Substation Automation", "Power Quality", "Electrical Safety"]),
    "energy-auditor": (
        ["Measures how a site uses energy and where it loses it.",
         "Logs power quality and load profiles with portable analysers.",
         "Builds the business case for efficiency upgrades, with payback periods.",
         "Prepares audit reports to BEE guidelines."],
        ["Energy Efficiency & Audits", "Power Quality", "Energy Data & Analytics", "Regulation & Policy"]),
    "automation-plc-engineer": (
        ["Programs PLCs and DCS controllers to IEC 61131-3.",
         "Designs control panels and I/O lists with the electrical team.",
         "Commissions control loops and interlocks on site.",
         "Links plant controllers to SCADA and keeps them maintainable."],
        ["Industrial Automation", "SCADA & Monitoring", "Electrical Safety"]),
    "plant-manager": (
        ["Runs a generating asset end to end: people, performance, safety and compliance.",
         "Sets maintenance strategy and budgets with the asset owner.",
         "Manages grid-code compliance and the relationship with the utility.",
         "Reports generation, availability and incidents to management."],
        ["Solar PV", "Wind Energy", "Regulation & Policy", "Electrical Safety"]),
}


def forwards(apps, schema_editor):
    CareerRole = apps.get_model("learning", "CareerRole")
    Topic = apps.get_model("pages", "Topic")
    for slug, (duties, topics) in ROLES.items():
        role = CareerRole.objects.filter(slug=slug).first()
        if role is None:
            continue
        if not role.duties:
            role.duties = "\n".join(duties)
            role.save(update_fields=["duties"])
        if not role.topics.exists():
            role.topics.set(Topic.objects.filter(name__in=topics))


class Migration(migrations.Migration):
    dependencies = [("learning", "0004_phase7"), ("pages", "0048_phase7")]
    operations = [migrations.RunPython(forwards, migrations.RunPython.noop)]
