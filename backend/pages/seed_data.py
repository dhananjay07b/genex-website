"""
Seed data translated from frontend TypeScript config files and inline component data.
All content matches the exact shapes already in the Genex frontend.
No Django imports — pure Python data.
"""

# ---------------------------------------------------------------------------
# PORTFOLIO PRODUCTS — from frontend/src/config/portfolioProjects.ts
# ---------------------------------------------------------------------------
PORTFOLIO_PRODUCTS = [
    {
        "slug": "solarlive",
        "title": "SolarLive™",
        "badge": "Flagship",
        "family": "solar",
        "headline": "SolarLive™ — Real-Time Solar Analytics",
        "subline": "Flagship platform for real-time solar plant monitoring, performance analytics, and remote diagnostics across distributed solar assets.",
        "gradient": "from-amber-400/35 via-amber-200/20 to-yellow-100/10",
        "overview": [
            "SolarLive™ is Genex's flagship monitoring platform, purpose-built for commercial, industrial, and utility-scale solar assets. It aggregates data from inverters, weather stations, and energy meters into a single live dashboard — giving operators complete visibility from string level to portfolio level.",
            "Deployed across hundreds of sites nationwide, SolarLive™ delivers sub-minute data acquisition, automated fault detection, and weather-normalised PR reporting. Asset owners and O&M teams get real-time alerts, trend analysis, and daily generation summaries without manual intervention.",
        ],
        "capabilities": [
            "Live plant dashboard with PR, CUF, and yield tracking",
            "Fault detection and alarm management with SMS/email alerts",
            "Multi-site aggregation for portfolio-level visibility",
            "Inverter and string-level performance diagnostics",
            "Automated daily and monthly generation reports",
        ],
        "tech_highlights": [
            {"title": "Modbus TCP/RTU and RS485 inverter communication", "description": "Talks directly to inverters over Modbus TCP/RTU and RS485, covering the communication standards most solar inverter fleets already use."},
            {"title": "Sub-minute data acquisition and cloud sync", "description": "Polls plant data on a sub-minute cycle and syncs it to the cloud immediately, keeping the live dashboard genuinely live."},
            {"title": "4G/LTE, Wi-Fi, and fiber connectivity support", "description": "Works over 4G/LTE, Wi-Fi, or fiber backhaul, so connectivity choice is dictated by the site, not the platform."},
            {"title": "RESTful API for third-party ERP and CMMS integration", "description": "Exposes a RESTful API so generation and fault data can flow directly into existing ERP and CMMS systems."},
        ],
        "stats": [
            {"value": "300+", "suffix": "", "label": "Sites Monitored"},
            {"value": "500 MW", "suffix": "", "label": "Capacity Under Management"},
            {"value": "99.5%", "suffix": "", "label": "Platform Uptime"},
        ],
    },
    {
        "slug": "energy-storage",
        "title": "EMS - BESS Storage",
        "badge": "",
        "family": "storage",
        "headline": "EMS — Battery Energy Storage Management",
        "subline": "Full-stack energy management system for battery energy storage projects — from cell-level control to grid-side dispatch optimisation.",
        "gradient": "from-teal-400/35 via-cyan-300/20 to-blue-100/10",
        "overview": [
            "Genex's EMS-BESS platform delivers end-to-end control and monitoring for battery energy storage systems across grid-tied, off-grid, and hybrid configurations. The platform manages charge/discharge cycles, state-of-charge optimisation, and peak shaving — reducing energy costs and improving grid stability.",
            "Designed for scalability from a single cabinet to multi-megawatt BESS installations, the platform integrates with SolarLive™, SCADA systems, and grid dispatch signals. Operators get a unified view of storage performance, cycle health, and revenue metrics in real time.",
        ],
        "capabilities": [
            "SOC/SOH monitoring and cell balancing control",
            "Charge/discharge scheduling and peak shaving logic",
            "Grid-tied and off-grid BESS operation modes",
            "Thermal management and fault protection",
            "Revenue metering and dispatch optimisation",
        ],
        "tech_highlights": [
            {"title": "CAN bus and Modbus BMS communication", "description": "Communicates with battery management systems over CAN bus and Modbus, covering the two protocols most BESS hardware ships with."},
            {"title": "IEC 61850 grid interface support", "description": "Interfaces with grid-side equipment over IEC 61850, the standard substation automation protocol utilities already rely on."},
            {"title": "Real-time SOC/SOH calculation engine", "description": "Continuously calculates state-of-charge and state-of-health in real time, the two numbers that drive every dispatch decision."},
            {"title": "SCADA and EMS integration via OPC-UA", "description": "Connects to plant SCADA and third-party EMS platforms over OPC-UA, avoiding vendor lock-in on the control layer."},
        ],
        "stats": [
            {"value": "50+", "suffix": "", "label": "BESS Projects"},
            {"value": "200 MWh", "suffix": "", "label": "Storage Managed"},
            {"value": "30%", "suffix": "", "label": "Avg. Peak Demand Reduction"},
        ],
    },
    {
        "slug": "wind-network",
        "title": "Wind Network System",
        "badge": "",
        "family": "solar",
        "headline": "Wind Network System",
        "subline": "Network monitoring and performance management platform for wind farm operations — tracking turbine health, generation, and network uptime.",
        "gradient": "from-sky-400/35 via-cyan-300/20 to-blue-100/10",
        "overview": [
            "The Genex Wind Network System provides centralised performance visibility across wind farm operations. It integrates with turbine SCADA controllers to capture turbine-level generation, rotor speed, wind speed, availability, and fault data — enabling proactive maintenance and yield protection.",
            "Built for O&M contractors and wind developers, the platform supports multi-site portfolio management, automated alarm escalation, and trend analytics. Field teams receive real-time alerts and remote diagnostic capability, reducing response time and turbine downtime.",
        ],
        "capabilities": [
            "Turbine-level SCADA integration and data acquisition",
            "Wind speed, rotor speed, and power curve analysis",
            "Alarm management and remote diagnostics for field teams",
            "Availability and energy yield reporting",
            "Predictive fault analytics and maintenance scheduling",
        ],
        "tech_highlights": [
            {"title": "OPC-DA/UA and Modbus turbine controller integration", "description": "Pulls turbine-level data directly from SCADA controllers over OPC-DA/UA and Modbus, no proprietary turbine OEM software required."},
            {"title": "IEC 61400 wind data standard compliance", "description": "Structures wind and turbine data to IEC 61400 standards, keeping reporting consistent across mixed turbine fleets."},
            {"title": "4G/LTE and fiber backhaul connectivity", "description": "Backhauls turbine data over 4G/LTE or fiber depending on site access, without compromising on data continuity."},
            {"title": "REST API for developer and utility integrations", "description": "Provides a REST API for developers and utilities to build custom reporting or dispatch tools on top of turbine data."},
        ],
        "stats": [
            {"value": "1,000+", "suffix": "", "label": "Turbines Monitored"},
            {"value": "22%", "suffix": "", "label": "Avg. Downtime Reduction"},
            {"value": "15+", "suffix": "", "label": "Wind Farms Covered"},
        ],
    },
    {
        "slug": "bms",
        "title": "BMS - Battery Management System",
        "badge": "",
        "family": "storage",
        "headline": "BMS — Battery Management System",
        "subline": "Intelligent battery management system for multi-chemistry storage assets — ensuring safety, longevity, and peak performance at cell level.",
        "gradient": "from-emerald-400/35 via-green-300/20 to-teal-100/10",
        "overview": [
            "Genex's BMS platform provides real-time cell-level monitoring and protection for lithium-ion, LFP, and lead-acid battery banks. It continuously tracks cell voltage, temperature, and state-of-charge — triggering balancing and thermal protection actions to extend battery life and prevent failures.",
            "The system communicates over CAN, Modbus, and RS485 — making it compatible with a wide range of inverters and EMS platforms. Custom alarm thresholds, balancing logic, and data logging are configurable per project, supporting both stationary and mobile storage applications.",
        ],
        "capabilities": [
            "Real-time cell voltage, temperature, and SOC monitoring",
            "Passive and active balancing with thermal protection",
            "Communication via CAN, Modbus, and RS485",
            "Multi-chemistry support: LFP, NMC, lead-acid",
            "Configurable alarm thresholds and event logging",
        ],
        "tech_highlights": [
            {"title": "CAN 2.0B and ISO 15765 protocol support", "description": "Communicates over CAN 2.0B and ISO 15765 diagnostics protocols, matching what most lithium-ion and LFP battery packs speak natively."},
            {"title": "Modbus RTU/TCP for EMS integration", "description": "Exposes cell and pack data over Modbus RTU/TCP so any EMS platform can integrate without custom drivers."},
            {"title": "Sub-second cell data sampling rate", "description": "Samples individual cell voltage and temperature on a sub-second cycle, catching thermal events before they cascade."},
            {"title": "Hardware-level overcurrent and overvoltage protection", "description": "Backs software monitoring with hardware-level overcurrent and overvoltage cutoffs, protecting cells even if the control loop is delayed."},
        ],
        "stats": [
            {"value": "500+", "suffix": "", "label": "BMS Units Deployed"},
            {"value": "35%", "suffix": "", "label": "Avg. Battery Life Improvement"},
            {"value": "5", "suffix": "", "label": "Chemistry Types Supported"},
        ],
    },
    {
        "slug": "rms",
        "title": "RMS - PM Kusum Projects",
        "badge": "",
        "family": "solar",
        "headline": "RMS — PM Kusum Monitoring",
        "subline": "Remote monitoring system purpose-built for PM Kusum scheme solar installations — centralised visibility across distributed rural sites.",
        "gradient": "from-orange-400/35 via-amber-300/20 to-yellow-100/10",
        "overview": [
            "Genex's RMS platform is purpose-built for PM Kusum scheme deployments — providing centralised monitoring for distributed solar pumping and feeder separation projects across rural India. The system aggregates generation, consumption, and pump operation data from hundreds of remote sites into a single web dashboard.",
            "Designed for low-bandwidth rural connectivity, the RMS uses GPRS and 4G communication with local data buffering — ensuring no data loss even during network outages. Automated reports for government compliance are generated daily without manual data collection.",
        ],
        "capabilities": [
            "Multi-site dashboard for pump and feeder monitoring",
            "Generation and consumption tracking per installation",
            "Automated reporting for government compliance",
            "GPRS and 4G with local data buffering",
            "SMS and email alerts for fault and low generation events",
        ],
        "tech_highlights": [
            {"title": "GPRS, 4G LTE, and NB-IoT connectivity", "description": "Supports GPRS, 4G LTE, and NB-IoT connectivity options to match whatever network reaches a given rural site."},
            {"title": "Edge data buffering for offline resilience", "description": "Buffers readings locally at the edge during network outages, so rural connectivity gaps never translate into lost data."},
            {"title": "Modbus RTU for inverter and meter integration", "description": "Reads inverters and meters over Modbus RTU, keeping hardware integration simple across distributed pump and feeder sites."},
            {"title": "PM Kusum reporting format compliance", "description": "Generates daily reports in the exact format PM Kusum compliance requires, without manual data collection or formatting."},
        ],
        "stats": [
            {"value": "2,000+", "suffix": "", "label": "PM Kusum Sites Monitored"},
            {"value": "8", "suffix": "", "label": "States Covered"},
            {"value": "99%", "suffix": "", "label": "Data Availability"},
        ],
    },
    {
        "slug": "scada",
        "title": "SCADA Platform",
        "badge": "",
        "family": "grid",
        "headline": "SCADA Platform",
        "subline": "Industrial supervisory control and data acquisition platform — purpose-built for power generation, transmission, and distribution facilities.",
        "gradient": "from-indigo-400/35 via-violet-300/20 to-blue-100/10",
        "overview": [
            "The Genex SCADA Platform delivers real-time supervisory control and monitoring for power generation plants, substations, and distribution networks. Supporting IEC 61850, Modbus, DNP3, and OPC-UA protocols, it integrates with a wide range of field devices and PLCs without hardware lock-in.",
            "Sub-second data acquisition, real-time alarming, and a historian engine enable operators to maintain control room situational awareness and perform post-event analysis. The platform is deployed at substations, thermal plants, solar farms, and distribution control centres across India.",
        ],
        "capabilities": [
            "IEC 61850, Modbus, DNP3, and OPC-UA protocol support",
            "Sub-second data acquisition with real-time alarming",
            "Historian, trend analysis, and control room dashboards",
            "Remote switching and setpoint control",
            "Redundant server architecture for high availability",
        ],
        "tech_highlights": [
            {"title": "IEC 61850 Ed. 2 and GOOSE messaging", "description": "Supports IEC 61850 Ed. 2 with GOOSE messaging for fast, standardized protection and control signaling between devices."},
            {"title": "DNP3 and IEC 104 for RTU/telecontrol", "description": "Handles DNP3 and IEC 104 telecontrol protocols, covering the RTU communication standards common across Indian substations."},
            {"title": "OPC-UA for device-agnostic integration", "description": "Integrates PLCs and field devices over OPC-UA, avoiding hardware lock-in to a single vendor's protocol stack."},
            {"title": "Hot-standby redundancy with automatic failover", "description": "Keeps a mirrored standby server ready to take over control automatically if the primary node goes down."},
        ],
        "stats": [
            {"value": "80+", "suffix": "", "label": "SCADA Deployments"},
            {"value": "220 kV", "suffix": "", "label": "Highest Voltage Level"},
            {"value": "<1s", "suffix": "", "label": "Data Acquisition Cycle"},
        ],
    },
    {
        "slug": "ev-infrastructure",
        "title": "EV - Software Management",
        "badge": "",
        "family": "ev",
        "headline": "EV Software Management",
        "subline": "Comprehensive EV charging infrastructure management platform — covering charger control, session management, and fleet energy optimisation.",
        "gradient": "from-green-400/35 via-emerald-300/20 to-teal-100/10",
        "overview": [
            "Genex's EV Software Management platform provides complete lifecycle management for electric vehicle charging infrastructure — from individual chargers to national fleet networks. The OCPP-compliant platform handles charger onboarding, session management, RFID authentication, billing, and real-time load balancing from a single dashboard.",
            "Built for enterprise fleets, corporate campuses, and public charging operators, the platform scales from a pilot of 10 chargers to hundreds of charge points without platform migration.",
        ],
        "capabilities": [
            "OCPP-compliant charger management and remote diagnostics",
            "User authentication, billing, and session reporting",
            "Fleet energy scheduling and load balancing",
            "Real-time charger availability and fault alerts",
            "Mobile app for driver access and session monitoring",
        ],
        "tech_highlights": [
            {"title": "OCPP 1.6J and 2.0.1 protocol support", "description": "Supports both OCPP 1.6J and 2.0.1, so the platform manages older charger fleets alongside the newest hardware."},
            {"title": "RFID, QR code, and app-based authentication", "description": "Authenticates drivers through RFID, QR code, or the mobile app, matching whichever method a site's users prefer."},
            {"title": "REST API for fleet management system integration", "description": "Exposes a REST API so fleet management systems can pull charger status and push session data directly."},
            {"title": "Smart charging with ISO 15118 V2G readiness", "description": "Builds in ISO 15118 V2G readiness now, positioning charging infrastructure for bidirectional power flow as regulation catches up."},
        ],
        "stats": [
            {"value": "500+", "suffix": "", "label": "Chargers Managed"},
            {"value": "40+", "suffix": "", "label": "Enterprise Clients"},
            {"value": "99.2%", "suffix": "", "label": "Charger Uptime"},
        ],
    },
    {
        "slug": "power-billing",
        "title": "Power Billing Tool (GNM & VNM)",
        "badge": "",
        "family": "ev",
        "headline": "Power Billing Tool (GNM & VNM)",
        "subline": "Automated power billing system for gross net metering and virtual net metering installations — reducing manual effort and billing errors.",
        "gradient": "from-blue-400/35 via-sky-300/20 to-cyan-100/10",
        "overview": [
            "The Genex Power Billing Tool automates unit calculation, tariff application, and bill generation for solar installations operating under Gross Net Metering (GNM) and Virtual Net Metering (VNM) frameworks.",
            "The platform supports multi-tariff structures, time-of-use rates, and government surcharges. Utility staff and project developers can generate bulk bills, reconcile generation data against distribution company records, and provide consumers with a self-service portal.",
        ],
        "capabilities": [
            "Automated unit calculation for GNM and VNM accounts",
            "Multi-tariff support with tax and surcharge computation",
            "Bulk bill generation and consumer portal access",
            "Discoms reconciliation and exception reporting",
            "API integration with utility billing systems",
        ],
        "tech_highlights": [
            {"title": "GNM and VNM regulatory formula engine", "description": "Applies GNM and VNM billing formulas automatically per project, removing manual tariff calculation from the billing cycle."},
            {"title": "Time-of-use and slab tariff support", "description": "Handles time-of-use and slab tariff structures natively, matching the rate designs most Indian discoms actually use."},
            {"title": "REST API for discom MIS integration", "description": "Reconciles generation and billing data with discom MIS systems directly over a REST API, cutting manual data entry."},
            {"title": "PDF bill generation with digital signature support", "description": "Generates signed PDF bills automatically, giving consumers a verifiable document without manual sign-off."},
        ],
        "stats": [
            {"value": "10,000+", "suffix": "", "label": "Bills Generated Monthly"},
            {"value": "15+", "suffix": "", "label": "Discom Formats Supported"},
            {"value": "98%", "suffix": "", "label": "Billing Accuracy Rate"},
        ],
    },
    {
        "slug": "zero-export",
        "title": "Zero Export Tools",
        "badge": "",
        "family": "grid",
        "headline": "Zero Export Tools",
        "subline": "Real-time solar generation curtailment system that prevents excess power injection into the grid — maintaining compliance with utility requirements.",
        "gradient": "from-violet-400/35 via-purple-300/20 to-indigo-100/10",
        "overview": [
            "Genex's Zero Export Tools provide real-time inverter control to match solar generation to on-site load — preventing any excess power from being exported to the utility grid. This is critical for installations where grid export is restricted by the local discom.",
            "The system monitors grid import in real time and dynamically adjusts inverter output set-points as load varies throughout the day. All control actions and limit events are logged for utility compliance reporting.",
        ],
        "capabilities": [
            "Real-time inverter control to match grid import",
            "Dynamic set-point adjustment as load varies",
            "Event logging and utility compliance reports",
            "Multi-inverter coordination for large plant deployments",
            "Alarm on export threshold breach",
        ],
        "tech_highlights": [
            {"title": "Modbus TCP/RTU inverter control interface", "description": "Controls inverter output set-points directly over Modbus TCP/RTU, compatible with the communication interface most inverters expose."},
            {"title": "CT/PT-based real-time grid import sensing", "description": "Senses grid import in real time through CT/PT metering, giving the control loop an accurate, low-latency signal to act on."},
            {"title": "Sub-second response to load changes", "description": "Adjusts inverter output within a sub-second window as on-site load changes, keeping export at zero without overcorrecting."},
            {"title": "Compatible with all major inverter brands", "description": "Works across all major inverter brands, so the export-limiting logic doesn't dictate which hardware a site can install."},
        ],
        "stats": [
            {"value": "200+", "suffix": "", "label": "Zero Export Sites"},
            {"value": "<1s", "suffix": "", "label": "Response Latency"},
            {"value": "100%", "suffix": "", "label": "Export Compliance Rate"},
        ],
    },
    {
        "slug": "carbon-credit",
        "title": "Carbon Credit Tools",
        "badge": "",
        "family": "ev",
        "headline": "Carbon Credit Tools",
        "subline": "Automated carbon credit accounting platform — tracking renewable energy generation, calculating credits, and generating verified audit reports.",
        "gradient": "from-lime-400/35 via-green-300/20 to-emerald-100/10",
        "overview": [
            "The Genex Carbon Credit Tools platform automates the full carbon credit lifecycle for renewable energy assets — from generation data ingestion to credit calculation, registry submission preparation, and audit-ready reporting.",
            "The platform integrates with SolarLive™ and other monitoring systems to pull verified generation data directly. Credits are calculated against BEE, UNFCCC, and voluntary market registry standards.",
        ],
        "capabilities": [
            "Automated MWh-to-credit conversion per registry standards",
            "Generation data integration from monitoring platforms",
            "Audit-ready reports for BEE and UNFCCC submissions",
            "Vintage tracking and credit portfolio management",
            "API output for registry and marketplace integration",
        ],
        "tech_highlights": [
            {"title": "BEE and UNFCCC calculation methodology support", "description": "Calculates credits using BEE and UNFCCC-approved methodologies, keeping every conversion aligned with the standard a registry expects."},
            {"title": "Integration with SolarLive™ and third-party platforms", "description": "Pulls verified generation data directly from SolarLive™ or any connected third-party monitoring platform, no manual re-entry."},
            {"title": "SHA-256 data integrity verification for audit trails", "description": "Hashes every generation record with SHA-256, giving auditors a tamper-evident trail from raw data to final credit."},
            {"title": "ISO 14064 alignment for GHG accounting", "description": "Aligns GHG accounting methodology with ISO 14064, keeping reports consistent with international carbon accounting practice."},
        ],
        "stats": [
            {"value": "500,000+", "suffix": "", "label": "Credits Tracked"},
            {"value": "3", "suffix": "", "label": "Registry Standards Supported"},
            {"value": "100%", "suffix": "", "label": "Audit Pass Rate"},
        ],
    },
    {
        "slug": "iot-gateway",
        "title": "Data Loggers",
        "badge": "",
        "family": "solar",
        "headline": "Data Loggers",
        "subline": "Edge connectivity devices that aggregate field sensor data and relay it to cloud platforms — the hardware backbone of any monitoring system.",
        "gradient": "from-slate-400/35 via-gray-300/20 to-zinc-100/10",
        "overview": [
            "Genex Data Loggers are edge devices that collect real-time data from inverters, meters, sensors, and PLCs — and transmit it to cloud monitoring platforms over 4G, Wi-Fi, or fiber. Built for harsh industrial environments, they operate reliably in outdoor enclosures.",
            "Plug-and-play integration with SolarLive™, the SCADA Platform, and third-party systems makes commissioning fast. Local buffering ensures zero data loss during connectivity gaps.",
        ],
        "capabilities": [
            "Multi-protocol support: Modbus, RS485, CAN, 4G/LTE",
            "Local buffering ensures no data loss during connectivity gaps",
            "Plug-and-play integration with SolarLive™ and SCADA Platform",
            "Remote firmware updates and configuration management",
            "DIN-rail mounting with industrial-grade enclosure options",
        ],
        "tech_highlights": [
            {"title": "Modbus RTU/TCP, RS485, and CAN bus support", "description": "Speaks Modbus RTU/TCP, RS485, and CAN bus out of the box, covering the field protocols most inverters, meters, and BMS units use."},
            {"title": "4G LTE, Wi-Fi, and Ethernet uplink options", "description": "Ships with 4G LTE, Wi-Fi, or Ethernet uplink options, letting each deployment pick the connectivity path a site actually has."},
            {"title": "On-device SQLite buffering up to 30 days", "description": "Buffers up to 30 days of readings locally in an on-device SQLite store, so extended outages never mean lost data."},
            {"title": "MQTT and REST for cloud platform connectivity", "description": "Syncs buffered data to the cloud over MQTT or REST once connectivity returns, with automatic retry and no manual intervention."},
        ],
        "stats": [
            {"value": "5,000+", "suffix": "", "label": "Units Deployed"},
            {"value": "30 Days", "suffix": "", "label": "Local Data Buffer"},
            {"value": "10+ Years", "suffix": "", "label": "Device Lifespan"},
        ],
    },
    {
        "slug": "power-cloud",
        "title": "Power Cloud System",
        "badge": "",
        "family": "grid",
        "headline": "Power Cloud System",
        "subline": "Centralized cloud analytics platform that aggregates data from multiple energy assets — providing unified dashboards, KPIs, and scheduled reports.",
        "gradient": "from-cyan-400/35 via-sky-300/20 to-blue-100/10",
        "overview": [
            "The Genex Power Cloud System is a centralised analytics platform for energy asset owners and operators managing multiple sites, technologies, and asset classes. It ingests data from SolarLive™, SCADA systems, EMS platforms, and third-party sources.",
            "Customizable KPI dashboards, scheduled report delivery, and trend analytics give management teams a real-time view of portfolio performance without logging into individual plant systems.",
        ],
        "capabilities": [
            "Multi-asset, multi-site data aggregation and normalisation",
            "Customizable KPI dashboards with scheduled report delivery",
            "API-first architecture for third-party integrations",
            "Cross-portfolio performance benchmarking",
            "Role-based access for operators, managers, and clients",
        ],
        "tech_highlights": [
            {"title": "REST and GraphQL API for data access", "description": "Offers both REST and GraphQL endpoints, letting integration teams choose whichever query pattern fits their BI or ERP tooling."},
            {"title": "MQTT and WebSocket for real-time data ingestion", "description": "Ingests live data over MQTT and WebSocket, keeping cross-portfolio dashboards current without polling delays."},
            {"title": "Multi-tenant architecture with data isolation", "description": "Isolates each client's data at the architecture level while sharing infrastructure, so multi-tenant scale never risks data leakage."},
            {"title": "Power BI and Tableau connector support", "description": "Connects natively to Power BI and Tableau, so management teams can build custom reporting on top of the unified data model."},
        ],
        "stats": [
            {"value": "1,000+", "suffix": "", "label": "Assets on Platform"},
            {"value": "50M+", "suffix": "", "label": "Data Points per Day"},
            {"value": "99.9%", "suffix": "", "label": "API Uptime"},
        ],
    },
    {
        "slug": "rtc-power-tools",
        "title": "RTC - Power Tools",
        "badge": "",
        "family": "grid",
        "headline": "RTC Power Tools",
        "subline": "Real-time control tools for precision power management — enabling dynamic load management, harmonic analysis, and power quality correction.",
        "gradient": "from-rose-400/35 via-orange-300/20 to-amber-100/10",
        "overview": [
            "Genex RTC Power Tools provide real-time monitoring and control capability for power quality management in industrial and commercial facilities. The platform captures load profiles, harmonic distortion data, and power factor readings.",
            "Integrated demand forecasting and ISO 50001-aligned reporting tools help energy managers demonstrate compliance, identify efficiency opportunities, and reduce demand charges.",
        ],
        "capabilities": [
            "Real-time load profiling and demand forecasting",
            "Power factor correction and harmonic distortion analysis",
            "ISO 50001 energy management system reporting support",
            "Closed-loop VFD and capacitor bank control",
            "Tariff optimisation and peak demand alerts",
        ],
        "tech_highlights": [
            {"title": "IEC 61000-4 power quality measurement compliance", "description": "Measures harmonic distortion and power quality to IEC 61000-4 standards, producing readings that hold up to audit."},
            {"title": "Modbus and BACnet meter integration", "description": "Integrates directly with meters and PLCs over Modbus and BACnet, capturing load and power quality data without extra hardware."},
            {"title": "ISO 50001 EnPI and baseline reporting", "description": "Automates ISO 50001 EnPI and baseline reporting, giving energy managers audit-ready compliance documentation without manual tracking."},
            {"title": "Real-time demand response signal processing", "description": "Processes demand response signals in real time, coordinating VFDs and capacitor banks to react as tariff or grid conditions shift."},
        ],
        "stats": [
            {"value": "150+", "suffix": "", "label": "Industrial Sites"},
            {"value": "18%", "suffix": "", "label": "Avg. Energy Cost Reduction"},
            {"value": "ISO 50001", "suffix": "", "label": "Compliance Supported"},
        ],
    },
]


