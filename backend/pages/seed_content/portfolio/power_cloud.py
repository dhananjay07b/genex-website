from ..builders import (
    capabilities, cards, contact, cta, faq, hero, highlights, how_we_work,
    intro, product, related, side, stats,
)

PAGE = {
    "key": "power-cloud",
    "tags": ["Grid & SCADA", "Cloud"],
    "seo_title": "Power Cloud: Portfolio Analytics for Energy Assets",
    "search_description": (
        "One cloud platform for solar, wind, storage, meters and EV chargers. Portfolio KPIs, "
        "scheduled reports and an open API. 1,000+ assets and 50M+ data points a day."
    ),
    "body": [
        hero(
            label="Cloud Platform",
            heading="Every energy asset you own, in one place",
            description=(
                "The Genex Power Cloud brings solar, wind, storage, meters and chargers into a single "
                "platform with shared KPIs, reports and an open API."
            ),
            cta_text="See Power Cloud",
            cta_link=contact(),
            image_hint="Portfolio dashboard on a large screen, or a montage of solar, wind and BESS sites",
        ),
        intro("Portfolios grow faster than the tools that track them", [
            "Most energy portfolios are built one project at a time. Each comes with its own monitoring "
            "portal, its own login and its own report format. After a few years, the asset manager is "
            "copying numbers from six systems into one spreadsheet every month.",
            "Power Cloud ends that. It takes data from Genex systems and from third-party platforms, puts "
            "it into one consistent model, and gives every team the view it needs from the same source.",
        ], note="One login, one data model, one set of numbers"),
        side(
            "One data layer for every asset type",
            "Each asset keeps its specialist tools on site. Power Cloud is where their data comes together.",
            "left",
            "Diagram of solar, wind, storage, meters and chargers feeding one cloud platform",
            bullets=[
                ("Solar and wind", "Generation, availability and performance from SolarLive, the Wind Network System or third-party portals."),
                ("Storage", "State of charge, cycles, efficiency and savings from the Genex EMS and BMS."),
                ("Meters", "Import, export and consumption from utility and sub-meters across sites."),
                ("EV charging", "Sessions, energy and revenue from charging sites on the Genex EV platform."),
            ],
            image_hint="Clean architecture diagram, or the Power Cloud portfolio map screen",
        ),
        stats("", [
            ("1,000", "+", "Assets on the platform"),
            ("50M", "+", "Data points processed every day"),
            ("99.9", "%", "API uptime"),
        ]),
        cards("One platform, a view for each team", (
            "Everyone works from the same data. What changes is the level of detail and the questions "
            "each view answers."
        ), [
            ("Business", "Leadership", "Portfolio generation, revenue and availability against budget, on one page.", "Portfolio summary"),
            ("Insights", "Asset managers", "Plant-by-plant performance ranking that shows where attention will pay back most.", "Underperformer ranking"),
            ("Engineering", "O&M teams", "Open alarms, tickets and response times across every site they maintain.", "Work queue"),
            ("CurrencyRupee", "Finance", "Generation-linked revenue, billing data and monthly figures ready for reconciliation.", "Revenue view"),
            ("EnergySavingsLeaf", "Sustainability", "Renewable energy share and avoided emissions for ESG reporting.", "ESG data"),
            ("AccountBalance", "Lenders and investors", "Read-only access to agreed KPIs and reports, without sharing operational controls.", "Controlled access"),
        ]),
        highlights("Platform Engineering", (
            "Power Cloud is built to handle years of high-resolution data from thousands of devices."
        ), [
            ("ring_stat", "Cloud", "Built for scale", "Tens of millions of readings processed every day", "50M+ / day"),
            ("icon", "Hub", "Open API", "REST API and scheduled exports to ERP and BI tools", "JSON and CSV"),
            ("security", "Lock", "Access control", "Role-based permissions down to single sites", "Per-site roles"),
            ("diagram", "Analytics", "Long-term storage", "Raw and aggregated data kept for life-of-asset analysis", "Years of history"),
            ("timeline", "Schedule", "Scheduled reports", "Daily, weekly and monthly reports by email", "Automatic"),
            ("signal", "Sync", "Third-party sources", "Data pulled from other vendors' portals and APIs", "Vendor neutral"),
        ]),
        capabilities("What you get", [
            ("Dashboard", "Portfolio dashboard with drill-down to every device"),
            ("Map", "Map view of all sites with live status"),
            ("Insights", "Performance ranking and underperformance alerts"),
            ("Assessment", "Custom and scheduled reports"),
            ("NotificationsActive", "Central alarm view across all asset types"),
            ("Groups", "Users, roles and site-level permissions"),
            ("Hub", "REST API and data exports"),
            ("Smartphone", "Mobile access for managers and field teams"),
        ]),
        how_we_work("Bringing a portfolio onto Power Cloud", (
            "Onboarding is done in stages, so the first sites are live and useful while the rest are "
            "being connected."
        ), [
            ("Connect", "Sites already on Genex systems connect directly. Third-party portals are linked through their APIs or data exports.", "Connection diagram or integrations screen"),
            ("Model", "Every asset is set up with its capacity, equipment, tariffs and contracts, so KPIs are calculated the same way everywhere.", "Asset configuration screen"),
            ("Configure", "Dashboards, users, alarm rules and scheduled reports are set up with each team.", "Dashboard configuration screen"),
            ("Operate", "Your teams run the portfolio from Power Cloud, and we review data quality with you every month.", "Portfolio dashboard in use"),
        ], principles=[
            ("Your data stays yours", "All data can be exported at any time through the API or as files. There is no lock-in."),
            ("One definition per KPI", "Performance ratio, availability and revenue are calculated the same way for every site, whoever built it."),
            ("Raw data is kept", "Original readings are stored alongside calculated values, so any figure can be rechecked later."),
        ]),
        faq("Frequently asked questions", [
            ("Can Power Cloud read data from other vendors' monitoring systems?",
             "Yes, where the vendor offers an API or a regular data export. We review each source during "
             "onboarding and confirm what can be pulled and how often."),
            ("Where is the data hosted?",
             "On secure cloud infrastructure with regular backups. Hosting in India can be arranged for "
             "clients who require it."),
            ("Is Power Cloud only for large portfolios?",
             "No. It is useful from a handful of sites upward, and becomes more valuable as the portfolio "
             "grows and mixes asset types."),
            ("Can we connect Power Cloud to our ERP?",
             "Yes. The REST API and scheduled exports are commonly used to feed ERP, BI and CMMS systems."),
        ]),
        related("Connected systems", ["solarlive", "ems-bess", "carbon-credit"],
                "Specialist systems whose data comes together in Power Cloud."),
        cta(
            "Managing assets across too many portals?",
            "Tell us your sites, asset types and the systems they use today. We will show you how they "
            "would look on Power Cloud.",
            "Book a Demo", contact(),
            "Explore SolarLive", product("solarlive"),
        ),
    ],
    "confirm": [
        "1,000+ assets, 50M+ data points/day, 99.9% API uptime (from earlier site data)",
        "Third-party portal integration and India hosting option",
        "Monthly data-quality review with clients",
        "Mobile access",
    ],
}
