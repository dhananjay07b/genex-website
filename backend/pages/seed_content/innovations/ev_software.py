from ..builders import (
    contact, cta, faq, hero, highlights, how_we_work, milestones, overview,
    product, related_innovations, side, stats,
)

PAGE = {
    "key": "ev-software",
    "tags": ["EV"],
    "seo_title": "Grid-Aware Smart Charging and V2G Readiness for EV Networks",
    "search_description": (
        "How Genex EV software charges more vehicles on the same connection: grid-aware load management, "
        "solar-matched charging and a roadmap to ISO 15118 and vehicle-to-grid."
    ),
    "body": [
        hero(
            label="EV Innovation",
            heading="Smarter charging, so the grid connection is never the bottleneck",
            description=(
                "Our EV software research focuses on one problem: charging more vehicles, faster and cheaper, "
                "without upgrading the electrical connection."
            ),
            cta_text="Discuss Smart Charging",
            cta_link=contact(),
        ),
        overview("The constraint is power, not chargers", [
            "Installing chargers is the easy part of electrifying a fleet or a car park. The hard part is the "
            "connection behind them. Ten 60 kW DC chargers running at full power would need 600 kW, more "
            "than many depots and commercial buildings have sanctioned. Upgrading the connection can take "
            "months and cost more than the chargers themselves.",
            "Most of the time, that full power is never needed at once. Vehicles arrive at different times, "
            "with different charge levels and different departure times. Smart charging uses that spread to "
            "share the power that is available, so every vehicle leaves with the charge it needs.",
            "This page covers the charging intelligence Genex is building into its platform. For the "
            "charge point management product itself, see EV Software Management in our Portfolio.",
        ]),
        side(
            "Charging that follows the grid",
            "The platform reads the site's real-time load and sets every charger's power so the total "
            "never crosses the connection limit.",
            "left",
            "Fleet depot with electric vehicles charging at night",
            bullets=[
                ("Site load first", "Building or factory load is measured live, and only the remaining capacity is given to charging."),
                ("Departure-aware", "Vehicles leaving first get priority, so every shift starts with charged vehicles."),
                ("Tariff-aware", "Charging shifts towards cheaper Time-of-Day hours wherever departure times allow."),
            ],
            image_hint="Electric buses or vans charging at a depot, ideally at night",
        ),
        highlights("Research Areas", (
            "The capabilities in development or early deployment on Genex charging networks."
        ), [
            ("diagram", "Speed", "Dynamic load management", "Charger power set from live site load", "Within sanctioned load"),
            ("ring_stat", "SolarPower", "Solar-matched charging", "Charging follows on-site solar output", "More self-use"),
            ("timeline", "Schedule", "Fleet schedule optimisation", "Plans charging around routes and shifts", "Ready on time"),
            ("signal", "SwapHoriz", "Vehicle-to-grid readiness", "Groundwork for two-way power flow", "ISO 15118-20"),
        ]),
        how_we_work("How smart charging decides", (
            "Every few seconds, the platform repeats the same three steps for each site."
        ), [
            ("Read the limits",
             "It reads the connection limit, the live site load, solar output if any, and the current tariff slot.",
             "Electrical panel and energy meter at a charging site"),
            ("Rank the vehicles",
             "Connected vehicles are ranked by departure time, charge needed and any priority set by the operator.",
             "Row of vehicles connected to chargers"),
            ("Set each charger",
             "Each charger receives a power limit over OCPP, and the plan is updated as vehicles arrive and leave.",
             "Close-up of a charger display or connector"),
        ], principles=[
            ("Never exceed the connection", "The site limit is a hard ceiling. Charging gives way before the main breaker does."),
            ("Every vehicle gets its charge", "Optimisation never leaves a vehicle short at its departure time."),
            ("Open standards", "Control uses OCPP smart charging profiles, so it works across charger brands."),
        ]),
        stats("On Genex charging networks", [
            ("500", "+", "Chargers managed"),
            ("25", "%", "Average charging cost reduction"),
            ("40", "+", "Enterprise clients"),
        ]),
        milestones([
            ("Live", "IN SERVICE", "OCPP management and load balancing",
             "OCPP 1.6J charger management with static and dynamic load balancing across sites.", False),
            ("Rollout", "IN DEPLOYMENT", "OCPP 2.0.1 and solar-matched charging",
             "Richer device management and charging that follows on-site solar generation.", True),
            ("Next", "IN DEVELOPMENT", "Fleet schedule optimisation",
             "Charging plans built from vehicle routes, shift times and tariff slots.", False),
            ("Research", "RESEARCH", "ISO 15118 and vehicle-to-grid",
             "Plug and Charge and the groundwork for vehicles that can return power to a site or the grid.", False),
        ]),
        side(
            "Solar and storage at the charging site",
            "Charging sites with rooftop solar or a battery can run a large share of their charging on "
            "their own energy.",
            "right",
            "Charging canopy with solar panels on the roof",
            bullets=[
                ("Midday charging", "Vehicles parked during the day charge mostly from solar."),
                ("Battery support", "A battery covers evening peaks, which reduces demand charges and grid draw."),
                ("One control layer", "Chargers, solar and battery are coordinated by the same platform."),
            ],
            image_hint="Solar carport or charging canopy with panels on top",
        ),
        faq("Frequently asked questions", [
            ("Does smart charging slow down charging?",
             "Only when the site is near its limit, and only for vehicles that can afford to wait. Vehicles "
             "leaving soon keep full power."),
            ("Will it work with chargers we already have?",
             "If the chargers support OCPP smart charging profiles, yes. Most current AC and DC chargers do. "
             "We check each model before onboarding."),
            ("What is vehicle-to-grid and is it available in India?",
             "Vehicle-to-grid lets a parked EV send power back to a building or the grid. It needs compatible "
             "vehicles, chargers and regulations. Pilots are under way in several countries; we are preparing "
             "the platform so customers can adopt it when it becomes practical in India."),
        ]),
        related_innovations("Related innovations", [
            ("ems-bess", "BatteryChargingFull"), ("smart-grid", "ElectricBolt"), ("power-billing", "ReceiptLong"),
        ], "Storage, grid and billing work connected to EV charging."),
        cta(
            "Running out of power for your chargers?",
            "Tell us your sanctioned load, number of chargers and fleet schedule. We will show how many more "
            "vehicles smart charging could support.",
            "Discuss Your Site", contact(),
            "See EV Software Management", product("ev-software"),
        ),
    ],
    "confirm": [
        "500+ chargers, 25% average cost reduction, 40+ clients (from earlier site data)",
        "Roadmap status of each milestone (Live / Rolling out / Next / Research)",
        "Solar-matched charging and fleet scheduling status",
    ],
}