# ---------------------------------------------------------------------------
# INNOVATION PRODUCTS — from frontend/src/config/innovationsProducts.ts
# ---------------------------------------------------------------------------
INNOVATION_PRODUCTS = [
    {
        "slug": "solar-rooftop",
        "title": "Advanced SCADA",
        "badge": "Advanced",
        "category": "monitoring",
        "stage": "scaled",
        "headline": "Advanced SCADA — Next-Gen Supervisory Control",
        "subline": "A next-generation SCADA platform engineered for modern power infrastructure — combining real-time control, AI-assisted diagnostics, and cloud-native architecture at scale.",
        "gradient": "from-indigo-400/35 via-violet-300/20 to-blue-100/10",
        "overview": [
            "Genex Advanced SCADA moves beyond traditional supervisor systems — replacing on-premise HMI terminals and proprietary protocol locks with a cloud-native, protocol-agnostic control layer. It supports IEC 61850, DNP3, Modbus, and OPC-UA simultaneously.",
            "The platform ships with a built-in AI anomaly engine that continuously profiles normal equipment behavior and flags deviations before they cause failures. Advanced SCADA scales from a handful of points to millions — without re-platforming or licence upgrades.",
        ],
        "capabilities": [
            "Multi-protocol gateway: IEC 61850, DNP3, Modbus, OPC-UA in a single deployment",
            "AI anomaly detection engine with real-time deviation alerts",
            "Cloud-native architecture — no on-premise server dependency",
            "Sub-second data acquisition with historian and trend analysis",
            "Role-based access control and full audit logging",
            "Remote setpoint control and automated interlock sequences",
        ],
        "tech_highlights": [
            {"title": "IEC 61850 Ed. 2 with GOOSE and SV messaging", "description": "Delivers substation-grade interoperability across mixed-vendor devices, using GOOSE and Sampled Values for microsecond-level protection signaling."},
            {"title": "DNP3 Secure Authentication v5", "description": "Encrypts and authenticates telecontrol traffic to DNP3 SAv5 standards, closing the gap that plain DNP3 leaves open on utility networks."},
            {"title": "WebSocket streaming for real-time dashboard updates", "description": "Pushes live point updates to operator dashboards over persistent WebSocket connections instead of slow polling cycles."},
            {"title": "Hot-standby redundancy with automatic failover < 2s", "description": "Runs a mirrored standby server that takes over control in under two seconds if the primary node fails, with zero manual intervention."},
        ],
        "stats": [
            {"value": "100+", "suffix": "", "label": "SCADA Deployments"},
            {"value": "220 kV", "suffix": "", "label": "Highest Voltage Level"},
            {"value": "<1s", "suffix": "", "label": "Data Acquisition Cycle"},
        ],
    },
    {
        "slug": "solar-power-plants",
        "title": "Re-NMS",
        "badge": "Network Management",
        "category": "monitoring",
        "stage": "deployed",
        "headline": "Re-NMS — Renewable Network Management System",
        "subline": "Centralised network management for renewable energy portfolios — tracking plant health, communication uptime, and network device status across geographically distributed assets.",
        "gradient": "from-sky-400/35 via-cyan-300/20 to-blue-100/10",
        "overview": [
            "Re-NMS is Genex's dedicated network management system for renewable energy infrastructure. It monitors communication links, data loggers, modems, routers, and edge devices across hundreds of sites.",
            "When a data logger goes offline or a 4G modem loses connectivity, Re-NMS detects the outage within minutes and automatically dispatches alerts to field engineers.",
        ],
        "capabilities": [
            "Real-time monitoring of edge devices, modems, and data loggers",
            "Automated outage detection with field engineer alert dispatch",
            "Communication uptime SLA dashboards per site and portfolio",
            "Remote device restart and firmware push capabilities",
            "Integration with SolarLive™ and third-party monitoring platforms",
        ],
        "tech_highlights": [
            {"title": "ICMP, SNMP, and REST-based device health polling", "description": "Continuously polls modems, routers, and loggers over ICMP, SNMP, and REST so a silent device failure is caught before it becomes a data gap."},
            {"title": "MQTT heartbeat monitoring with configurable timeout thresholds", "description": "Tracks lightweight MQTT heartbeats per device with adjustable timeout windows, tuned to each site's connectivity profile."},
            {"title": "Automated escalation rules with on-call rotation support", "description": "Routes unresolved outages through configurable escalation chains and on-call rotations so alerts always reach an available field engineer."},
            {"title": "Multi-tenant architecture for managing multiple client portfolios", "description": "Isolates data and dashboards per client while running on shared infrastructure, letting O&M teams manage many portfolios from one deployment."},
        ],
        "stats": [
            {"value": "3,000+", "suffix": "", "label": "Devices Monitored"},
            {"value": "98.5%", "suffix": "", "label": "Avg. Network Uptime"},
            {"value": "<5 min", "suffix": "", "label": "Outage Detection Time"},
        ],
    },
    {
        "slug": "rms",
        "title": "AI-Based Remote Monitoring Systems",
        "badge": "AI-Powered",
        "category": "ai",
        "stage": "deployed",
        "headline": "AI-Based Remote Monitoring System",
        "subline": "Intelligent remote monitoring that goes beyond data collection — using ML models to predict faults, recommend maintenance actions, and optimize asset performance autonomously.",
        "gradient": "from-violet-400/35 via-purple-300/20 to-indigo-100/10",
        "overview": [
            "Genex AI-RMS adds a machine learning layer on top of conventional remote monitoring — shifting from reactive alert management to predictive, prescriptive operations.",
            "The system generates plain-language work orders for maintenance teams — not just raw alerts — explaining what is likely wrong, how urgent it is, and what action to take.",
        ],
        "capabilities": [
            "ML-based fault prediction for inverters, panels, and batteries",
            "Automated plain-language work order generation for maintenance teams",
            "Performance ratio anomaly detection with weather normalization",
            "Self-improving models based on maintenance outcome feedback",
            "Natural language query interface for operational data",
        ],
        "tech_highlights": [
            {"title": "LSTM and transformer models for time-series fault prediction", "description": "Trains LSTM and transformer architectures on historical sensor time-series to catch early-stage degradation before it triggers a hard fault."},
            {"title": "scikit-learn and PyTorch inference engine on cloud backend", "description": "Runs a hybrid scikit-learn and PyTorch inference stack in the cloud, balancing classical models with deep learning where each performs best."},
            {"title": "Real-time streaming inference with < 30s prediction latency", "description": "Scores incoming telemetry against trained models within 30 seconds, keeping predictions close enough to real time for operational response."},
            {"title": "Explainable AI layer — all alerts include reasoning and confidence score", "description": "Attaches a plain-language reason and confidence score to every alert, so maintenance teams can act on model output without a black box."},
        ],
        "stats": [
            {"value": "40%", "suffix": "", "label": "Reduction in Unplanned Downtime"},
            {"value": "85%", "suffix": "", "label": "Fault Prediction Accuracy"},
            {"value": "200+", "suffix": "", "label": "Sites on AI Monitoring"},
        ],
    },
    {
        "slug": "energy-storage",
        "title": "EMS - BESS",
        "badge": "Energy Storage",
        "category": "storage",
        "stage": "deployed",
        "headline": "EMS-BESS — AI-Driven Energy Storage Management",
        "subline": "Next-generation energy management system for battery storage — with AI-driven dispatch optimization, predictive cycle management, and grid ancillary service capability.",
        "gradient": "from-teal-400/35 via-cyan-300/20 to-blue-100/10",
        "overview": [
            "The Genex EMS-BESS Innovation Platform extends standard storage management with AI-driven economic dispatch — automatically choosing when to charge from the grid, when to discharge to reduce demand peaks, and when to participate in ancillary markets.",
            "Unlike conventional EMS platforms that follow fixed schedules, Genex EMS-BESS ingests live grid signals, tariff schedules, and weather forecasts — making adaptive dispatch decisions every minute.",
        ],
        "capabilities": [
            "AI economic dispatch: tariff arbitrage, peak shaving, ancillary services",
            "Real-time battery degradation modeling and cycle optimization",
            "Live grid signal ingestion for adaptive charge/discharge decisions",
            "Multi-asset coordination across co-located solar + storage systems",
            "Regulatory reporting for capacity markets and ancillary services",
        ],
        "tech_highlights": [
            {"title": "Reinforcement learning-based dispatch optimization engine", "description": "Uses reinforcement learning to continuously refine charge/discharge decisions against live grid signals, tariffs, and forecast data."},
            {"title": "IEC 61850 grid interface and MODBUS BMS communication", "description": "Bridges standardized IEC 61850 grid signaling with Modbus-based BMS communication, unifying grid and battery control in one system."},
            {"title": "Sub-minute dispatch cycle with adaptive forecast integration", "description": "Recomputes dispatch decisions on a sub-minute cycle, folding in updated weather and tariff forecasts as conditions change."},
            {"title": "Digital twin of battery chemistry for degradation simulation", "description": "Simulates battery chemistry behavior in a digital twin to model degradation ahead of time and adjust cycling to protect lifetime value."},
        ],
        "stats": [
            {"value": "35%", "suffix": "", "label": "Avg. Energy Cost Reduction"},
            {"value": "200 MWh", "suffix": "", "label": "Storage Under Management"},
            {"value": "20%", "suffix": "", "label": "Battery Life Extension"},
        ],
    },
    {
        "slug": "wind-energy",
        "title": "Drone Monitoring",
        "badge": "AI Vision",
        "category": "ai",
        "stage": "prototype",
        "headline": "Drone Monitoring — Autonomous Aerial Plant Inspection",
        "subline": "AI-powered drone inspection platform for solar and wind assets — automating panel health assessment, hotspot detection, and structural inspection without manual risk.",
        "gradient": "from-amber-400/35 via-orange-300/20 to-yellow-100/10",
        "overview": [
            "Genex Drone Monitoring replaces manual rooftop and climbing inspections with autonomous drone flights and AI-powered image analysis. Drones capture thermal and RGB imagery across entire solar arrays or wind turbine blades.",
            "Each inspection generates a geo-tagged fault map with severity classification and a prioritized remediation list — giving maintenance crews precise panel-level coordinates rather than hours of manual visual scanning.",
        ],
        "capabilities": [
            "Autonomous drone flight path planning for large solar arrays",
            "Thermal and RGB imagery analysis for hotspot and defect detection",
            "AI-generated geo-tagged fault maps with severity scoring",
            "Soiling index calculation from aerial imagery",
            "Integration with monitoring platforms for correlation with generation loss",
        ],
        "tech_highlights": [
            {"title": "Computer vision models trained on 500,000+ panel images", "description": "Trained on more than 500,000 labeled panel images, the vision models reliably distinguish hotspots, soiling, and delamination from normal wear."},
            {"title": "DJI SDK and MAVLink drone control protocol integration", "description": "Integrates directly with DJI SDK and MAVLink flight controllers to plan and execute autonomous inspection flight paths."},
            {"title": "Orthomosaic stitching with sub-cm spatial resolution", "description": "Stitches individual aerial captures into a single orthomosaic with sub-centimeter resolution, precise enough to pinpoint a single faulty cell."},
            {"title": "Edge inference on drone payload for real-time flagging", "description": "Runs defect-detection inference directly on the drone payload, flagging likely faults during flight instead of waiting for post-processing."},
        ],
        "stats": [
            {"value": "80%", "suffix": "", "label": "Inspection Time Reduction"},
            {"value": "500+", "suffix": "", "label": "MW Inspected Aerially"},
            {"value": "92%", "suffix": "", "label": "Defect Detection Accuracy"},
        ],
    },
    {
        "slug": "industrial-energy",
        "title": "Power Management Tools",
        "badge": "Grid Tools",
        "category": "grid",
        "stage": "deployed",
        "headline": "Power Management Tools — Industrial Energy Intelligence",
        "subline": "Comprehensive power quality and demand management platform for industrial and commercial facilities.",
        "gradient": "from-emerald-400/35 via-green-300/20 to-teal-100/10",
        "overview": [
            "Genex Power Management Tools give industrial energy managers the analytical depth to understand their electricity consumption, identify inefficiencies, and take corrective action before the next billing cycle.",
            "Demand forecasting models alert teams before demand peaks that would trigger expensive charges. Closed-loop control integrations with VFDs and capacitor banks enable automatic power factor correction.",
        ],
        "capabilities": [
            "Half-hourly load profiling and demand forecasting with peak alerts",
            "Power factor monitoring and automated capacitor bank control",
            "Harmonic distortion analysis per IEC 61000-4 standards",
            "Tariff optimization — TOD, slab, and demand charge analysis",
            "ISO 50001 EnPI baseline and continuous improvement reporting",
        ],
        "tech_highlights": [
            {"title": "Modbus and BACnet smart meter integration", "description": "Pulls half-hourly readings directly from smart meters and PLCs over Modbus and BACnet, no manual meter walks required."},
            {"title": "IEC 61000-4 power quality measurement compliance", "description": "Measures harmonic distortion and power quality to IEC 61000-4 test standards, giving auditable, standards-compliant readings."},
            {"title": "Closed-loop VFD and capacitor bank control via Modbus", "description": "Closes the loop on power factor correction by driving VFDs and capacitor banks directly over Modbus when thresholds are breached."},
            {"title": "ISO 50001:2018 EnPI calculation and baseline engine", "description": "Automates ISO 50001:2018 EnPI baseline calculation, tracking continuous improvement without manual spreadsheet reporting."},
        ],
        "stats": [
            {"value": "150+", "suffix": "", "label": "Industrial Sites"},
            {"value": "18%", "suffix": "", "label": "Avg. Energy Cost Reduction"},
            {"value": "ISO 50001", "suffix": "", "label": "Compliance Supported"},
        ],
    },
    {
        "slug": "ai-health-checkup",
        "title": "AI-Plant Health Checkup",
        "badge": "AI Diagnostics",
        "category": "ai",
        "stage": "prototype",
        "headline": "AI-Plant Health Checkup",
        "subline": "Automated AI-driven health assessment for solar and battery plants — delivering instant diagnostics, performance benchmarks, and a prioritized remediation plan in under an hour.",
        "gradient": "from-rose-400/35 via-pink-300/20 to-orange-100/10",
        "overview": [
            "AI-Plant Health Checkup is a diagnostic product that gives plant owners a complete, unbiased assessment of their solar or storage asset's current condition — without waiting for the next scheduled audit.",
            "The output is a structured health report with a traffic-light score per subsystem, a ranked list of remediation actions sorted by revenue impact, and an estimated financial recovery for each fix.",
        ],
        "capabilities": [
            "Automated 12-month performance analysis and benchmark comparison",
            "Subsystem health scoring: inverters, strings, meters, communication",
            "Weather-normalized yield loss attribution per fault category",
            "Financial recovery estimation per remediation action",
            "Structured PDF health report with executive summary",
        ],
        "tech_highlights": [
            {"title": "Weather normalization using ERA5 and satellite irradiance data", "description": "Normalizes plant output against ERA5 reanalysis and satellite irradiance data, separating true underperformance from weather variability."},
            {"title": "Random forest classifier for fault attribution and scoring", "description": "Uses a random forest classifier to attribute yield loss to a specific fault category and rank subsystems by health score."},
            {"title": "Integration with SolarLive™ and third-party monitoring APIs", "description": "Pulls 12 months of operational history directly from SolarLive™ or any third-party monitoring API, no manual data export needed."},
            {"title": "Automated report generation pipeline — full PDF in < 60 minutes", "description": "Runs the full analysis-to-report pipeline automatically, delivering a structured PDF health report in under 60 minutes."},
        ],
        "stats": [
            {"value": "50+", "suffix": "", "label": "Plants Assessed"},
            {"value": "< 1hr", "suffix": "", "label": "Report Generation Time"},
            {"value": "22%", "suffix": "", "label": "Avg. Recoverable Yield Found"},
        ],
    },
    {
        "slug": "smart-grid",
        "title": "Smart Grid & Utilities",
        "badge": "Smart Grid",
        "category": "grid",
        "stage": "deployed",
        "headline": "Smart Grid & Utilities Platform",
        "subline": "End-to-end smart grid management — from distribution automation and AMI integration to demand response orchestration and grid resilience analytics.",
        "gradient": "from-cyan-400/35 via-sky-300/20 to-blue-100/10",
        "overview": [
            "The Genex Smart Grid & Utilities Platform gives distribution utilities and discoms the operational intelligence to manage modern grid complexity. It integrates with Advanced Metering Infrastructure (AMI), Distribution Automation (DA) systems, and RTUs.",
            "Built for Indian grid conditions, the platform handles high-frequency load shedding events, non-technical loss identification, and feeder-level generation forecasting for DERs.",
        ],
        "capabilities": [
            "AMI and smart meter integration for real-time consumption visibility",
            "Distribution automation: feeder switching and fault isolation",
            "Non-technical loss detection and theft analytics",
            "Demand response program orchestration and settlement",
            "DER and rooftop solar backflow management",
        ],
        "tech_highlights": [
            {"title": "IEC 61968/61970 CIM data model for utility integration", "description": "Models grid assets against the IEC 61968/61970 Common Information Model, so utility systems integrate without custom data mapping."},
            {"title": "DLMS/COSEM smart meter communication protocol support", "description": "Reads AMI smart meters natively over DLMS/COSEM, the protocol most Indian utility meter fleets already speak."},
            {"title": "Real-time outage management with geo-fenced fault isolation", "description": "Isolates faults to a geo-fenced feeder segment in real time, narrowing outage response from guesswork to a known location."},
            {"title": "DERMS integration for distributed energy resource dispatch", "description": "Coordinates rooftop solar, storage, and other DERs through DERMS integration, keeping distributed generation within grid limits."},
        ],
        "stats": [
            {"value": "10+", "suffix": "", "label": "Utility Clients"},
            {"value": "1M+", "suffix": "", "label": "Meters Connected"},
            {"value": "30%", "suffix": "", "label": "NTL Reduction Achieved"},
        ],
    },
    {
        "slug": "ev-infrastructure",
        "title": "EV - Software Management",
        "badge": "EV Tech",
        "category": "ev",
        "stage": "scaled",
        "headline": "EV Software Management — Next-Gen Fleet Intelligence",
        "subline": "Advanced EV charging and fleet intelligence platform — with AI-driven load balancing, V2G readiness, and real-time fleet energy optimization.",
        "gradient": "from-green-400/35 via-emerald-300/20 to-teal-100/10",
        "overview": [
            "Genex EV Software Management goes beyond basic OCPP charger control — adding AI-driven fleet energy intelligence that optimizes charging schedules across an entire fleet to minimize electricity cost while ensuring vehicles are ready when drivers need them.",
            "For public charging operators, the platform manages dynamic pricing, utilization analytics, and fault diagnostics across hundreds of charge points. V2G capability is built into the protocol stack.",
        ],
        "capabilities": [
            "AI-driven fleet charging schedule optimization against tariff curves",
            "Vehicle telematics and HR system integration for departure prediction",
            "Dynamic pricing and session analytics for public charging operators",
            "V2G protocol stack (ISO 15118) for bidirectional charging readiness",
            "White-label driver mobile app with RFID, QR, and app authentication",
        ],
        "tech_highlights": [
            {"title": "OCPP 2.0.1 and ISO 15118-2 V2G protocol support", "description": "Speaks OCPP 2.0.1 for charger control and ISO 15118-2 for vehicle-to-grid, positioning the platform for bidirectional charging as it matures."},
            {"title": "Reinforcement learning for fleet charge schedule optimization", "description": "Applies reinforcement learning to fleet charging schedules, balancing tariff cost against each vehicle's required departure readiness."},
            {"title": "REST and MQTT APIs for fleet management system integration", "description": "Exposes REST and MQTT interfaces so fleet management systems can pull charging status and push scheduling changes directly."},
            {"title": "End-to-end encryption and PCI-DSS compliant payment flow", "description": "Encrypts payment data end-to-end through a PCI-DSS compliant flow, meeting the compliance bar public charging operators need."},
        ],
        "stats": [
            {"value": "500+", "suffix": "", "label": "Chargers Managed"},
            {"value": "40+", "suffix": "", "label": "Enterprise Clients"},
            {"value": "25%", "suffix": "", "label": "Avg. Charging Cost Reduction"},
        ],
    },
    {
        "slug": "power-trading",
        "title": "Power Trading",
        "badge": "Energy Markets",
        "category": "grid",
        "stage": "research",
        "headline": "Power Trading Platform",
        "subline": "Algorithmic power trading and market participation platform — enabling renewable generators and large consumers to optimize energy procurement and sell surplus power on IEX and bilateral markets.",
        "gradient": "from-slate-400/35 via-gray-300/20 to-zinc-100/10",
        "overview": [
            "Genex Power Trading Platform is in active research and development — targeting India's rapidly growing power exchange and bilateral electricity markets.",
            "For large industrial consumers, the platform aggregates demand flexibility and participates in demand response programs — offsetting peak tariff exposure.",
        ],
        "capabilities": [
            "Generation forecasting models for Day-Ahead IEX market bidding",
            "Real-Time Market price analytics and bid optimization",
            "Demand aggregation and flexibility market participation",
            "Portfolio-level energy balance and imbalance management",
            "Regulatory compliance and settlement automation (CERC guidelines)",
        ],
        "tech_highlights": [
            {"title": "XGBoost and LSTM generation forecast models (1hr resolution)", "description": "Forecasts hourly generation using a combined XGBoost and LSTM ensemble, tuned for the resolution IEX bidding windows require."},
            {"title": "IEX API integration for market price and clearing data", "description": "Pulls live price and clearing data directly from IEX APIs, keeping bid decisions grounded in current market conditions."},
            {"title": "Monte Carlo simulation for bid price uncertainty modeling", "description": "Runs Monte Carlo simulations over forecast uncertainty to size bid prices that balance revenue against imbalance risk."},
            {"title": "CERC imbalance charge calculation and settlement reconciliation", "description": "Automates CERC imbalance charge calculation and settlement reconciliation, built to the regulatory architecture research partners are validating."},
        ],
        "stats": [
            {"value": "Active", "suffix": "", "label": "Research Phase"},
            {"value": "IEX", "suffix": "", "label": "Target Market"},
            {"value": "2026", "suffix": "", "label": "Commercial Launch Target"},
        ],
    },
    {
        "slug": "power-billing",
        "title": "Power Billing System",
        "badge": "Billing",
        "category": "grid",
        "stage": "scaled",
        "headline": "Power Billing System — Automated Energy Billing",
        "subline": "Enterprise-grade automated power billing for utilities, discoms, and distributed energy operators.",
        "gradient": "from-blue-400/35 via-sky-300/20 to-cyan-100/10",
        "overview": [
            "Genex Power Billing System replaces error-prone manual billing workflows with a fully automated platform that handles the full billing lifecycle — from raw meter reading ingestion to bill generation, consumer dispatch, and discom reconciliation.",
            "Built for scale, the platform generates tens of thousands of bills per monthly cycle without manual intervention. Consumer self-service portals, digital payment integrations, and automated dispute resolution workflows reduce the operational burden.",
        ],
        "capabilities": [
            "Automated meter reading ingestion and validation with exception handling",
            "Multi-tariff engine: GNM, VNM, ToD, slab, and demand charge billing",
            "Bulk bill generation with PDF and digital delivery",
            "Consumer self-service portal with payment gateway integration",
            "Discom MIS API connectors for automated reconciliation",
        ],
        "tech_highlights": [
            {"title": "GNM and VNM regulatory formula engine per state SERC orders", "description": "Applies each state SERC's specific GNM and VNM billing formulas automatically, instead of maintaining separate spreadsheets per discom."},
            {"title": "DLMS/COSEM smart meter reading protocol support", "description": "Ingests raw meter readings over DLMS/COSEM directly from the field, removing manual reading entry from the billing cycle."},
            {"title": "Digital signature (DSC) integration for bill authentication", "description": "Signs every generated bill with a Digital Signature Certificate, giving consumers and auditors a verifiable, tamper-evident document."},
            {"title": "Multi-discom adapter layer with format versioning", "description": "Adapts to each discom's MIS format through a versioned connector layer, so a format change at one discom doesn't break the others."},
        ],
        "stats": [
            {"value": "10,000+", "suffix": "", "label": "Bills Generated Monthly"},
            {"value": "15+", "suffix": "", "label": "Discom Formats Supported"},
            {"value": "98%", "suffix": "", "label": "Billing Accuracy Rate"},
        ],
    },
]


