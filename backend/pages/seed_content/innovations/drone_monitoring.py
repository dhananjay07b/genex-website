from ..builders import (
    cards, contact, cta, faq, gallery, hero, overview,
    related_innovations, side, stats, steps,
)

PAGE = {
    "key": "drone-monitoring",
    "tags": ["AI & Analytics"],
    "seo_title": "Drone Thermal Inspection for Solar Plants with AI Defect Detection",
    "search_description": (
        "Drone-based thermal and visual inspection of solar plants to IEC TS 62446-3, with AI defect "
        "detection and geo-tagged fault maps linked to SolarLive."
    ),
    "body": [
        hero(
            label="AI & Analytics",
            heading="Inspect a whole solar plant in hours, down to the module",
            description=(
                "Genex Drone Monitoring combines thermal and visual drone imagery with AI analysis to find "
                "faulty modules across a plant and map each one to its exact location."
            ),
            cta_text="Plan an Inspection",
            cta_link=contact(),
        ),
        overview("Why inspect from the air", [
            "A 50 MW solar plant has well over a hundred thousand modules. Walking the rows with a handheld "
            "thermal camera takes weeks, and teams inevitably sample rather than check every panel. Small "
            "defects go unnoticed until they show up as lost generation.",
            "A drone with a thermal camera covers the same plant in a fraction of the time and sees every "
            "module. Faulty cells, bypass diodes and disconnected strings run hotter than healthy ones, so "
            "they stand out clearly in thermal images taken in strong sunlight.",
            "The difficult part is not flying. It is turning thousands of images into a reliable list of "
            "faults. That is where the Genex AI analysis comes in, and where it connects to the plant's "
            "live monitoring data.",
        ]),
        gallery([
            ("Drone flying over rows of solar panels", "Inspection drone in flight over a solar array"),
            ("Thermal image of solar modules with a hotspot", "Thermal (infrared) image of PV modules showing a hotspot"),
            ("Aerial view of a solar plant layout", "Top-down aerial view of a solar plant"),
            ("Technician checking a solar module flagged by inspection", "Technician at a panel row with a tablet or thermal camera"),
        ]),
        cards("What the inspection finds", (
            "Each defect type has a distinct thermal or visual signature, which the AI classifies and "
            "ranks by severity."
        ), [
            ("Thermostat", "Hotspots", "Single cells running far hotter than the rest of the module, from cracks, shading or manufacturing defects.", "Cell level"),
            ("ElectricBolt", "Bypass diode faults", "One-third of a module heated evenly, a sign that a bypass diode is conducting or has failed short.", "Sub-string pattern"),
            ("SolarPower", "Disconnected strings", "Whole strings warmer than neighbours because they are not delivering current.", "Immediate loss"),
            ("WarningAmber", "Physical damage", "Broken glass, delamination and frame damage visible in high-resolution RGB images.", "Safety risk"),
            ("Layers", "Soiling patterns", "Uneven dirt and bird droppings that cause local heating and reduce output.", "Cleaning priority"),
            ("Agriculture", "Vegetation and shading", "Grass, trees and structures casting shadows across module rows.", "Site upkeep"),
        ]),
        steps("How an inspection runs", (
            "Inspections follow the conditions set in IEC TS 62446-3, the standard for outdoor thermal "
            "imaging of PV plants, so results are comparable from one year to the next."
        ), [
            ("Flight planning", "Flight paths are planned over the plant layout, and airspace permission is confirmed under India's drone rules.", "Map"),
            ("Image capture", "Thermal and RGB images are captured in clear conditions with strong sunlight, as the standard requires.", "Sensors"),
            ("AI analysis", "Images are stitched into a plant map and every module is checked by the defect detection models.", "Psychology"),
            ("Fault map and report", "Each defect is mapped to its row, table and module, with severity and recommended action.", "Assessment"),
            ("Field verification", "Technicians use the map on site to confirm and fix defects, and results feed back into the models.", "Engineering"),
        ]),
        side(
            "What the thermal camera sees",
            "A healthy module shows an even temperature. A faulty one does not, and the pattern tells you why.",
            "left",
            "Thermal image of solar modules with defects highlighted",
            bullets=[
                ("Strong sunlight needed", "Thermal inspection needs irradiance of at least 600 W/m² so that faults generate enough heat to show clearly."),
                ("Temperature difference", "Defects are graded by how much hotter they run than healthy modules nearby."),
                ("RGB for context", "Visual images confirm whether heat comes from damage, soiling or an electrical fault."),
            ],
            image_hint="Side-by-side thermal and RGB image of the same modules",
        ),
        stats("", [
            ("80", "%", "Less time than manual inspection"),
            ("500", "MW", "Inspected from the air"),
            ("92", "%", "Defect detection accuracy"),
        ]),
        side(
            "Linked to live plant data",
            "Inspection results are loaded into SolarLive alongside the plant's generation data.",
            "right",
            "SolarLive dashboard showing inspection faults on a plant map",
            bullets=[
                ("Confirm the cause", "A string flagged as underperforming in SolarLive can be matched with the thermal defect behind it."),
                ("Size the loss", "Each defect is linked to the energy it is costing, which sets repair priority."),
                ("Track the fix", "The next inspection shows whether repairs worked and whether new defects have appeared."),
            ],
            image_hint="Dashboard screen with a plant map and fault markers",
        ),
        faq("Frequently asked questions", [
            ("Do drone flights need permission in India?",
             "Yes. Flights follow the Drone Rules, 2021 and the airspace map on the Digital Sky platform. "
             "Our pilots hold the required remote pilot certificates, and we handle permissions for each site."),
            ("How often should a plant be inspected?",
             "Once a year is common for performance tracking, with extra inspections after storms, before "
             "warranty claims or when monitoring shows unexplained losses."),
            ("Can the results support a module warranty claim?",
             "Yes. Geo-tagged thermal and visual images, with temperature data for each defect, give "
             "manufacturers the evidence they usually ask for."),
            ("Can you inspect wind turbines as well?",
             "Blade inspection uses different flight methods and models. Talk to us about wind sites; "
             "our current focus is solar plants."),
        ]),
        related_innovations("Related innovations", [
            ("ai-health-checkup", "Insights"), ("ai-monitoring", "Psychology"), ("advanced-scada", "Dashboard"),
        ], "Other ways Genex finds and fixes lost generation."),
        cta(
            "Find the modules that are costing you energy",
            "Tell us the plant size and location. We will plan an inspection and share a sample fault report "
            "from a similar site.",
            "Plan an Inspection", contact(),
        ),
    ],
    "confirm": [
        "Product stage: the earlier site called Drone Monitoring a prototype; 500 MW inspected and 92% accuracy may not fit that. Confirm all three stats",
        "In-house remote pilot certificates and permission handling",
        "Wind blade inspection not offered yet (as written in the FAQ)",
    ],
}
