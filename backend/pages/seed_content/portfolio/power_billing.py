from ..builders import (
    capabilities, cards, contact, cta, faq, hero, highlights, overview,
    product, related, side, stats, steps,
)

PAGE = {
    "key": "power-billing",
    "tags": ["EV & Power Tools"],
    "seo_title": "Solar Power Billing Software for Group and Virtual Net Metering",
    "search_description": (
        "Automated billing for group net metering (GNM) and virtual net metering (VNM). Meter "
        "data to credit allocation to invoice, in discom formats. 10,000+ bills generated monthly."
    ),
    "body": [
        hero(
            label="Billing Automation",
            heading="Shared solar, billed correctly every month",
            description=(
                "The Genex Power Billing Tool turns meter readings into allocated credits and finished "
                "invoices for group and virtual net metering, without spreadsheets."
            ),
            cta_text="Request a Billing Demo",
            cta_link=contact(),
            image_hint="Rooftop solar on a housing society or multi-building campus",
        ),
        overview("Why shared solar is hard to bill", [
            "Under ordinary net metering, one consumer has one meter and one bill. Shared solar breaks "
            "that link. One plant can now offset consumption at several connections of the same owner, "
            "or be shared between many consumers who each own part of it.",
            "India's consumer rules now recognise both models: group net metering, where surplus from "
            "one connection is adjusted against the owner's other connections in the same discom area, "
            "and virtual net metering, where several consumers share the output of one plant. Both are "
            "good for consumers. Both turn a simple bill into an allocation exercise.",
            "Each month, someone has to read every meter, apply each consumer's share, carry forward "
            "unused credits, apply the right tariff slab and produce an invoice that matches the discom "
            "statement. Done by hand across hundreds of connections, mistakes are almost certain. The "
            "Power Billing Tool does the whole cycle from meter data.",
        ]),
        cards("Three metering models, one tool", (
            "The tool supports each arrangement with its own allocation rules, and a portfolio can "
            "mix all three."
        ), [
            ("SwapHoriz", "Net metering", "One consumer, one meter. Exported units are set off against imported units on the same connection.", "One plant, one bill"),
            ("Business", "Group net metering", "Surplus from one connection offsets consumption at the same owner's other connections in the discom area.", "One owner, many sites"),
            ("Groups", "Virtual net metering", "Several consumers share one plant. Each gets credits in proportion to their agreed share.", "Many owners, one plant"),
        ]),
        side(
            "How a bill is built",
            "Each figure on the invoice can be traced back to a meter reading and an allocation rule.",
            "left",
            "Billing dashboard showing allocation of solar credits",
            bullets=[
                ("Meter data", "Generation, import and export readings arrive from meters automatically, or are uploaded from the discom statement."),
                ("Allocation", "Net surplus is split between connections or consumers according to the agreed shares or priority order."),
                ("Tariff", "Each consumer's tariff category, slabs, Time-of-Day rates, duties and fixed charges are applied."),
                ("Invoice", "A finished invoice is generated for each consumer, with a breakdown that matches the discom figures."),
            ],
            image_hint="Screenshot of the billing allocation screen or a sample invoice",
        ),
        steps("The monthly billing cycle", (
            "The tool runs the same cycle every month, and an operator reviews and approves before "
            "anything is sent."
        ), [
            ("Collect readings", "Meter data for the billing period is pulled in and checked for gaps or jumps.", "Sensors"),
            ("Validate", "Readings are compared with the discom statement. Any difference is flagged for review before billing.", "VerifiedOutlined"),
            ("Allocate credits", "Surplus units are allocated by share, and unused credits are carried forward per the applicable rules.", "Calculate"),
            ("Apply tariffs", "Each consumer's tariff, slabs and charges are applied to their net consumption.", "CurrencyRupee"),
            ("Issue and reconcile", "Invoices are issued by email and portal, and payments are tracked against each one.", "ReceiptLong"),
        ]),
        stats("Billing at scale", [
            ("10,000", "+", "Bills generated every month"),
            ("15", "+", "Discom statement formats supported"),
            ("3", "", "Metering models handled"),
        ]),
        highlights("Accuracy by Design", (
            "Billing errors cost trust as well as money. These are the controls that keep each invoice right."
        ), [
            ("icon", "Calculate", "Rule-based allocation", "Shares, priority and carry-forward set per project", "No manual maths"),
            ("timeline", "History", "Full audit trail", "Every reading, rule and edit logged with user and time", "Traceable"),
            ("diagram", "Assessment", "Discom reconciliation", "Billed units checked against the discom statement", "Before sending"),
            ("security", "Lock", "Controlled approvals", "Invoices released only after operator approval", "Maker-checker"),
        ]),
        capabilities("What the tool covers", [
            ("Sensors", "Automatic meter data collection and upload"),
            ("Calculate", "Allocation by share, priority or fixed quantity"),
            ("CurrencyRupee", "Tariff slabs, ToD rates, duties and fixed charges"),
            ("ReceiptLong", "Branded invoices by email and portal"),
            ("SwapHoriz", "Credit carry-forward and settlement tracking"),
            ("Assessment", "Consumer statements and portfolio reports"),
        ]),
        faq("Frequently asked questions", [
            ("Is group net metering the same as gross metering?",
             "No. Under gross metering, all generation is sold to the discom at a fixed tariff. Under "
             "group net metering, surplus from one connection reduces the bill at the owner's other "
             "connections. The tool supports group and virtual net metering, as well as ordinary net metering."),
            ("Do the rules differ between states?",
             "Yes. Eligibility, carry-forward periods and charges vary by state regulation and discom. "
             "These are set up as rules for each project, so state differences do not need custom work."),
            ("Can we bill from discom statements if we have no smart meters?",
             "Yes. Readings can be uploaded from the discom's monthly statement, and the tool handles "
             "allocation and invoicing from there."),
            ("Who sends the invoices?",
             "Invoices go out under your company name and branding. Genex runs the platform, not the "
             "billing relationship."),
        ]),
        related("Related systems", ["solarlive", "power-cloud", "data-loggers"],
                "Generation and meter data that feed the billing cycle."),
        cta(
            "Billing shared solar by hand?",
            "Send us one month of meter data and your allocation rules. We will run it through the tool "
            "and show you the finished invoices.",
            "Request a Billing Demo", contact(),
        ),
    ],
    "confirm": [
        "10,000+ bills per month, 15+ discom formats (from earlier site data)",
        "GNM = Group Net Metering (check it is not meant as Gross Net Metering)",
        "Maker-checker approval, payment tracking and branded invoices",
        "Upload from discom statements when there are no smart meters",
        "Earlier site claimed 98% billing accuracy; dropped because it implies 2% wrong bills",
    ],
}
