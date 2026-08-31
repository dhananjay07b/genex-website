export interface TechArticle {
  id: number
  title: string
  topic: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  readTime: string
  date: string
  excerpt: string
  tags: string[]
  featured: boolean
  image: string
  intro: string
  sections: { heading: string; body: string }[]
  callout: { label: string; content: string }
  takeaways: string[]
}

export const TECH_ARTICLES: TechArticle[] = [
  {
    id: 1,
    title: 'How IEC 61850 Changed Substation Automation — And Why It Matters for Indian Utilities',
    topic: 'IEC 61850',
    difficulty: 'Intermediate',
    readTime: '12 min read',
    date: 'JUL 15 2025',
    excerpt:
      "IEC 61850 is more than a communication protocol — it's a complete engineering philosophy for interoperable, vendor-agnostic substation automation. This deep dive covers GOOSE, SV messaging, and practical deployment lessons from Genex SCADA installations.",
    tags: ['IEC 61850', 'SCADA', 'Substation'],
    featured: true,
    image: '/images/case-studies/cs-1.jpg',
    intro:
      "Before IEC 61850, substation automation meant negotiating a patchwork of proprietary protocols — DNP3 here, Modbus there, a vendor-specific binary language buried in a relay datasheet. Indian state transmission utilities in particular have inherited large installed bases of legacy IEDs that speak nothing in common. IEC 61850 changed the equation by defining both a data model and a communication framework that any compliant device must implement, regardless of manufacturer. The result: substations that can be integrated, tested, and maintained by any engineering team with the right tools.",
    sections: [
      {
        heading: 'What the Standard Actually Specifies',
        body:
          "IEC 61850 is organised into parts. The critical ones for substation automation are Part 7 (data models and services), Part 8-1 (mapping to MMS over TCP/IP for station-bus communication), and Part 9-2 (sampled values for process-bus current and voltage). Part 6 defines SCL — the Substation Configuration Language — a structured XML format that describes the entire substation configuration, including which IEDs are present, their logical node structure, and their communication bindings. SCL is what makes 61850 genuinely interoperable: the configuration lives in files that any 61850-compliant engineering tool can read and validate.",
      },
      {
        heading: 'GOOSE and Sampled Values in Practice',
        body:
          "GOOSE (Generic Object Oriented Substation Event) is the mechanism used for high-speed peer-to-peer messaging between IEDs — inter-tripping, interlocking, protection coordination. GOOSE packets are published to a multicast Ethernet address and re-transmitted at decreasing intervals after an event, which gives sub-5ms end-to-end latency when the LAN is properly configured. Sampled Values (SV) are the digital equivalent of analogue current and voltage waveforms, published from merging units to protection relays at 80 or 256 samples per cycle. Both require a dedicated, isolated station LAN — mixing GOOSE with general IT traffic is a commissioning mistake Genex engineers have had to diagnose more than once on site.",
      },
      {
        heading: 'Commissioning Lessons from Indian Deployments',
        body:
          "Three patterns come up repeatedly when Genex engineers commission IEC 61850 systems at Indian substations. First: SCL file mismatches between relay firmware versions and the ICD files shipped with the relay. Always extract the ICD directly from the commissioned relay firmware, not from the CD that came in the box. Second: VLAN misconfiguration causing GOOSE messages to drop — because the switch was treating multicast as broadcast and flooding the wrong ports. Third: timestamp synchronisation failures. Protection logs and event records are meaningless without accurate IEEE 1588 / PTP synchronisation. A GPS-disciplined PTP grandmaster is non-negotiable on any site where fault analysis matters.",
      },
    ],
    callout: {
      label: 'Protocol Quick Reference',
      content:
        'GOOSE: Multicast Ethernet, <5ms latency, peer-to-peer protection. MMS: TCP/IP, station-bus SCADA. SV: 80/256 spc process bus. SCL files: ICD (device), SSD (single-line), SCD (complete substation).',
    },
    takeaways: [
      'SCL files must be extracted from commissioned firmware — not from installation media',
      'GOOSE requires a dedicated VLAN with correctly configured multicast forwarding',
      'PTP/IEEE 1588 synchronisation is mandatory for meaningful protection event logs',
      'Test IEC 61850 interoperability with actual site hardware before finalising the SCL',
      'IEC 61850 Part 6 SCL is the single source of truth for substation configuration',
    ],
  },
  {
    id: 2,
    title: 'Edge vs Cloud: Choosing the Right Data Architecture for Solar Monitoring at Scale',
    topic: 'Edge Computing',
    difficulty: 'Intermediate',
    readTime: '9 min read',
    date: 'AUG 05 2025',
    excerpt:
      "When you're managing 500+ solar sites, the decision between edge processing and cloud aggregation isn't theoretical — it affects data latency, cost, and reliability in measurable ways.",
    tags: ['Solar Analytics', 'Edge Computing', 'Cloud Architecture'],
    featured: false,
    image: '/images/case-studies/cs-2.jpg',
    intro:
      "The default assumption for any new IoT deployment is cloud-first: collect everything at the edge, push it all upstream, process it centrally. For solar monitoring at small scale, that works. At 500 sites or more — with varying connectivity, data volume pressure, and SLA requirements for fault alerting — cloud-first stops being the right answer. The question is not edge or cloud, but which functions belong at each tier.",
    sections: [
      {
        heading: 'What Has to Run at the Edge',
        body:
          "Anything with a real-time SLA belongs at the edge. Overcurrent fault detection, grid islanding alerts, inverter communication health checks — these need sub-second decisions. A cloud round-trip over a 4G connection with backpressure from 500 simultaneous sites adds latency that makes real-time alerting unreliable. Edge nodes buffer measurements locally, run threshold logic, and push alerts independently of cloud connectivity. The cloud gets the aggregated telemetry, not the alerting path.",
      },
      {
        heading: 'What the Cloud Does Better',
        body:
          "Historical trend analysis, portfolio-level PR benchmarking, ML-based degradation modelling, and report generation are all cloud-appropriate. These workloads are batch-oriented, not latency-sensitive, and they benefit from aggregating data across sites that an edge node by definition cannot see. The Genex SolarLive™ cloud backend processes multi-site PR deviation, inverter health scoring, and soiling event correlation across the portfolio — work that fundamentally requires cross-site data.",
      },
      {
        heading: 'Connectivity Budgeting at Scale',
        body:
          "At 500 sites, 4G data costs become a real line item. The engineering decision is what resolution of data goes to the cloud versus what stays at the edge. Genex Data Loggers store 1-second resolution locally and push 5-minute aggregates upstream by default. Raw second-by-second data is pulled on demand — for fault investigation, commissioning validation, or PR dispute resolution. This cuts typical data egress by 80% compared to streaming everything.",
      },
    ],
    callout: {
      label: 'Architecture Decision Rule',
      content:
        'If a function needs sub-second response or must survive connectivity loss: edge. If it benefits from cross-site aggregation or historical depth: cloud. Fault alerting = edge. PR analytics = cloud.',
    },
    takeaways: [
      'Real-time alerting must run at the edge — cloud round-trips are too slow and unreliable',
      'Cloud is the right tier for cross-site analytics, ML models, and portfolio reporting',
      'Connectivity budgeting: push aggregates upstream, pull raw data on-demand for investigations',
      'Local buffering at the edge prevents data loss during connectivity gaps',
      'Design data resolution by tier — 1s at edge, 5-min aggregates to cloud by default',
    ],
  },
  {
    id: 3,
    title: 'OCPP 2.0.1 vs OCPP 1.6: What Fleet Operators Need to Know Before Upgrading',
    topic: 'EV Infrastructure',
    difficulty: 'Beginner',
    readTime: '7 min read',
    date: 'AUG 19 2025',
    excerpt:
      "The jump from OCPP 1.6 to 2.0.1 introduces device management, improved security, and ISO 15118 readiness. Here's a practical comparison for charging network operators planning infrastructure upgrades.",
    tags: ['EV Infrastructure', 'OCPP', 'Standards'],
    featured: false,
    image: '/images/case-studies/cs-3.jpg',
    intro:
      "OCPP — the Open Charge Point Protocol — is the dominant communication standard between EV charging stations and management systems. Version 1.6J became the de facto standard for most of India's early charging infrastructure. OCPP 2.0.1, published in 2020, is a near-complete rewrite. The architecture is cleaner, security is built in, and device management is finally specified. But the upgrade path is not trivial, and fleet operators need a clear-eyed view of what changes and what doesn't before committing hardware spend.",
    sections: [
      {
        heading: 'What 2.0.1 Actually Adds',
        body:
          "The most significant additions in 2.0.1 are: Device Management (firmware updates, diagnostics, and configuration pushed from the CSMS), improved Security profiles (TLS 1.2+ mandatory, certificate-based mutual authentication), Smart Charging enhancements (more granular charging profiles, local load balancing), and a transaction model that properly handles offline sessions and energy transfer records. For fleet operators, the device management improvements are the most immediately valuable — being able to push firmware remotely without a site visit is a genuine operational saving.",
      },
      {
        heading: 'What the Upgrade Means for Hardware',
        body:
          "Most OCPP 1.6 hardware can receive a 2.0.1 firmware update if the manufacturer supports it. The protocol change itself is not the limiting factor — the hardware's computational capacity and the manufacturer's willingness to maintain legacy products are. Before budgeting an upgrade, fleet operators should confirm firmware roadmap commitments in writing from their charger OEM. Chargers deployed before 2021 from several major Indian vendors have effectively been abandoned in terms of firmware support.",
      },
      {
        heading: 'ISO 15118 Readiness',
        body:
          "OCPP 2.0.1 is designed to carry ISO 15118 messages — the vehicle-to-grid communication standard that enables Plug & Charge (automatic authentication without RFID cards) and V2G bidirectional charging. Most Indian deployments do not need this today, but fleet operators building depot infrastructure in 2025 should think about whether their vehicles and software stack will need 15118 within the next four years. The right answer is usually to deploy 2.0.1-ready hardware now and activate 15118 features when vehicles support it.",
      },
    ],
    callout: {
      label: 'OCPP Version Comparison',
      content:
        '1.6: WebSocket + JSON, basic auth, limited device mgmt. 2.0.1: TLS mandatory, certificate auth, full device mgmt, ISO 15118 ready, better offline handling. Both use JSON-over-WebSocket transport.',
    },
    takeaways: [
      'OCPP 2.0.1 adds mandatory TLS, device management, and ISO 15118 readiness',
      'Confirm firmware upgrade path with your charger OEM before budgeting the transition',
      'Pre-2021 hardware from some vendors may not receive 2.0.1 firmware — check the roadmap',
      'Deploy 2.0.1-capable hardware now even if ISO 15118 features are not needed immediately',
      'The transaction model in 2.0.1 is significantly improved for offline session handling',
    ],
  },
  {
    id: 4,
    title: 'Designing a Reliable MQTT Architecture for Industrial IoT at 10,000 Endpoints',
    topic: 'MQTT',
    difficulty: 'Advanced',
    readTime: '15 min read',
    date: 'SEP 02 2025',
    excerpt:
      "MQTT is lightweight by design — but scaling it reliably across thousands of field devices requires careful broker configuration, QoS selection, and failover planning. Lessons from Genex's Data Logger fleet.",
    tags: ['IoT', 'MQTT', 'Edge Computing'],
    featured: false,
    image: '/images/case-studies/cs-4.jpg',
    intro:
      "MQTT gained dominance in IoT because it is genuinely lightweight and well-suited to constrained devices on unreliable networks. A Data Logger running on a 512MB embedded Linux device over a 4G connection with intermittent coverage is exactly the deployment MQTT was designed for. But 'lightweight protocol' does not mean 'light infrastructure' at 10,000 endpoints. The broker cluster, topic hierarchy, QoS selection, and client reconnection behaviour need serious design attention before you have a production incident at 3am.",
    sections: [
      {
        heading: 'Broker Architecture and Clustering',
        body:
          "A single MQTT broker will become a bottleneck at scale. Genex uses a clustered EMQX deployment with a load balancer in front and separate node pools for ingest (device connections) and subscription (application consumers). Device connections are separated from application consumption because their traffic profiles are completely different — devices send small messages frequently, while application consumers may subscribe to aggregated topics. Running them on the same broker pool creates resource contention that shows up as increased publish latency under load.",
      },
      {
        heading: 'QoS Level Selection is Not Trivial',
        body:
          "QoS 0 (at most once) is appropriate for high-frequency telemetry where occasional loss is acceptable — 10-second power readings, for example. QoS 1 (at least once) adds acknowledgement and retry, which is correct for fault events and alarm messages that must not be lost. QoS 2 (exactly once) is almost never worth the overhead for IoT telemetry — the four-way handshake adds latency and broker state that compounds at scale. The common mistake is using QoS 1 for everything. At 10,000 devices publishing every 10 seconds, QoS 1 generates 60x the broker state of QoS 0 for the same data volume.",
      },
      {
        heading: 'Reconnection and Session Persistence',
        body:
          "Field device connectivity is intermittent. A data logger on a 4G link in a remote solar farm will experience disconnections — sometimes for minutes, sometimes hours. MQTT's clean session flag controls whether the broker retains subscription state between connections. For devices, clean session should be true — no retained state means no session accumulation on the broker from thousands of devices connecting and disconnecting. Use local buffering on the device to handle connectivity gaps, not MQTT persistent sessions. Retained messages should be used sparingly — only for device last-known-state, not for telemetry.",
      },
    ],
    callout: {
      label: 'MQTT QoS Decision Matrix',
      content:
        'QoS 0: high-freq telemetry (power readings, inverter status). QoS 1: alarms, faults, config change confirmations. QoS 2: almost never in IoT. Always: local buffer + clean session on field devices.',
    },
    takeaways: [
      'Separate ingest and subscription node pools in the broker cluster — their load profiles differ',
      'Use QoS 0 for high-frequency telemetry, QoS 1 for alarms — QoS 2 is rarely justified',
      'Set clean session = true on field devices; use local buffering for connectivity gaps',
      'Design topic hierarchy before deployment — retrofitting is painful at scale',
      'Broker metrics to monitor: connection rate, message throughput, queue depth, session count',
    ],
  },
  {
    id: 5,
    title: 'Battery State-of-Health Estimation: Methods, Tradeoffs, and What Actually Works in the Field',
    topic: 'Energy Storage',
    difficulty: 'Advanced',
    readTime: '11 min read',
    date: 'SEP 16 2025',
    excerpt:
      'SOH estimation algorithms range from simple coulomb counting to machine learning models. We break down the methods Genex uses in its BMS platform and why accuracy requirements differ by application.',
    tags: ['Energy Storage', 'BMS', 'AI Analytics'],
    featured: false,
    image: '/images/case-studies/cs-5.jpg',
    intro:
      "State of Health — the ratio of a battery's current usable capacity to its original rated capacity — is the most important number in any battery management system. But it cannot be measured directly. Every BMS estimates it, and the accuracy of that estimate has direct consequences for dispatch decisions, warranty claims, and second-life assessment. The gap between laboratory SoH methods and what is practical on a deployed fleet of batteries in Indian ambient conditions is wider than most engineers expect when they start specifying a BMS.",
    sections: [
      {
        heading: 'Coulomb Counting: Simple and Unreliable',
        body:
          "The simplest SoH approach integrates charge and discharge current over time to track capacity fade. It works reasonably well in a laboratory with precise current measurement and controlled temperature. In the field, current sensor drift, partial state-of-charge operation (most BESS systems never fully charge or discharge), and temperature variation accumulate errors that make long-term coulomb counting unreliable without recalibration. Genex BMS performs coulomb counting between reference events — full charge cycles where the SoC can be anchored to a known value — to reset drift.",
      },
      {
        heading: 'Electrochemical Impedance and EIS',
        body:
          "Electrochemical Impedance Spectroscopy measures the frequency-domain impedance of the cell across a sweep of AC frequencies. The impedance spectrum reveals which degradation mechanisms are active — SEI growth, lithium plating, cathode dissolution — with specificity that current-based methods cannot match. EIS is the gold standard in research. In deployed BMS hardware, it requires a signal injection circuit and careful noise isolation that adds cost. Genex uses simplified single-frequency impedance measurements as a proxy for degradation state tracking on cell groups, not full EIS across the spectrum.",
      },
      {
        heading: 'ML-Based SoH Estimation',
        body:
          "Machine learning approaches — typically trained on voltage, current, and temperature feature vectors — can achieve high SoH accuracy on the cell chemistry and duty profile they were trained on. The failure mode is distribution shift: a model trained on cells from manufacturer A, operated at 25°C, performing daily cycling, will give unreliable estimates on the same cells at 45°C with aggressive short-duration discharge events. Genex trains SoH models on fleet data from Indian ambient conditions and updates them quarterly as more operational data accumulates. The model is a complement to physics-based methods, not a replacement.",
      },
    ],
    callout: {
      label: 'SoH Method Comparison',
      content:
        'Coulomb counting: low cost, drifts without recalibration. OCV lookup: accurate but requires rest period. Impedance: high accuracy, hardware cost. ML model: high accuracy on trained distribution, degrades on shift.',
    },
    takeaways: [
      'No single SoH method is sufficient — production BMS platforms use complementary approaches',
      'Coulomb counting requires reference anchoring events to prevent drift accumulation',
      'ML models must be trained on representative field data — lab data is not enough',
      'Temperature compensation is non-negotiable for Indian ambient conditions (35–50°C range)',
      'SoH accuracy requirements differ: warranty tracking needs ±2%, dispatch can tolerate ±5%',
    ],
  },
]
