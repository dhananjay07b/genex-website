"""
Portfolio product pages for the seed_portfolio_content command.

PRODUCTS lists every Portfolio page so pages can be found on any server
(by slug first, then by title) and linked to each other. Pages with content
here are in CONTENT; the rest were written by hand in the CMS and are never
touched by the command.
"""
from . import (
    bms, carbon_credit, data_loggers, ev_software, power_billing,
    power_cloud, rms_kusum, rtc_power_tools, scada, zero_export,
)

# key: (possible slugs, possible titles). The first slug is used when a page is created.
PRODUCTS = {
    "solarlive":       (["solarlive"], ["SolarLive™", "SolarLive"]),
    "ems-bess":        (["energy-storage", "ems-bess", "ems-bess-storage"], ["EMS - BESS Storage"]),
    "wind-network":    (["wind-network", "wind-network-system"], ["Wind Network System"]),
    "bms":             (["bms", "battery-management-system"], ["BMS - Battery Management System"]),
    "rms-kusum":       (["rms", "rms-pm-kusum", "rms-pm-kusum-projects"], ["RMS - PM Kusum Projects"]),
    "scada":           (["scada", "scada-platform"], ["SCADA Platform"]),
    "ev-software":     (["ev-infrastructure", "ev-software", "ev-software-management"], ["EV - Software Management"]),
    "power-billing":   (["power-billing", "power-billing-tool"], ["Power Billing Tool (GNM & VNM)"]),
    "zero-export":     (["zero-export", "zero-export-tools"], ["Zero Export Tools"]),
    "carbon-credit":   (["carbon-credit", "carbon-credit-tools"], ["Carbon Credit Tools"]),
    "data-loggers":    (["iot-gateway", "data-loggers", "data-logger"], ["Data Loggers"]),
    "power-cloud":     (["power-cloud", "power-cloud-system"], ["Power Cloud System"]),
    "rtc-power-tools": (["rtc-power-tools", "rtc"], ["RTC - Power Tools"]),
}

CONTENT = {
    module.PAGE["key"]: module.PAGE
    for module in (
        bms, rms_kusum, scada, ev_software, power_billing,
        zero_export, carbon_credit, data_loggers, power_cloud, rtc_power_tools,
    )
}
