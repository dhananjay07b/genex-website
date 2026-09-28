from datetime import date

from django.core.management.base import BaseCommand

from pages.models import TechArticle

ARTICLES = [
    {
        "title": "How IEC 61850 Changed Substation Automation — And Why It Matters for Indian Utilities",
        "topic": "IEC 61850",
        "difficulty": "Intermediate",
        "read_time": "12 min read",
        "date": date(2025, 7, 15),
        "excerpt": (
            "IEC 61850 is more than a communication protocol — it's a complete engineering "
            "philosophy for interoperable, vendor-agnostic substation automation. This deep dive "
            "covers GOOSE, SV messaging, and practical deployment lessons from Genex SCADA "
            "installations."
        ),
        "tags": ["IEC 61850", "SCADA", "Substation"],
        "featured": True,
        "intro": (
            "<p>Before IEC 61850, substation automation meant negotiating a patchwork of proprietary "
            "protocols — DNP3 here, Modbus there, a vendor-specific binary language buried in a relay "
            "datasheet. Indian state transmission utilities in particular have inherited large installed "
            "bases of legacy IEDs that speak nothing in common. IEC 61850 changed the equation by "
            "defining both a data model and a communication framework that any compliant device must "
            "implement, regardless of manufacturer. The result: substations that can be integrated, "
            "tested, and maintained by any engineering team with the right tools.</p>"
        ),
        "sections": [
            (
                "section",
                {
                    "heading": "What the Standard Actually Specifies",
                    "body": (
                        "<p>IEC 61850 is organised into parts. The critical ones for substation automation "
                        "are Part 7 (data models and services), Part 8-1 (mapping to MMS over TCP/IP for "
                        "station-bus communication), and Part 9-2 (sampled values for process-bus current "
                        "and voltage). Part 6 defines SCL — the Substation Configuration Language — a "
                        "structured XML format that describes the entire substation configuration. SCL is "
                        "what makes 61850 genuinely interoperable: the configuration lives in files that "
                        "any 61850-compliant engineering tool can read and validate.</p>"
                    ),
                },
            ),
            (
                "section",
                {
                    "heading": "GOOSE and Sampled Values in Practice",
                    "body": (
                        "<p>GOOSE (Generic Object Oriented Substation Event) is the mechanism used for "
                        "high-speed peer-to-peer messaging between IEDs — inter-tripping, interlocking, "
                        "protection coordination. Sampled Values (SV) are the digital equivalent of "
                        "analogue current and voltage waveforms, published from merging units to "
                        "protection relays at 80 or 256 samples per cycle. Both require a dedicated, "
                        "isolated station LAN — mixing GOOSE with general IT traffic is a commissioning "
                        "mistake Genex engineers have had to diagnose more than once on site.</p>"
                    ),
                },
            ),
            (
                "section",
                {
                    "heading": "Commissioning Lessons from Indian Deployments",
                    "body": (
                        "<p>Three patterns come up repeatedly when Genex engineers commission IEC 61850 "
                        "systems at Indian substations: SCL file mismatches between relay firmware and "
                        "shipped ICD files, VLAN misconfiguration causing GOOSE messages to drop, and "
                        "timestamp synchronisation failures. A GPS-disciplined PTP grandmaster is "
                        "non-negotiable on any site where fault analysis matters.</p>"
                    ),
                },
            ),
        ],
        "callout_label": "Protocol Quick Reference",
        "callout_content": (
            "GOOSE: Multicast Ethernet, <5ms latency, peer-to-peer protection. MMS: TCP/IP, "
            "station-bus SCADA. SV: 80/256 spc process bus. SCL files: ICD (device), SSD "
            "(single-line), SCD (complete substation)."
        ),
        "takeaways": [
            "SCL files must be extracted from commissioned firmware — not from installation media",
            "GOOSE requires a dedicated VLAN with correctly configured multicast forwarding",
            "PTP/IEEE 1588 synchronisation is mandatory for meaningful protection event logs",
            "Test IEC 61850 interoperability with actual site hardware before finalising the SCL",
            "IEC 61850 Part 6 SCL is the single source of truth for substation configuration",
        ],
    },
    {
        "title": "Edge vs Cloud: Choosing the Right Data Architecture for Solar Monitoring at Scale",
        "topic": "Edge Computing",
        "difficulty": "Intermediate",
        "read_time": "9 min read",
        "date": date(2025, 8, 5),
        "excerpt": (
            "When you're managing 500+ solar sites, the decision between edge processing and cloud "
            "aggregation isn't theoretical — it affects data latency, cost, and reliability in "
            "measurable ways."
        ),
        "tags": ["Solar Analytics", "Edge Computing", "Cloud Architecture"],
        "featured": False,
        "intro": (
            "<p>The default assumption for any new IoT deployment is cloud-first: collect everything "
            "at the edge, push it all upstream, process it centrally. For solar monitoring at small "
            "scale, that works. At 500 sites or more — with varying connectivity, data volume pressure, "
            "and SLA requirements for fault alerting — cloud-first stops being the right answer. The "
            "question is not edge or cloud, but which functions belong at each tier.</p>"
        ),
        "sections": [
            (
                "section",
                {
                    "heading": "What Has to Run at the Edge",
                    "body": (
                        "<p>Anything with a real-time SLA belongs at the edge. Overcurrent fault "
                        "detection, grid islanding alerts, and inverter communication health checks need "
                        "sub-second decisions. Edge nodes buffer measurements locally, run threshold "
                        "logic, and push alerts independently of cloud connectivity. The cloud gets the "
                        "aggregated telemetry, not the alerting path.</p>"
                    ),
                },
            ),
            (
                "section",
                {
                    "heading": "What the Cloud Does Better",
                    "body": (
                        "<p>Historical trend analysis, portfolio-level PR benchmarking, ML-based "
                        "degradation modelling, and report generation are all cloud-appropriate. These "
                        "workloads are batch-oriented, not latency-sensitive, and they benefit from "
                        "aggregating data across sites that an edge node by definition cannot see.</p>"
                    ),
                },
            ),
            (
                "section",
                {
                    "heading": "Connectivity Budgeting at Scale",
                    "body": (
                        "<p>At 500 sites, 4G data costs become a real line item. Genex Data Loggers "
                        "store 1-second resolution locally and push 5-minute aggregates upstream by "
                        "default. Raw second-by-second data is pulled on demand — for fault "
                        "investigation, commissioning validation, or PR dispute resolution. This cuts "
                        "typical data egress by 80% compared to streaming everything.</p>"
                    ),
                },
            ),
        ],
        "callout_label": "Architecture Decision Rule",
        "callout_content": (
            "If a function needs sub-second response or must survive connectivity loss: edge. If it "
            "benefits from cross-site aggregation or historical depth: cloud. Fault alerting = edge. "
            "PR analytics = cloud."
        ),
        "takeaways": [
            "Real-time alerting must run at the edge — cloud round-trips are too slow and unreliable",
            "Cloud is the right tier for cross-site analytics, ML models, and portfolio reporting",
            "Connectivity budgeting: push aggregates upstream, pull raw data on-demand for investigations",
            "Local buffering at the edge prevents data loss during connectivity gaps",
            "Design data resolution by tier — 1s at edge, 5-min aggregates to cloud by default",
        ],
    },
    {
        "title": "OCPP 2.0.1 vs OCPP 1.6: What Fleet Operators Need to Know Before Upgrading",
        "topic": "EV Infrastructure",
        "difficulty": "Beginner",
        "read_time": "7 min read",
        "date": date(2025, 8, 19),
        "excerpt": (
            "The jump from OCPP 1.6 to 2.0.1 introduces device management, improved security, and "
            "ISO 15118 readiness. Here's a practical comparison for charging network operators "
            "planning infrastructure upgrades."
        ),
        "tags": ["EV Infrastructure", "OCPP", "Standards"],
        "featured": False,
        "intro": (
            "<p>OCPP — the Open Charge Point Protocol — is the dominant communication standard "
            "between EV charging stations and management systems. Version 1.6J became the de facto "
            "standard for most of India's early charging infrastructure. OCPP 2.0.1, published in "
            "2020, is a near-complete rewrite. The upgrade path is not trivial, and fleet operators "
            "need a clear-eyed view of what changes before committing hardware spend.</p>"
        ),
        "sections": [
            (
                "section",
                {
                    "heading": "What 2.0.1 Actually Adds",
                    "body": (
                        "<p>The most significant additions in 2.0.1 are Device Management (firmware "
                        "updates, diagnostics, and configuration pushed from the CSMS), improved "
                        "Security profiles (TLS 1.2+ mandatory, certificate-based mutual authentication), "
                        "Smart Charging enhancements, and a transaction model that properly handles "
                        "offline sessions and energy transfer records.</p>"
                    ),
                },
            ),
            (
                "section",
                {
                    "heading": "What the Upgrade Means for Hardware",
                    "body": (
                        "<p>Most OCPP 1.6 hardware can receive a 2.0.1 firmware update if the "
                        "manufacturer supports it. Before budgeting an upgrade, fleet operators should "
                        "confirm firmware roadmap commitments in writing from their charger OEM — "
                        "chargers deployed before 2021 from several major Indian vendors have "
                        "effectively been abandoned in terms of firmware support.</p>"
                    ),
                },
            ),
            (
                "section",
                {
                    "heading": "ISO 15118 Readiness",
                    "body": (
                        "<p>OCPP 2.0.1 is designed to carry ISO 15118 messages — the vehicle-to-grid "
                        "communication standard that enables Plug &amp; Charge and V2G bidirectional "
                        "charging. The right answer is usually to deploy 2.0.1-ready hardware now and "
                        "activate 15118 features when vehicles support it.</p>"
                    ),
                },
            ),
        ],
        "callout_label": "OCPP Version Comparison",
        "callout_content": (
            "1.6: WebSocket + JSON, basic auth, limited device mgmt. 2.0.1: TLS mandatory, "
            "certificate auth, full device mgmt, ISO 15118 ready, better offline handling."
        ),
        "takeaways": [
            "OCPP 2.0.1 adds mandatory TLS, device management, and ISO 15118 readiness",
            "Confirm firmware upgrade path with your charger OEM before budgeting the transition",
            "Pre-2021 hardware from some vendors may not receive 2.0.1 firmware — check the roadmap",
            "Deploy 2.0.1-capable hardware now even if ISO 15118 features are not needed immediately",
            "The transaction model in 2.0.1 is significantly improved for offline session handling",
        ],
    },
]


class Command(BaseCommand):
    help = "Seed a handful of sample Tech Article snippets for the GeLearn / Technology section."

    def handle(self, *args, **options):
        for entry in ARTICLES:
            tags = entry.pop("tags")
            takeaways = [("point", point) for point in entry.pop("takeaways")]
            article, created = TechArticle.objects.get_or_create(
                title=entry["title"],
                defaults={**entry, "takeaways": takeaways},
            )
            if created:
                article.tags.add(*tags)
                self.stdout.write(self.style.SUCCESS(f"Created: {article.title}"))
            else:
                self.stdout.write(self.style.WARNING(f"Already exists, skipped: {article.title}"))