# ---------------------------------------------------------------------------
# CASE STUDIES — from frontend/src/config/caseStudies.ts
# ---------------------------------------------------------------------------
import datetime

CASE_STUDIES = [
    {
        "title": "200 MW Solar SCADA Deployment Across Three States",
        "category": "SCADA",
        "category_color": "bg-primary",
        "excerpt": "End-to-end SCADA integration for a multi-state solar portfolio — connecting 18 inverter brands, 3 weather stations, and 6 substations into a single unified dashboard.",
        "date": datetime.date(2026, 3, 14),
        "read_time": "4 Mins Read",
    },
    {
        "title": "PM Kusum Monitoring: 1,200 Farmers, One Platform",
        "category": "Solar",
        "category_color": "bg-amber-400",
        "excerpt": "We built the monitoring stack for a state-level PM Kusum rollout — remote data logging for 1,200 decentralised solar pumps with GSM connectivity and edge buffering.",
        "date": datetime.date(2026, 1, 28),
        "read_time": "3 Mins Read",
    },
    {
        "title": "Real-Time Grid Monitoring for 66 kV Substation Network",
        "category": "Grid",
        "category_color": "bg-indigo-400",
        "excerpt": "IEC 61850-compliant monitoring deployed across a 12-substation network — event logging, fault detection, and auto-generated compliance reports for a state DISCOM.",
        "date": datetime.date(2025, 12, 10),
        "read_time": "5 Mins Read",
    },
    {
        "title": "EV Fleet Charging Software for 300-Vehicle Depot",
        "category": "EV",
        "category_color": "bg-secondary",
        "excerpt": "Custom charge management software for a municipal bus depot — smart scheduling, load balancing, real-time SOC tracking, and driver-facing mobile interface.",
        "date": datetime.date(2025, 11, 2),
        "read_time": "3 Mins Read",
    },
    {
        "title": "BESS Monitoring & Dispatch for 10 MW / 20 MWh Storage Asset",
        "category": "BESS",
        "category_color": "bg-violet-400",
        "excerpt": "Deployed a real-time BMS monitoring layer and dispatch optimisation engine for a grid-scale battery project — SOC tracking, cycle counting, and peak-shaving logic.",
        "date": datetime.date(2025, 9, 18),
        "read_time": "4 Mins Read",
    },
    {
        "title": "150 MW Wind Farm SCADA: Multi-Vendor Turbine Integration",
        "category": "Wind",
        "category_color": "bg-sky-400",
        "excerpt": "Protocol-agnostic SCADA platform built for a wind portfolio spanning three OEMs — unified performance analytics, downtime tracking, and automated CERC reporting.",
        "date": datetime.date(2025, 8, 7),
        "read_time": "5 Mins Read",
    },
    {
        "title": "ISO 50001 Energy Management for Automotive Manufacturer",
        "category": "Energy",
        "category_color": "bg-orange-400",
        "excerpt": "EMS deployment for a 600-worker manufacturing plant — sub-metering at 40 load points, automated EnPIs, and compliance-ready monthly energy reports for certification.",
        "date": datetime.date(2025, 6, 22),
        "read_time": "4 Mins Read",
    },
    {
        "title": "Power Billing Platform for Industrial Zone with 80 Tenants",
        "category": "Software",
        "category_color": "bg-rose-400",
        "excerpt": "Built a multi-tenant power billing engine for a private industrial area — time-of-use tariff calculation, automated invoice generation, and dispute management portal.",
        "date": datetime.date(2025, 5, 15),
        "read_time": "3 Mins Read",
    },
    {
        "title": "RTC Power Trading Analytics: 6 Months in Production",
        "category": "Trading",
        "category_color": "bg-emerald-500",
        "excerpt": "Custom analytics dashboard for a renewable energy trader operating on IEX — bid optimisation signals, real-time market data feeds, and post-trade settlement reporting.",
        "date": datetime.date(2025, 4, 1),
        "read_time": "5 Mins Read",
    },
]


