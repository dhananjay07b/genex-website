from ..builders import (
    capabilities, cards, contact, cta, faq, hero, highlights, overview,
    product, related, side, stats, steps,
)

PAGE = {
    "key": "data-loggers",
    "tags": ["Solar & Monitoring", "Hardware"],
    "seo_title": "Industrial Data Loggers and IoT Gateways for Energy Sites",
    "search_description": (
        "Genex data loggers read inverters, meters and sensors over RS485 and Ethernet, buffer data "
        "for 30 days offline and send it securely to the cloud. 5,000+ units deployed."
    ),
    "body": [
        hero(
            label="Edge Hardware",
            heading="The field device every monitoring system depends on",
            description=(
                "Genex data loggers collect readings from inverters, meters and sensors, keep them safe "
                "when the network drops, and deliver them to the cloud without gaps."
            ),
            cta_text="Get a Logger Quote",
            cta_link=contact(),
            image_hint="Genex data logger mounted in a panel with RS485 and Ethernet cables connected",
        ),
        stats("Proven in the field", [
            ("5,000", "+", "Loggers deployed"),
            ("30", "days", "Data stored on board without network"),
            ("10", "+ yrs", "Design life"),
            ("1", "min", "Standard polling interval"),
            ("32", "", "Devices per RS485 port"),
            ("4G", "", "LTE with Ethernet fallback"),
        ]),
        overview("Monitoring is only as reliable as its weakest link", [
            "Dashboards, alarms and reports all start with a small box in an inverter room or a panel on "
            "a rooftop. If that box loses data during a network outage, misreads a register or stops after "
            "a summer of 50 °C heat, every system above it reports the wrong picture.",
            "Genex designs its data loggers for exactly those conditions. They read devices over the "
            "industrial protocols used on Indian energy sites, store everything locally, and send data "
            "on in order once a connection is available. Nothing is skipped and nothing is duplicated.",
            "The same logger family powers SolarLive, the PM-KUSUM RMS and our cloud platform, and can "
            "also feed third-party software over standard protocols.",
        ]),
        cards("Hardware at a glance", (
            "Typical specification of the standard Genex logger. Variants are available for larger sites "
            "and special enclosures."
        ), [
            ("Lan", "Field interfaces", "Two isolated RS485 ports and an Ethernet port for Modbus RTU and Modbus TCP devices.", "Isolated RS485"),
            ("CellTower", "Connectivity", "4G LTE with a fallback to 2G, plus Ethernet or Wi-Fi where site broadband is available.", "Auto failover"),
            ("Storage", "On-board storage", "Enough flash memory to hold a month of one-minute data from a typical plant.", "30 days buffer"),
            ("Power", "Power supply", "Wide-range DC input or AC adapter, with surge protection for field wiring.", "Surge protected"),
            ("Thermostat", "Operating range", "Industrial-grade components rated for hot inverter rooms and outdoor panels.", "Built for Indian summers"),
            ("Layers", "Mounting", "DIN-rail mounting to fit standard panels, with clear port labelling for field teams.", "DIN rail"),
        ]),
        side(
            "What connects to it",
            "One logger reads every device on a typical site, whatever the brand, and maps it to a "
            "common data model before sending.",
            "right",
            "Wiring diagram of a logger connected to inverters, meters and sensors",
            bullets=[
                ("Inverters", "String and central inverters over Modbus RTU or Modbus TCP, including SunSpec-compliant models."),
                ("Energy meters", "ABT, net and sub-meters for import, export and consumption."),
                ("Sensors", "Pyranometers, temperature sensors, anemometers and flow meters through Modbus or analog inputs."),
                ("Controllers", "Pump drives, BMS units, DG controllers and relays that expose data over Modbus."),
            ],
            image_hint="Panel photo with logger and labelled cables, or a connection diagram",
        ),
        highlights("Engineered for the Edge", (
            "Design choices that keep data flowing from sites with heat, dust and patchy networks."
        ), [
            ("ring_stat", "Storage", "No data loss", "Readings stored locally and sent in order on reconnect", "30 days"),
            ("signal", "CellTower", "Network failover", "Switches between LTE, 2G and Ethernet automatically", "Always reporting"),
            ("security", "Lock", "Secure transport", "Encrypted connection to the cloud, no open inbound ports", "TLS"),
            ("timeline", "Sync", "Remote management", "Configuration and firmware updates over the air", "No site visit"),
            ("icon", "Hub", "Open protocols", "Modbus RTU, Modbus TCP, MQTT and HTTPS", "Vendor neutral"),
            ("diagram", "Speed", "Flexible polling", "From seconds to minutes, set per device", "Per-device rate"),
        ]),
        steps("Installing a logger", (
            "A standard site is wired and reporting in under a day."
        ), [
            ("Device list", "We collect the model and Modbus settings of every device on site before the visit.", "DescriptionOutlined"),
            ("Pre-configuration", "The logger is loaded with the site's device map before dispatch, so field setup is minimal.", "Tune"),
            ("Mounting and wiring", "The logger is mounted on DIN rail, wired to the RS485 bus and Ethernet, and powered up.", "Engineering"),
            ("Live check", "Each device is confirmed reporting correctly on the cloud dashboard before the team leaves site.", "CheckCircleOutlined"),
        ]),
        capabilities("Logger features", [
            ("Lan", "Isolated RS485 and Ethernet interfaces"),
            ("CellTower", "4G LTE with automatic network fallback"),
            ("Storage", "30-day on-board data buffer"),
            ("Sync", "Over-the-air configuration and firmware updates"),
            ("Lock", "Encrypted data transfer to the cloud"),
            ("Hub", "Data delivery to Genex or third-party platforms"),
        ]),
        faq("Frequently asked questions", [
            ("How many devices can one logger read?",
             "Each RS485 port supports up to 32 standard devices on one bus segment, which covers most "
             "plants. Larger sites use additional ports, repeaters or a second logger."),
            ("Can the logger send data to our own software?",
             "Yes. Data can be pushed to third-party platforms over MQTT or HTTPS, as well as to Genex "
             "systems."),
            ("What happens during a long network outage?",
             "The logger keeps recording and stores up to 30 days of data. When the connection returns, "
             "it uploads the backlog in order alongside new readings."),
            ("Does Genex supply the SIM card?",
             "We can supply a managed data SIM with the logger, or the site can use its own SIM or "
             "broadband connection."),
        ]),
        related("Platforms it powers", ["solarlive", "rms-kusum", "power-cloud"],
                "Software that runs on data from Genex loggers."),
        cta(
            "Need reliable data from the field?",
            "Tell us the devices on your site and how many sites you have. We will recommend a logger "
            "configuration and send a quote.",
            "Request a Quote", contact(),
        ),
    ],
    "confirm": [
        "5,000+ units, 30-day buffer, 10+ year life (from earlier site data)",
        "Hardware spec: 2 isolated RS485, Ethernet, 4G with 2G fallback, Wi-Fi, DIN rail, wide DC input",
        "MQTT/HTTPS push to third-party platforms",
        "Managed data SIM option",
        "Under-a-day standard installation",
    ],
}
