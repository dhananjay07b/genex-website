from ..builders import (
    cards, contact, cta, faq, gallery, hero, highlights, overview,
    related_innovations, side, stats,
)

PAGE = {
    "key": "re-nms",
    "tags": ["Monitoring"],
    "seo_title": "Re-NMS: Network Management for Renewable Energy Sites",
    "search_description": (
        "Re-NMS monitors the loggers, modems, routers and links behind renewable plant monitoring, "
        "detects outages in minutes and recovers many automatically. 3,000+ devices monitored."
    ),
    "body": [
        hero(
            label="Monitoring Innovation",
            heading="Keep the data flowing from every site you monitor",
            description=(
                "Re-NMS watches the communication network behind your plants: loggers, modems, routers "
                "and links. It finds outages in minutes and fixes many of them remotely."
            ),
            cta_text="See Re-NMS in Action",
            cta_link=contact(),
        ),
        stats("", [
            ("3,000", "+", "Network devices monitored"),
            ("98.5", "%", "Average network uptime"),
            ("<5", "min", "To detect a communication outage"),
        ]),
        overview("When the network fails, monitoring goes blind", [
            "Every monitoring dashboard depends on a chain of small devices: a data logger reading the "
            "inverters, a modem or router sending the data, a SIM card or fibre link carrying it. When any "
            "link in that chain fails, the dashboard shows a flat line, and nobody can tell whether the "
            "plant has stopped or just the data has.",
            "Across a portfolio of hundreds of sites, these failures happen every day. Teams lose hours "
            "calling sites, sending technicians to reset modems and filling data gaps by hand.",
            "Re-NMS is a network management system built for renewable portfolios. It monitors the "
            "communication equipment itself, so outages are found and fixed before they turn into missing "
            "reports.",
        ]),
        side(
            "Why monitoring data goes missing",
            "Most data gaps on renewable sites come from a short list of causes, and Re-NMS checks for each one.",
            "left",
            "Modem and data logger in a site communication panel",
            bullets=[
                ("Exhausted or blocked SIM", "The SIM's data allowance runs out or the account is suspended."),
                ("Hung modem or router", "The device is powered but has stopped passing traffic, usually fixed by a restart."),
                ("Power loss to the panel", "The communication panel loses its auxiliary supply after a trip or fault."),
                ("Field bus fault", "A loose RS485 connection or wrong address stops the logger reading devices."),
            ],
            image_hint="Communication panel with a router, modem and data logger",
        ),
        cards("What Re-NMS monitors", (
            "Every device between the field equipment and the cloud is tracked."
        ), [
            ("Storage", "Data loggers", "Online status, last successful reading and the health of each connected device.", "Per device"),
            ("Router", "Modems and routers", "Reachability, signal strength, uptime and traffic for every cellular or broadband link.", "Signal and traffic"),
            ("CellTower", "SIM cards", "Data usage against plan limits, so a SIM is topped up before it runs out.", "Usage alerts"),
            ("Lan", "Switches and fibre", "Port status and link errors on site networks and fibre rings.", "Link health"),
            ("Hub", "Gateways and RTUs", "Protocol gateways and RTUs that pass data to SCADA and SLDC.", "Protocol level"),
            ("Lock", "Firewalls and VPNs", "Tunnel status for secure remote access to each site.", "Secure access"),
        ]),
        side(
            "Automatic recovery",
            "Many outages can be fixed without anyone going to site.",
            "right",
            "Remote restart of a site router from the Re-NMS console",
            bullets=[
                ("Remote restart", "Hung modems and routers are restarted remotely, with a watchdog if the first attempt fails."),
                ("Backlog check", "After recovery, Re-NMS confirms that buffered logger data has been uploaded."),
                ("Escalation", "If remote recovery fails, a ticket goes to the nearest field engineer with the likely cause."),
            ],
            image_hint="Operator at a network monitoring console, or a router with status lights",
        ),
        highlights("How It Works", (
            "Re-NMS uses standard network management methods, adapted to energy site equipment."
        ), [
            ("signal", "CellTower", "Link monitoring", "Ping, SNMP and signal checks on every link", "Every minute"),
            ("icon", "MemoryOutlined", "Device heartbeats", "Loggers and gateways report health on schedule", "Missed beat alerts"),
            ("timeline", "Sync", "Self-healing actions", "Scripted restarts and checks before escalation", "Fewer site visits"),
            ("diagram", "Assessment", "SLA reporting", "Data availability per site and per month", "Contract evidence"),
        ]),
        gallery([
            ("Telecom tower serving a remote energy site", "Cell tower near a solar or wind site"),
            ("Network rack with routers and switches", "Small network rack with cables and status lights"),
            ("Engineer checking a communication panel at a solar plant", "Technician opening a panel on site"),
            ("Network operations dashboard", "Monitoring dashboard on a large screen"),
        ]),
        faq("Frequently asked questions", [
            ("Does Re-NMS replace our plant monitoring system?",
             "No. It works alongside SolarLive, SCADA or any other monitoring system, and watches the network "
             "those systems depend on."),
            ("Can it monitor equipment from other vendors?",
             "Yes. Re-NMS uses standard methods such as ping, SNMP and device APIs, which most industrial "
             "routers, switches and loggers support."),
            ("How does it tell a plant outage from a network outage?",
             "It compares the communication path with plant signals. If the router is online but the logger "
             "reports no inverter data, the problem is on site; if the router is unreachable, it is the network."),
        ]),
        related_innovations("Related innovations", [
            ("advanced-scada", "Dashboard"), ("ai-monitoring", "Psychology"), ("smart-grid", "ElectricBolt"),
        ], "Systems that depend on a healthy site network."),
        cta(
            "Tired of chasing missing data?",
            "Tell us how many sites you monitor and the equipment they use. We will show you how Re-NMS "
            "would track and recover them.",
            "Book a Demo", contact(),
        ),
    ],
    "confirm": [
        "3,000+ devices, 98.5% uptime, <5 min detection (from earlier site data)",
        "Remote restart / watchdog and SIM usage monitoring as current features",
    ],
}