# ---------------------------------------------------------------------------
# BLOG POSTS — from frontend/src/config/blogPosts.ts
# ---------------------------------------------------------------------------
BLOG_POSTS = [
    {"title": "India's Grid Modernisation Roadmap: What the 2030 Targets Mean for SCADA Vendors", "topic": "Policy", "date": datetime.date(2026, 4, 12), "excerpt": "The Ministry of Power's 2030 transmission targets require 500 GW of renewable integration — and the control room infrastructure to match. We break down what this means for the SCADA and EMS ecosystem."},
    {"title": "Why PM Kusum Monitoring Is Harder Than It Looks — And How to Get It Right", "topic": "Engineering", "date": datetime.date(2026, 3, 18), "excerpt": "Distributed rural solar deployments have unique connectivity, power, and reporting challenges. A look at the mistakes operators make — and the architectural choices that prevent them."},
    {"title": "Drone Inspection for Solar: Where the Technology Actually Stands in 2026", "topic": "Technology", "date": datetime.date(2026, 1, 27), "excerpt": "Thermal drones are moving from pilot to production in India. We examine what's working, what's not, and what plant operators should ask before committing to an aerial inspection programme."},
    {"title": "The Hidden Costs of Proprietary SCADA: A 15-Year Lifecycle Analysis", "topic": "Operations", "date": datetime.date(2025, 12, 9), "excerpt": "Licensing, vendor lock-in, and support dependencies compound over time. An honest breakdown of what proprietary monitoring systems actually cost across a plant lifetime."},
    {"title": "EV Fleet Charging Demand: Planning Grid Impact Before It Becomes a Problem", "topic": "Industry", "date": datetime.date(2025, 11, 22), "excerpt": "Fleet operators consistently underestimate the grid impact of simultaneous charging events. We outline a demand modelling approach that prevents expensive infrastructure surprises at scale."},
    {"title": "ISO 50001 in Practice: What Indian Industrial Sites Actually Use", "topic": "Operations", "date": datetime.date(2025, 10, 5), "excerpt": "The standard is comprehensive but implementation varies widely. Here's what energy managers at Indian manufacturing sites tell us they actually use — and what collects dust on the dashboard."},
    {"title": "IEC 61850 Adoption in India: A Practical Field Report from 30+ Substations", "topic": "Engineering", "date": datetime.date(2025, 9, 14), "excerpt": "IEC 61850 promises interoperability. The reality at Indian substations is more complicated. Our deployment experience across transmission and distribution projects reveals the real friction points."},
    {"title": "CERC's Real-Time Market: One Year In — What's Working for Energy Traders", "topic": "Policy", "date": datetime.date(2025, 8, 30), "excerpt": "The Real-Time Market at IEX has reshaped how renewable generators optimise dispatch. We examine early data, participant behaviour, and what algorithmic trading platforms need to compete."},
    {"title": "AI Anomaly Detection in Solar: Moving Beyond Threshold Alerts", "topic": "Technology", "date": datetime.date(2025, 7, 12), "excerpt": "Rule-based alerts generate noise. ML-based anomaly detection reduces false positives by 60-80% in our deployments — but only when trained on site-specific baselines."},
    {"title": "Edge Computing for Remote Sites: When Cloud Connectivity Is Not Enough", "topic": "Engineering", "date": datetime.date(2025, 6, 28), "excerpt": "Desert solar plants and mountain wind farms can't rely on consistent connectivity. We explain how local edge processing changes the data architecture for remote energy assets."},
    {"title": "Battery Storage in India: BESS Deployment Lessons from 18 Months in the Field", "topic": "Industry", "date": datetime.date(2025, 5, 15), "excerpt": "From grid-scale projects to behind-the-meter commercial installations, BESS has moved fast in India. The operational lessons that early movers learned the hard way."},
    {"title": "Protocol Fragmentation in Indian Renewables: Our Experience Across Vendor Ecosystems", "topic": "Engineering", "date": datetime.date(2025, 4, 1), "excerpt": "A single large solar park can have six different communication protocols. How we approach protocol-agnostic architecture and why hardware lock-in is the biggest hidden risk in monitoring contracts."},
]


