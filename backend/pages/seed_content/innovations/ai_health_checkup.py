from ..builders import (
    cards, contact, cta, faq, hero, how_we_work, intro, related_innovations,
    side, stats,
)

PAGE = {
    "key": "ai-health-checkup",
    "tags": ["AI & Analytics"],
    "seo_title": "AI Plant Health Checkup for Solar and Storage Assets",
    "search_description": (
        "An AI-driven health assessment of a solar or storage plant from 12 months of data: every source "
        "of lost generation, ranked by revenue, with a recovery plan."
    ),
    "body": [
        hero(
            label="AI & Analytics",
            heading="A full diagnosis of your plant, without waiting for the annual audit",
            description=(
                "The AI Plant Health Checkup analyses a year of operating data and shows exactly where "
                "your plant is losing generation, what each loss is worth and how to recover it."
            ),
            cta_text="Book a Health Checkup",
            cta_link=contact(),
        ),
        intro("Every plant loses energy. Few owners know exactly where.", [
            "Plants rarely lose generation to one big failure. They lose it to a dozen small causes at once: "
            "dirty modules, a few weak strings, inverters clipping at midday, a tracker that stalls, grid "
            "outages that were never logged. Each looks minor. Together they can take several percent of "
            "annual revenue.",
            "A health checkup separates these causes. Using weather-corrected models, it works out what the "
            "plant should have produced, then assigns every lost unit to a specific cause.",
        ], note="Based on 12 months of plant data"),
        how_we_work("What a checkup involves", (
            "Most of the work is done by the models. Our engineers review every result before it reaches you."
        ), [
            ("Share the data",
             "We collect 12 months of inverter, meter and weather data from your monitoring system or as file exports.",
             "Data files or a monitoring export on a laptop"),
            ("AI analysis",
             "Models calculate expected generation for every interval and assign each shortfall to a cause.",
             "Charts comparing expected and actual generation"),
            ("Engineer review",
             "A Genex engineer checks the findings against the plant layout and history, and removes anything the data cannot support.",
             "Engineer reviewing results at a desk"),
            ("Report and recovery plan",
             "You receive a scored report and a ranked list of fixes, each with its estimated value in rupees per year.",
             "Printed or on-screen health report with scores"),
        ], principles=[
            ("Weather-corrected", "Losses are measured against what the weather allowed, not against a fixed target."),
            ("Every unit accounted for", "The gap between expected and actual generation is fully broken down by cause."),
            ("Independent", "The checkup reports what the data shows, whoever built or maintains the plant."),
        ]),
        stats("Checkups so far", [
            ("50", "+", "Plants assessed"),
            ("48", "h", "Typical turnaround after data is received"),
            ("22", "%", "Average share of lost generation found to be recoverable"),
        ]),
        cards("Where the losses come from", (
            "The report breaks lost generation into categories like these, each with its share of the total."
        ), [
            ("Layers", "Soiling", "Dust and dirt on modules, with the cleaning interval that would pay back best.", "Cleaning plan"),
            ("Speed", "Inverter clipping", "Energy lost when DC power exceeds inverter capacity at midday.", "DC:AC ratio"),
            ("SolarPower", "Shading", "Losses from nearby structures, vegetation or row-to-row shading.", "Seasonal"),
            ("Power", "Equipment downtime", "Hours lost to inverter, string and tracker faults, with repair response times.", "Availability"),
            ("TrendingUp", "Degradation", "Module performance loss compared with the warranted rate.", "Warranty check"),
            ("ElectricBolt", "Grid limits", "Curtailment and grid outages, separated from plant-side causes.", "Not plant fault"),
        ]),
        side(
            "The health report",
            "The report is written for owners and asset managers, not just engineers.",
            "right",
            "Plant health report with subsystem scores",
            bullets=[
                ("Health score", "A traffic-light score for each subsystem: modules, strings, inverters, trackers, grid connection."),
                ("Loss waterfall", "A single chart from theoretical to actual generation, with every loss category shown."),
                ("Recovery plan", "Fixes ranked by value, with estimated cost and the energy each one recovers."),
            ],
            image_hint="Report cover or loss waterfall chart on screen",
        ),
        side(
            "Who uses it",
            "The checkup is used whenever someone needs an honest picture of a plant's condition.",
            "left",
            "Asset manager and engineer reviewing a solar plant",
            bullets=[
                ("Buyers and investors", "Due diligence before acquiring an operating plant."),
                ("Asset owners", "An independent view of how well the O&M contractor is performing."),
                ("O&M contractors", "Evidence to support repair or upgrade proposals to the owner."),
            ],
            image_hint="Two people in hard hats with a tablet at a solar plant",
        ),
        faq("Frequently asked questions", [
            ("What data do you need?",
             "Twelve months of inverter output, energy meter readings and on-site irradiance and temperature "
             "data. If irradiance data is missing, satellite weather data can fill the gap with lower precision."),
            ("Does the plant need to be on SolarLive?",
             "No. We can work with exports from any monitoring system. Plants on SolarLive are faster to "
             "assess because the data is already in the right format."),
            ("Can a checkup be used for a plant acquisition?",
             "Yes. Buyers use it as part of technical due diligence, to see how the plant has really "
             "performed and what it would take to improve it."),
            ("Does it work for battery storage plants?",
             "Yes. For storage, the checkup covers availability, round-trip efficiency, capacity fade and "
             "how well the battery has been dispatched."),
        ]),
        related_innovations("Related innovations", [
            ("ai-monitoring", "Psychology"), ("drone-monitoring", "Sensors"), ("power-management", "Speed"),
        ], "Tools that keep a plant healthy after the checkup."),
        cta(
            "Find out what your plant is leaving on the table",
            "Send us 12 months of data from one plant. We will return a health report and a ranked "
            "recovery plan.",
            "Book a Health Checkup", contact(),
        ),
    ],
    "confirm": [
        "50+ plants assessed and 22% recoverable share (earlier site); 22% is high, check its meaning",
        "48-hour turnaround (earlier site said report in under 1 hour of compute; 48 h includes engineer review)",
        "Storage checkup scope and satellite weather fallback",
    ],
}
