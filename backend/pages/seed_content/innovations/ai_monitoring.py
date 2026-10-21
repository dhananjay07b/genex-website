from ..builders import (
    cards, contact, cta, faq, hero, highlights, how_we_work, intro,
    related_innovations, side, stats,
)

PAGE = {
    "key": "ai-monitoring",
    "tags": ["AI & Analytics"],
    "seo_title": "AI-Based Monitoring for Solar, Wind and Storage Plants",
    "search_description": (
        "Machine learning on plant data to catch inverter, string and battery problems before they "
        "fail, with plain-language work orders for O&M teams. 200+ sites on AI monitoring."
    ),
    "body": [
        hero(
            label="AI & Analytics",
            heading="Monitoring that spots the fault before the alarm does",
            description=(
                "Genex AI-based monitoring learns how each plant normally behaves and flags the small "
                "changes that come before a failure, so teams can fix problems on their schedule."
            ),
            cta_text="See It on Your Plant Data",
            cta_link=contact(),
        ),
        intro("Alarms tell you what broke. Models tell you what is about to.", [
            "Conventional monitoring works on thresholds. An alarm goes off when a value crosses a limit, "
            "which usually means the equipment has already failed or tripped. By then the energy is lost "
            "and the repair is urgent.",
            "Most failures give warning first. An inverter runs a few degrees hotter than its neighbours "
            "for weeks. A string current drifts down slowly. A battery cell's voltage spreads further from "
            "the pack average each cycle. These signs are too small for thresholds, but clear to a model "
            "that has learned what normal looks like for that specific device.",
        ], note="From reactive alarms to planned maintenance"),
        how_we_work("How the models work", (
            "Every device gets its own model of normal behaviour, trained on its own history and its "
            "neighbours under the same conditions."
        ), [
            ("Learn normal behaviour",
             "Models learn how each inverter, string and battery behaves across irradiance, temperature and load, using months of plant history.",
             "Plant data streams on a monitoring screen"),
            ("Detect drift",
             "Live readings are compared with what the model expects. Small, persistent gaps are tracked even when no threshold is crossed.",
             "Chart showing a device drifting away from its expected curve"),
            ("Diagnose the likely cause",
             "The pattern of the drift points to a likely cause, such as cooling, a weak string, a failing fan or cell imbalance.",
             "Engineer reviewing a diagnosis on a laptop"),
            ("Recommend an action",
             "The system writes a work order in plain language: what is likely wrong, how urgent it is and what to check on site.",
             "Technician inspecting an inverter on site"),
        ], principles=[
            ("Explainable, not a black box", "Every alert shows the data behind it, so engineers can judge it for themselves."),
            ("People stay in charge", "The system recommends. Engineers decide what goes into the work plan."),
            ("Learns from outcomes", "When a technician closes a work order, the result is fed back so future alerts get more precise."),
        ]),
        stats("Results on AI-monitored sites", [
            ("40", "%", "Less unplanned downtime"),
            ("85", "%", "Of predicted faults confirmed on site"),
            ("200", "+", "Sites on AI monitoring"),
        ]),
        cards("What the models catch early", (
            "Typical early-warning patterns found on solar, wind and storage sites."
        ), [
            ("Thermostat", "Inverter overheating", "A unit running hotter than its peers under the same load, often a blocked filter or failing fan.", "Weeks of warning"),
            ("SolarPower", "Weak strings", "Gradual current loss on one string from damaged modules, loose connectors or a failing fuse.", "String level"),
            ("Speed", "Inverter derating", "Output capped below rating in the afternoon, a sign of thermal or grid-voltage limits.", "Lost peak energy"),
            ("BatteryChargingFull", "Battery cell drift", "Cell voltages spreading from the pack average cycle after cycle.", "Before imbalance trips"),
            ("WindPower", "Turbine underperformance", "Power below the expected curve from yaw error, pitch issues or blade condition.", "Power curve based"),
            ("CellTower", "Data quality issues", "Frozen sensors, drifting meters or gaps that would otherwise distort every report.", "Trustworthy data"),
        ]),
        side(
            "From alert to work order",
            "Each alert arrives as a short, readable task rather than a raw data point.",
            "right",
            "Work order on a mobile phone generated from an AI alert",
            bullets=[
                ("What", "Inverter 7 is running 6 °C hotter than inverters 5 to 9 under the same load."),
                ("Why it matters", "If the trend continues, it will start derating in the afternoon within about three weeks."),
                ("What to do", "Check the air filter and cooling fan at the next visit. No shutdown needed."),
            ],
            text="Teams act on a ranked list of tasks, sorted by the energy each one is putting at risk.",
            image_hint="Phone or tablet showing a maintenance task, held by a technician on site",
        ),
        highlights("Under the Hood", (
            "The data science behind the alerts, kept practical."
        ), [
            ("diagram", "Psychology", "Time-series models", "Per-device models trained on months of history", "Per device"),
            ("icon", "Analytics", "Peer comparison", "Devices compared with neighbours in the same conditions", "Weather neutral"),
            ("timeline", "Sync", "Continuous learning", "Closed work orders feed back into the models", "Improves over time"),
            ("signal", "Cloud", "Runs on existing data", "Uses data already flowing to SolarLive or SCADA", "No new hardware"),
        ]),
        faq("Frequently asked questions", [
            ("Do we need new sensors or hardware?",
             "Usually not. The models use the inverter, string, meter and weather data that a monitored plant "
             "already collects. Plants without monitoring start with a Genex data logger."),
            ("How much history is needed before the models are useful?",
             "Around three months of good-quality data gives useful results. Accuracy improves as more "
             "seasons and more confirmed faults are added."),
            ("Will this flood our team with alerts?",
             "No. Alerts are grouped, ranked by energy at risk and only raised when a pattern persists. The "
             "aim is fewer, better alerts than threshold monitoring."),
            ("Does it work for wind and storage, not just solar?",
             "Yes. The same approach is applied to turbine power curves and battery cell data, with models "
             "suited to each asset type."),
        ]),
        related_innovations("Related innovations", [
            ("ai-health-checkup", "Insights"), ("drone-monitoring", "Sensors"), ("re-nms", "Hub"),
        ], "More ways Genex uses data to protect plant performance."),
        cta(
            "See what your plant data is already telling you",
            "Share three months of data from one plant. We will run it through the models and show you the "
            "early warnings they find.",
            "Run a Free Trial Analysis", contact(),
        ),
    ],
    "confirm": [
        "40% less unplanned downtime, 85% confirmed predictions, 200+ sites (from earlier site data; '85% fault prediction accuracy' reworded as confirmed on site)",
        "Three months of history needed for useful results",
        "Free trial analysis offer in the CTA",
    ],
}