# ---------------------------------------------------------------------------
# HOMEPAGE DATA — translated from inline component data
# ---------------------------------------------------------------------------
HOMEPAGE_DATA = {
    "hero_slides": [
        {
            "headline": "Next Generation Power Management",
            "subline": "India's most deployed energy monitoring and control platform — built by engineers, for engineers.",
            "media_type": "video",
            "background_video": "/images/hero/slide1.mp4",
            "cta_text": "Request Demo",
            "cta_link": "/contact#demo",
        },
        {
            "headline": "Monitoring Every Watt. In Real Time.",
            "subline": "500 MW under active monitoring. Sub-minute data. No data loss.",
            "media_type": "image",
            "background_image_path": "/images/hero/slide2.png",
            "cta_text": "See Our Platform",
            "cta_link": "/portfolio",
        },
        {
            "headline": "Built by Engineers. For Engineers.",
            "subline": "Full-stack from hardware to cloud. Deployed at scale across India.",
            "media_type": "image",
            "background_image_path": "/images/hero/slide4.png",
            "cta_text": "View Our Work",
            "cta_link": "/portfolio",
        },
    ],
    "credibility_clients": [
        "Tata Power", "NTPC", "Torrent Power", "Adani Green", "Azure Power",
        "ReNew Power", "MSEDCL", "GUVNL", "SECI", "Hero Future Energies",
    ],
    "impact_stats": [
        {"value": "500", "suffix": " MW", "label": "Monitored"},
        {"value": "120", "suffix": "+", "label": "Projects Delivered"},
        {"value": "8", "suffix": "", "label": "States"},
        {"value": "15", "suffix": "+", "label": "Years in Operation"},
    ],
    "what_we_build": [
        {"id": "solarlive", "label": "SolarLive™", "badge": "Flagship", "headline": "Real-Time Solar Analytics", "body": "Sub-minute data acquisition across inverters, meters, and weather stations. Full portfolio visibility from a single dashboard.", "points": ["Live plant dashboard with PR, CUF, and yield tracking", "Automated fault detection with SMS/email alerts", "Multi-site aggregation for portfolio-level visibility"], "href": "/portfolio/solarlive"},
        {"id": "energy-storage", "label": "EMS - BESS Storage", "badge": "", "headline": "Battery Energy Storage Management", "body": "Full-stack EMS for grid-tied and off-grid BESS — from cell-level BMS to grid-side dispatch optimisation.", "points": ["SOC/SOH monitoring and cell balancing control", "Peak shaving and charge/discharge scheduling", "IEC 61850 grid interface and OPC-UA integration"], "href": "/portfolio/energy-storage"},
        {"id": "wind-network", "label": "Wind Network System", "badge": "", "headline": "Wind Farm Performance Management", "body": "Centralised turbine-level monitoring across multi-OEM wind farms — availability, yield, and predictive maintenance.", "points": ["Turbine SCADA integration with OPC-UA and Modbus", "Power curve analysis and downtime tracking", "Multi-site portfolio management for O&M teams"], "href": "/portfolio/wind-network"},
        {"id": "bms", "label": "BMS", "badge": "", "headline": "Battery Management System", "body": "Cell-level monitoring and protection for lithium-ion, LFP, and lead-acid battery banks with multi-chemistry support.", "points": ["Real-time cell voltage, temperature, and SOC monitoring", "Passive and active balancing with thermal protection", "CAN, Modbus, and RS485 communication"], "href": "/portfolio/bms"},
        {"id": "rms", "label": "RMS - PM Kusum", "badge": "", "headline": "PM Kusum Remote Monitoring", "body": "Purpose-built monitoring for PM Kusum scheme deployments — aggregating generation from distributed rural solar pumps.", "points": ["GPRS, 4G, and NB-IoT connectivity for rural sites", "Edge data buffering for offline resilience", "Automated PM Kusum compliance reporting"], "href": "/portfolio/rms"},
        {"id": "scada", "label": "SCADA Platform", "badge": "", "headline": "Industrial SCADA", "body": "Real-time supervisory control for generation plants, substations, and distribution networks — multi-protocol, redundant, and secure.", "points": ["IEC 61850, Modbus, DNP3, and OPC-UA support", "Sub-second data acquisition and real-time alarming", "Historian and hot-standby redundancy"], "href": "/portfolio/scada"},
        {"id": "ev-infrastructure", "label": "EV Software", "badge": "", "headline": "EV Charging Management", "body": "OCPP-compliant fleet charging management — from charger onboarding to session billing and real-time load balancing.", "points": ["OCPP 1.6J and 2.0.1 protocol support", "Fleet scheduling and dynamic load balancing", "Driver mobile app with RFID and QR authentication"], "href": "/portfolio/ev-infrastructure"},
        {"id": "power-billing", "label": "Power Billing", "badge": "", "headline": "GNM & VNM Billing Automation", "body": "Automated billing for gross and virtual net metering — multi-tariff, bulk generation, and discom reconciliation.", "points": ["GNM and VNM regulatory formula engine", "Bulk bill generation with digital signatures", "Discom MIS API reconciliation"], "href": "/portfolio/power-billing"},
        {"id": "zero-export", "label": "Zero Export Tools", "badge": "", "headline": "Zero Export Control", "body": "Real-time inverter curtailment to prevent grid export — sub-second response and full audit logging for compliance.", "points": ["Real-time inverter control via Modbus", "CT/PT-based grid import sensing", "Event logging and utility compliance reports"], "href": "/portfolio/zero-export"},
        {"id": "carbon-credit", "label": "Carbon Credit Tools", "badge": "", "headline": "Carbon Credit Accounting", "body": "Automated MWh-to-credit conversion with BEE, UNFCCC, and voluntary registry alignment — audit-ready from day one.", "points": ["Registry-standard credit calculation engine", "SHA-256 tamper-evident audit trail", "ISO 14064 GHG accounting alignment"], "href": "/portfolio/carbon-credit"},
        {"id": "iot-gateway", "label": "Data Loggers", "badge": "", "headline": "Edge Data Loggers", "body": "Industrial-grade edge devices that collect, buffer, and relay field data to any cloud platform over 4G, Wi-Fi, or fiber.", "points": ["Modbus, RS485, and CAN bus support", "30-day local SQLite buffer with auto-sync", "Remote firmware and configuration management"], "href": "/portfolio/iot-gateway"},
        {"id": "power-cloud", "label": "Power Cloud System", "badge": "", "headline": "Cloud Analytics Platform", "body": "Centralised multi-asset analytics — customizable KPI dashboards, scheduled reports, and API-first architecture.", "points": ["REST and GraphQL data access APIs", "Power BI and Tableau connector support", "Multi-tenant with data isolation"], "href": "/portfolio/power-cloud"},
        {"id": "rtc-power-tools", "label": "RTC Power Tools", "badge": "", "headline": "Power Quality Management", "body": "Real-time load profiling, harmonic analysis, and closed-loop power factor correction for industrial facilities.", "points": ["IEC 61000-4 power quality measurement", "Closed-loop VFD and capacitor bank control", "ISO 50001 EnPI baseline reporting"], "href": "/portfolio/rtc-power-tools"},
    ],
    "edge_statements": [
        {"title": "Full-stack.", "body": "Hardware to cloud, in one team. No integration headaches."},
        {"title": "Indian engineering.", "body": "Built to global standards. Priced for Indian realities."},
        {"title": "Deployed at scale.", "body": "Not pilot projects. 500 MW under active monitoring."},
        {"title": "Responsive support.", "body": "Real engineers on call. Not a support ticket number."},
    ],
    "projects_showcase": [
        {"name": "Rajasthan Solar Park", "location": "Rajasthan", "metric": "50 MW", "href": "/portfolio/solarlive", "gradient": "linear-gradient(160deg, #1a2d0a 0%, #2a4a15 100%)", "image": "/images/projects/rajasthan.jpg"},
        {"name": "Industrial SCADA Pune", "location": "Maharashtra", "metric": "SCADA", "href": "/portfolio/scada", "gradient": "linear-gradient(160deg, #0a1628 0%, #0d2d50 100%)", "image": "/images/projects/pune.jpg"},
        {"name": "Wind Farm Gujarat", "location": "Gujarat", "metric": "Wind", "href": "/portfolio/wind-network", "gradient": "linear-gradient(160deg, #0a1a28 0%, #0d3040 100%)", "image": "/images/projects/gujarat.jpg"},
    ],
    "innovations_teaser": [
        {"name": "Advanced SCADA", "tagline": "Next-gen supervisory control with AI-assisted diagnostics", "href": "/innovations/solar-rooftop", "badge": "Flagship", "index": 1},
        {"name": "Re-NMS", "tagline": "Renewable network management across distributed portfolios", "href": "/innovations/solar-power-plants", "badge": "", "index": 2},
        {"name": "AI Remote Monitoring", "tagline": "ML-based fault prediction and prescriptive maintenance", "href": "/innovations/rms", "badge": "", "index": 3},
        {"name": "EMS-BESS", "tagline": "AI-driven battery dispatch with degradation modeling", "href": "/innovations/energy-storage", "badge": "", "index": 4},
        {"name": "AI-Plant Health Checkup", "tagline": "Automated plant diagnostics and remediation scoring", "href": "/innovations/ai-health-checkup", "badge": "", "index": 5},
    ],
    "world_map_pins": [
        {"id": "IN", "name": "India", "latitude": 20.5937, "longitude": 78.9629, "delay": 0.0},
        {"id": "US", "name": "United States", "latitude": 37.0902, "longitude": -95.7129, "delay": 0.3},
        {"id": "SG", "name": "Singapore", "latitude": 1.3521, "longitude": 103.8198, "delay": 0.6},
        {"id": "GB", "name": "United Kingdom", "latitude": 55.3781, "longitude": -3.4360, "delay": 0.9},
        {"id": "CN", "name": "China", "latitude": 35.8617, "longitude": 104.1954, "delay": 0.2},
        {"id": "CA", "name": "Canada", "latitude": 56.1304, "longitude": -106.3468, "delay": 0.5},
        {"id": "CO", "name": "Colombia", "latitude": 4.5709, "longitude": -74.2973, "delay": 0.8},
        {"id": "FR", "name": "France", "latitude": 46.2276, "longitude": 2.2137, "delay": 0.4},
        {"id": "IT", "name": "Italy", "latitude": 41.8719, "longitude": 12.5674, "delay": 0.7},
    ],
    "world_map_stats": [
        {"value": "9", "suffix": "", "label": "Countries"},
        {"value": "3", "suffix": "", "label": "Continents"},
        {"value": "24×7", "suffix": "", "label": "Operations"},
    ],
    "tech_partners": [
        {"name": "Amazon Web Services", "abbr": "AWS", "href": "https://aws.amazon.com"},
        {"name": "Microsoft Azure", "abbr": "Azure", "href": "https://azure.microsoft.com"},
        {"name": "Google Cloud", "abbr": "GCP", "href": "https://cloud.google.com"},
        {"name": "Modbus Organization", "abbr": "Modbus", "href": "https://modbus.org"},
        {"name": "IEC 61850 Standard", "abbr": "IEC 61850", "href": "https://www.iec.ch"},
        {"name": "OPC Foundation", "abbr": "OPC-UA", "href": "https://opcfoundation.org"},
        {"name": "MQTT.org", "abbr": "MQTT", "href": "https://mqtt.org"},
        {"name": "DNP Users Group", "abbr": "DNP3", "href": "https://www.dnp.org"},
    ],
    "testimonials": [
        {"quote": "Genex transformed how we manage our solar portfolio. Real-time visibility across 40 sites was something we couldn't achieve with any other platform at this price point.", "name": "Arjun Sharma", "role": "Head of O&M", "company": "Adani Green Energy", "initials": "AS"},
        {"quote": "The PM Kusum RMS deployment was handled professionally. Data availability went from 70% to 98% within a month of going live. The edge buffering actually works.", "name": "Priya Mehta", "role": "Project Manager", "company": "MSEDCL", "initials": "PM"},
        {"quote": "Their SCADA team understood IEC 61850 better than most integrators we've worked with. Commissioning was on schedule and the system has been rock-solid since.", "name": "Vikram Nair", "role": "Chief Engineer", "company": "Tata Power", "initials": "VN"},
        {"quote": "We needed a billing engine that could handle GNM and VNM simultaneously for different consumer categories. Genex built it, tested it, and deployed it in six weeks.", "name": "Deepa Rao", "role": "Commercial Head", "company": "GUVNL", "initials": "DR"},
    ],
    "gelearn_cards": [
        {"slug": "how-we-work", "label": "How We Work", "icon": "EngineeringOutlined", "gradient": "from-indigo-500/30 via-blue-400/20 to-slate-400/10", "icon_bg": "from-indigo-500 to-blue-500", "count": "6 Methodology Steps", "description": "Our engineering process — from discovery to deployment and beyond."},
        {"slug": "technology", "label": "Technology Deep Dives", "icon": "MemoryOutlined", "gradient": "from-cyan-500/30 via-teal-400/20 to-sky-400/10", "icon_bg": "from-cyan-500 to-teal-500", "count": "5 Articles", "description": "In-depth technical content on protocols, architectures, and platforms."},
        {"slug": "case-studies", "label": "Case Studies", "icon": "DescriptionOutlined", "gradient": "from-amber-500/30 via-orange-400/20 to-yellow-400/10", "icon_bg": "from-amber-500 to-orange-500", "count": "9 Projects", "description": "Real deployments, real results — documented from first principles."},
        {"slug": "tenders", "label": "Tenders & Opportunities", "icon": "GavelOutlined", "gradient": "from-slate-500/30 via-gray-400/20 to-zinc-400/10", "icon_bg": "from-slate-500 to-gray-600", "count": "4 Open Tenders", "description": "Active government and enterprise tenders in energy and infrastructure."},
        {"slug": "whitepapers", "label": "Whitepapers & Reports", "icon": "ArticleOutlined", "gradient": "from-violet-500/30 via-purple-400/20 to-indigo-400/10", "icon_bg": "from-violet-500 to-purple-600", "count": "6 Papers", "description": "Technical papers, research, and standards guides for energy professionals."},
        {"slug": "videos", "label": "Video Library", "icon": "PlayCircleOutlined", "gradient": "from-rose-500/30 via-pink-400/20 to-red-400/10", "icon_bg": "from-rose-500 to-pink-600", "count": "6 Videos", "description": "Product demos, live system walkthroughs, and installation guides."},
        {"slug": "blog", "label": "Blog & Insights", "icon": "RssFeedOutlined", "gradient": "from-emerald-500/30 via-green-400/20 to-teal-400/10", "icon_bg": "from-emerald-500 to-green-600", "count": "12 Posts", "description": "Engineering perspectives on India's energy transition."},
        {"slug": "faq", "label": "FAQ", "icon": "HelpOutlined", "gradient": "from-sky-500/30 via-blue-400/20 to-cyan-400/10", "icon_bg": "from-sky-500 to-blue-500", "count": "16 Questions", "description": "Common questions about our products, services, and processes."},
        {"slug": "podcasts", "label": "Podcasts & Interviews", "icon": "MicOutlined", "gradient": "from-orange-500/30 via-amber-400/20 to-yellow-400/10", "icon_bg": "from-orange-500 to-amber-500", "count": "6 Episodes", "description": "Conversations with engineers, operators, and policy experts."},
    ],
    "cta": {
        "heading": "Ready to build smarter infrastructure?",
        "description": "Talk to our engineering team — no sales pitch.",
        "primary_cta_text": "Request Demo",
        "primary_cta_link": "/contact#demo",
        "secondary_cta_text": "View Portfolio",
        "secondary_cta_link": "/portfolio",
    },
}


