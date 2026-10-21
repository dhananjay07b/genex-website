from ..builders import (
    capabilities, cards, contact, cta, faq, hero, highlights, overview,
    product, related, side, stats, steps,
)

# NOTE: written from the earlier site's description (real-time control and power
# quality). In Indian power markets "RTC" usually means Round-The-Clock power; if
# that is what this product is, this page needs rewriting before it is published.
PAGE = {
    "key": "rtc-power-tools",
    "tags": ["EV & Power Tools", "Power Quality"],
    "seo_title": "Real-Time Power Quality and Control Tools for Industry",
    "search_description": (
        "Real-time power quality monitoring and control for industrial sites. Harmonics, power factor, "
        "demand and voltage, with closed-loop correction. 150+ industrial sites, 18% average cost reduction."
    ),
    "body": [
        hero(
            label="Power Quality",
            heading="Cleaner power, lower bills, fewer surprises on the shop floor",
            description=(
                "RTC Power Tools measure power quality in real time and act on it, correcting power "
                "factor, limiting demand and flagging harmonics before they cost you money or equipment."
            ),
            cta_text="Book a Power Quality Audit",
            cta_link=contact(),
            image_hint="Industrial LT panel room or capacitor bank with a power analyser display",
        ),
        overview("Power quality is now a line item on the bill", [
            "Industrial sites used to treat power quality as an engineering concern. Several Indian states "
            "now bill large consumers in kVAh instead of kWh, which turns it into a direct cost. Under kVAh "
            "billing, a site running at a power factor of 0.9 pays for about 11% more units than it "
            "actually uses.",
            "Harmonics add hidden costs of their own. Variable speed drives, UPS systems, LED lighting and "
            "EV chargers all draw distorted current. That distortion heats transformers and cables, trips "
            "breakers without an obvious cause, and shortens the life of capacitor banks.",
            "RTC Power Tools give plant engineers continuous measurement at the points that matter, and "
            "control the correction equipment automatically, so problems are fixed as they happen rather "
            "than discovered in the next bill.",
        ]),
        cards("Problems it addresses", (
            "Each issue is measured continuously and reported in rupees where possible, so priorities are clear."
        ), [
            ("CurrencyRupee", "Low power factor", "Under kVAh billing, every point below unity is paid for. Automatic capacitor or active compensation holds PF close to 1.", "kVAh = kWh ÷ PF"),
            ("WarningAmber", "Harmonic distortion", "Drives and electronic loads distort current. High distortion overheats transformers and cables and causes nuisance trips.", "IEEE 519 limits"),
            ("TrendingUp", "Demand peaks", "Short load peaks push maximum demand above the contract value, adding demand charges and penalties.", "kVA demand control"),
            ("ElectricBolt", "Voltage sags and swells", "Short dips stop sensitive machines and PLCs. Recording them shows whether the cause is inside or outside the plant.", "Event recording"),
            ("Tune", "Phase unbalance", "Uneven loading across phases heats motors and transformers and wastes capacity.", "Per-phase analysis"),
            ("Factory", "Equipment stress", "Poor power quality shortens the life of motors, capacitors and drives long before they fail outright.", "Asset life"),
        ]),
        stats("Results on industrial sites", [
            ("150", "+", "Industrial sites"),
            ("18", "%", "Average energy cost reduction"),
            ("0.99", "", "Typical power factor held after correction"),
        ]),
        side(
            "What is measured",
            "Measurements follow international power quality methods, so results stand up in discussions "
            "with the discom or an equipment supplier.",
            "right",
            "Power quality analyser installed at the main LT incomer",
            bullets=[
                ("Energy and demand", "kWh, kVAh, kVArh and maximum demand at incomers and major feeders."),
                ("Power factor", "Displacement and true power factor per phase, trended against time of day."),
                ("Harmonics", "Voltage and current distortion up to the 50th harmonic, with individual harmonic levels."),
                ("Voltage events", "Sags, swells and interruptions with time stamps and waveform capture."),
            ],
            image_hint="Analyser mounted in a panel, or a harmonics spectrum screenshot",
        ),
        highlights("Measurement and Control", (
            "The tools combine accurate measurement with fast, automatic action on correction equipment."
        ), [
            ("ring_stat", "Speed", "Real-time correction", "Capacitor and compensation steps switched automatically", "Closed loop"),
            ("diagram", "Analytics", "Harmonic analysis", "Voltage and current harmonics up to the 50th order", "Up to 50th"),
            ("timeline", "History", "Event capture", "Sags, swells and trips recorded with time stamps", "Root cause"),
            ("icon", "VerifiedOutlined", "Energy management support", "Data and reports that support ISO 50001 programmes", "ISO 50001"),
        ]),
        steps("From audit to continuous control", (
            "Work starts with measurement, so any investment is sized to the problem actually found."
        ), [
            ("Power quality audit", "Analysers are installed at the incomers and key feeders for about a week to record normal operation.", "Sensors"),
            ("Findings and plan", "We report power factor, harmonics, demand and voltage issues with their cost, and recommend corrections.", "Assessment"),
            ("Correction and control", "Correction equipment and the controller are installed and tuned on live load.", "Tune"),
            ("Continuous monitoring", "Measurements continue on the cloud platform, with alerts and monthly savings reports.", "Cloud"),
        ]),
        capabilities("What the tools provide", [
            ("Speed", "Automatic power factor correction control"),
            ("TrendingUp", "Maximum demand monitoring and load shedding alerts"),
            ("Analytics", "Harmonic and voltage quality analysis"),
            ("History", "Event log with waveform capture"),
            ("CurrencyRupee", "Savings report in rupees each month"),
            ("Cloud", "Remote access to all measurement points"),
        ]),
        faq("Frequently asked questions", [
            ("How do I know if power quality is costing me money?",
             "Check your bill for power factor penalties, kVAh units well above kWh units, or maximum "
             "demand above the contract value. Frequent unexplained trips or failing capacitors are "
             "another sign. A one-week audit gives a clear answer."),
            ("What are acceptable harmonic levels?",
             "IEEE 519 is the most widely used reference. At low voltage, it recommends total voltage "
             "distortion below 8%, and 5% at most medium voltages. Current limits depend on the size of "
             "the site's load relative to the supply."),
            ("Can this work with our existing capacitor banks?",
             "Often, yes. If the existing banks are in good condition, the controller can switch them. "
             "Where harmonics are high, detuned banks or active filters may be needed instead."),
            ("Does it integrate with our plant SCADA or BMS?",
             "Yes. Measurements are available over Modbus TCP for building or plant management systems, "
             "and on the Genex cloud platform."),
        ]),
        related("Related systems", ["scada", "power-cloud", "ems-bess"],
                "Control and analytics that work alongside power quality tools."),
        cta(
            "Paying for power you never used?",
            "Send us your last three electricity bills. We will tell you what power factor, demand and "
            "harmonics are costing you, and whether an audit is worth it.",
            "Get a Bill Review", contact(),
            "Explore SCADA", product("scada"),
        ),
    ],
    "confirm": [
        "IMPORTANT: confirm what RTC stands for. This page assumes real-time control and power quality (earlier site). If it means Round-The-Clock renewable power, rewrite it.",
        "150+ sites, 18% average cost reduction, ISO 50001 support (from earlier site data)",
        "0.99 typical power factor after correction",
        "Harmonics up to the 50th, waveform capture, free bill review offer",
    ],
}
