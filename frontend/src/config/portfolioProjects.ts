export type FamilyKey = 'solar' | 'storage' | 'grid' | 'ev'
export type FilterKey = 'all' | FamilyKey

export interface PortfolioProduct {
  slug: string
  label: string
  badge?: string
  family: FamilyKey
  headline: string
  subline: string
  overview: string[]
  capabilities: string[]
  techHighlights: { title: string; description: string }[]
  stats: { value: string; label: string }[]
  image: string
  gradient: string
}

export const FAMILIES: { key: FilterKey; label: string }[] = [
  { key: 'all',     label: 'All Products'       },
  { key: 'solar',   label: 'Solar & Monitoring' },
  { key: 'storage', label: 'Energy Storage'     },
  { key: 'grid',    label: 'Grid & SCADA'       },
  { key: 'ev',      label: 'EV & Power Tools'   },
]

export const PORTFOLIO_PRODUCTS: PortfolioProduct[] = [
  {
    slug: 'solarlive',
    label: 'SolarLive™',
    badge: 'Flagship',
    family: 'solar',
    headline: 'SolarLive™ — Real-Time Solar Analytics',
    subline: 'Flagship platform for real-time solar plant monitoring, performance analytics, and remote diagnostics across distributed solar assets.',
    overview: [
      'SolarLive™ is Genex\'s flagship monitoring platform, purpose-built for commercial, industrial, and utility-scale solar assets. It aggregates data from inverters, weather stations, and energy meters into a single live dashboard — giving operators complete visibility from string level to portfolio level.',
      'Deployed across hundreds of sites nationwide, SolarLive™ delivers sub-minute data acquisition, automated fault detection, and weather-normalised PR reporting. Asset owners and O&M teams get real-time alerts, trend analysis, and daily generation summaries without manual intervention.',
    ],
    capabilities: [
      'Live plant dashboard with PR, CUF, and yield tracking',
      'Fault detection and alarm management with SMS/email alerts',
      'Multi-site aggregation for portfolio-level visibility',
      'Inverter and string-level performance diagnostics',
      'Automated daily and monthly generation reports',
    ],
    techHighlights: [
      { title: 'Modbus TCP/RTU and RS485 inverter communication', description: 'Talks directly to inverters over Modbus TCP/RTU and RS485, covering the communication standards most solar inverter fleets already use.' },
      { title: 'Sub-minute data acquisition and cloud sync', description: 'Polls plant data on a sub-minute cycle and syncs it to the cloud immediately, keeping the live dashboard genuinely live.' },
      { title: '4G/LTE, Wi-Fi, and fiber connectivity support', description: 'Works over 4G/LTE, Wi-Fi, or fiber backhaul, so connectivity choice is dictated by the site, not the platform.' },
      { title: 'RESTful API for third-party ERP and CMMS integration', description: 'Exposes a RESTful API so generation and fault data can flow directly into existing ERP and CMMS systems.' },
    ],
    stats: [
      { value: '300+', label: 'Sites Monitored' },
      { value: '500 MW', label: 'Capacity Under Management' },
      { value: '99.5%', label: 'Platform Uptime' },
    ],
    image: '/images/portfolio/solarlive.png',
    gradient: 'from-amber-400/35 via-amber-200/20 to-yellow-100/10',
  },
  {
    slug: 'energy-storage',
    label: 'EMS - BESS Storage',
    family: 'storage',
    headline: 'EMS — Battery Energy Storage Management',
    subline: 'Full-stack energy management system for battery energy storage projects — from cell-level control to grid-side dispatch optimisation.',
    overview: [
      'Genex\'s EMS-BESS platform delivers end-to-end control and monitoring for battery energy storage systems across grid-tied, off-grid, and hybrid configurations. The platform manages charge/discharge cycles, state-of-charge optimisation, and peak shaving — reducing energy costs and improving grid stability.',
      'Designed for scalability from a single cabinet to multi-megawatt BESS installations, the platform integrates with SolarLive™, SCADA systems, and grid dispatch signals. Operators get a unified view of storage performance, cycle health, and revenue metrics in real time.',
    ],
    capabilities: [
      'SOC/SOH monitoring and cell balancing control',
      'Charge/discharge scheduling and peak shaving logic',
      'Grid-tied and off-grid BESS operation modes',
      'Thermal management and fault protection',
      'Revenue metering and dispatch optimisation',
    ],
    techHighlights: [
      { title: 'CAN bus and Modbus BMS communication', description: 'Communicates with battery management systems over CAN bus and Modbus, covering the two protocols most BESS hardware ships with.' },
      { title: 'IEC 61850 grid interface support', description: 'Interfaces with grid-side equipment over IEC 61850, the standard substation automation protocol utilities already rely on.' },
      { title: 'Real-time SOC/SOH calculation engine', description: 'Continuously calculates state-of-charge and state-of-health in real time, the two numbers that drive every dispatch decision.' },
      { title: 'SCADA and EMS integration via OPC-UA', description: 'Connects to plant SCADA and third-party EMS platforms over OPC-UA, avoiding vendor lock-in on the control layer.' },
    ],
    stats: [
      { value: '50+', label: 'BESS Projects' },
      { value: '200 MWh', label: 'Storage Managed' },
      { value: '30%', label: 'Avg. Peak Demand Reduction' },
    ],
    image: '/images/portfolio/ems-bess.png',
    gradient: 'from-teal-400/35 via-cyan-300/20 to-blue-100/10',
  },
  {
    slug: 'wind-network',
    label: 'Wind Network System',
    family: 'solar',
    headline: 'Wind Network System',
    subline: 'Network monitoring and performance management platform for wind farm operations — tracking turbine health, generation, and network uptime.',
    overview: [
      'The Genex Wind Network System provides centralised performance visibility across wind farm operations. It integrates with turbine SCADA controllers to capture turbine-level generation, rotor speed, wind speed, availability, and fault data — enabling proactive maintenance and yield protection.',
      'Built for O&M contractors and wind developers, the platform supports multi-site portfolio management, automated alarm escalation, and trend analytics. Field teams receive real-time alerts and remote diagnostic capability, reducing response time and turbine downtime.',
    ],
    capabilities: [
      'Turbine-level SCADA integration and data acquisition',
      'Wind speed, rotor speed, and power curve analysis',
      'Alarm management and remote diagnostics for field teams',
      'Availability and energy yield reporting',
      'Predictive fault analytics and maintenance scheduling',
    ],
    techHighlights: [
      { title: 'OPC-DA/UA and Modbus turbine controller integration', description: 'Pulls turbine-level data directly from SCADA controllers over OPC-DA/UA and Modbus, no proprietary turbine OEM software required.' },
      { title: 'IEC 61400 wind data standard compliance', description: 'Structures wind and turbine data to IEC 61400 standards, keeping reporting consistent across mixed turbine fleets.' },
      { title: '4G/LTE and fiber backhaul connectivity', description: 'Backhauls turbine data over 4G/LTE or fiber depending on site access, without compromising on data continuity.' },
      { title: 'REST API for developer and utility integrations', description: 'Provides a REST API for developers and utilities to build custom reporting or dispatch tools on top of turbine data.' },
    ],
    stats: [
      { value: '1,000+', label: 'Turbines Monitored' },
      { value: '22%', label: 'Avg. Downtime Reduction' },
      { value: '15+', label: 'Wind Farms Covered' },
    ],
    image: '/images/portfolio/wind-network.png',
    gradient: 'from-sky-400/35 via-cyan-300/20 to-blue-100/10',
  },
  {
    slug: 'bms',
    label: 'BMS - Battery Management System',
    family: 'storage',
    headline: 'BMS — Battery Management System',
    subline: 'Intelligent battery management system for multi-chemistry storage assets — ensuring safety, longevity, and peak performance at cell level.',
    overview: [
      'Genex\'s BMS platform provides real-time cell-level monitoring and protection for lithium-ion, LFP, and lead-acid battery banks. It continuously tracks cell voltage, temperature, and state-of-charge — triggering balancing and thermal protection actions to extend battery life and prevent failures.',
      'The system communicates over CAN, Modbus, and RS485 — making it compatible with a wide range of inverters and EMS platforms. Custom alarm thresholds, balancing logic, and data logging are configurable per project, supporting both stationary and mobile storage applications.',
    ],
    capabilities: [
      'Real-time cell voltage, temperature, and SOC monitoring',
      'Passive and active balancing with thermal protection',
      'Communication via CAN, Modbus, and RS485',
      'Multi-chemistry support: LFP, NMC, lead-acid',
      'Configurable alarm thresholds and event logging',
    ],
    techHighlights: [
      { title: 'CAN 2.0B and ISO 15765 protocol support', description: 'Communicates over CAN 2.0B and ISO 15765 diagnostics protocols, matching what most lithium-ion and LFP battery packs speak natively.' },
      { title: 'Modbus RTU/TCP for EMS integration', description: 'Exposes cell and pack data over Modbus RTU/TCP so any EMS platform can integrate without custom drivers.' },
      { title: 'Sub-second cell data sampling rate', description: 'Samples individual cell voltage and temperature on a sub-second cycle, catching thermal events before they cascade.' },
      { title: 'Hardware-level overcurrent and overvoltage protection', description: 'Backs software monitoring with hardware-level overcurrent and overvoltage cutoffs, protecting cells even if the control loop is delayed.' },
    ],
    stats: [
      { value: '500+', label: 'BMS Units Deployed' },
      { value: '35%', label: 'Avg. Battery Life Improvement' },
      { value: '5', label: 'Chemistry Types Supported' },
    ],
    image: '/images/portfolio/bms.png',
    gradient: 'from-emerald-400/35 via-green-300/20 to-teal-100/10',
  },
  {
    slug: 'rms',
    label: 'RMS - PM Kusum Projects',
    family: 'solar',
    headline: 'RMS — PM Kusum Monitoring',
    subline: 'Remote monitoring system purpose-built for PM Kusum scheme solar installations — centralised visibility across distributed rural sites.',
    overview: [
      'Genex\'s RMS platform is purpose-built for PM Kusum scheme deployments — providing centralised monitoring for distributed solar pumping and feeder separation projects across rural India. The system aggregates generation, consumption, and pump operation data from hundreds of remote sites into a single web dashboard.',
      'Designed for low-bandwidth rural connectivity, the RMS uses GPRS and 4G communication with local data buffering — ensuring no data loss even during network outages. Automated reports for government compliance are generated daily without manual data collection.',
    ],
    capabilities: [
      'Multi-site dashboard for pump and feeder monitoring',
      'Generation and consumption tracking per installation',
      'Automated reporting for government compliance',
      'GPRS and 4G with local data buffering',
      'SMS and email alerts for fault and low generation events',
    ],
    techHighlights: [
      { title: 'GPRS, 4G LTE, and NB-IoT connectivity', description: 'Supports GPRS, 4G LTE, and NB-IoT connectivity options to match whatever network reaches a given rural site.' },
      { title: 'Edge data buffering for offline resilience', description: 'Buffers readings locally at the edge during network outages, so rural connectivity gaps never translate into lost data.' },
      { title: 'Modbus RTU for inverter and meter integration', description: 'Reads inverters and meters over Modbus RTU, keeping hardware integration simple across distributed pump and feeder sites.' },
      { title: 'PM Kusum reporting format compliance', description: 'Generates daily reports in the exact format PM Kusum compliance requires, without manual data collection or formatting.' },
    ],
    stats: [
      { value: '2,000+', label: 'PM Kusum Sites Monitored' },
      { value: '8', label: 'States Covered' },
      { value: '99%', label: 'Data Availability' },
    ],
    image: '/images/portfolio/rms-kusum.png',
    gradient: 'from-orange-400/35 via-amber-300/20 to-yellow-100/10',
  },
  {
    slug: 'scada',
    label: 'SCADA Platform',
    family: 'grid',
    headline: 'SCADA Platform',
    subline: 'Industrial supervisory control and data acquisition platform — purpose-built for power generation, transmission, and distribution facilities.',
    overview: [
      'The Genex SCADA Platform delivers real-time supervisory control and monitoring for power generation plants, substations, and distribution networks. Supporting IEC 61850, Modbus, DNP3, and OPC-UA protocols, it integrates with a wide range of field devices and PLCs without hardware lock-in.',
      'Sub-second data acquisition, real-time alarming, and a historian engine enable operators to maintain control room situational awareness and perform post-event analysis. The platform is deployed at substations, thermal plants, solar farms, and distribution control centres across India.',
    ],
    capabilities: [
      'IEC 61850, Modbus, DNP3, and OPC-UA protocol support',
      'Sub-second data acquisition with real-time alarming',
      'Historian, trend analysis, and control room dashboards',
      'Remote switching and setpoint control',
      'Redundant server architecture for high availability',
    ],
    techHighlights: [
      { title: 'IEC 61850 Ed. 2 and GOOSE messaging', description: 'Supports IEC 61850 Ed. 2 with GOOSE messaging for fast, standardized protection and control signaling between devices.' },
      { title: 'DNP3 and IEC 104 for RTU/telecontrol', description: 'Handles DNP3 and IEC 104 telecontrol protocols, covering the RTU communication standards common across Indian substations.' },
      { title: 'OPC-UA for device-agnostic integration', description: "Integrates PLCs and field devices over OPC-UA, avoiding hardware lock-in to a single vendor's protocol stack." },
      { title: 'Hot-standby redundancy with automatic failover', description: 'Keeps a mirrored standby server ready to take over control automatically if the primary node goes down.' },
    ],
    stats: [
      { value: '80+', label: 'SCADA Deployments' },
      { value: '220 kV', label: 'Highest Voltage Level' },
      { value: '<1s', label: 'Data Acquisition Cycle' },
    ],
    image: '/images/portfolio/scada-platform.png',
    gradient: 'from-indigo-400/35 via-violet-300/20 to-blue-100/10',
  },
  {
    slug: 'ev-infrastructure',
    label: 'EV - Software Management',
    family: 'ev',
    headline: 'EV Software Management',
    subline: 'Comprehensive EV charging infrastructure management platform — covering charger control, session management, and fleet energy optimisation.',
    overview: [
      'Genex\'s EV Software Management platform provides complete lifecycle management for electric vehicle charging infrastructure — from individual chargers to national fleet networks. The OCPP-compliant platform handles charger onboarding, session management, RFID authentication, billing, and real-time load balancing from a single dashboard.',
      'Built for enterprise fleets, corporate campuses, and public charging operators, the platform scales from a pilot of 10 chargers to hundreds of charge points without platform migration. Energy scheduling and demand management features help operators reduce peak tariff costs while maintaining charging availability.',
    ],
    capabilities: [
      'OCPP-compliant charger management and remote diagnostics',
      'User authentication, billing, and session reporting',
      'Fleet energy scheduling and load balancing',
      'Real-time charger availability and fault alerts',
      'Mobile app for driver access and session monitoring',
    ],
    techHighlights: [
      { title: 'OCPP 1.6J and 2.0.1 protocol support', description: 'Supports both OCPP 1.6J and 2.0.1, so the platform manages older charger fleets alongside the newest hardware.' },
      { title: 'RFID, QR code, and app-based authentication', description: "Authenticates drivers through RFID, QR code, or the mobile app, matching whichever method a site's users prefer." },
      { title: 'REST API for fleet management system integration', description: 'Exposes a REST API so fleet management systems can pull charger status and push session data directly.' },
      { title: 'Smart charging with ISO 15118 V2G readiness', description: 'Builds in ISO 15118 V2G readiness now, positioning charging infrastructure for bidirectional power flow as regulation catches up.' },
    ],
    stats: [
      { value: '500+', label: 'Chargers Managed' },
      { value: '40+', label: 'Enterprise Clients' },
      { value: '99.2%', label: 'Charger Uptime' },
    ],
    image: '/images/portfolio/ev-software.png',
    gradient: 'from-green-400/35 via-emerald-300/20 to-teal-100/10',
  },
  {
    slug: 'power-billing',
    label: 'Power Billing Tool (GNM & VNM)',
    family: 'ev',
    headline: 'Power Billing Tool (GNM & VNM)',
    subline: 'Automated power billing system for gross net metering and virtual net metering installations — reducing manual effort and billing errors.',
    overview: [
      'The Genex Power Billing Tool automates unit calculation, tariff application, and bill generation for solar installations operating under Gross Net Metering (GNM) and Virtual Net Metering (VNM) frameworks. It eliminates manual spreadsheet-based billing workflows that are prone to error and delay.',
      'The platform supports multi-tariff structures, time-of-use rates, and government surcharges. Utility staff and project developers can generate bulk bills, reconcile generation data against distribution company records, and provide consumers with a self-service portal for bill history and consumption tracking.',
    ],
    capabilities: [
      'Automated unit calculation for GNM and VNM accounts',
      'Multi-tariff support with tax and surcharge computation',
      'Bulk bill generation and consumer portal access',
      'Discoms reconciliation and exception reporting',
      'API integration with utility billing systems',
    ],
    techHighlights: [
      { title: 'GNM and VNM regulatory formula engine', description: 'Applies GNM and VNM billing formulas automatically per project, removing manual tariff calculation from the billing cycle.' },
      { title: 'Time-of-use and slab tariff support', description: 'Handles time-of-use and slab tariff structures natively, matching the rate designs most Indian discoms actually use.' },
      { title: 'REST API for discom MIS integration', description: 'Reconciles generation and billing data with discom MIS systems directly over a REST API, cutting manual data entry.' },
      { title: 'PDF bill generation with digital signature support', description: 'Generates signed PDF bills automatically, giving consumers a verifiable document without manual sign-off.' },
    ],
    stats: [
      { value: '10,000+', label: 'Bills Generated Monthly' },
      { value: '15+', label: 'Discom Formats Supported' },
      { value: '98%', label: 'Billing Accuracy Rate' },
    ],
    image: '/images/portfolio/power-billing.png',
    gradient: 'from-blue-400/35 via-sky-300/20 to-cyan-100/10',
  },
  {
    slug: 'zero-export',
    label: 'Zero Export Tools',
    family: 'grid',
    headline: 'Zero Export Tools',
    subline: 'Real-time solar generation curtailment system that prevents excess power injection into the grid — maintaining compliance with utility requirements.',
    overview: [
      'Genex\'s Zero Export Tools provide real-time inverter control to match solar generation to on-site load — preventing any excess power from being exported to the utility grid. This is critical for installations where grid export is restricted by the local discom or where net metering agreements are not in place.',
      'The system monitors grid import in real time and dynamically adjusts inverter output set-points as load varies throughout the day. All control actions and limit events are logged for utility compliance reporting, giving plant operators a complete audit trail.',
    ],
    capabilities: [
      'Real-time inverter control to match grid import',
      'Dynamic set-point adjustment as load varies',
      'Event logging and utility compliance reports',
      'Multi-inverter coordination for large plant deployments',
      'Alarm on export threshold breach',
    ],
    techHighlights: [
      { title: 'Modbus TCP/RTU inverter control interface', description: 'Controls inverter output set-points directly over Modbus TCP/RTU, compatible with the communication interface most inverters expose.' },
      { title: 'CT/PT-based real-time grid import sensing', description: 'Senses grid import in real time through CT/PT metering, giving the control loop an accurate, low-latency signal to act on.' },
      { title: 'Sub-second response to load changes', description: 'Adjusts inverter output within a sub-second window as on-site load changes, keeping export at zero without overcorrecting.' },
      { title: 'Compatible with all major inverter brands', description: "Works across all major inverter brands, so the export-limiting logic doesn't dictate which hardware a site can install." },
    ],
    stats: [
      { value: '200+', label: 'Zero Export Sites' },
      { value: '<1s', label: 'Response Latency' },
      { value: '100%', label: 'Export Compliance Rate' },
    ],
    image: '/images/portfolio/zero-export.png',
    gradient: 'from-violet-400/35 via-purple-300/20 to-indigo-100/10',
  },
  {
    slug: 'carbon-credit',
    label: 'Carbon Credit Tools',
    family: 'ev',
    headline: 'Carbon Credit Tools',
    subline: 'Automated carbon credit accounting platform — tracking renewable energy generation, calculating credits, and generating verified audit reports.',
    overview: [
      'The Genex Carbon Credit Tools platform automates the full carbon credit lifecycle for renewable energy assets — from generation data ingestion to credit calculation, registry submission preparation, and audit-ready reporting. It eliminates manual, spreadsheet-based credit accounting that is slow and error-prone.',
      'The platform integrates with SolarLive™ and other monitoring systems to pull verified generation data directly. Credits are calculated against BEE, UNFCCC, and voluntary market registry standards, with outputs formatted for direct submission to registration bodies and verification agencies.',
    ],
    capabilities: [
      'Automated MWh-to-credit conversion per registry standards',
      'Generation data integration from monitoring platforms',
      'Audit-ready reports for BEE and UNFCCC submissions',
      'Vintage tracking and credit portfolio management',
      'API output for registry and marketplace integration',
    ],
    techHighlights: [
      { title: 'BEE and UNFCCC calculation methodology support', description: 'Calculates credits using BEE and UNFCCC-approved methodologies, keeping every conversion aligned with the standard a registry expects.' },
      { title: 'Integration with SolarLive™ and third-party platforms', description: 'Pulls verified generation data directly from SolarLive™ or any connected third-party monitoring platform, no manual re-entry.' },
      { title: 'SHA-256 data integrity verification for audit trails', description: 'Hashes every generation record with SHA-256, giving auditors a tamper-evident trail from raw data to final credit.' },
      { title: 'ISO 14064 alignment for GHG accounting', description: 'Aligns GHG accounting methodology with ISO 14064, keeping reports consistent with international carbon accounting practice.' },
    ],
    stats: [
      { value: '500,000+', label: 'Credits Tracked' },
      { value: '3', label: 'Registry Standards Supported' },
      { value: '100%', label: 'Audit Pass Rate' },
    ],
    image: '/images/portfolio/carbon-credit.png',
    gradient: 'from-lime-400/35 via-green-300/20 to-emerald-100/10',
  },
  {
    slug: 'iot-gateway',
    label: 'Data Loggers',
    family: 'solar',
    headline: 'Data Loggers',
    subline: 'Edge connectivity devices that aggregate field sensor data and relay it to cloud platforms — the hardware backbone of any monitoring system.',
    overview: [
      'Genex Data Loggers are edge devices that collect real-time data from inverters, meters, sensors, and PLCs — and transmit it to cloud monitoring platforms over 4G, Wi-Fi, or fiber. Built for harsh industrial environments, they operate reliably in outdoor enclosures, remote locations, and unstable power conditions.',
      'Plug-and-play integration with SolarLive™, the SCADA Platform, and third-party systems makes commissioning fast. Local buffering ensures zero data loss during connectivity gaps — data is stored on-device and synced automatically when connectivity is restored.',
    ],
    capabilities: [
      'Multi-protocol support: Modbus, RS485, CAN, 4G/LTE',
      'Local buffering ensures no data loss during connectivity gaps',
      'Plug-and-play integration with SolarLive™ and SCADA Platform',
      'Remote firmware updates and configuration management',
      'DIN-rail mounting with industrial-grade enclosure options',
    ],
    techHighlights: [
      { title: 'Modbus RTU/TCP, RS485, and CAN bus support', description: 'Speaks Modbus RTU/TCP, RS485, and CAN bus out of the box, covering the field protocols most inverters, meters, and BMS units use.' },
      { title: '4G LTE, Wi-Fi, and Ethernet uplink options', description: 'Ships with 4G LTE, Wi-Fi, or Ethernet uplink options, letting each deployment pick the connectivity path a site actually has.' },
      { title: 'On-device SQLite buffering up to 30 days', description: 'Buffers up to 30 days of readings locally in an on-device SQLite store, so extended outages never mean lost data.' },
      { title: 'MQTT and REST for cloud platform connectivity', description: 'Syncs buffered data to the cloud over MQTT or REST once connectivity returns, with automatic retry and no manual intervention.' },
    ],
    stats: [
      { value: '5,000+', label: 'Units Deployed' },
      { value: '30 Days', label: 'Local Data Buffer' },
      { value: '10+ Years', label: 'Device Lifespan' },
    ],
    image: '/images/portfolio/data-loggers.png',
    gradient: 'from-slate-400/35 via-gray-300/20 to-zinc-100/10',
  },
  {
    slug: 'power-cloud',
    label: 'Power Cloud System',
    family: 'grid',
    headline: 'Power Cloud System',
    subline: 'Centralized cloud analytics platform that aggregates data from multiple energy assets — providing unified dashboards, KPIs, and scheduled reports.',
    overview: [
      'The Genex Power Cloud System is a centralised analytics platform for energy asset owners and operators managing multiple sites, technologies, and asset classes. It ingests data from SolarLive™, SCADA systems, EMS platforms, and third-party sources — normalising it into a unified data model for cross-portfolio analysis.',
      'Customizable KPI dashboards, scheduled report delivery, and trend analytics give management teams a real-time view of portfolio performance without logging into individual plant systems. The API-first architecture allows integration with ERP, CMMS, and business intelligence tools.',
    ],
    capabilities: [
      'Multi-asset, multi-site data aggregation and normalisation',
      'Customizable KPI dashboards with scheduled report delivery',
      'API-first architecture for third-party integrations',
      'Cross-portfolio performance benchmarking',
      'Role-based access for operators, managers, and clients',
    ],
    techHighlights: [
      { title: 'REST and GraphQL API for data access', description: 'Offers both REST and GraphQL endpoints, letting integration teams choose whichever query pattern fits their BI or ERP tooling.' },
      { title: 'MQTT and WebSocket for real-time data ingestion', description: 'Ingests live data over MQTT and WebSocket, keeping cross-portfolio dashboards current without polling delays.' },
      { title: 'Multi-tenant architecture with data isolation', description: "Isolates each client's data at the architecture level while sharing infrastructure, so multi-tenant scale never risks data leakage." },
      { title: 'Power BI and Tableau connector support', description: 'Connects natively to Power BI and Tableau, so management teams can build custom reporting on top of the unified data model.' },
    ],
    stats: [
      { value: '1,000+', label: 'Assets on Platform' },
      { value: '50M+', label: 'Data Points per Day' },
      { value: '99.9%', label: 'API Uptime' },
    ],
    image: '/images/portfolio/power-cloud.png',
    gradient: 'from-cyan-400/35 via-sky-300/20 to-blue-100/10',
  },
  {
    slug: 'rtc-power-tools',
    label: 'RTC - Power Tools',
    family: 'grid',
    headline: 'RTC Power Tools',
    subline: 'Real-time control tools for precision power management — enabling dynamic load management, harmonic analysis, and power quality correction.',
    overview: [
      'Genex RTC Power Tools provide real-time monitoring and control capability for power quality management in industrial and commercial facilities. The platform captures load profiles, harmonic distortion data, and power factor readings — identifying waste and enabling corrective action in real time.',
      'Integrated demand forecasting and ISO 50001-aligned reporting tools help energy managers demonstrate compliance, identify efficiency opportunities, and reduce demand charges. The platform connects to meters, PLCs, and VFDs for closed-loop power factor correction and demand response.',
    ],
    capabilities: [
      'Real-time load profiling and demand forecasting',
      'Power factor correction and harmonic distortion analysis',
      'ISO 50001 energy management system reporting support',
      'Closed-loop VFD and capacitor bank control',
      'Tariff optimisation and peak demand alerts',
    ],
    techHighlights: [
      { title: 'IEC 61000-4 power quality measurement compliance', description: 'Measures harmonic distortion and power quality to IEC 61000-4 standards, producing readings that hold up to audit.' },
      { title: 'Modbus and BACnet meter integration', description: 'Integrates directly with meters and PLCs over Modbus and BACnet, capturing load and power quality data without extra hardware.' },
      { title: 'ISO 50001 EnPI and baseline reporting', description: 'Automates ISO 50001 EnPI and baseline reporting, giving energy managers audit-ready compliance documentation without manual tracking.' },
      { title: 'Real-time demand response signal processing', description: 'Processes demand response signals in real time, coordinating VFDs and capacitor banks to react as tariff or grid conditions shift.' },
    ],
    stats: [
      { value: '150+', label: 'Industrial Sites' },
      { value: '18%', label: 'Avg. Energy Cost Reduction' },
      { value: 'ISO 50001', label: 'Compliance Supported' },
    ],
    image: '/images/portfolio/rtc-power.png',
    gradient: 'from-rose-400/35 via-orange-300/20 to-amber-100/10',
  },
]

export const PRODUCT_BY_SLUG: Record<string, PortfolioProduct> = Object.fromEntries(
  PORTFOLIO_PRODUCTS.map(p => [p.slug, p])
)

export const FAMILY_LABEL: Record<FamilyKey, string> = {
  solar:   'Solar & Monitoring',
  storage: 'Energy Storage',
  grid:    'Grid & SCADA',
  ev:      'EV & Power Tools',
}
