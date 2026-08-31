export interface BlogPost {
  id: number
  title: string
  topic: string
  date: string
  excerpt: string
}

export const BLOG_IMAGES = [
  '/images/blog/blog-1.jpg',
  '/images/blog/blog-2.jpg',
  '/images/blog/blog-3.jpg',
  '/images/blog/blog-4.jpg',
]

export const POSTS: BlogPost[] = [
  {
    id: 1,
    title: "India's Grid Modernisation Roadmap: What the 2030 Targets Mean for SCADA Vendors",
    topic: 'Policy',
    date: '12 / 04 / 2026',
    excerpt: "The Ministry of Power's 2030 transmission targets require 500 GW of renewable integration — and the control room infrastructure to match. We break down what this means for the SCADA and EMS ecosystem.",
  },
  {
    id: 2,
    title: 'Why PM Kusum Monitoring Is Harder Than It Looks — And How to Get It Right',
    topic: 'Engineering',
    date: '18 / 03 / 2026',
    excerpt: "Distributed rural solar deployments have unique connectivity, power, and reporting challenges. A look at the mistakes operators make — and the architectural choices that prevent them.",
  },
  {
    id: 3,
    title: 'Drone Inspection for Solar: Where the Technology Actually Stands in 2026',
    topic: 'Technology',
    date: '27 / 01 / 2026',
    excerpt: "Thermal drones are moving from pilot to production in India. We examine what's working, what's not, and what plant operators should ask before committing to an aerial inspection programme.",
  },
  {
    id: 4,
    title: 'The Hidden Costs of Proprietary SCADA: A 15-Year Lifecycle Analysis',
    topic: 'Operations',
    date: '09 / 12 / 2025',
    excerpt: 'Licensing, vendor lock-in, and support dependencies compound over time. An honest breakdown of what proprietary monitoring systems actually cost across a plant lifetime.',
  },
  {
    id: 5,
    title: 'EV Fleet Charging Demand: Planning Grid Impact Before It Becomes a Problem',
    topic: 'Industry',
    date: '22 / 11 / 2025',
    excerpt: 'Fleet operators consistently underestimate the grid impact of simultaneous charging events. We outline a demand modelling approach that prevents expensive infrastructure surprises at scale.',
  },
  {
    id: 6,
    title: 'ISO 50001 in Practice: What Indian Industrial Sites Actually Use',
    topic: 'Operations',
    date: '05 / 10 / 2025',
    excerpt: "The standard is comprehensive but implementation varies widely. Here's what energy managers at Indian manufacturing sites tell us they actually use — and what collects dust on the dashboard.",
  },
  {
    id: 7,
    title: 'IEC 61850 Adoption in India: A Practical Field Report from 30+ Substations',
    topic: 'Engineering',
    date: '14 / 09 / 2025',
    excerpt: 'IEC 61850 promises interoperability. The reality at Indian substations is more complicated. Our deployment experience across transmission and distribution projects reveals the real friction points.',
  },
  {
    id: 8,
    title: "CERC's Real-Time Market: One Year In — What's Working for Energy Traders",
    topic: 'Policy',
    date: '30 / 08 / 2025',
    excerpt: 'The Real-Time Market at IEX has reshaped how renewable generators optimise dispatch. We examine early data, participant behaviour, and what algorithmic trading platforms need to compete.',
  },
  {
    id: 9,
    title: 'AI Anomaly Detection in Solar: Moving Beyond Threshold Alerts',
    topic: 'Technology',
    date: '12 / 07 / 2025',
    excerpt: 'Rule-based alerts generate noise. ML-based anomaly detection reduces false positives by 60-80% in our deployments — but only when trained on site-specific baselines. The implementation detail that matters.',
  },
  {
    id: 10,
    title: 'Edge Computing for Remote Sites: When Cloud Connectivity Is Not Enough',
    topic: 'Engineering',
    date: '28 / 06 / 2025',
    excerpt: "Desert solar plants and mountain wind farms can't rely on consistent connectivity. We explain how local edge processing changes the data architecture for remote energy assets.",
  },
  {
    id: 11,
    title: 'Battery Storage in India: BESS Deployment Lessons from 18 Months in the Field',
    topic: 'Industry',
    date: '15 / 05 / 2025',
    excerpt: 'From grid-scale projects to behind-the-meter commercial installations, BESS has moved fast in India. The operational lessons — from degradation tracking to dispatch optimisation — that early movers learned the hard way.',
  },
  {
    id: 12,
    title: 'Protocol Fragmentation in Indian Renewables: Our Experience Across Vendor Ecosystems',
    topic: 'Engineering',
    date: '01 / 04 / 2025',
    excerpt: 'A single large solar park can have six different communication protocols. How we approach protocol-agnostic architecture and why hardware lock-in is the biggest hidden risk in monitoring contracts.',
  },
]
