from ..builders import (
    cards, contact, cta, faq, hero, highlights, how_we_work, intro, product,
    related_innovations, side, stats,
)

PAGE = {
    "key": "power-billing",
    "tags": ["Grid & Utilities"],
    "seo_title": "Power Billing System: A Rules Engine for Energy Settlement",
    "search_description": (
        "The settlement engine behind Genex power billing: configurable tariff and allocation rules, "
        "meter data validation and support for net, group and virtual net metering."
    ),
    "body": [
        hero(
            label="Billing Innovation",
            heading="Energy settlement written as rules, not spreadsheets",
            description=(
                "The Genex Power Billing System is a settlement engine. Tariffs, credits and allocation "
                "are configured as rules, so new regulations become settings instead of software projects."
            ),
            cta_text="Talk to Our Billing Team",
            cta_link=contact(),
        ),
        intro("Energy billing keeps getting more complicated", [
            "A decade ago, a solar bill had one meter and one tariff. Today a single consumer may have "
            "Time-of-Day rates, net metering at one site, group net metering across others, a share in a "
            "virtual net metering plant and an open access contract on top.",
            "Every state sets its own rules for carry-forward, banking, charges and settlement periods, and "
            "those rules change. Billing software with this logic written into its code cannot keep up. "
            "The Power Billing System was built so that the logic lives in configuration instead.",
        ], note="Built for net, group and virtual net metering"),
        side(
            "Rules as configuration, not code",
            "Each project's billing logic is set up as a set of readable rules that a billing manager can "
            "review.",
            "right",
            "Billing rule configuration screen",
            bullets=[
                ("Tariff rules", "Slabs, Time-of-Day rates, fixed charges, duties and surcharges per consumer category."),
                ("Allocation rules", "How surplus is shared: by percentage, by priority or as fixed quantities."),
                ("Settlement rules", "Carry-forward periods, banking limits and how unused credits are settled at year end."),
            ],
            text="When a regulation changes, the rule is updated and versioned. Past bills stay reproducible under the old rule.",
            image_hint="Screen showing tariff or allocation settings",
        ),
        how_we_work("Inside the settlement engine", (
            "Every billing run passes through the same four stages, each logged for audit."
        ), [
            ("Ingest",
             "Meter readings arrive from smart meters, data loggers or uploaded discom statements, all converted to one format.",
             "Smart energy meter on a wall"),
            ("Validate",
             "Readings are checked for gaps, rollovers and sudden jumps. Suspect values are held for review instead of being billed.",
             "Analyst checking data quality on screen"),
            ("Allocate",
             "Credits and consumption are assigned to each connection or consumer according to the project's rules.",
             "Rooftop solar shared by several buildings"),
            ("Settle",
             "Tariffs are applied, invoices produced and payments tracked, with every figure traceable to its source reading.",
             "Invoice and payment summary"),
        ], principles=[
            ("Reproducible", "Any past bill can be regenerated exactly, with the rules that applied at the time."),
            ("Validated before billed", "Bad meter data is stopped before it becomes a wrong invoice."),
            ("Transparent", "Each line on an invoice links back to readings and rules."),
        ]),
        cards("Settlement models supported", (
            "The engine handles today's metering models and is being extended to the next ones."
        ), [
            ("SwapHoriz", "Net and group net metering", "Surplus set off at one connection or across an owner's connections in the same discom area.", "In service"),
            ("Groups", "Virtual net metering", "One plant shared by many consumers, each credited by their share.", "In service"),
            ("AccountBalance", "Open access and captive", "Settlement of energy from captive and open access plants, including banking.", "In development"),
        ]),
        stats("", [
            ("10,000", "+", "Bills generated every month"),
            ("15", "+", "Discom statement formats read"),
            ("3", "", "Metering models in service"),
        ]),
        highlights("Engineering Details", (
            "The parts of the engine that keep settlement accurate at scale."
        ), [
            ("timeline", "History", "Versioned rules", "Every rule change dated and kept", "Reproducible bills"),
            ("diagram", "Sensors", "Meter data validation", "Gaps, rollovers and jumps caught early", "Before billing"),
            ("icon", "Hub", "Open interfaces", "API to ERP, accounting and payment systems", "No re-keying"),
            ("security", "Lock", "Maker-checker control", "Invoices approved before release", "Audit ready"),
        ]),
        faq("Frequently asked questions", [
            ("How is this different from the Power Billing Tool in your Portfolio?",
             "The Portfolio page describes the billing product and service. This page explains the settlement "
             "engine underneath it and where we are taking it next, such as open access settlement."),
            ("Can the rules handle my state's regulations?",
             "Rules are configured per project, so state differences in carry-forward, banking and charges "
             "are set up as settings. We review the applicable regulation during onboarding."),
            ("What happens when a meter reading is wrong?",
             "Validation holds suspect readings for review. Once corrected, the bill is recalculated and the "
             "change is logged."),
        ]),
        related_innovations("Related innovations", [
            ("power-trading", "TrendingUp"), ("smart-grid", "ElectricBolt"), ("ev-software", "EvStation"),
        ], "Market, grid and EV work that connects to billing."),
        cta(
            "Billing that keeps up with regulation",
            "Tell us your metering models and states. We will show how the rules for your projects would be set up.",
            "Request a Walkthrough", contact(),
            "See the Power Billing Tool", product("power-billing"),
        ),
    ],
    "confirm": [
        "10,000+ bills/month, 15+ discom formats (from earlier site data)",
        "Open access and captive settlement listed as 'In development'",
        "Versioned rules and API to ERP/accounting as current features",
    ],
}
