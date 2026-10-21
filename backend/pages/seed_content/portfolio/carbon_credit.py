from ..builders import (
    capabilities, cards, contact, cta, faq, hero, highlights, overview,
    product, related, side, stats, steps,
)

PAGE = {
    "key": "carbon-credit",
    "tags": ["Solar & Monitoring", "Sustainability"],
    "seo_title": "Carbon Credit and REC Tracking for Renewable Energy Assets",
    "search_description": (
        "Turn metered renewable generation into verifiable carbon credits and I-RECs. Emission "
        "factor calculations, audit-ready monitoring reports and registry exports."
    ),
    "body": [
        hero(
            label="Sustainability",
            heading="From metered megawatt-hours to verified carbon credits",
            description=(
                "Genex Carbon Credit Tools turn the generation data your plants already record into "
                "audit-ready emission reduction reports and registry submissions."
            ),
            cta_text="Assess Your Credit Potential",
            cta_link=contact(),
            image_hint="Large solar or wind plant in wide view, ideally with a clear sky",
        ),
        overview("Credits are only as good as the data behind them", [
            "Every megawatt-hour from a solar or wind plant displaces electricity that would otherwise "
            "come from the grid, most of it from coal. That avoided emission can be certified and sold, "
            "as a carbon credit or as a renewable energy certificate, to companies working towards "
            "their climate targets.",
            "Buyers and verifiers have become strict. A credit must be backed by metered generation, a "
            "recognised calculation method and a clear audit trail. Claims built on spreadsheets and "
            "estimated readings now struggle at verification.",
            "Genex Carbon Credit Tools connect directly to metered plant data from SolarLive and other "
            "sources, apply the approved calculation, and produce the monitoring reports and registry "
            "files that verifiers expect. Owners see their credit pipeline as clearly as their generation.",
        ]),
        stats("", [
            ("500,000", "+", "Credits tracked on the platform"),
            ("3", "", "Certification frameworks supported"),
            ("100", "%", "Verification pass rate to date"),
        ]),
        side(
            "How generation becomes a credit",
            "The arithmetic is simple. Making it defensible is the hard part.",
            "left",
            "Diagram showing generation multiplied by grid emission factor",
            bullets=[
                ("Metered generation", "Net energy exported, taken from the main meter, not from inverter estimates."),
                ("Grid emission factor", "Tonnes of CO2 per MWh of grid power displaced. In India this comes from the CEA CO2 Baseline Database and is roughly 0.7 tCO2 per MWh."),
                ("Emission reduction", "Generation multiplied by the emission factor, less any project emissions. One credit equals one tonne of CO2 avoided."),
            ],
            text=(
                "As a rule of thumb, a 1 MW solar plant in India generating about 1,500 MWh a year "
                "avoids roughly 1,000 tonnes of CO2, or about 1,000 credits a year."
            ),
            image_hint="Simple infographic: MWh x emission factor = tCO2e, or a plant meter photo",
        ),
        cards("Supported frameworks", (
            "Different buyers want different instruments. The tool prepares data for each pathway."
        ), [
            ("VerifiedOutlined", "Verra and Gold Standard", "International voluntary carbon credits, issued per tonne of CO2 avoided after independent verification.", "Voluntary carbon market"),
            ("EnergySavingsLeaf", "I-REC", "International renewable energy certificates, one per MWh, used by companies to claim renewable electricity.", "Per MWh"),
            ("AccountBalance", "India Carbon Market", "Data preparation for India's Carbon Credit Trading Scheme as its offset methodologies are notified.", "CCTS ready"),
        ]),
        steps("From meter to registry", (
            "The tool covers the data side of the whole cycle and works alongside your consultant and verifier."
        ), [
            ("Data capture", "Generation is collected from the plant meters every day and checked for gaps and anomalies.", "Sensors"),
            ("Calculation", "The approved emission factor and methodology are applied to each monitoring period.", "Calculate"),
            ("Monitoring report", "A report is generated with the data, calculation and evidence a verifier needs.", "DescriptionOutlined"),
            ("Verification", "An independent verification body reviews the report and the underlying meter records.", "VerifiedOutlined"),
            ("Issuance and sale", "Credits are issued on the registry and tracked through to sale or retirement.", "Co2"),
        ]),
        highlights("Audit-Ready by Default", (
            "Every number in a report can be traced to a meter reading, a factor and a rule."
        ), [
            ("timeline", "History", "Complete audit trail", "Readings, corrections and approvals logged", "Verifier friendly"),
            ("icon", "Sensors", "Meter-level data", "Built on main meter readings, not estimates", "Defensible"),
            ("diagram", "Calculate", "Emission factor library", "Versioned factors applied per monitoring period", "CEA baseline"),
            ("security", "Lock", "No double counting", "Each MWh tied to one certificate only", "Unique claims"),
        ]),
        capabilities("Platform features", [
            ("Co2", "Emission reductions calculated per plant and period"),
            ("Business", "Portfolio view of credits across all plants"),
            ("DescriptionOutlined", "Monitoring reports in verifier-ready format"),
            ("SwapHoriz", "Registry export files"),
            ("CurrencyRupee", "Credit inventory, sales and retirement tracking"),
            ("Assessment", "ESG and sustainability reporting data"),
        ]),
        faq("Frequently asked questions", [
            ("Is my plant eligible for carbon credits?",
             "It depends on the plant's size, commissioning date, location and the framework you choose. "
             "Some frameworks restrict large grid-connected renewables in India. We assess eligibility "
             "before any work starts."),
            ("What is the difference between a carbon credit and an I-REC?",
             "A carbon credit represents one tonne of CO2 avoided. An I-REC represents one MWh of "
             "renewable electricity. Buyers use them for different claims, and the same generation "
             "cannot be sold as both for the same claim."),
            ("Do I need to change my monitoring system?",
             "No. If your plant has a main export meter and its data can be collected, the tool works "
             "with it. Plants on SolarLive are connected directly."),
            ("Do you sell the credits?",
             "No. The tool prepares and tracks the data. Sales go through your chosen registry, "
             "trader or buyer."),
        ]),
        related("Related systems", ["solarlive", "power-cloud", "wind-network"],
                "The monitoring platforms that supply the metered generation."),
        cta(
            "Find out what your generation is worth",
            "Share your plant capacity, location and commissioning date. We will estimate annual "
            "credit volume and the frameworks you are eligible for.",
            "Assess My Plants", contact(),
        ),
    ],
    "confirm": [
        "500,000+ credits tracked, 3 frameworks, 100% verification pass rate (from earlier site data)",
        "Frameworks named: Verra, Gold Standard, I-REC, India CCTS (confirm which the product really supports)",
        "Emission factor about 0.7 tCO2/MWh: check the latest CEA CO2 Baseline Database version",
        "Registry export files and sale/retirement tracking",
    ],
}
