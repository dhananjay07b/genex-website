from ..builders import (
    contact, cta, faq, hero, highlights, how_we_work, intro, product,
    related_innovations, side, stats,
)

PAGE = {
    "key": "ems-bess",
    "tags": ["Energy Storage"],
    "seo_title": "AI Dispatch and Degradation-Aware Control for Battery Storage",
    "search_description": (
        "Genex storage research: machine learning forecasts, dispatch that accounts for battery wear, "
        "revenue stacking and hybrid solar, wind and storage control."
    ),
    "body": [
        hero(
            label="Storage Innovation",
            heading="Dispatch that weighs every rupee earned against every cycle used",
            description=(
                "Our storage research is about making batteries earn more over their whole life, not just "
                "in their first year, through better forecasts and wear-aware control."
            ),
            cta_text="Discuss Your Storage Project",
            cta_link=contact(),
        ),
        intro("A battery's real cost is the life you use up", [
            "Most battery controllers treat each charge and discharge as free. They chase every price gap, "
            "even when the saving is smaller than the wear it causes. The battery looks profitable in its "
            "first year and reaches its end-of-life capacity years early.",
            "The Genex EMS research programme treats battery life as a cost to be managed. Every dispatch "
            "decision weighs the expected saving or revenue against the degradation it will cause, using "
            "forecasts of load, solar output and prices.",
        ], note="Builds on the Genex EMS for BESS in service today"),
        how_we_work("How the optimiser plans a day", (
            "The optimiser runs ahead of time and keeps correcting itself through the day."
        ), [
            ("Forecast with machine learning",
             "Models forecast site load and solar or wind output for the next day, learning from each site's own history and weather.",
             "Forecast chart of load and solar output"),
            ("Price the wear",
             "Each possible cycle is given a cost, based on depth of discharge, temperature and the battery's current health.",
             "Battery racks inside a storage container"),
            ("Optimise the schedule",
             "The plan that earns the most after wear costs is chosen, within the owner's limits and backup reserve.",
             "Optimised charge and discharge schedule on screen"),
            ("Learn and correct",
             "Forecast errors and actual battery behaviour are fed back, so tomorrow's plan is better than today's.",
             "Engineer reviewing battery performance data"),
        ], principles=[
            ("Life-cycle value", "The goal is the most value over the battery's whole life, not the most in one month."),
            ("Hard safety limits", "Optimisation never overrides BMS limits or the owner's backup reserve."),
            ("Measured, not assumed", "Wear costs are updated from the battery's measured state of health."),
        ]),
        side(
            "Degradation-aware dispatch",
            "Not every cycle is worth running. The optimiser skips those that cost more in battery life than "
            "they earn.",
            "left",
            "Battery storage containers at a solar plant",
            bullets=[
                ("Depth of discharge", "Deep cycles wear lithium cells faster, so they are reserved for high-value hours."),
                ("Temperature", "Heavy cycling is avoided when cells are hot, where ageing is fastest."),
                ("State of health", "As the battery ages, its wear cost and usable window are updated automatically."),
            ],
            image_hint="Row of BESS containers, ideally next to a solar array",
        ),
        stats("Results from Genex storage control", [
            ("35", "%", "Average energy cost reduction"),
            ("200", "MWh", "Storage under management"),
            ("20", "%", "Longer projected battery life"),
        ]),
        highlights("Research Areas", (
            "Where the storage programme is focused."
        ), [
            ("diagram", "Psychology", "Machine learning forecasts", "Site-specific load and generation models", "Day ahead"),
            ("ring_stat", "BatteryChargingFull", "Wear-cost model", "Cycle cost from depth, temperature and health", "Per cycle"),
            ("timeline", "Layers", "Revenue stacking", "Several applications run in one plan", "Priority based"),
            ("icon", "WindPower", "Hybrid plant control", "Solar, wind and storage dispatched together", "Firm output"),
        ]),
        side(
            "Hybrid plants and firm power",
            "Combining solar, wind and storage behind one connection lets a plant deliver steadier output "
            "than any one of them alone.",
            "right",
            "Solar and wind generation at one site with storage",
            bullets=[
                ("Shape the output", "Storage fills gaps when solar fades in the evening or wind drops."),
                ("Meet a schedule", "Output is held close to the declared schedule, which reduces deviation penalties."),
                ("Use the connection fully", "Energy that would be curtailed at midday is stored and exported later."),
            ],
            image_hint="Wind turbines and solar panels together at one site",
        ),
        faq("Frequently asked questions", [
            ("Is this different from the EMS in your Portfolio?",
             "The Portfolio EMS is the product in service today. This page covers the forecasting and "
             "optimisation work being added to it. Existing Genex EMS sites receive these features as they "
             "are released."),
            ("Does wear-aware dispatch earn less money?",
             "It can earn slightly less in a single month, because it skips low-value cycles. Over the "
             "battery's life it earns more, because capacity lasts longer."),
            ("Can it run a hybrid solar and wind plant with storage?",
             "Yes. Hybrid control is one of the main research areas, aimed at plants that must deliver "
             "steady or scheduled output."),
        ]),
        related_innovations("Related innovations", [
            ("power-trading", "TrendingUp"), ("ai-monitoring", "Psychology"), ("ev-software", "EvStation"),
        ], "Market, analytics and EV work linked to storage."),
        cta(
            "Planning storage that has to pay for itself?",
            "Share your load data, tariff and battery plans. We will model the value of wear-aware dispatch "
            "for your site.",
            "Request a Storage Assessment", contact(),
            "See EMS for BESS", product("ems-bess"),
        ),
    ],
    "confirm": [
        "35% cost reduction, 200 MWh, 20% battery life extension (from earlier site data)",
        "Which features are live vs in research (ML forecasts, wear-cost model, hybrid control)",
    ],
}
