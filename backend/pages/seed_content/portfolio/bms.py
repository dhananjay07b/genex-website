from ..builders import (
    capabilities, cards, contact, cta, faq, hero, highlights, overview,
    product, related, side, stats,
)

PAGE = {
    "key": "bms",
    "tags": ["Energy Storage"],
    "seo_title": "Battery Management System (BMS) for LFP and NMC Storage",
    "search_description": (
        "Cell-level battery management for stationary storage. Voltage, temperature and "
        "SoC monitoring, passive balancing and hardware protection for LFP, NMC and lead-acid packs."
    ),
    "body": [
        hero(
            label="Energy Storage",
            heading="Protection and insight at the level of every cell",
            description=(
                "The Genex BMS watches each cell's voltage and temperature, keeps the pack balanced, "
                "and disconnects the battery before a fault can become a failure."
            ),
            cta_text="Discuss Your Battery Project",
            cta_link=contact(),
            image_hint="Close-up of battery modules or a rack-mounted BMS controller with wiring",
        ),
        overview("A battery pack is only as good as its weakest cell", [
            "A storage battery is built from hundreds or thousands of cells in series and parallel. "
            "They leave the factory closely matched, but they do not age at the same rate. A cell near "
            "the warm end of a rack or one with slightly higher resistance drifts away from its "
            "neighbours over time. Once that happens, the weakest cell decides when charging must "
            "stop and when discharge must end, and the rest of the pack's capacity goes unused.",
            "The Battery Management System is the layer that prevents this. It measures every cell, "
            "balances charge between them, estimates how much energy is left, and opens the main "
            "contactors if voltage, current or temperature move outside safe limits. It is the last "
            "line of protection between a healthy battery and a thermal event.",
            "Genex designs its BMS for stationary storage: solar and storage systems, commercial and "
            "industrial backup, telecom sites and grid-scale BESS. It reports to the Genex EMS or to "
            "any third-party controller over standard protocols, so it fits into systems we did not "
            "build as easily as ones we did.",
        ]),
        highlights("Engineered for Safety", (
            "Protection decisions are made locally, in hardware and firmware, so the battery stays "
            "safe even when the network or the upstream controller does not respond."
        ), [
            ("ring_stat", "Speed", "Fast cell sampling", "Cell voltage and temperature read below one second", "<1 s"),
            ("security", "ShieldOutlined", "Two layers of protection", "Firmware limits backed by hardware cut-offs", "Fail-safe"),
            ("icon", "MemoryOutlined", "Open communication", "CAN 2.0B, Modbus RTU and Modbus TCP", "Any EMS or PCS"),
            ("diagram", "Analytics", "State of health tracking", "Capacity fade and resistance growth logged over time", "Warranty evidence"),
            ("timeline", "History", "Event recorder", "Every alarm and trip stored with a timestamp", "Root-cause ready"),
            ("signal", "CellTower", "Remote visibility", "Cell data available on the Genex cloud platform", "4G or Ethernet"),
        ]),
        side(
            "What the BMS measures, cell by cell",
            "Every reading feeds three jobs: keeping the battery safe, keeping it balanced, and "
            "telling the operator how much usable energy is really there.",
            "left",
            "Battery rack with cell monitoring boards and wiring",
            bullets=[
                ("Cell voltage", "Measured on every series cell. For LFP chemistry the safe window is roughly 2.5 V to 3.65 V per cell, and the BMS acts well inside those limits."),
                ("Temperature", "Sensors across each module track hot spots. Charging lithium cells below 0 °C damages them, so charge current is reduced or blocked in the cold."),
                ("Pack current", "A shunt or Hall-effect sensor measures current in both directions, which drives overcurrent protection and charge counting."),
                ("Insulation", "On high-voltage packs, insulation resistance to earth is monitored so a wiring fault is caught before it becomes a shock or fire risk."),
            ],
            text=(
                "LFP has a very flat voltage curve between 20% and 80% charge, so voltage alone says "
                "little about state of charge. The Genex BMS combines current counting with voltage "
                "correction at the ends of the curve to keep the SoC estimate honest."
            ),
            image_hint="Battery rack with monitoring boards visible, or BMS wiring inside a module",
        ),
        stats("Deployed across storage projects", [
            ("500", "+", "BMS units in service"),
            ("35", "%", "Average battery life gained versus unmanaged packs"),
            ("3", "", "Chemistries supported: LFP, NMC, lead-acid"),
        ]),
        cards("Protection functions", (
            "Each protection has a warning level, which tells the EMS to reduce power, and a trip "
            "level, which opens the contactors. Thresholds are set per project from the cell "
            "manufacturer's datasheet."
        ), [
            ("Bolt", "Overvoltage", "Stops charging when any single cell reaches its upper limit, even if the pack average looks normal.", "Per-cell, not per-pack"),
            ("BatteryChargingFull", "Undervoltage", "Ends discharge before the weakest cell is over-discharged, which can cause permanent capacity loss.", "Protects cycle life"),
            ("ElectricBolt", "Overcurrent and short circuit", "Limits current to the cell rating and opens the circuit within milliseconds on a short.", "Hardware trip path"),
            ("Thermostat", "Over and under temperature", "Reduces or blocks charge and discharge outside the safe temperature band for the chemistry.", "Charge blocked below 0 °C"),
            ("Tune", "Cell imbalance", "Bleeds excess charge from the highest cells during charging so the whole pack reaches full together.", "Passive balancing"),
            ("WarningAmber", "Insulation fault", "Detects a drop in insulation resistance between the battery and earth on high-voltage systems.", "High-voltage packs"),
        ]),
        capabilities("Inside the Genex BMS", [
            ("Sensors", "Per-cell voltage and multi-point temperature monitoring"),
            ("Speed", "State of charge and state of health estimation"),
            ("Tune", "Passive cell balancing with configurable thresholds"),
            ("ShieldOutlined", "Contactor and pre-charge control"),
            ("NotificationsActive", "Two-level alarms: warning and trip"),
            ("History", "On-board event log with timestamps"),
            ("Hub", "Integration with Genex EMS and third-party PCS"),
            ("Cloud", "Remote cell data on the Genex cloud platform"),
        ]),
        faq("Frequently asked questions", [
            ("Which battery chemistries does the BMS support?",
             "LFP, NMC and lead-acid. Voltage, temperature and current limits are set from the cell "
             "manufacturer's datasheet for each project, so the same platform works across chemistries."),
            ("Can the Genex BMS work with an inverter or EMS from another manufacturer?",
             "Yes. It communicates over CAN 2.0B, Modbus RTU and Modbus TCP. We share the register "
             "map with the integrator and confirm it during commissioning."),
            ("What is the difference between passive and active balancing?",
             "Passive balancing bleeds a small amount of energy from the highest cells as heat so the "
             "others can catch up. Active balancing moves energy between cells. For stationary LFP "
             "storage, well-managed passive balancing is reliable, simple and low-cost."),
            ("What happens if communication with the EMS is lost?",
             "The BMS keeps protecting the battery on its own. Every protection runs locally, and the "
             "contactors open if any limit is crossed, whether or not an upstream controller responds."),
            ("Can the BMS data support a warranty claim?",
             "Yes. Cell voltages, temperatures, cycle counts and every alarm are logged with timestamps, "
             "which gives a clear record of how the battery was operated."),
        ]),
        related("Part of the storage stack", ["ems-bess", "data-loggers", "power-cloud"],
                "The BMS protects the cells. These systems decide how the battery is used and report on it."),
        cta(
            "Building or upgrading a battery system?",
            "Tell us the chemistry, pack voltage and capacity. Our engineers will recommend a BMS "
            "configuration and the protection settings to match.",
            "Talk to an Engineer", contact(),
            "See EMS for BESS", product("ems-bess"),
        ),
    ],
    "confirm": [
        "500+ BMS units in service and 35% average battery life gain (from earlier site data)",
        "3 chemistries supported (the earlier site said 5 but only listed 3)",
        "Sub-second cell sampling and hardware cut-off path",
        "Insulation monitoring on high-voltage packs",
        "Passive balancing (not active) as the current design",
        "Cloud visibility of cell data over 4G or Ethernet",
    ],
}
