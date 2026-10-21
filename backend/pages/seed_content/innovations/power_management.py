from ..builders import (
    capabilities, cards, contact, cta, faq, hero, how_we_work, overview,
    product, related_innovations, side, stats,
)

PAGE = {
    "key": "power-management",
    "tags": ["Grid & Utilities"],
    "seo_title": "Industrial Energy Management and ISO 50001 Analytics",
    "search_description": (
        "Power Management Tools for factories and campuses: sub-metering, load profiles, demand forecasts, "
        "energy baselines and verified savings for ISO 50001 programmes. 150+ industrial sites."
    ),
    "body": [
        hero(
            label="Energy Management",
            heading="See where every unit goes, and prove every unit saved",
            description=(
                "Power Management Tools give industrial energy managers the measurements, baselines and "
                "reports needed to cut consumption and show the savings are real."
            ),
            cta_text="Talk to an Energy Engineer",
            cta_link=contact(),
        ),
        overview("You cannot manage what you only see once a month", [
            "For most factories, the electricity bill is the only energy report. It says how much was used "
            "and what it cost, but not where, when or why. Without that detail, energy projects are chosen "
            "by guesswork and their savings are hard to prove.",
            "Power Management Tools fill that gap. Sub-meters on major loads and departments record "
            "consumption every few minutes. Load profiles show when demand peaks and what drives it. "
            "Baselines adjusted for production and weather show whether a change really saved energy.",
            "The tools are built around ISO 50001, the international standard for energy management "
            "systems, so the data supports both day-to-day decisions and formal energy programmes.",
        ]),
        cards("What gets measured", (
            "Measurement points are chosen with the site team to cover the loads that matter most."
        ), [
            ("Factory", "Process loads", "Furnaces, compressors, chillers, pumps and production lines metered individually.", "Biggest consumers"),
            ("Business", "Departments and buildings", "Consumption by area, for internal cost allocation and targets.", "Cost centres"),
            ("TrendingUp", "Demand profile", "Load every few minutes, showing peaks against the contract demand.", "Peak drivers"),
            ("Speed", "Power factor", "kVA, kVAr and power factor at incomers and major feeders.", "kVAh billing"),
            ("SolarPower", "On-site generation", "Rooftop solar and DG output, alongside grid import.", "Energy mix"),
            ("Thermostat", "Production and weather", "Output and temperature, so energy can be normalised per unit produced.", "Fair comparison"),
        ]),
        side(
            "The load profile tells the story",
            "A single week of interval data usually reveals more savings than a year of bills.",
            "right",
            "Load profile chart of a factory over one week",
            bullets=[
                ("Night and weekend load", "Consumption that stays high when production stops points to equipment left running."),
                ("Start-up spikes", "Machines started together push demand peaks that staggered starts would avoid."),
                ("Compressed air", "Compressors cycling all night often point to leaks, one of the most common industrial losses."),
            ],
            image_hint="Energy manager looking at a load profile chart on screen",
        ),
        how_we_work("From measurement to verified savings", (
            "Each project follows the same plan-do-check-act cycle that ISO 50001 is built on."
        ), [
            ("Measure",
             "Sub-meters are installed on major loads, and data flows to the platform every few minutes.",
             "Sub-meters installed in an LT panel"),
            ("Set the baseline",
             "A baseline links energy use to production and weather, so later results can be compared fairly.",
             "Baseline regression chart"),
            ("Find and act",
             "Load profiles and benchmarks point to the best opportunities, and the site team acts on them.",
             "Engineers inspecting a compressor or motor"),
            ("Verify savings",
             "Savings are calculated against the adjusted baseline, following IPMVP measurement and verification methods.",
             "Savings report on screen"),
        ], principles=[
            ("Measure before you spend", "Projects are chosen from data, not assumptions."),
            ("Normalise for production", "Energy per unit produced, not just total kWh, is the measure that matters."),
            ("Savings must be provable", "Every claimed saving is checked against an adjusted baseline."),
        ]),
        stats("Across industrial sites", [
            ("150", "+", "Industrial sites"),
            ("18", "%", "Average energy cost reduction"),
            ("ISO", "", "50001 programmes supported"),
        ]),
        capabilities("Platform features", [
            ("Sensors", "Sub-metering by load, department and building"),
            ("TrendingUp", "Demand forecasting and peak alerts"),
            ("Analytics", "Energy performance indicators per unit produced"),
            ("Assessment", "Baselines and verified savings reports"),
            ("CurrencyRupee", "Cost allocation to departments"),
            ("DescriptionOutlined", "Reports for ISO 50001 audits"),
        ]),
        faq("Frequently asked questions", [
            ("How many meters does a site need?",
             "Enough to cover the large loads, typically those that together use 80% or more of the site's "
             "energy. For most factories that means 10 to 40 measurement points."),
            ("Do we need ISO 50001 certification to use this?",
             "No. The tools are useful on their own. Sites working towards ISO 50001 also get the baselines, "
             "indicators and records the standard asks for."),
            ("How is this different from RTC Power Tools?",
             "RTC Power Tools focus on power quality and real-time correction. Power Management Tools focus "
             "on where energy is used and how to reduce it. Many sites use both."),
        ]),
        related_innovations("Related innovations", [
            ("ai-health-checkup", "Insights"), ("ems-bess", "BatteryChargingFull"), ("smart-grid", "ElectricBolt"),
        ], "Other Genex work on energy efficiency and control."),
        cta(
            "Find out where your energy really goes",
            "Share your last 12 months of bills and your main loads. We will propose a metering plan and "
            "estimate the savings it could uncover.",
            "Request a Metering Plan", contact(),
            "See RTC Power Tools", product("rtc-power-tools"),
        ),
    ],
    "confirm": [
        "150+ sites, 18% average cost reduction (from earlier site data; same numbers as Portfolio RTC Power Tools, consider making them distinct)",
        "IPMVP-based verification as a delivered practice",
        "Stat tile shows 'ISO' with label '50001 programmes supported'; change if you prefer another figure",
    ],
}