# ---------------------------------------------------------------------------
# ABOUT PAGE DATA — translated from inline data in About/index.tsx
# ---------------------------------------------------------------------------
ABOUT_DATA = {
    "milestones": [
        {"year": "2010", "label": "THE BEGINNING", "title": "Founded in Jaipur", "description": "Genex Technocrats was established with a focus on industrial automation and energy monitoring solutions for the growing Indian renewable sector.", "is_current": False},
        {"year": "2014", "label": "FIRST SCALE", "title": "PM Kusum Early Deployments", "description": "Won first large-scale government monitoring project under the PM Kusum scheme, deploying remote monitoring for 200+ distributed solar pumps across Rajasthan.", "is_current": False},
        {"year": "2017", "label": "SCADA LAUNCH", "title": "Industrial SCADA Platform", "description": "Launched the Genex SCADA Platform with IEC 61850 and Modbus support, entering the utility and substation monitoring market.", "is_current": False},
        {"year": "2019", "label": "PORTFOLIO SCALE", "title": "500 MW Milestone", "description": "Crossed 500 MW of solar capacity under active monitoring — validating SolarLive™ at utility scale with multi-site portfolio customers.", "is_current": False},
        {"year": "2021", "label": "AI & STORAGE", "title": "AI and BESS Expansion", "description": "Introduced AI-based anomaly detection and launched the EMS-BESS platform, extending from monitoring into intelligent control and storage management.", "is_current": False},
        {"year": "2024", "label": "TODAY", "title": "Pan-India Operations", "description": "Operating across 10+ states with 120+ completed projects, Genex is expanding into smart grid, EV fleet management, and power trading platforms.", "is_current": True},
    ],
    "stats": [
        {"value": "14+", "suffix": "", "label": "Years of Operation"},
        {"value": "120+", "suffix": "", "label": "Projects Delivered"},
        {"value": "500 MW", "suffix": "", "label": "Capacity Monitored"},
        {"value": "10+", "suffix": "", "label": "States Covered"},
    ],
    "vision_cards": [
        {"icon": "LanguageOutlined", "title": "Pan-India Scale", "text": "To be the most trusted energy intelligence platform operating across every major renewable asset class in India — from rooftop solar to grid-scale storage."},
        {"icon": "ShieldOutlined", "title": "Absolute Reliability", "text": "To deliver monitoring and control systems that operators can depend on without question — because energy infrastructure doesn't get second chances."},
    ],
    "mission_points": [
        {"icon": "BoltOutlined", "title": "Optimise Efficiency", "text": "Help energy operators maximise yield and minimise waste through real-time data and automated decision support."},
        {"icon": "SecurityOutlined", "title": "Protect Infrastructure", "text": "Detect faults, prevent failures, and reduce equipment downtime through proactive monitoring and control."},
        {"icon": "CheckCircleOutlined", "title": "Ensure Reliability", "text": "Build systems with redundancy, edge resilience, and 99.9% uptime so operators can trust the data they see."},
    ],
    "leadership": [
        {"title": "Founder & CEO", "bio": "15+ years in industrial automation and energy management. Led deployments across utility SCADA, solar monitoring, and smart grid infrastructure for major Indian utilities.", "initials": "G"},
        {"title": "CTO", "bio": "Expert in protocol engineering and cloud architecture. Designed the core communication stack powering Genex platforms across Modbus, IEC 61850, and OPC-UA protocols.", "initials": "E"},
        {"title": "Head of Operations", "bio": "Oversees project delivery and O&M operations across all client sites. Ensures deployment quality and SLA compliance from commissioning through handover.", "initials": "A"},
    ],
    "partners": ["Siemens", "Schneider Electric", "ABB", "Huawei Solar", "SMA Solar", "Delta Electronics", "Fronius", "Growatt"],
    "certifications": [
        {"name": "ISO 9001:2015", "label": "Quality Management System"},
        {"name": "ISO 27001:2022", "label": "Information Security Management"},
        {"name": "CE Marking", "label": "European Conformity — Electrical Equipment"},
        {"name": "BIS Certified", "label": "Bureau of Indian Standards Compliance"},
    ],
}


