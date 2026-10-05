"""Starting one-line descriptions for the grouped topics. Editable in the CMS; only fills empty ones."""
from django.db import migrations

DESCRIPTIONS = {
    "Solar PV": "Design, commissioning and operation of utility-scale and rooftop solar plants, from string sizing to performance ratio.",
    "Wind Energy": "Wind turbines and wind farms: condition monitoring, availability and grid connection.",
    "Energy Storage (BESS)": "Battery energy storage systems: sizing, safety, battery management and dispatch.",
    "Green Hydrogen": "Electrolysers and the power systems around them, from renewable supply to plant balance.",
    "Substation Automation": "Protection, control and communication inside substations, including IEC 61850.",
    "Protection & Switchgear": "Relays, breakers and coordination that keep faults from spreading.",
    "Power Quality": "Harmonics, flicker, voltage events and the standards plants must meet at the grid connection.",
    "Smart Grid & Metering": "Smart meters, AMI rollouts and the data utilities use to run the grid.",
    "Grid Modernization": "Upgrading distribution and transmission networks for more renewables and more data.",
    "SCADA & Monitoring": "Supervisory control and data acquisition: collecting plant data, alarms and remote control.",
    "Industrial Automation": "PLCs, DCS and the control systems that run plants and process lines.",
    "Energy Data & Analytics": "Turning plant and meter data into generation, loss and performance insight.",
    "Energy Efficiency & Audits": "Measuring where energy is lost and making the case for improvements.",
    "EV Infrastructure": "EV chargers, their standards, site planning and fleet charging management.",
    "Electrical Safety": "Safe working on live plant: isolation, lock-out/tag-out and arc-flash awareness.",
    "Regulation & Policy": "CERC, CEA and MNRE rules, grid codes and the tenders that follow from them.",
    "Maintenance & Ops": "Keeping power assets available: maintenance planning, spares and field operations.",
}


def forwards(apps, schema_editor):
    Topic = apps.get_model("pages", "Topic")
    for name, text in DESCRIPTIONS.items():
        Topic.objects.filter(name=name, description="").update(description=text)


class Migration(migrations.Migration):
    dependencies = [("pages", "0048_phase7")]
    operations = [migrations.RunPython(forwards, migrations.RunPython.noop)]
