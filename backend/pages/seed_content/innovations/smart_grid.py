from ..builders import (
    cards, contact, cta, faq, gallery, hero, highlights, intro,
    related_innovations, side, stats,
)

PAGE = {
    "key": "smart-grid",
    "tags": ["Grid & Utilities"],
    "seo_title": "Smart Grid Analytics for Discoms: AMI, DT Monitoring, Loss Reduction",
    "search_description": (
        "Smart grid tools for distribution utilities: smart meter data analytics, distribution transformer "
        "monitoring, feeder energy audits and loss detection. 1M+ meters connected."
    ),
    "body": [
        hero(
            label="Grid & Utilities",
            heading="Turning smart meter data into lower losses and fewer outages",
            description=(
                "Genex Smart Grid tools help distribution utilities use the data from smart meters and "
                "network sensors to find losses, prevent transformer failures and respond to outages faster."
            ),
            cta_text="Talk to Our Utilities Team",
            cta_link=contact(),
        ),
        intro("Smart meters are being installed. The value is in the data.", [
            "India's Revamped Distribution Sector Scheme (RDSS) is funding smart prepaid meters for "
            "consumers, distribution transformers and feeders across the country. Its goal is to bring "
            "aggregate technical and commercial (AT&C) losses down to 12 to 15% and close the gap between "
            "what power costs discoms and what they recover.",
            "Meters alone do not reduce losses. Discoms need tools that turn millions of readings into "
            "decisions: which feeder is losing energy, which transformer is overloaded, which meter has "
            "been tampered with. That is where Genex Smart Grid tools work.",
        ], note="Revamped Distribution Sector Scheme (RDSS)"),
        stats("", [
            ("1", "M+", "Meters connected"),
            ("10", "+", "Utility clients"),
            ("30", "%", "Reduction in non-technical losses achieved"),
        ]),
        side(
            "Distribution transformer monitoring",
            "Transformer failures are one of the most common and costly faults on a distribution network. "
            "Most give warning first.",
            "left",
            "Pole-mounted distribution transformer with a monitoring unit",
            bullets=[
                ("Overload", "Load above rating for long periods shortens transformer life sharply."),
                ("Phase imbalance", "Uneven loading across phases heats one winding and wastes capacity."),
                ("Oil temperature and level", "Rising temperature or falling oil level are early signs of failure."),
            ],
            text="Alerts let field teams balance loads or replace a transformer before it fails during peak demand.",
            image_hint="Distribution transformer on a pole or plinth in an Indian town",
        ),
        cards("What the platform does", (
            "Each module works on data the discom is already collecting or about to collect under RDSS."
        ), [
            ("Hub", "Smart meter data integration", "Reads consumption and event data from AMI head-end systems into one data model.", "AMI head-end"),
            ("Calculate", "Feeder and DT energy audit", "Compares energy sent into each feeder and transformer with energy billed downstream.", "Loss by area"),
            ("WarningAmber", "Theft and tamper detection", "Flags meters with tamper events, sudden drops or patterns that do not match neighbours.", "Ranked leads"),
            ("Power", "Outage detection", "Detects outages from meter power-off events and maps them to the affected feeder.", "Faster restoration"),
            ("SolarPower", "Rooftop solar on feeders", "Tracks reverse power flow and voltage rise where rooftop solar is growing.", "DER visibility"),
            ("EvStation", "EV load growth", "Shows where EV charging is adding load, for network planning.", "Planning data"),
        ]),
        side(
            "Energy audits that point to the loss",
            "An energy audit compares the energy entering a part of the network with the energy billed in it. "
            "The gap shows where losses are.",
            "right",
            "Feeder energy audit map showing high-loss areas",
            bullets=[
                ("Feeder level", "Identifies the feeders with the highest losses for priority action."),
                ("Transformer level", "Narrows the gap down to individual transformers and their consumers."),
                ("Consumer level", "Ranks individual meters for inspection by their likelihood of theft or fault."),
            ],
            image_hint="Map or dashboard showing feeders coloured by loss level",
        ),
        highlights("Built for Utilities", (
            "Designed for the scale and conditions of Indian distribution networks."
        ), [
            ("ring_stat", "Storage", "Utility scale", "Millions of meters and readings every day", "1M+ meters"),
            ("icon", "Hub", "Standards-based integration", "Meter data from multiple AMI vendors in one model", "Vendor neutral"),
            ("diagram", "Analytics", "Loss analytics", "Energy audits at feeder, DT and consumer level", "Ranked actions"),
            ("security", "Lock", "Utility-grade security", "Role-based access and audit trails", "Data stays protected"),
        ]),
        gallery([
            ("Distribution network lines in an Indian town", "Overhead distribution lines on a street"),
            ("Smart energy meter installed at a home", "Smart meter on a wall"),
            ("Utility engineer working on a distribution transformer", "Lineman or engineer at a transformer"),
            ("Utility control room monitoring the network", "Distribution control room with screens"),
        ]),
        faq("Frequently asked questions", [
            ("Does this replace our AMI head-end or billing system?",
             "No. The platform reads data from the head-end and billing systems and adds analytics on top. "
             "It does not replace systems you already run."),
            ("Can it work with meters from different suppliers?",
             "Yes. Data from different AMI head-ends is mapped into one model, so analysis covers the whole "
             "network regardless of meter vendor."),
            ("How quickly can a discom see results?",
             "Feeder-level energy audits can start as soon as feeder and consumer meter data are connected. "
             "Detailed transformer-level results depend on how far DT metering has progressed."),
        ]),
        related_innovations("Related innovations", [
            ("advanced-scada", "Dashboard"), ("re-nms", "Hub"), ("power-trading", "TrendingUp"),
        ], "Grid control and network tools that work alongside smart grid analytics."),
        cta(
            "Making the most of your smart meter rollout?",
            "Tell us your circle, meter count and the systems you run. We will show what the data can "
            "reveal about losses on your network.",
            "Request a Utility Demo", contact(),
        ),
    ],
    "confirm": [
        "1M+ meters, 10+ utility clients, 30% non-technical loss reduction (from earlier site data)",
        "RDSS loss target wording (12 to 15% AT&C): check against current MoP guidance",
        "Which modules are live (theft detection, outage detection, DER visibility)",
    ],
}
