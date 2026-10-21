"""
Innovations pages for `seed_section_content innovations`.

PAGES lists every Innovations page so pages can be found on any server
(by slug first, then by title) and linked to each other. The first slug is
used when a page is created.

Several innovations share a name with a Portfolio product (EMS-BESS, EV,
Power Billing). Their Innovations pages cover what is new in the technology
and link to the Portfolio page for the product itself, so the two never
repeat each other.
"""
from . import (
    advanced_scada, ai_health_checkup, ai_monitoring, drone_monitoring,
    ems_bess, ev_software, power_billing, power_management, power_trading,
    re_nms, smart_grid,
)

PAGES = {
    "advanced-scada":    (["advanced-scada", "solar-rooftop"], ["Advanced SCADA"]),
    "ai-monitoring":     (["ai-based-monitoring-systems", "ai-monitoring", "rms"],
                          ["AI-Based Monitoring Systems", "AI-Based Remote Monitoring Systems"]),
    "drone-monitoring":  (["drone-monitoring", "wind-energy"], ["Drone Monitoring"]),
    "ai-health-checkup": (["ai-plant-health-checkups", "ai-health-checkup"],
                          ["AI Plant Health Checkups", "AI-Plant Health Checkup", "AI Plant Health Checkup"]),
    "ev-software":       (["ev-software-management", "ev-infrastructure", "ev-software"], ["EV - Software Management"]),
    "power-billing":     (["power-billing-system", "power-billing"], ["Power Billing System"]),
    "re-nms":            (["re-nms", "solar-power-plants"], ["Re-NMS"]),
    "ems-bess":          (["ems-bess", "energy-storage"], ["EMS - BESS"]),
    "power-management":  (["power-management-tools", "industrial-energy"], ["Power Management Tools"]),
    "smart-grid":        (["smart-grid-utilities", "smart-grid"], ["Smart Grid & Utilities"]),
    "power-trading":     (["power-trading"], ["Power Trading"]),
}

CONTENT = {
    module.PAGE["key"]: module.PAGE
    for module in (
        advanced_scada, ai_monitoring, drone_monitoring, ai_health_checkup, ev_software,
        power_billing, re_nms, ems_bess, power_management, smart_grid, power_trading,
    )
}
