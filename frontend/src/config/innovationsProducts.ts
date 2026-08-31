export type InnovationCategory = 'monitoring' | 'ai' | 'storage' | 'grid' | 'ev'
export type InnovationFilterKey = 'all' | InnovationCategory
export type InnovationStage = 'research' | 'prototype' | 'deployed' | 'scaled'

export interface InnovationProduct {
  slug: string
  label: string
  badge: string
  category: InnovationCategory
  stage: InnovationStage
  headline: string
  subline: string
  overview: string[]
  capabilities: string[]
  techHighlights: { title: string; description: string }[]
  stats: { value: string; label: string }[]
  gradient: string
  image: string
}

export const INNOVATION_CATEGORIES: { key: InnovationFilterKey; label: string }[] = [
  { key: 'all',        label: 'All Innovations'    },
  { key: 'monitoring', label: 'Monitoring'          },
  { key: 'ai',         label: 'AI & Analytics'     },
  { key: 'storage',    label: 'Energy Storage'      },
  { key: 'grid',       label: 'Grid & Utilities'    },
  { key: 'ev',         label: 'EV'                  },
]

export const INNOVATION_STAGE_LABEL: Record<InnovationStage, string> = {
  research:  'Research',
  prototype: 'Prototype',
  deployed:  'Deployed',
  scaled:    'Scaled',
}

export const CATEGORY_LABEL: Record<InnovationCategory, string> = {
  monitoring: 'Monitoring',
  ai:         'AI & Analytics',
  storage:    'Energy Storage',
  grid:       'Grid & Utilities',
  ev:         'EV',
}

