from ..builders import (
    capabilities, cards, contact, cta, faq, hero, highlights, intro, product,
    related, side, stats, steps,
)

PAGE = {
    "key": "ev-software",
    "tags": ["EV & Power Tools"],
    "seo_title": "EV Charging Management Software (OCPP) for Fleets and Operators",
    "search_description": (
        "OCPP charge point management for EV fleets, campuses and public operators. Remote "
        "control, user authentication, billing and load management within sanctioned load. 500+ chargers managed."
    ),
    "body": [
        hero(
            label="EV Charging",
            heading="Run every charger on one platform, whoever built it",
            description=(
                "Genex EV Software Management connects OCPP chargers from any manufacturer, controls "
                "sessions and billing, and keeps total charging load inside the limits of your connection."
            ),
            cta_text="See the Platform",
            cta_link=contact(),
            image_hint="Row of EV chargers in use at a fleet depot or office car park",
        ),
        intro("Chargers are hardware. The business runs on software.", [
            "A charger on its own can only deliver energy. Knowing who is charging, what they owe, "
            "whether the charger is healthy, and how many vehicles the site can charge at once without "
            "tripping the main breaker all depends on the management software behind it.",
            "Genex built its platform on OCPP, the open protocol most charger manufacturers support. "
            "That keeps operators free to buy chargers from more than one supplier and to change "
            "suppliers later without replacing the software.",
        ], note="Open Charge Point Protocol (OCPP) 1.6J and 2.0.1"),
        cards("Who uses it", (
            "The platform is the same for every operator. Access rules, pricing and reports are set "
            "up for how each one runs."
        ), [
            ("EvStation", "Charge point operators", "Public networks with pay-per-use pricing, live availability and remote fault handling across cities.", "Public charging"),
            ("Work", "Fleet operators", "Depot charging for buses, delivery vans and cabs, with schedules that have vehicles ready before each shift.", "Depot scheduling"),
            ("Business", "Offices and campuses", "Employee and visitor charging with access by RFID card and cost allocation by department.", "Workplace charging"),
            ("LocationOn", "Highway and destination sites", "Fast charging at fuel stations, hotels and malls, where uptime and quick payment matter most.", "Fast DC charging"),
            ("Groups", "Residential societies", "Shared chargers with fair use rules and monthly billing to each flat.", "Shared chargers"),
            ("Factory", "Dealers and OEMs", "Demo and service-bay chargers managed across a dealer network from one account.", "Multi-site"),
        ]),
        stats("Platform scale", [
            ("500", "+", "Chargers managed"),
            ("40", "+", "Enterprise clients"),
            ("99.2", "%", "Charger uptime"),
        ]),
        side(
            "Inside a charging session",
            "Every session passes through the platform from the moment a driver arrives to the final "
            "invoice. Each step is logged so disputes can be settled from the record.",
            "right",
            "Driver starting a charging session with an RFID card or mobile app",
            bullets=[
                ("Authorise", "The driver starts with an RFID card, a QR code or the mobile app. The platform checks the account before power flows."),
                ("Charge", "Power is set by the platform's load plan. The driver sees energy delivered and estimated cost in real time."),
                ("Stop and bill", "When the session ends, energy is metered, the tariff is applied and the invoice or wallet deduction is created."),
                ("Report", "Session data feeds daily revenue, utilisation and energy reports for each site and charger."),
            ],
            image_hint="Close-up of a driver tapping an RFID card or scanning a QR code at a charger",
        ),
        highlights("Under the Hood", (
            "The parts of the platform that keep chargers available and sites inside their electrical limits."
        ), [
            ("ring_stat", "EvStation", "OCPP 1.6J and 2.0.1", "Older and newer chargers managed side by side", "Open protocol"),
            ("diagram", "Speed", "Dynamic load management", "Shares available power across active chargers", "Within sanctioned load"),
            ("security", "Lock", "Secure access", "RFID, QR and app authorisation with user roles", "Per-user control"),
            ("signal", "CellTower", "Remote operations", "Reset, unlock and firmware updates over the air", "Fewer site visits"),
        ]),
        capabilities("Platform features", [
            ("EvStation", "Charger onboarding and remote configuration"),
            ("Smartphone", "Driver app for finding, starting and paying for sessions"),
            ("CurrencyRupee", "Flexible tariffs by time, energy or session"),
            ("ReceiptLong", "Automated invoices with GST details"),
            ("Speed", "Load balancing across chargers on one connection"),
            ("Schedule", "Fleet charging schedules by shift"),
            ("NotificationsActive", "Fault alerts and charger health monitoring"),
            ("Assessment", "Utilisation, revenue and energy reports"),
        ]),
        steps("Getting a site live", (
            "A new site can be running on the platform within days of the chargers being installed."
        ), [
            ("Site and charger review", "We confirm charger models, firmware versions, OCPP support and the site's sanctioned load.", "Engineering"),
            ("Charger onboarding", "Each charger is pointed to the Genex platform and tested for start, stop and metering.", "EvStation"),
            ("Pricing and access setup", "Tariffs, user groups, RFID cards and billing details are configured for the operator.", "Tune"),
            ("Go-live and support", "The site goes live with monitoring on day one, and our team handles first-line charger faults.", "VerifiedOutlined"),
        ]),
        faq("Frequently asked questions", [
            ("Which chargers can the platform manage?",
             "Any AC or DC charger that supports OCPP 1.6J or 2.0.1. This covers most chargers sold in "
             "India, including CCS2 and Bharat-standard units. We test new models before onboarding."),
            ("How does load management help my site?",
             "A site's connection has a fixed sanctioned load. Load management shares the available power "
             "between active chargers, so you can install more chargers than the connection could run at "
             "full power at once, without tripping the supply or paying for a larger connection."),
            ("Can drivers pay without an app?",
             "Yes. Sessions can start with an RFID card or by scanning a QR code that opens a payment page, "
             "so occasional users do not need to install anything."),
            ("Can we use our own brand on the driver app?",
             "Yes. Operators can run the driver app and invoices under their own brand."),
        ]),
        related("Related systems", ["power-billing", "power-cloud", "ems-bess"],
                "Billing, analytics and storage that work with EV charging."),
        cta(
            "Setting up or growing a charging network?",
            "Tell us how many chargers you run or plan to install, and which brands. We will show you "
            "the platform running on a live network.",
            "Book a Demo", contact(),
        ),
    ],
    "confirm": [
        "500+ chargers, 40+ enterprise clients, 99.2% uptime (from earlier site data)",
        "OCPP 2.0.1 support (not just 1.6J)",
        "White-label driver app and GST invoices",
        "Over-the-air firmware updates",
        "First-line charger fault handling by the Genex team",
    ],
}
