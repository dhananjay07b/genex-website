from ..builders import (
    cards, contact, cta, faq, hero, highlights, intro, related, side,
    stats, steps,
)

PAGE = {
    "key": "rms-kusum",
    "tags": ["Solar & Monitoring", "PM-KUSUM"],
    "seo_title": "Remote Monitoring System (RMS) for PM-KUSUM Solar Pumps",
    "search_description": (
        "RMS for PM-KUSUM solar pumps and feeder solarisation. Daily water output, energy and "
        "fault data from thousands of rural sites, with state-format reports. 2,000+ sites in 8 states."
    ),
    "body": [
        hero(
            label="PM-KUSUM",
            heading="Every solar pump in the field, visible from one screen",
            description=(
                "The Genex RMS reports water output, energy and faults from solar pumps and "
                "feeder-level plants under PM-KUSUM, even from villages with weak mobile coverage."
            ),
            cta_text="Talk to Our PM-KUSUM Team",
            cta_link=contact(),
            image_hint="Solar water pump installation in a farm field, panels with the pump controller visible",
        ),
        intro("Monitoring is part of the scheme, not an add-on", [
            "PM-KUSUM is the Government of India's programme to bring solar power to farms. "
            "It supports standalone solar pumps, the solarisation of existing grid-connected pumps, "
            "and small solar plants feeding rural distribution feeders.",
            "For pumps installed under the scheme, suppliers are expected to provide remote "
            "monitoring through the maintenance period, so that state agencies can see whether "
            "each subsidised pump is actually working. A pump that stopped in its second month "
            "and was never reported is a failure for the farmer, the supplier and the agency.",
        ], note="Pradhan Mantri Kisan Urja Suraksha evam Utthan Mahabhiyan (PM-KUSUM)"),
        stats("RMS in the field", [
            ("2,000", "+", "PM-KUSUM sites monitored"),
            ("8", "", "States covered"),
            ("99", "%", "Data availability"),
            ("15", "min", "Reporting interval from each pump"),
            ("7", "days", "Data stored on the device if the network fails"),
            ("24", "h", "Typical time to flag a pump that has stopped"),
        ]),
        cards("Built for all three scheme components", (
            "Each component has different equipment and different people who need the data. The RMS "
            "uses one platform with views set up for each."
        ), [
            ("SolarPower", "Component A: Decentralised plants",
             "Solar plants of 500 kW to 2 MW on farmland, supplying power to the local substation. "
             "The RMS tracks generation, export and plant availability for the developer and discom.",
             "Generation and export"),
            ("WaterDrop", "Component B: Standalone pumps",
             "Off-grid solar pumps that replace diesel pumps. The RMS reports daily water output, "
             "running hours, energy and faults for each pump.",
             "Water output per day"),
            ("ElectricBolt", "Component C: Grid-connected pumps",
             "Existing grid pumps and agricultural feeders solarised so farmers can use solar power "
             "and sell the surplus. The RMS reads generation and grid exchange.",
             "Pump and feeder level"),
        ]),
        side(
            "What the RMS reads from each pump",
            "A GSM-based RMS unit inside or beside the pump controller collects readings and sends "
            "them to the Genex platform. Field staff never need to visit a site to fill a report.",
            "right",
            "Solar pump controller with RMS unit installed",
            bullets=[
                ("Solar input", "Array voltage, current and power, which shows whether panels are clean and producing as expected."),
                ("Pump operation", "Motor frequency, current and running hours, along with start and stop times for each day."),
                ("Water output", "Daily discharge in litres, measured or calculated from pump curves, the figure agencies care about most."),
                ("Faults", "Dry run, overload, overvoltage and communication loss, each raised as an alert to the service team."),
            ],
            image_hint="Pump controller box open with the RMS module visible, or a technician at a pump site",
        ),
        highlights("Made for Rural Conditions", (
            "Farm sites have weak networks, unstable power and no on-site staff. The RMS hardware and "
            "software are designed around those limits."
        ), [
            ("signal", "CellTower", "Works on 2G, 4G and NB-IoT", "Picks whichever network reaches the village", "Multi-network"),
            ("timeline", "History", "Stores data during outages", "Readings held on the device and sent once coverage returns", "No gaps"),
            ("icon", "MemoryOutlined", "Standard controller interface", "Modbus RTU over RS485 to pump drives", "Major pump brands"),
            ("diagram", "Assessment", "State-ready reports", "Reports in the formats state agencies ask for", "No manual collation"),
        ]),
        steps("From factory to farm", (
            "RMS units are prepared before dispatch so installation teams only need to mount and "
            "power them. Sites appear on the dashboard as soon as they are switched on."
        ), [
            ("Pre-configuration", "Each RMS unit is linked to its pump serial number and SIM card at our facility before it is shipped.", "Tune"),
            ("Installation at site", "The unit is fitted with the pump controller during installation. There are no settings to change in the field.", "Agriculture"),
            ("Automatic registration", "On first power-up the unit reports its location and appears on the dashboard against the beneficiary record.", "LocationOn"),
            ("Reporting and service", "Daily and monthly reports go to the supplier and state agency, and faults go straight to the service team.", "Assessment"),
        ]),
        faq("Common questions", [
            ("Does the RMS work with pumps from any manufacturer?",
             "It works with pump controllers that expose data over Modbus RTU, which covers most "
             "controllers supplied under the scheme. We confirm compatibility for each model before supply."),
            ("What happens when there is no mobile network at the site?",
             "The unit stores readings for up to seven days and uploads them in order when the network "
             "returns. Reports update automatically, so no data is lost."),
            ("Can state nodal agencies get their own access?",
             "Yes. Agencies can be given read-only access to the sites in their district or state, with "
             "the same reports the supplier sees."),
            ("Can farmers see their own pump data?",
             "Yes. A simple mobile view shows each farmer their pump's daily water output and running "
             "hours, in a format that is easy to read on a basic smartphone."),
        ]),
        related("Related systems", ["data-loggers", "solarlive", "power-cloud"],
                "The hardware and platforms the RMS is built on."),
        cta(
            "Supplying pumps under PM-KUSUM?",
            "Tell us the state, the number of pumps and the controller model. We will confirm "
            "compatibility and share a sample monthly report.",
            "Request a Sample Report", contact(),
        ),
    ],
    "confirm": [
        "2,000+ sites, 8 states, 99% data availability (from earlier site data)",
        "15-minute reporting interval, 7-day on-device storage, 24-hour stopped-pump detection",
        "2G / 4G / NB-IoT support",
        "Water output measured or calculated from pump curves",
        "Farmer mobile view and state agency read-only access",
        "Scheme wording: check the latest MNRE guidelines for the RMS requirement and the component details before publishing",
    ],
}
