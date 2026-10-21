from ..builders import (
    capabilities, contact, cta, faq, gallery, hero, highlights,
    overview, product, related_innovations, side, stats,
)

PAGE = {
    "key": "advanced-scada",
    "tags": ["Monitoring"],
    "seo_title": "Advanced SCADA: Web HMI, Digital Substations and Plant Control",
    "search_description": (
        "The next generation of Genex SCADA: browser-based HMI, IEC 61850 digital substation "
        "support, power plant control for renewables and cyber security built to IEC 62443."
    ),
    "body": [
        hero(
            label="Grid Innovation",
            heading="SCADA rebuilt for digital substations and renewable plants",
            description=(
                "Advanced SCADA is where Genex takes supervisory control next: browser-based "
                "operation, digital substation protocols and closed-loop control of renewable plants."
            ),
            cta_text="Talk to Our SCADA Team",
            cta_link=contact(),
        ),
        stats("", [
            ("80", "+", "SCADA systems in service"),
            ("220", "kV", "Highest voltage level"),
            ("<1", "s", "Data acquisition cycle"),
        ]),
        overview("Why SCADA needed rethinking", [
            "Conventional SCADA was designed for a world of thick-client workstations in one control "
            "room, copper-wired substations and large thermal plants that change output slowly. Each of "
            "those assumptions has changed.",
            "Engineers now need to see a plant from a laptop at site, a tablet in the switchyard or a "
            "monitoring centre in another state. Substations are moving from copper wiring to fibre and "
            "IEC 61850 messaging. Solar, wind and storage plants change output in seconds and must hold "
            "the voltage and power the grid operator asks for.",
            "Advanced SCADA is our answer to those changes. It keeps the reliability that control rooms "
            "depend on and adds the access, protocols and control logic that new assets need.",
        ]),
        side(
            "An HMI that runs in the browser",
            "Operators open the same live single-line diagrams on a control room screen, a laptop or a "
            "tablet, with no client software to install or update.",
            "left",
            "Browser-based SCADA single-line diagram on a laptop",
            bullets=[
                ("Any authorised device", "Screens adapt from a video wall to a tablet, with the same live data and alarms."),
                ("One place to update", "Screens and point lists are changed once on the server and every user sees the update."),
                ("Role-based control", "Viewing, acknowledging and operating are separate permissions, assigned per user and per site."),
            ],
            image_hint="Laptop or tablet showing a SCADA single-line diagram",
        ),
        side(
            "Ready for the digital substation",
            "IEC 61850 moves substation signals from copper wires to a fibre network. Advanced SCADA is "
            "built to work with that architecture from the start.",
            "right",
            "Fibre network switches and IEDs in a digital substation panel",
            bullets=[
                ("MMS client", "Reads data and sends commands to protection relays and bay controllers using the IEC 61850 data model."),
                ("GOOSE monitoring", "Tracks peer-to-peer GOOSE messages between IEDs, so a missing interlock signal is visible at once."),
                ("SCL import", "Builds the SCADA database from the substation configuration files, which cuts engineering time and typing errors."),
            ],
            image_hint="Substation relay panel with fibre patch cords, or IEDs mounted in a bay panel",
        ),
        highlights("What Is New", (
            "The capabilities that separate Advanced SCADA from a conventional system."
        ), [
            ("icon", "LanguageOutlined", "Web-native HMI", "Live screens in any modern browser, no client install", "HTML5"),
            ("timeline", "Hub", "IEC 61850 Edition 2", "MMS, GOOSE monitoring and SCL-based engineering", "Digital substation"),
            ("ring_stat", "Speed", "Power plant control", "Closed-loop active and reactive power control", "Seconds, not minutes"),
            ("security", "Lock", "Security by design", "Built to the zones and conduits model of IEC 62443", "IEC 62443"),
            ("diagram", "Analytics", "Built-in analytics", "Trends, KPIs and reports from the historian", "No extra tools"),
            ("signal", "Cloud", "Edge to cloud", "Site SCADA keeps running; summary data goes to the cloud", "Local first"),
        ]),
        side(
            "Power plant control for renewables",
            "Grid operators expect solar, wind and storage plants to behave like conventional generators "
            "at the point of interconnection. The power plant controller makes that possible.",
            "left",
            "Solar plant pooling substation at the point of interconnection",
            bullets=[
                ("Active power", "Holds plant export at the scheduled value and applies ramp-rate limits."),
                ("Reactive power and voltage", "Uses inverter reactive capability to support voltage at the grid connection."),
                ("Frequency response", "Reduces output when grid frequency rises above the set band, as grid codes require."),
            ],
            text=(
                "The controller measures at the point of interconnection and sends setpoints to every "
                "inverter or turbine, adjusting continuously so the plant output matches the instruction."
            ),
            image_hint="Pooling substation or plant switchyard next to a solar field",
        ),
        gallery([
            ("Control room operators monitoring a power network", "Modern control room with operators at screens"),
            ("Substation switchyard with breakers and isolators", "Substation switchyard, wide shot"),
            ("Relay and control panels in a substation building", "Row of protection and control panels"),
            ("SCADA servers in a network rack", "Server rack with network equipment"),
        ]),
        capabilities("Built into the platform", [
            ("Dashboard", "Browser-based single-line diagrams and dashboards"),
            ("Hub", "IEC 61850, IEC 60870-5-104, DNP3, Modbus and OPC UA"),
            ("Speed", "Power plant controller for solar, wind and storage"),
            ("Sync", "Hot-standby servers with automatic failover"),
            ("Lock", "Role-based access, audit trail and secure remote access"),
            ("History", "Historian with millisecond sequence of events"),
        ]),
        faq("Frequently asked questions", [
            ("How is Advanced SCADA different from the Genex SCADA Platform?",
             "The SCADA Platform is the proven system running at our installed sites. Advanced SCADA is its "
             "next generation, adding the browser HMI, deeper IEC 61850 engineering and power plant control. "
             "New projects can start on Advanced SCADA, and existing sites can move to it in stages."),
            ("Is a browser-based HMI secure enough for a control room?",
             "Access goes through authenticated, encrypted sessions with role-based permissions, and control "
             "actions can be limited to specific networks or devices. The design follows the zones and "
             "conduits approach of IEC 62443."),
            ("Can it work with relays from different manufacturers?",
             "Yes. IEC 61850 is a vendor-neutral standard, and the SCADA database can be built from the "
             "configuration files that each relay manufacturer's tools export."),
            ("Does the power plant controller meet Indian grid code requirements?",
             "It is designed for the active power, reactive power and frequency response functions the grid "
             "codes call for. Settings and tests are agreed with the transmission utility for each project."),
        ]),
        related_innovations("Related innovations", [
            ("re-nms", "Hub"), ("smart-grid", "ElectricBolt"), ("ems-bess", "BatteryChargingFull"),
        ], "Other Genex work in grid and plant control."),
        cta(
            "Planning a substation or plant control system?",
            "Share the single-line diagram and grid connection requirements. Our engineers will show you "
            "how Advanced SCADA would be set up for it.",
            "Request a Technical Discussion", contact(),
            "See the SCADA Platform", product("scada"),
        ),
    ],
    "confirm": [
        "80+ SCADA systems in service (the old Innovations page said 100+, Portfolio says 80+; pick one)",
        "Browser HMI, SCL import, GOOSE monitoring and power plant controller as delivered features",
        "IEC 62443 design approach (not a certification claim)",
    ],
}