export const INNOVATIONS: InnovationProduct[] = [
  {
    slug: 'solar-rooftop',
    label: 'Advanced SCADA',
    badge: 'Advanced',
    category: 'monitoring',
    stage: 'scaled',
    headline: 'Advanced SCADA — Next-Gen Supervisory Control',
    subline:
      'A next-generation SCADA platform engineered for modern power infrastructure — combining real-time control, AI-assisted diagnostics, and cloud-native architecture at scale.',
    overview: [
      'Genex Advanced SCADA moves beyond traditional supervisor systems — replacing on-premise HMI terminals and proprietary protocol locks with a cloud-native, protocol-agnostic control layer. It supports IEC 61850, DNP3, Modbus, and OPC-UA simultaneously, giving operators a single interface across mixed-vendor field device landscapes.',
      'The platform ships with a built-in AI anomaly engine that continuously profiles normal equipment behavior and flags deviations before they cause failures. From substation automation to distributed solar farms, Advanced SCADA scales from a handful of points to millions — without re-platforming or licence upgrades.',
    ],
    capabilities: [
      'Multi-protocol gateway: IEC 61850, DNP3, Modbus, OPC-UA in a single deployment',
      'AI anomaly detection engine with real-time deviation alerts',
      'Cloud-native architecture — no on-premise server dependency',
      'Sub-second data acquisition with historian and trend analysis',
      'Role-based access control and full audit logging',
      'Remote setpoint control and automated interlock sequences',
    ],
    techHighlights: [
      { title: 'IEC 61850 Ed. 2 with GOOSE and SV messaging', description: 'Delivers substation-grade interoperability across mixed-vendor devices, using GOOSE and Sampled Values for microsecond-level protection signaling.' },
      { title: 'DNP3 Secure Authentication v5', description: 'Encrypts and authenticates telecontrol traffic to DNP3 SAv5 standards, closing the gap that plain DNP3 leaves open on utility networks.' },
      { title: 'WebSocket streaming for real-time dashboard updates', description: 'Pushes live point updates to operator dashboards over persistent WebSocket connections instead of slow polling cycles.' },
      { title: 'Hot-standby redundancy with automatic failover < 2s', description: 'Runs a mirrored standby server that takes over control in under two seconds if the primary node fails, with zero manual intervention.' },
    ],
    stats: [
      { value: '100+',  label: 'SCADA Deployments' },
      { value: '220 kV', label: 'Highest Voltage Level' },
      { value: '<1s',   label: 'Data Acquisition Cycle' },
    ],
    gradient: 'from-indigo-400/35 via-violet-300/20 to-blue-100/10',
    image: '/images/portfolio/scada-platform.png',
  },
  {
    slug: 'solar-power-plants',
    label: 'Re-NMS',
    badge: 'Network Management',
    category: 'monitoring',
    stage: 'deployed',
    headline: 'Re-NMS — Renewable Network Management System',
    subline:
      'Centralised network management for renewable energy portfolios — tracking plant health, communication uptime, and network device status across geographically distributed assets.',
    overview: [
      'Re-NMS is Genex\'s dedicated network management system for renewable energy infrastructure. It monitors communication links, data loggers, modems, routers, and edge devices across hundreds of sites — giving O&M teams a single-pane view of network health rather than chasing individual site failures reactively.',
      'When a data logger goes offline or a 4G modem loses connectivity, Re-NMS detects the outage within minutes and automatically dispatches alerts to field engineers. Historical uptime reports and SLA dashboards help asset owners track data availability across their entire renewable portfolio.',
    ],
    capabilities: [
      'Real-time monitoring of edge devices, modems, and data loggers',
      'Automated outage detection with field engineer alert dispatch',
      'Communication uptime SLA dashboards per site and portfolio',
      'Remote device restart and firmware push capabilities',
      'Integration with SolarLive™ and third-party monitoring platforms',
    ],
    techHighlights: [
      { title: 'ICMP, SNMP, and REST-based device health polling', description: "Continuously polls modems, routers, and loggers over ICMP, SNMP, and REST so a silent device failure is caught before it becomes a data gap." },
      { title: 'MQTT heartbeat monitoring with configurable timeout thresholds', description: "Tracks lightweight MQTT heartbeats per device with adjustable timeout windows, tuned to each site's connectivity profile." },
      { title: 'Automated escalation rules with on-call rotation support', description: 'Routes unresolved outages through configurable escalation chains and on-call rotations so alerts always reach an available field engineer.' },
      { title: 'Multi-tenant architecture for managing multiple client portfolios', description: 'Isolates data and dashboards per client while running on shared infrastructure, letting O&M teams manage many portfolios from one deployment.' },
    ],
    stats: [
      { value: '3,000+', label: 'Devices Monitored' },
      { value: '98.5%',  label: 'Avg. Network Uptime' },
      { value: '<5 min', label: 'Outage Detection Time' },
    ],
    gradient: 'from-sky-400/35 via-cyan-300/20 to-blue-100/10',
    image: '/images/portfolio/rms-kusum.png',
  },
  {
    slug: 'rms',
    label: 'AI-Based Remote Monitoring Systems',
    badge: 'AI-Powered',
    category: 'ai',
    stage: 'deployed',
    headline: 'AI-Based Remote Monitoring System',
    subline:
      'Intelligent remote monitoring that goes beyond data collection — using ML models to predict faults, recommend maintenance actions, and optimize asset performance autonomously.',
    overview: [
      'Genex AI-RMS adds a machine learning layer on top of conventional remote monitoring — shifting from reactive alert management to predictive, prescriptive operations. Time-series models trained on equipment behavior automatically detect early-stage degradation in inverters, panels, and batteries before failures manifest.',
      'The system generates plain-language work orders for maintenance teams — not just raw alerts — explaining what is likely wrong, how urgent it is, and what action to take. Over time, models self-improve using the outcomes of past interventions, making every site smarter without manual model retraining.',
    ],
    capabilities: [
      'ML-based fault prediction for inverters, panels, and batteries',
      'Automated plain-language work order generation for maintenance teams',
      'Performance ratio anomaly detection with weather normalization',
      'Self-improving models based on maintenance outcome feedback',
      'Natural language query interface for operational data',
    ],
    techHighlights: [
      { title: 'LSTM and transformer models for time-series fault prediction', description: 'Trains LSTM and transformer architectures on historical sensor time-series to catch early-stage degradation before it triggers a hard fault.' },
      { title: 'scikit-learn and PyTorch inference engine on cloud backend', description: 'Runs a hybrid scikit-learn and PyTorch inference stack in the cloud, balancing classical models with deep learning where each performs best.' },
      { title: 'Real-time streaming inference with < 30s prediction latency', description: 'Scores incoming telemetry against trained models within 30 seconds, keeping predictions close enough to real time for operational response.' },
      { title: 'Explainable AI layer — all alerts include reasoning and confidence score', description: 'Attaches a plain-language reason and confidence score to every alert, so maintenance teams can act on model output without a black box.' },
    ],
    stats: [
      { value: '40%',  label: 'Reduction in Unplanned Downtime' },
      { value: '85%',  label: 'Fault Prediction Accuracy' },
      { value: '200+', label: 'Sites on AI Monitoring' },
    ],
    gradient: 'from-violet-400/35 via-purple-300/20 to-indigo-100/10',
    image: '/images/portfolio/power-cloud.png',
  },
  {
    slug: 'energy-storage',
    label: 'EMS - BESS',
    badge: 'Energy Storage',
    category: 'storage',
    stage: 'deployed',
    headline: 'EMS-BESS — AI-Driven Energy Storage Management',
    subline:
      'Next-generation energy management system for battery storage — with AI-driven dispatch optimization, predictive cycle management, and grid ancillary service capability.',
    overview: [
      'The Genex EMS-BESS Innovation Platform extends standard storage management with AI-driven economic dispatch — automatically choosing when to charge from the grid, when to discharge to reduce demand peaks, and when to participate in ancillary markets. The system models battery degradation in real time and modifies cycling to maximize lifetime value, not just immediate performance.',
      'Unlike conventional EMS platforms that follow fixed schedules, Genex EMS-BESS ingests live grid signals, tariff schedules, and weather forecasts — making adaptive dispatch decisions every minute. Operators can set economic objectives and let the system optimize autonomously, or override with manual control at any time.',
    ],
    capabilities: [
      'AI economic dispatch: tariff arbitrage, peak shaving, ancillary services',
      'Real-time battery degradation modeling and cycle optimization',
      'Live grid signal ingestion for adaptive charge/discharge decisions',
      'Multi-asset coordination across co-located solar + storage systems',
      'Regulatory reporting for capacity markets and ancillary services',
    ],
    techHighlights: [
      { title: 'Reinforcement learning-based dispatch optimization engine', description: 'Uses reinforcement learning to continuously refine charge/discharge decisions against live grid signals, tariffs, and forecast data.' },
      { title: 'IEC 61850 grid interface and MODBUS BMS communication', description: 'Bridges standardized IEC 61850 grid signaling with Modbus-based BMS communication, unifying grid and battery control in one system.' },
      { title: 'Sub-minute dispatch cycle with adaptive forecast integration', description: 'Recomputes dispatch decisions on a sub-minute cycle, folding in updated weather and tariff forecasts as conditions change.' },
      { title: 'Digital twin of battery chemistry for degradation simulation', description: 'Simulates battery chemistry behavior in a digital twin to model degradation ahead of time and adjust cycling to protect lifetime value.' },
    ],
    stats: [
      { value: '35%',    label: 'Avg. Energy Cost Reduction' },
      { value: '200 MWh', label: 'Storage Under Management' },
      { value: '20%',    label: 'Battery Life Extension' },
    ],
    gradient: 'from-teal-400/35 via-cyan-300/20 to-blue-100/10',
    image: '/images/portfolio/ems-bess.png',
  },
  {
    slug: 'wind-energy',
    label: 'Drone Monitoring',
    badge: 'AI Vision',
    category: 'ai',
    stage: 'prototype',
    headline: 'Drone Monitoring — Autonomous Aerial Plant Inspection',
    subline:
      'AI-powered drone inspection platform for solar and wind assets — automating panel health assessment, hotspot detection, and structural inspection without manual risk.',
    overview: [
      'Genex Drone Monitoring replaces manual rooftop and climbing inspections with autonomous drone flights and AI-powered image analysis. Drones capture thermal and RGB imagery across entire solar arrays or wind turbine blades — with the AI engine automatically flagging hotspots, delamination, soiling, and structural cracks in the resulting scan.',
      'Each inspection generates a geo-tagged fault map with severity classification and a prioritized remediation list — giving maintenance crews precise panel-level coordinates rather than hours of manual visual scanning. Integration with SolarLive™ correlates aerial fault data with live generation underperformance for full diagnostic context.',
    ],
    capabilities: [
      'Autonomous drone flight path planning for large solar arrays',
      'Thermal and RGB imagery analysis for hotspot and defect detection',
      'AI-generated geo-tagged fault maps with severity scoring',
      'Soiling index calculation from aerial imagery',
      'Integration with monitoring platforms for correlation with generation loss',
    ],
    techHighlights: [
      { title: 'Computer vision models trained on 500,000+ panel images', description: 'Trained on more than 500,000 labeled panel images, the vision models reliably distinguish hotspots, soiling, and delamination from normal wear.' },
      { title: 'DJI SDK and MAVLink drone control protocol integration', description: 'Integrates directly with DJI SDK and MAVLink flight controllers to plan and execute autonomous inspection flight paths.' },
      { title: 'Orthomosaic stitching with sub-cm spatial resolution', description: 'Stitches individual aerial captures into a single orthomosaic with sub-centimeter resolution, precise enough to pinpoint a single faulty cell.' },
      { title: 'Edge inference on drone payload for real-time flagging', description: 'Runs defect-detection inference directly on the drone payload, flagging likely faults during flight instead of waiting for post-processing.' },
    ],
    stats: [
      { value: '80%',   label: 'Inspection Time Reduction' },
      { value: '500+',  label: 'MW Inspected Aerially' },
      { value: '92%',   label: 'Defect Detection Accuracy' },
    ],
    gradient: 'from-amber-400/35 via-orange-300/20 to-yellow-100/10',
    image: '/images/portfolio/wind-network.png',
  },
  {
    slug: 'industrial-energy',
    label: 'Power Management Tools',
    badge: 'Grid Tools',
    category: 'grid',
    stage: 'deployed',
    headline: 'Power Management Tools — Industrial Energy Intelligence',
    subline:
      'Comprehensive power quality and demand management platform for industrial and commercial facilities — from load profiling and harmonic analysis to tariff optimization and ISO 50001 compliance.',
    overview: [
      'Genex Power Management Tools give industrial energy managers the analytical depth to understand their electricity consumption, identify inefficiencies, and take corrective action before the next billing cycle. The platform captures half-hourly load profiles, power factor readings, and harmonic distortion data from smart meters and PLCs across the facility.',
      'Demand forecasting models alert teams before demand peaks that would trigger expensive charges. Closed-loop control integrations with VFDs and capacitor banks enable automatic power factor correction without manual intervention. ISO 50001 EnPI reporting and baseline tracking are built in — helping energy managers demonstrate continuous improvement to auditors and management.',
    ],
    capabilities: [
      'Half-hourly load profiling and demand forecasting with peak alerts',
      'Power factor monitoring and automated capacitor bank control',
      'Harmonic distortion analysis per IEC 61000-4 standards',
      'Tariff optimization — TOD, slab, and demand charge analysis',
      'ISO 50001 EnPI baseline and continuous improvement reporting',
    ],
    techHighlights: [
      { title: 'Modbus and BACnet smart meter integration', description: 'Pulls half-hourly readings directly from smart meters and PLCs over Modbus and BACnet, no manual meter walks required.' },
      { title: 'IEC 61000-4 power quality measurement compliance', description: 'Measures harmonic distortion and power quality to IEC 61000-4 test standards, giving auditable, standards-compliant readings.' },
      { title: 'Closed-loop VFD and capacitor bank control via Modbus', description: 'Closes the loop on power factor correction by driving VFDs and capacitor banks directly over Modbus when thresholds are breached.' },
      { title: 'ISO 50001:2018 EnPI calculation and baseline engine', description: 'Automates ISO 50001:2018 EnPI baseline calculation, tracking continuous improvement without manual spreadsheet reporting.' },
    ],
    stats: [
      { value: '150+',     label: 'Industrial Sites' },
      { value: '18%',      label: 'Avg. Energy Cost Reduction' },
      { value: 'ISO 50001', label: 'Compliance Supported' },
    ],
    gradient: 'from-emerald-400/35 via-green-300/20 to-teal-100/10',
    image: '/images/portfolio/rtc-power.png',
  },
  {
    slug: 'ai-health-checkup',
    label: 'AI-Plant Health Checkup',
    badge: 'AI Diagnostics',
    category: 'ai',
    stage: 'prototype',
    headline: 'AI-Plant Health Checkup',
    subline:
      'Automated AI-driven health assessment for solar and battery plants — delivering instant diagnostics, performance benchmarks, and a prioritized remediation plan in under an hour.',
    overview: [
      'AI-Plant Health Checkup is a diagnostic product that gives plant owners a complete, unbiased assessment of their solar or storage asset\'s current condition — without waiting for the next scheduled audit. The AI ingests 12 months of operational data, compares performance against weather-normalized benchmarks, and identifies every source of yield loss from inverter clipping to soiling degradation.',
      'The output is a structured health report — not a raw data export — with a traffic-light score per subsystem, a ranked list of remediation actions sorted by revenue impact, and an estimated financial recovery for each fix. Asset managers use it before buying or selling plants, and O&M contractors use it to justify capex to plant owners.',
    ],
    capabilities: [
      'Automated 12-month performance analysis and benchmark comparison',
      'Subsystem health scoring: inverters, strings, meters, communication',
      'Weather-normalized yield loss attribution per fault category',
      'Financial recovery estimation per remediation action',
      'Structured PDF health report with executive summary',
    ],
    techHighlights: [
      { title: 'Weather normalization using ERA5 and satellite irradiance data', description: 'Normalizes plant output against ERA5 reanalysis and satellite irradiance data, separating true underperformance from weather variability.' },
      { title: 'Random forest classifier for fault attribution and scoring', description: 'Uses a random forest classifier to attribute yield loss to a specific fault category and rank subsystems by health score.' },
      { title: 'Integration with SolarLive™ and third-party monitoring APIs', description: 'Pulls 12 months of operational history directly from SolarLive™ or any third-party monitoring API, no manual data export needed.' },
      { title: 'Automated report generation pipeline — full PDF in < 60 minutes', description: 'Runs the full analysis-to-report pipeline automatically, delivering a structured PDF health report in under 60 minutes.' },
    ],
    stats: [
      { value: '50+',  label: 'Plants Assessed' },
      { value: '< 1hr', label: 'Report Generation Time' },
      { value: '22%',  label: 'Avg. Recoverable Yield Found' },
    ],
    gradient: 'from-rose-400/35 via-pink-300/20 to-orange-100/10',
    image: '/images/portfolio/bms.png',
  },
  {
    slug: 'smart-grid',
    label: 'Smart Grid & Utilities',
    badge: 'Smart Grid',
    category: 'grid',
    stage: 'deployed',
    headline: 'Smart Grid & Utilities Platform',
    subline:
      'End-to-end smart grid management — from distribution automation and AMI integration to demand response orchestration and grid resilience analytics for utilities and discoms.',
    overview: [
      'The Genex Smart Grid & Utilities Platform gives distribution utilities and discoms the operational intelligence to manage modern grid complexity. It integrates with Advanced Metering Infrastructure (AMI), Distribution Automation (DA) systems, and RTUs — providing a unified operations dashboard for load management, outage response, and demand-side programs.',
      'Built for Indian grid conditions, the platform handles high-frequency load shedding events, non-technical loss identification, and feeder-level generation forecasting for DERs. Utilities use it to manage PM-KUSUM feeder separation, rooftop solar backflow, and emerging EV charging load growth without manual spreadsheet coordination.',
    ],
    capabilities: [
      'AMI and smart meter integration for real-time consumption visibility',
      'Distribution automation: feeder switching and fault isolation',
      'Non-technical loss detection and theft analytics',
      'Demand response program orchestration and settlement',
      'DER and rooftop solar backflow management',
    ],
    techHighlights: [
      { title: 'IEC 61968/61970 CIM data model for utility integration', description: 'Models grid assets against the IEC 61968/61970 Common Information Model, so utility systems integrate without custom data mapping.' },
      { title: 'DLMS/COSEM smart meter communication protocol support', description: 'Reads AMI smart meters natively over DLMS/COSEM, the protocol most Indian utility meter fleets already speak.' },
      { title: 'Real-time outage management with geo-fenced fault isolation', description: 'Isolates faults to a geo-fenced feeder segment in real time, narrowing outage response from guesswork to a known location.' },
      { title: 'DERMS integration for distributed energy resource dispatch', description: 'Coordinates rooftop solar, storage, and other DERs through DERMS integration, keeping distributed generation within grid limits.' },
    ],
    stats: [
      { value: '10+',   label: 'Utility Clients' },
      { value: '1M+',   label: 'Meters Connected' },
      { value: '30%',   label: 'NTL Reduction Achieved' },
    ],
    gradient: 'from-cyan-400/35 via-sky-300/20 to-blue-100/10',
    image: '/images/portfolio/zero-export.png',
  },
  {
    slug: 'ev-infrastructure',
    label: 'EV - Software Management',
    badge: 'EV Tech',
    category: 'ev',
    stage: 'scaled',
    headline: 'EV Software Management — Next-Gen Fleet Intelligence',
    subline:
      'Advanced EV charging and fleet intelligence platform — with AI-driven load balancing, V2G readiness, and real-time fleet energy optimization for enterprise and public charging networks.',
    overview: [
      'Genex EV Software Management goes beyond basic OCPP charger control — adding AI-driven fleet energy intelligence that optimizes charging schedules across an entire fleet to minimize electricity cost while ensuring vehicles are ready when drivers need them. The platform integrates with HR systems and vehicle telematics to predict departure schedules and auto-configure charging windows.',
      'For public charging operators, the platform manages dynamic pricing, utilization analytics, and fault diagnostics across hundreds of charge points. V2G capability is built into the protocol stack, positioning operators to participate in demand response markets as bidirectional charging infrastructure matures in India.',
    ],
    capabilities: [
      'AI-driven fleet charging schedule optimization against tariff curves',
      'Vehicle telematics and HR system integration for departure prediction',
      'Dynamic pricing and session analytics for public charging operators',
      'V2G protocol stack (ISO 15118) for bidirectional charging readiness',
      'White-label driver mobile app with RFID, QR, and app authentication',
    ],
    techHighlights: [
      { title: 'OCPP 2.0.1 and ISO 15118-2 V2G protocol support', description: 'Speaks OCPP 2.0.1 for charger control and ISO 15118-2 for vehicle-to-grid, positioning the platform for bidirectional charging as it matures.' },
      { title: 'Reinforcement learning for fleet charge schedule optimization', description: "Applies reinforcement learning to fleet charging schedules, balancing tariff cost against each vehicle's required departure readiness." },
      { title: 'REST and MQTT APIs for fleet management system integration', description: 'Exposes REST and MQTT interfaces so fleet management systems can pull charging status and push scheduling changes directly.' },
      { title: 'End-to-end encryption and PCI-DSS compliant payment flow', description: 'Encrypts payment data end-to-end through a PCI-DSS compliant flow, meeting the compliance bar public charging operators need.' },
    ],
    stats: [
      { value: '500+', label: 'Chargers Managed' },
      { value: '40+',  label: 'Enterprise Clients' },
      { value: '25%',  label: 'Avg. Charging Cost Reduction' },
    ],
    gradient: 'from-green-400/35 via-emerald-300/20 to-teal-100/10',
    image: '/images/portfolio/ev-software.png',
  },
  {
    slug: 'power-trading',
    label: 'Power Trading',
    badge: 'Energy Markets',
    category: 'grid',
    stage: 'research',
    headline: 'Power Trading Platform',
    subline:
      'Algorithmic power trading and market participation platform — enabling renewable generators and large consumers to optimize energy procurement and sell surplus power on IEX and bilateral markets.',
    overview: [
      'Genex Power Trading Platform is in active research and development — targeting India\'s rapidly growing power exchange and bilateral electricity markets. The platform combines real-time generation forecasting with market price analytics to identify optimal bid windows for renewable generators on IEX Day-Ahead and Real-Time markets.',
      'For large industrial consumers, the platform aggregates demand flexibility and participates in demand response programs — offsetting peak tariff exposure. Research partnerships with IITs and CERC research units are informing the regulatory compliance architecture, ensuring the platform is ready for commercial deployment as India\'s market mechanisms mature.',
    ],
    capabilities: [
      'Generation forecasting models for Day-Ahead IEX market bidding',
      'Real-Time Market price analytics and bid optimization',
      'Demand aggregation and flexibility market participation',
      'Portfolio-level energy balance and imbalance management',
      'Regulatory compliance and settlement automation (CERC guidelines)',
    ],
    techHighlights: [
      { title: 'XGBoost and LSTM generation forecast models (1hr resolution)', description: 'Forecasts hourly generation using a combined XGBoost and LSTM ensemble, tuned for the resolution IEX bidding windows require.' },
      { title: 'IEX API integration for market price and clearing data', description: 'Pulls live price and clearing data directly from IEX APIs, keeping bid decisions grounded in current market conditions.' },
      { title: 'Monte Carlo simulation for bid price uncertainty modeling', description: 'Runs Monte Carlo simulations over forecast uncertainty to size bid prices that balance revenue against imbalance risk.' },
      { title: 'CERC imbalance charge calculation and settlement reconciliation', description: 'Automates CERC imbalance charge calculation and settlement reconciliation, built to the regulatory architecture research partners are validating.' },
    ],
    stats: [
      { value: 'Active',  label: 'Research Phase' },
      { value: 'IEX',     label: 'Target Market' },
      { value: '2026',    label: 'Commercial Launch Target' },
    ],
    gradient: 'from-slate-400/35 via-gray-300/20 to-zinc-100/10',
    image: '/images/portfolio/carbon-credit.png',
  },
  {
    slug: 'power-billing',
    label: 'Power Billing System',
    badge: 'Billing',
    category: 'grid',
    stage: 'scaled',
    headline: 'Power Billing System — Automated Energy Billing',
    subline:
      'Enterprise-grade automated power billing for utilities, discoms, and distributed energy operators — handling complex tariff structures, net metering, and multi-discom regulatory compliance at scale.',
    overview: [
      'Genex Power Billing System replaces error-prone manual billing workflows with a fully automated platform that handles the full billing lifecycle — from raw meter reading ingestion to bill generation, consumer dispatch, and discom reconciliation. The tariff engine supports all major Indian regulatory structures including GNM, VNM, time-of-use, slab, and ToD tariffs.',
      'Built for scale, the platform generates tens of thousands of bills per monthly cycle without manual intervention. Consumer self-service portals, digital payment integrations, and automated dispute resolution workflows reduce the operational burden on billing staff while improving consumer satisfaction. API connectors are available for all major discom MIS formats.',
    ],
    capabilities: [
      'Automated meter reading ingestion and validation with exception handling',
      'Multi-tariff engine: GNM, VNM, ToD, slab, and demand charge billing',
      'Bulk bill generation with PDF and digital delivery',
      'Consumer self-service portal with payment gateway integration',
      'Discom MIS API connectors for automated reconciliation',
    ],
    techHighlights: [
      { title: 'GNM and VNM regulatory formula engine per state SERC orders', description: "Applies each state SERC's specific GNM and VNM billing formulas automatically, instead of maintaining separate spreadsheets per discom." },
      { title: 'DLMS/COSEM smart meter reading protocol support', description: 'Ingests raw meter readings over DLMS/COSEM directly from the field, removing manual reading entry from the billing cycle.' },
      { title: 'Digital signature (DSC) integration for bill authentication', description: 'Signs every generated bill with a Digital Signature Certificate, giving consumers and auditors a verifiable, tamper-evident document.' },
      { title: 'Multi-discom adapter layer with format versioning', description: "Adapts to each discom's MIS format through a versioned connector layer, so a format change at one discom doesn't break the others." },
    ],
    stats: [
      { value: '10,000+', label: 'Bills Generated Monthly' },
      { value: '15+',     label: 'Discom Formats Supported' },
      { value: '98%',     label: 'Billing Accuracy Rate' },
    ],
    gradient: 'from-blue-400/35 via-sky-300/20 to-cyan-100/10',
    image: '/images/portfolio/power-billing.png',
  },
]

export const INNOVATION_BY_SLUG: Record<string, InnovationProduct> = Object.fromEntries(
  INNOVATIONS.map(p => [p.slug, p])
)