# ---------------------------------------------------------------------------
# TEAM DATA — translated from About/Team/index.tsx
# ---------------------------------------------------------------------------
TEAM_DATA = {
    "leader": {
        "name": "Shree Kant Bohra",
        "role": "Co-Founder & CEO",
        "quote": "We built Genex to solve the problems we saw firsthand — monitoring systems that couldn't talk to each other, billing engines that needed three people to run, and SCADA platforms that locked operators into one vendor's world. Every product we ship is the version we wish had existed when we started.",
    },
    "sections": [
        {
            "title": "Development Team",
            "description": "Engineers building the platform stack — from firmware and protocol drivers to cloud infrastructure and analytics.",
            "members": [
                {"name": "Rahul Agarwal", "role": "Lead Backend Engineer"},
                {"name": "Sneha Patel", "role": "Frontend Developer"},
                {"name": "Amit Verma", "role": "Embedded Systems Engineer"},
                {"name": "Priya Singh", "role": "Cloud Infrastructure Engineer"},
                {"name": "Karan Mehta", "role": "Protocol Integration Engineer"},
                {"name": "Divya Sharma", "role": "Full Stack Developer"},
            ],
        },
        {
            "title": "Operations Team",
            "description": "Field engineers and project managers responsible for deployment, commissioning, and ongoing client support.",
            "members": [
                {"name": "Suresh Kumar", "role": "Field Operations Lead"},
                {"name": "Anjali Gupta", "role": "Project Manager"},
                {"name": "Rajesh Nair", "role": "SCADA Commissioning Engineer"},
                {"name": "Pooja Joshi", "role": "Client Success Manager"},
                {"name": "Vivek Rao", "role": "Network Operations Engineer"},
                {"name": "Meena Tiwari", "role": "QA & Testing Engineer"},
            ],
        },
    ],
}


# ---------------------------------------------------------------------------
# CAREERS DATA — translated from Careers.tsx
# ---------------------------------------------------------------------------
CAREERS_DATA = {
    "why_genex": [
        {"icon": "Bolt", "title": "Real Engineering Problems", "description": "Work on systems that monitor live power plants, control grid infrastructure, and manage gigawatt-hours of storage. No toy problems — real stakes, real scale."},
        {"icon": "TrendingUp", "title": "Ownership & Growth", "description": "Small, experienced team means genuine ownership of products. Engineers here lead features, not just implement tickets. Your work ships and stays."},
        {"icon": "Groups", "title": "Domain Expertise", "description": "Build deep knowledge in energy systems, industrial protocols, and power infrastructure — one of the highest-demand engineering specialisations in India's energy transition."},
    ],
    "open_roles": [
        {"title": "Backend Engineer — Python / Django", "department": "Engineering", "location": "Jaipur / Remote", "type": "Full-time", "description": "Build and maintain the API layer, data pipelines, and Wagtail CMS backend powering the Genex platform. Strong Python skills required; experience with time-series data or energy systems is a bonus."},
        {"title": "Embedded Systems Engineer — Firmware", "department": "Hardware & Firmware", "location": "Jaipur", "type": "Full-time", "description": "Write firmware for edge data loggers and IoT gateways. Implement Modbus, CAN bus, and MQTT drivers. Experience with STM32 or ESP32 and C/C++ required."},
        {"title": "Frontend Engineer — React / TypeScript", "department": "Engineering", "location": "Jaipur / Remote", "type": "Full-time", "description": "Build the operator dashboards, admin interfaces, and public website using React, TypeScript, and Tailwind. Strong component design skills and API integration experience required."},
        {"title": "SCADA / Protocol Integration Engineer", "department": "Engineering", "location": "Jaipur", "type": "Full-time", "description": "Integrate field devices over IEC 61850, Modbus, DNP3, and OPC-UA. Commission monitoring systems at substations, solar farms, and industrial sites. Field experience required."},
        {"title": "Project Manager — Energy Deployments", "department": "Operations", "location": "Jaipur", "type": "Full-time", "description": "Plan and execute monitoring system deployments end-to-end. Coordinate with clients, field teams, and engineering. Experience in energy, infrastructure, or telecom projects preferred."},
    ],
    "perks": [
        "Health Insurance (family floater)",
        "Learning & Tool Budget",
        "Flexible Working Hours",
        "Performance ESOPs",
    ],
}


# ---------------------------------------------------------------------------
# CONTACT DATA — translated from Contact.tsx
# ---------------------------------------------------------------------------
CONTACT_DATA = {
    "contact_details": [
        {"icon": "LocationOn", "label": "Office", "lines": ["Genex Technocrats Pvt. Ltd.", "Pune, Maharashtra, India"]},
        {"icon": "Phone", "label": "Phone", "lines": ["+91 XXXXX XXXXX"], "note": "Mon–Sat · 10am–7pm IST"},
        {"icon": "Email", "label": "Email", "lines": ["info@genextechnocrats.com"]},
    ],
    "project_types": [
        {"value": "solar-rooftop", "label": "Solar Rooftop System"},
        {"value": "solar-plant", "label": "Solar Power Plant (EPC)"},
        {"value": "scada-rms", "label": "SCADA / RMS Deployment"},
        {"value": "wind-energy", "label": "Wind Energy Monitoring"},
        {"value": "industrial", "label": "Industrial Energy Mgmt"},
        {"value": "request-demo", "label": "Request a Product Demo"},
        {"value": "other", "label": "Other / General Inquiry"},
    ],
}


# ---------------------------------------------------------------------------
# GELEARN — HOW WE WORK STEPS — translated from HowWeWork.tsx
# ---------------------------------------------------------------------------
HOW_WE_WORK_DATA = {
    "steps": [
        {"num": "01", "title": "Discovery", "desc": "We begin by understanding your site, assets, and operational goals. Genex engineers conduct a technical assessment — mapping protocols, communication paths, and data requirements before a line of code is written.", "badge_color": "#4f46e5", "dot_color": "#4f46e5", "connector_color": "#4f46e5", "card_border": "#c7d2fe", "side": "right"},
        {"num": "02", "title": "Architecture", "desc": "Based on discovery findings, we design the complete system architecture — selecting the right edge devices, communication protocols, cloud components, and redundancy approach for your specific deployment context.", "badge_color": "#0891b2", "dot_color": "#0891b2", "connector_color": "#0891b2", "card_border": "#bae6fd", "side": "left"},
        {"num": "03", "title": "Development", "desc": "Firmware, protocol drivers, dashboards, and APIs are built iteratively. Each component is tested against real device behaviour — not just simulated data — before moving to integration.", "badge_color": "#059669", "dot_color": "#059669", "connector_color": "#059669", "card_border": "#a7f3d0", "side": "right"},
        {"num": "04", "title": "Integration", "desc": "We commission the full system at your site — connecting inverters, meters, RTUs, and PLCs to the monitoring layer. Protocols are verified, data accuracy is validated, and alarms are configured before handover.", "badge_color": "#d97706", "dot_color": "#d97706", "connector_color": "#d97706", "card_border": "#fde68a", "side": "left"},
        {"num": "05", "title": "Deployment", "desc": "The system goes live with Genex engineers on-site or available remotely. We support the first weeks of operation actively — tuning thresholds, resolving field issues, and ensuring stable data flow before transition.", "badge_color": "#dc2626", "dot_color": "#dc2626", "connector_color": "#dc2626", "card_border": "#fca5a5", "side": "right"},
        {"num": "06", "title": "Support & Scale", "desc": "Post-deployment, we provide ongoing support, firmware updates, and platform improvements. As your portfolio grows, the system scales without re-platforming. Your data, your rules — we maintain it.", "badge_color": "#7c3aed", "dot_color": "#7c3aed", "connector_color": "#7c3aed", "card_border": "#ddd6fe", "side": "left"},
    ],
    "principles": [
        {"title": "Protocol-Agnostic", "desc": "We design systems that communicate with any device, regardless of manufacturer. Modbus, IEC 61850, DNP3, OPC-UA, CAN — the protocol is dictated by the hardware, not by platform limitations."},
        {"title": "Edge-First Connectivity", "desc": "Data processing begins at the edge — buffering, compression, and initial validation happen on-device before transmission. Network outages don't mean data loss."},
        {"title": "Real-Time Over Periodic", "desc": "We build for sub-minute data acquisition by default. Periodic polling introduces blind spots; real-time streaming surfaces anomalies before they become failures."},
        {"title": "Security Without Compromise", "desc": "Authentication, encrypted transport, and access control are built into every layer. Security is not added at the end — it is a first principle of every system we design."},
    ],
}


# ---------------------------------------------------------------------------
# GELEARN FAQ ITEMS — translated from FAQ.tsx
# ---------------------------------------------------------------------------
FAQ_ITEMS = [
    {"section": "General Questions", "q": "What types of energy assets do Genex platforms support?", "a": "Genex platforms support solar (rooftop, ground-mount, utility-scale), wind, battery energy storage (BESS), substations, industrial facilities, and EV charging infrastructure. We work across the full energy stack — from individual inverters to portfolio-level aggregation."},
    {"section": "General Questions", "q": "Do you build custom monitoring solutions or only off-the-shelf products?", "a": "Both. Our core products (SolarLive™, SCADA Platform, EMS-BESS) are production-ready platforms that we deploy and customise for each client. For specific requirements — unusual protocols, custom dashboards, or integration with legacy systems — we build tailored components on top of the core platform."},
    {"section": "General Questions", "q": "Which communication protocols does the Genex platform support?", "a": "Modbus RTU/TCP, IEC 61850 (Ed. 1 and Ed. 2, including GOOSE and SV), DNP3, OPC-DA/UA, IEC 104, DLMS/COSEM, CAN bus, MQTT, and REST APIs. We also support custom or proprietary protocols when vendor SDKs are available."},
    {"section": "General Questions", "q": "Where is Genex deployed? Which regions and states?", "a": "Genex systems are deployed across 10+ Indian states — with the highest concentration in Rajasthan, Gujarat, Maharashtra, Madhya Pradesh, and Tamil Nadu. We also support international clients in Southeast Asia, the Middle East, and Europe for specific product categories."},
    {"section": "General Questions", "q": "What is the minimum project size you work with?", "a": "We work with projects from a single-site rooftop installation (as small as 10 kWp) to utility-scale portfolios of 500 MW+. Pricing and product selection are matched to project scale — smaller projects use our standard platform with minimal customisation."},
    {"section": "Service Details", "q": "How long does a monitoring system deployment typically take?", "a": "A standard SolarLive™ or SCADA deployment takes 2–6 weeks from kickoff to go-live, depending on site readiness and protocol complexity. Projects involving custom protocol drivers, multi-site rollouts, or regulatory reporting integration may take 8–12 weeks."},
    {"section": "Service Details", "q": "Do you provide hardware (data loggers, edge devices) as part of the solution?", "a": "Yes. Genex supplies its own industrial-grade data loggers and edge gateways as part of most deployments. We also support third-party hardware if clients have existing devices — provided the device supports standard communication protocols."},
    {"section": "Service Details", "q": "What is your data availability SLA for monitoring platforms?", "a": "Our standard platform SLA targets 99.5% data availability, measured at the platform level. Edge device uptime depends on site connectivity — our local buffering mechanism ensures no data loss even during extended connectivity outages, with automated sync on reconnection."},
    {"section": "Service Details", "q": "Can the platform integrate with our existing ERP, CMMS, or billing systems?", "a": "Yes. All Genex platforms expose REST APIs for third-party integration. We have experience integrating with SAP, Oracle, IBM Maximo, and custom MIS systems. Typical integration scope (API specification, authentication, data mapping) is handled during the discovery phase."},
    {"section": "Service Details", "q": "What post-deployment support do you offer?", "a": "All deployments include a 3-month hypercare period with dedicated engineer support. After that, we offer tiered SLA contracts covering platform updates, bug fixes, 24x7 alert response, and field engineer dispatch for hardware issues. Annual maintenance contracts are available for all product lines."},
    {"section": "Procedures", "q": "How do I request a demo or proof of concept?", "a": "Use the Request Demo form on the Contact page, or email us directly at info@genextechnocrats.com. We typically schedule an initial call within 48 hours to understand your requirements and scope a relevant PoC."},
    {"section": "Procedures", "q": "What information do I need to provide to get a project proposal?", "a": "For a monitoring project: site location, installed capacity, inverter brands and models, communication type available (4G/LTE, fiber, Wi-Fi), and the KPIs you want to track. For SCADA or grid projects: substation single-line diagram, protocol requirements, and control scope. We'll ask everything we need during discovery."},
    {"section": "Procedures", "q": "How does the site assessment process work?", "a": "After an initial brief, one of our protocol engineers reviews your SLD, equipment datasheets, and communication infrastructure remotely. For complex projects, we conduct an on-site technical assessment before finalising scope. Most assessments complete within 5–7 business days."},
    {"section": "Procedures", "q": "Do you provide training for our operations team?", "a": "Yes. All deployments include operator training covering dashboard navigation, alarm management, report generation, and basic troubleshooting. Advanced training on protocol configuration, API access, and system administration is available as an add-on."},
    {"section": "Procedures", "q": "How are firmware and platform updates handled?", "a": "Platform updates are deployed automatically to cloud components with zero downtime. Edge device firmware updates are staged — pushed remotely via our device management layer during off-peak hours. Clients are notified in advance for major releases. Update logs are maintained for audit purposes."},
    {"section": "Procedures", "q": "What is your data retention and privacy policy?", "a": "Operational data is retained for a minimum of 7 years in compliance with energy regulatory requirements. Client data is isolated at the infrastructure level — no cross-client data sharing. Data residency in India is available for government and regulated sector clients. Full details are in our Data Processing Agreement."},
]


