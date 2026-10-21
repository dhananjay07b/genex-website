from ..builders import (
    capabilities, cards, contact, cta, faq, hero, highlights, overview,
    product, related, side, stats, steps,
)

PAGE = {
    "key": "scada",
    "tags": ["Grid & SCADA"],
    "seo_title": "SCADA Platform for Solar Plants, Substations and BESS",
    "search_description": (
        "Genex SCADA for power plants and substations up to 220 kV. IEC 61850, IEC 60870-5-104, "
        "DNP3 and Modbus, redundant servers, historian and SLDC data exchange. 80+ deployments."
    ),
    "body": [
        hero(
            label="Grid & SCADA",
            heading="Supervisory control for plants and substations up to 220 kV",
            description=(
                "The Genex SCADA platform gives control rooms live visibility and control over "
                "generation, switching and protection, with the redundancy that grid operations demand."
            ),
            cta_text="Discuss Your SCADA Requirement",
            cta_link=contact(),
            image_hint="Control room with SCADA screens, or a substation switchyard at dusk",
        ),
        stats("", [
            ("80", "+", "SCADA systems commissioned"),
            ("220", "kV", "Highest voltage level in service"),
            ("<1", "s", "Data acquisition cycle"),
            ("1", "ms", "Event time-stamp resolution from IEDs"),
            ("2", "", "Servers in hot standby on every critical system"),
            ("4", "", "Native protocol families"),
        ]),
        overview("Control rooms run on trust in the data", [
            "A SCADA system has one job above all: show the operator what is really happening in the "
            "field, fast enough to act on it. If a breaker status is stale or an alarm arrives late, "
            "every decision made from that screen is a guess.",
            "The Genex SCADA platform is built for power assets: solar and wind plants, battery storage, "
            "pooling substations and industrial distribution networks. It talks to protection relays, "
            "meters, RTUs and inverters in their own protocols, stores every value in a historian, and "
            "passes the required data to the State Load Despatch Centre.",
            "Our engineers configure, test and commission each system, from the single-line diagram on "
            "the HMI to the last signal in the point list. The same team supports it after handover.",
        ]),
        highlights("Built to Grid Standards", (
            "Protocol support and redundancy are designed in from the start, not added at the end of "
            "a project."
        ), [
            ("icon", "Hub", "IEC 61850 with GOOSE", "MMS client for IEDs and GOOSE for fast peer messaging", "Substation native"),
            ("timeline", "Sync", "Hot-standby redundancy", "A mirrored server takes over automatically on failure", "Automatic failover"),
            ("signal", "CellTower", "Grid data exchange", "IEC 60870-5-104 link to SLDC and RLDC", "Utility ready"),
            ("ring_stat", "Speed", "Fast acquisition", "Analog and status values refreshed every second", "<1 s"),
            ("security", "Lock", "Secure by design", "Role-based access, audit logs and segregated networks", "Least privilege"),
            ("diagram", "Analytics", "Long-term historian", "Every point stored for trends and post-event analysis", "Years online"),
        ]),
        side(
            "How a Genex SCADA system is layered",
            "Each layer has a clear boundary, which keeps the control system stable when one part is "
            "being maintained or expanded.",
            "left",
            "SCADA architecture from field devices to control room",
            bullets=[
                ("Field level", "Protection relays, energy meters, inverters, transformer monitors and weather stations, each with its native protocol."),
                ("Bay and gateway level", "RTUs and protocol gateways that collect field signals and pass them on over a fibre ring or station LAN."),
                ("Station level", "Redundant SCADA servers, the historian and the HMI workstations used by the control room."),
                ("Remote level", "Data to SLDC and RLDC over IEC 60870-5-104, and to owners through the Genex cloud platform."),
            ],
            image_hint="Architecture diagram, or a photo of a SCADA server rack and network panel",
        ),
        cards("Where it is deployed", (
            "The core platform is the same across asset types. Screens, point lists and control logic "
            "are engineered for each one."
        ), [
            ("SolarPower", "Utility-scale solar", "Plant-wide monitoring, inverter control and the power plant controller that holds export at the scheduled value.", "Inverter to POI"),
            ("Business", "Substations", "Bay control, breaker and isolator status, protection events and transformer monitoring up to 220 kV.", "Up to 220 kV"),
            ("WindPower", "Wind farms", "Turbine and pooling substation data in one system, with grid limits passed down to the turbines.", "Pooling substation"),
            ("BatteryChargingFull", "Battery storage", "BESS status, power commands and grid interface for standalone and co-located storage.", "With Genex EMS"),
            ("Factory", "Industrial networks", "HT and LT distribution, DG sets and critical feeders for plants and large campuses.", "HT and LT"),
            ("AccountBalance", "Utilities", "Distribution substations and feeder monitoring for discoms modernising their networks.", "Discom ready"),
        ]),
        capabilities("Platform capabilities", [
            ("Dashboard", "Single-line diagram HMI with live status"),
            ("NotificationsActive", "Alarm management with priority and acknowledgement"),
            ("History", "Sequence of events with millisecond time stamps"),
            ("Analytics", "Historian with trends and data export"),
            ("Tune", "Remote control with select-before-operate"),
            ("Assessment", "Daily, monthly and grid-compliance reports"),
            ("Schedule", "GPS or NTP time synchronisation"),
            ("Groups", "User roles for operators, engineers and managers"),
        ]),
        steps("From point list to commissioning", (
            "Every SCADA project follows the same tested sequence. Most of the risk is removed before "
            "the system reaches site."
        ), [
            ("Requirement and point list", "We agree the signal list, control functions, screens and grid data exchange with the owner and the EPC.", "DescriptionOutlined"),
            ("Engineering", "Communication architecture, database, HMI screens and reports are built against the approved point list.", "Engineering"),
            ("Factory acceptance test", "The full system is tested at our facility with simulated field signals, witnessed by the client.", "VerifiedOutlined"),
            ("Installation", "Servers, network and gateways are installed on site and connected to field devices.", "Storage"),
            ("Site acceptance test", "Each signal is checked end to end from the field device to the HMI and the SLDC link.", "CheckCircleOutlined"),
            ("Handover and support", "Operators are trained, documentation is handed over and support continues under an agreed service plan.", "Groups"),
        ]),
        faq("Frequently asked questions", [
            ("Which protocols does the platform support?",
             "IEC 61850 (MMS and GOOSE), IEC 60870-5-101 and 104, DNP3, Modbus RTU and Modbus TCP, "
             "and OPC UA. Other protocols can be added through gateways."),
            ("Can it send data to SLDC as required for renewable plants?",
             "Yes. The platform provides the IEC 60870-5-104 link and the signal list required by the "
             "State Load Despatch Centre, and we support testing with the SLDC during commissioning."),
            ("What happens if a SCADA server fails?",
             "On critical systems, a standby server runs in parallel with the same data. If the "
             "primary fails, the standby takes over automatically and operators keep working."),
            ("Can you extend an existing SCADA system from another vendor?",
             "Often, yes. We can integrate the existing system as a data source or replace it in "
             "stages. A site survey tells us which approach is safer and cheaper."),
        ]),
        related("Works alongside", ["ems-bess", "wind-network", "power-cloud"],
                "Systems that run under or alongside the SCADA platform."),
        cta(
            "Planning a plant or substation?",
            "Send us the single-line diagram and the grid connection details. We will come back with "
            "a SCADA architecture and a point list to start from.",
            "Start a SCADA Project", contact(),
            "Explore EMS for BESS", product("ems-bess"),
        ),
    ],
    "confirm": [
        "80+ deployments, 220 kV highest level, <1 s acquisition (from earlier site data)",
        "1 ms event time stamps, hot standby on every critical system",
        "Protocol list: IEC 61850 MMS/GOOSE, IEC 101/104, DNP3, Modbus, OPC UA",
        "Power plant controller for solar export control",
        "FAT at Genex facility witnessed by client",
    ],
}
