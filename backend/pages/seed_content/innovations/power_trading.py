from ..builders import (
    cards, contact, cta, faq, hero, highlights, how_we_work, intro, milestones,
    related_innovations, side,
)

PAGE = {
    "key": "power-trading",
    "tags": ["Grid & Utilities", "Research"],
    "seo_title": "Power Trading Platform for Renewable Generators and Large Consumers",
    "search_description": (
        "Genex research into forecast-driven power trading on Indian exchanges: day-ahead, real-time and "
        "green markets, with deviation management for renewable generators."
    ),
    "body": [
        hero(
            label="In Research",
            heading="Forecast-driven trading for India's power markets",
            description=(
                "Genex is building a trading platform that combines generation forecasts with market "
                "analytics, so renewable generators and large consumers can buy and sell power with confidence."
            ),
            cta_text="Join the Pilot Programme",
            cta_link=contact(),
        ),
        intro("Power markets now reward good forecasts", [
            "India's power exchanges have grown quickly. Alongside the day-ahead market, generators and "
            "buyers can now trade in a real-time market with auctions every half hour, and in dedicated "
            "green markets for renewable energy.",
            "For renewable generators, these markets are an opportunity and a risk. Selling well needs an "
            "accurate forecast of tomorrow's output and the next few hours. Deviating from the schedule "
            "brings penalties under the Deviation Settlement Mechanism. The platform under development "
            "brings forecasting, price analysis and bidding together to manage both.",
        ], note="This product is in research and development"),
        cards("The markets it is designed for", (
            "Each segment has its own timing, rules and use, and the platform is being built to work across them."
        ), [
            ("Schedule", "Day-Ahead Market", "Energy for the next day, traded in 15-minute blocks through a single daily auction.", "Next-day delivery"),
            ("Speed", "Real-Time Market", "Half-hourly auctions for delivery about an hour later, useful for correcting forecasts.", "Hour-ahead"),
            ("EnergySavingsLeaf", "Green markets", "Day-ahead and term-ahead segments for renewable energy, used for green energy procurement.", "Renewable only"),
            ("Timeline", "Term-ahead contracts", "Contracts from intraday up to several days ahead, for planned surpluses or needs.", "Days ahead"),
            ("Handshake", "Bilateral contracts", "Direct contracts between generators and buyers, often through traders.", "Longer term"),
            ("WarningAmber", "Deviation settlement", "Charges for deviating from schedule, which better forecasts reduce.", "Penalty risk"),
        ]),
        side(
            "Forecast first, then bid",
            "For a renewable generator, the quality of the bid can never be better than the quality of the forecast.",
            "right",
            "Generation forecast chart next to market prices",
            bullets=[
                ("Generation forecast", "Plant output forecast for each 15-minute block, from weather models and plant history."),
                ("Uncertainty bands", "A range around the forecast, so bids can be sized to the risk the generator accepts."),
                ("Intraday updates", "Forecasts refreshed through the day to use the real-time market for corrections."),
            ],
            image_hint="Trading or analytics desk with charts on screens",
        ),
        how_we_work("How the platform will work", (
            "The design under development follows three stages for every trading day."
        ), [
            ("Forecast",
             "Generation or demand is forecast block by block for the next day and refreshed through the day.",
             "Weather and generation forecast on screen"),
            ("Analyse prices",
             "Historical and recent market prices are analysed to estimate likely clearing prices and spreads.",
             "Market price chart"),
            ("Bid and settle",
             "Bids are prepared for approval, and results are reconciled against actual generation and settlement statements.",
             "Trader reviewing bids on a workstation"),
        ], principles=[
            ("Human approval", "The platform prepares bids. A person approves them before submission."),
            ("Within the rules", "Market regulations and exchange rules are built into every step."),
            ("Measured performance", "Forecast accuracy and trading results are tracked openly."),
        ]),
        highlights("Research Focus", (
            "The technical problems the programme is working on."
        ), [
            ("diagram", "Psychology", "Block-level forecasting", "Solar and wind output per 15-minute block", "96 blocks a day"),
            ("icon", "Analytics", "Price analytics", "Clearing price patterns by season and hour", "Market data"),
            ("timeline", "Sync", "Intraday re-forecasting", "Updates through the day for real-time trading", "Half-hourly"),
            ("security", "Lock", "Compliance by design", "Exchange and regulatory rules built in", "Audit trail"),
        ]),
        milestones([
            ("Research", "CURRENT STAGE", "Forecasting and market analytics",
             "Forecast models and price analysis tested on historical data from Genex-monitored plants.", True),
            ("Pilot", "NEXT", "Pilot with selected generators",
             "Forecasts and bid recommendations used alongside existing trading arrangements.", False),
            ("Launch", "PLANNED", "Commercial platform",
             "Full trading workflow for generators and large consumers, released after the pilot.", False),
        ]),
        faq("Frequently asked questions", [
            ("Is the platform available today?",
             "Not yet. It is in research and development. Selected generators and consumers can join the pilot "
             "programme as it opens."),
            ("Will Genex trade power on our behalf?",
             "The platform is designed to support generators, consumers and their traders, not to act as a "
             "trading member itself. Trading continues through registered members of the exchanges."),
            ("Who is it for?",
             "Renewable generators selling merchant power, large consumers buying from the exchanges, and "
             "traders who serve them."),
        ]),
        related_innovations("Related innovations", [
            ("ems-bess", "BatteryChargingFull"), ("ai-monitoring", "Psychology"), ("power-billing", "ReceiptLong"),
        ], "Storage, forecasting and settlement work linked to trading."),
        cta(
            "Interested in the pilot?",
            "Tell us about your plants or your power purchases. We will keep you informed and invite you "
            "when the pilot opens.",
            "Join the Pilot Programme", contact(),
        ),
    ],
    "confirm": [
        "Stage: research, pilot next (earlier site said commercial launch target 2026; no date is given on this page)",
        "Earlier site mentioned research partnerships with IITs and CERC units; left out until confirmed",
        "Market descriptions (DAM 15-min blocks, RTM half-hourly auctions, green markets): check before publishing",
    ],
}