# ---------------------------------------------------------------------------
# TENDERS — translated from Tenders.tsx
# ---------------------------------------------------------------------------
TENDERS = [
    {"title": "SCADA Upgrade for 132 kV Substation Network — RVPNL", "authority": "Rajasthan Vidyut Prasaran Nigam Ltd.", "deadline": "30 / 06 / 2026", "value": "₹1.2 Cr – ₹2.5 Cr", "status": "Open", "sector": "Grid & SCADA", "description": "IEC 61850-compliant SCADA system upgrade for a network of 12 substations in eastern Rajasthan. Scope includes RTU replacement, communication backbone, and new SCADA HMI with historian functionality."},
    {"title": "PM Kusum RMS Platform for 5,000 Solar Pumps — MNRE", "authority": "Ministry of New and Renewable Energy", "deadline": "15 / 07 / 2026", "value": "₹3.5 Cr – ₹6 Cr", "status": "Open", "sector": "Solar", "description": "Remote monitoring system for 5,000 PM Kusum solar pumps across Madhya Pradesh and Rajasthan. Requirements include edge data logging, GSM/NB-IoT connectivity, and automated daily compliance reporting."},
    {"title": "EV Fleet Charging Management — BEST Mumbai", "authority": "Brihanmumbai Electric Supply & Transport", "deadline": "20 / 08 / 2026", "value": "₹80 Lakh – ₹1.5 Cr", "status": "Upcoming", "sector": "EV Software", "description": "OCPP-compliant charge management software for 150 electric bus charging points across BEST's depot network. Includes fleet scheduling, load balancing, and real-time SOC tracking interface for depot staff."},
    {"title": "BESS Monitoring & Dispatch — GUVNL Pilot", "authority": "Gujarat Urja Vikas Nigam Limited", "deadline": "10 / 03 / 2026", "value": "₹45 Lakh – ₹90 Lakh", "status": "Closed", "sector": "BESS", "description": "Monitoring and dispatch optimisation system for a 5 MW / 10 MWh pilot BESS project in Kutch. Scope includes BMS data integration, SOC/SOH monitoring, and automated peak shaving logic."},
]


# ---------------------------------------------------------------------------
# WHITEPAPERS — translated from Whitepapers.tsx
# ---------------------------------------------------------------------------
WHITEPAPERS = [
    {"title": "IEC 61850 in Indian Substations: A Practical Implementation Guide", "category": "Grid Technology", "category_bg": "#eef2ff", "category_text": "#432dd7", "date": datetime.date(2026, 3, 14), "pages": "38 pages", "description": "A technical guide covering IEC 61850 Ed. 2 deployment realities in Indian transmission and distribution substations — protocol mapping, GOOSE configuration, and vendor interoperability lessons from 30+ projects."},
    {"title": "PM Kusum Monitoring Architecture: Lessons from 2,000 Sites", "category": "Solar", "category_bg": "#fffbeb", "category_text": "#b45309", "date": datetime.date(2026, 1, 22), "pages": "24 pages", "description": "Field-tested architecture recommendations for distributed solar monitoring under the PM Kusum scheme — covering edge device selection, NB-IoT vs. 4G trade-offs, and automated compliance reporting design."},
    {"title": "BESS Dispatch Optimisation: From Fixed Schedules to AI-Driven Control", "category": "Energy Storage", "category_bg": "#f5f3ff", "category_text": "#6d28d9", "date": datetime.date(2025, 11, 10), "pages": "32 pages", "description": "A comparative analysis of rule-based, model predictive, and reinforcement learning dispatch strategies for grid-scale battery energy storage. Includes real-world performance data from Indian BESS deployments."},
    {"title": "India's Net Metering Landscape: GNM, VNM, and the Billing Complexity", "category": "Regulation", "category_bg": "#fdf2f8", "category_text": "#9d174d", "date": datetime.date(2025, 9, 5), "pages": "20 pages", "description": "An overview of India's gross and virtual net metering regulatory framework — state-by-state tariff structures, billing formula variations, and the technical requirements for compliant automated billing systems."},
    {"title": "EV Fleet Charging: Grid Impact Assessment and Demand Management Strategies", "category": "EV", "category_bg": "#ecfdf5", "category_text": "#047857", "date": datetime.date(2025, 7, 18), "pages": "28 pages", "description": "Technical analysis of EV fleet charging demand profiles, peak coincidence factors, and smart charging strategies — including V2G readiness assessment and grid impact modelling for depot operators."},
    {"title": "AI Anomaly Detection in Solar Monitoring: From Research to Production", "category": "AI & Analytics", "category_bg": "#eef2ff", "category_text": "#432dd7", "date": datetime.date(2025, 5, 3), "pages": "26 pages", "description": "End-to-end implementation guide for ML-based anomaly detection in solar monitoring systems — covering data preparation, model selection, real-time inference architecture, and false positive management in production."},
]


# ---------------------------------------------------------------------------
# VIDEOS — translated from VideoLibrary.tsx
# ---------------------------------------------------------------------------
VIDEOS = [
    {"title": "SolarLive™ Platform Walkthrough — Live Plant Dashboard", "category": "Product Demo", "category_color": "#eef2ff", "category_text_color": "#432dd7", "date": datetime.date(2025, 7, 27), "duration": "14:32 min", "excerpt": "A complete walkthrough of the SolarLive™ operator dashboard — from the live plant overview to string-level diagnostics, alarm management, and automated report generation."},
    {"title": "IEC 61850 SCADA — Live System at 66 kV Substation", "category": "Live System", "category_color": "#ecfdf5", "category_text_color": "#047857", "date": datetime.date(2025, 6, 14), "duration": "22:18 min", "excerpt": "A live system demonstration of the Genex SCADA Platform deployed at an operating 66 kV substation — showing real-time event logging, GOOSE messaging, and HMI control screens."},
    {"title": "Data Logger Installation Guide — DIN Rail Mounting and Commissioning", "category": "Installation", "category_color": "#fffbeb", "category_text_color": "#b45309", "date": datetime.date(2025, 5, 9), "duration": "18:45 min", "excerpt": "Step-by-step installation guide for Genex edge data loggers — covering DIN rail mounting, Modbus RS485 wiring, 4G SIM configuration, and first-connection verification against the monitoring platform."},
    {"title": "Operator Training: SolarLive™ Alarm Management and Escalation", "category": "Training", "category_color": "#fdf2f8", "category_text_color": "#9d174d", "date": datetime.date(2025, 4, 2), "duration": "11:20 min", "excerpt": "A training module for operations teams covering alarm configuration, acknowledgement workflows, SMS/email escalation rules, and how to investigate inverter-level faults from the dashboard."},
    {"title": "EMS-BESS Platform — Dispatch Optimisation in Action", "category": "Product Demo", "category_color": "#eef2ff", "category_text_color": "#432dd7", "date": datetime.date(2025, 3, 15), "duration": "16:55 min", "excerpt": "Live demonstration of the EMS-BESS dispatch engine — showing real-time SOC tracking, automated peak shaving decisions, and the AI dispatch log explaining each charge/discharge action."},
    {"title": "Genex at REI Expo 2025 — Exhibition Highlights", "category": "Event", "category_color": "#f5f3ff", "category_text_color": "#6d28d9", "date": datetime.date(2025, 2, 8), "duration": "9:40 min", "excerpt": "Highlights from the Genex exhibition booth at REI Expo 2025 — featuring live product demonstrations, client testimonials, and team interviews on current development priorities."},
]


# ---------------------------------------------------------------------------
# PODCASTS — translated from Podcasts.tsx
# ---------------------------------------------------------------------------
PODCASTS = [
    {"title": "The Grid Engineer's Perspective: IEC 61850 in the Real World", "category": "Grid & SCADA", "category_bg": "#eef2ff", "category_text": "#432dd7", "date": datetime.date(2025, 7, 27), "duration": "48 min", "description": "A deep technical conversation on the practical realities of deploying IEC 61850 in Indian substations — interoperability challenges, GOOSE configuration, and what utility engineers need to know before specifying it.", "guest": "Raghav Menon", "guest_role": "Head of Grid Automation, State Transmission Utility"},
    {"title": "PM Kusum at Scale: What 1,200 Sites Taught Us", "category": "Solar", "category_bg": "#fffbeb", "category_text": "#b45309", "date": datetime.date(2025, 6, 10), "duration": "42 min", "description": "Our project lead on the largest PM Kusum monitoring rollout Genex has completed — covering site challenges, connectivity choices, government reporting requirements, and what worked at scale.", "guest": "Kavita Joshi", "guest_role": "Project Director, PM Kusum Deployments"},
    {"title": "Battery Storage Economics: When Does BESS Actually Make Sense?", "category": "Energy Storage", "category_bg": "#f5f3ff", "category_text": "#6d28d9", "date": datetime.date(2025, 5, 18), "duration": "55 min", "description": "A frank discussion on the economics of grid-scale battery storage in India — peak tariff arbitrage realities, degradation modelling, ancillary service opportunities, and the projects where BESS doesn't make sense.", "guest": "Dr. Sanjay Kapoor", "guest_role": "Energy Storage Economist, TERI"},
    {"title": "Metering India's EV Fleet Transition", "category": "EV", "category_bg": "#ecfdf5", "category_text": "#047857", "date": datetime.date(2025, 4, 5), "duration": "38 min", "description": "How EV fleet operators are managing charging demand, grid impact, and operational data in India's early commercial EV market — with a focus on depot infrastructure and the software layer that makes it work.", "guest": "Nisha Agarwal", "guest_role": "VP Operations, Electric Mobility Operator"},
    {"title": "India's Power Trading Markets: A Practitioner's View", "category": "Grid & SCADA", "category_bg": "#eef2ff", "category_text": "#432dd7", "date": datetime.date(2025, 3, 14), "duration": "51 min", "description": "An insider's view of India's IEX Day-Ahead and Real-Time markets — how renewable generators are participating, what algorithmic bidding looks like in practice, and where the regulatory gaps are.", "guest": "Arun Krishnaswamy", "guest_role": "Power Trader, Renewable Energy Developer"},
    {"title": "Engineering for India's Climate: Designing Systems That Survive the Field", "category": "Engineering", "category_bg": "#fffbeb", "category_text": "#b45309", "date": datetime.date(2025, 2, 20), "duration": "44 min", "description": "How Genex engineers design monitoring hardware and software for the realities of Indian field conditions — dust, heat, voltage fluctuations, and connectivity gaps that standard designs can't handle.", "guest": "Rahul Agarwal", "guest_role": "Lead Hardware Engineer, Genex Technocrats"},
]
