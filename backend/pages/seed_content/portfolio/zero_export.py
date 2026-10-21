from ..builders import (
    cards, contact, cta, faq, hero, highlights, intro, product, related, side,
    stats, steps,
)

PAGE = {
    "key": "zero-export",
    "tags": ["Solar & Monitoring"],
    "seo_title": "Zero Export Controller for Rooftop Solar and DG Sync",
    "search_description": (
        "Zero export and export-limit control for rooftop and captive solar. Keeps grid export at "
        "zero, protects DG sets from reverse power, and responds in under one second. 200+ sites."
    ),
    "body": [
        hero(
            label="Export Control",
            heading="All the solar you can use. Nothing you are not allowed to export.",
            description=(
                "Genex Zero Export Tools measure power at the grid connection and adjust inverter output "
                "in real time, so the plant never pushes power back into the grid or a running DG set."
            ),
            cta_text="Get a Zero Export Solution",
            cta_link=contact(),
            image_hint="Factory rooftop solar with an LT panel or inverter bank in the foreground",
        ),
        intro("When export is not an option", [
            "Many commercial and industrial sites install more solar than they can always use, but are "
            "not permitted to export the surplus. Net metering approval may be pending, the plant may be "
            "above the state's net metering limit, or the discom may simply not allow export at that "
            "connection.",
            "Diesel generators add a second problem. A DG set cannot absorb power flowing back into it. "
            "If solar output exceeds the site load while the DG is running, the reverse power relay "
            "trips the generator and the site goes dark. A zero export controller prevents both problems "
            "by keeping solar output just below what the site is consuming at every moment.",
        ], note="Typical cases: export not permitted, net metering pending, DG-synchronised sites"),
        side(
            "How the controller works",
            "The control loop runs continuously, many times a second, so changes in load are matched "
            "before power can flow the wrong way.",
            "right",
            "Zero export controller panel with meter and communication wiring",
            bullets=[
                ("Measure", "A meter at the grid or DG incomer measures power flow in both directions, with CTs on each phase."),
                ("Decide", "The controller compares the measured flow with the allowed limit, which can be zero or a fixed export value."),
                ("Adjust", "Inverter output limits are raised or lowered over Modbus, so solar follows the load up and down."),
                ("Protect", "If communication with the meter is lost, inverters drop to a safe output level until it is restored."),
            ],
            image_hint="Controller enclosure with the energy meter and inverter communication cabling",
        ),
        stats("", [
            ("200", "+", "Zero export sites running"),
            ("<1", "s", "Response to a change in load"),
            ("100", "%", "Export compliance on commissioned sites"),
        ]),
        highlights("Control Engineering", (
            "Zero export is a fast control problem. These are the details that keep it stable."
        ), [
            ("ring_stat", "Speed", "Sub-second response", "Inverter limits updated as soon as load changes", "<1 s"),
            ("icon", "MemoryOutlined", "Multi-brand inverters", "One controller manages mixed inverter brands", "Modbus RTU / TCP"),
            ("timeline", "SwapHoriz", "Grid and DG modes", "Switches limits automatically when the DG starts", "Auto changeover"),
            ("security", "ShieldOutlined", "Fail-safe behaviour", "Safe output level on meter or link failure", "No reverse flow"),
            ("diagram", "Analytics", "Curtailment logging", "Records how much solar was held back each day", "Loss in kWh"),
            ("signal", "Wifi", "Remote monitoring", "Status and logs visible on SolarLive", "Cloud linked"),
        ]),
        cards("Where it is used", (
            "The same controller is configured differently for each site arrangement."
        ), [
            ("Factory", "Factories without export approval", "Run the full solar plant while net metering is pending or not allowed, using every unit on site.", "Limit: zero export"),
            ("Power", "DG-synchronised sites", "Keep the generator loaded and protected from reverse power whenever it runs alongside solar.", "Protects the DG"),
            ("Business", "Commercial buildings", "Offices, malls and hospitals where weekend or holiday load drops well below solar output.", "Low-load days"),
            ("ElectricBolt", "Export-limited connections", "Sites allowed to export up to a fixed limit hold export at that value instead of zero.", "Limit: fixed kW"),
            ("BatteryChargingFull", "Solar with storage", "Surplus is sent to the battery first, and inverters are limited only once the battery is full.", "Works with EMS"),
            ("LocationOn", "Multi-incomer sites", "Sites with more than one grid incomer are controlled as one, with meters on each.", "Combined control"),
        ]),
        steps("Commissioning a site", (
            "Most sites are commissioned in a single visit once the inverters are running."
        ), [
            ("Site study", "We review the single-line diagram, incomers, DG sets and inverter models, and agree the export limit.", "Engineering"),
            ("Installation", "The meter and CTs are fitted at the incomer, and the controller is wired to the inverters.", "Power"),
            ("Tuning and testing", "The control loop is tuned on live load, including load drops and DG start and stop.", "Tune"),
            ("Handover", "Settings are documented and the site appears on SolarLive with curtailment logging.", "VerifiedOutlined"),
        ]),
        faq("Frequently asked questions", [
            ("Will zero export reduce my solar generation?",
             "Only when site load is lower than what the plant could produce. Then the surplus is held "
             "back. The controller logs these curtailed units, so you can see whether storage or net "
             "metering would be worth adding."),
            ("Why is a DG set at risk from solar?",
             "A DG set is built to supply power, not absorb it. If solar output exceeds the load while "
             "the DG runs, power flows back into it and the reverse power relay trips the set. DG "
             "manufacturers also recommend a minimum load, often around 30% of rating, which the "
             "controller can hold."),
            ("Does it work with my inverters?",
             "It works with inverters that accept active power limits over Modbus RTU or Modbus TCP, "
             "which includes most commercial string and central inverters. We confirm each model first."),
            ("Can the export limit change later?",
             "Yes. If you get net metering approval or an export allowance, the limit is changed in "
             "settings with no new hardware."),
        ]),
        related("Related systems", ["solarlive", "ems-bess", "data-loggers"],
                "Monitoring and storage that make the most of a zero export site."),
        cta(
            "Solar sitting idle because you cannot export?",
            "Share your single-line diagram, inverter make and DG details. We will propose a zero "
            "export setup and estimate the solar you will be able to use.",
            "Get a Proposal", contact(),
            "Explore SolarLive", product("solarlive"),
        ),
    ],
    "confirm": [
        "200+ sites, <1 s response, 100% export compliance (from earlier site data)",
        "DG minimum-load holding and automatic grid/DG changeover",
        "Battery-first surplus handling with the EMS",
        "Fail-safe output level on communication loss",
        "Curtailment logging on SolarLive",
    ],
}
