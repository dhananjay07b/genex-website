export const CS_IMAGES = [
  '/images/case-studies/cs-1.jpg',
  '/images/case-studies/cs-2.jpg',
  '/images/case-studies/cs-3.jpg',
  '/images/case-studies/cs-4.jpg',
  '/images/case-studies/cs-5.jpg',
]

export interface CaseStudy {
  id: number
  title: string
  category: string
  categoryColor: string
  excerpt: string
  date: string
  readTime: string
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 1,
    title: '200 MW Solar SCADA Deployment Across Three States',
    category: 'SCADA',
    categoryColor: 'bg-primary',
    excerpt: 'End-to-end SCADA integration for a multi-state solar portfolio — connecting 18 inverter brands, 3 weather stations, and 6 substations into a single unified dashboard.',
    date: '14th Mar 2026',
    readTime: '4 Mins Read',
  },
  {
    id: 2,
    title: 'PM Kusum Monitoring: 1,200 Farmers, One Platform',
    category: 'Solar',
    categoryColor: 'bg-amber-400',
    excerpt: 'We built the monitoring stack for a state-level PM Kusum rollout — remote data logging for 1,200 decentralised solar pumps with GSM connectivity and edge buffering.',
    date: '28th Jan 2026',
    readTime: '3 Mins Read',
  },
  {
    id: 3,
    title: 'Real-Time Grid Monitoring for 66 kV Substation Network',
    category: 'Grid',
    categoryColor: 'bg-indigo-400',
    excerpt: 'IEC 61850-compliant monitoring deployed across a 12-substation network — event logging, fault detection, and auto-generated compliance reports for a state DISCOM.',
    date: '10th Dec 2025',
    readTime: '5 Mins Read',
  },
  {
    id: 4,
    title: 'EV Fleet Charging Software for 300-Vehicle Depot',
    category: 'EV',
    categoryColor: 'bg-secondary',
    excerpt: 'Custom charge management software for a municipal bus depot — smart scheduling, load balancing, real-time SOC tracking, and driver-facing mobile interface.',
    date: '02nd Nov 2025',
    readTime: '3 Mins Read',
  },
  {
    id: 5,
    title: 'BESS Monitoring & Dispatch for 10 MW / 20 MWh Storage Asset',
    category: 'BESS',
    categoryColor: 'bg-violet-400',
    excerpt: 'Deployed a real-time BMS monitoring layer and dispatch optimisation engine for a grid-scale battery project — SOC tracking, cycle counting, and peak-shaving logic.',
    date: '18th Sep 2025',
    readTime: '4 Mins Read',
  },
  {
    id: 6,
    title: '150 MW Wind Farm SCADA: Multi-Vendor Turbine Integration',
    category: 'Wind',
    categoryColor: 'bg-sky-400',
    excerpt: 'Protocol-agnostic SCADA platform built for a wind portfolio spanning three OEMs — unified performance analytics, downtime tracking, and automated CERC reporting.',
    date: '07th Aug 2025',
    readTime: '5 Mins Read',
  },
  {
    id: 7,
    title: 'ISO 50001 Energy Management for Automotive Manufacturer',
    category: 'Energy',
    categoryColor: 'bg-orange-400',
    excerpt: 'EMS deployment for a 600-worker manufacturing plant — sub-metering at 40 load points, automated EnPIs, and compliance-ready monthly energy reports for certification.',
    date: '22nd Jun 2025',
    readTime: '4 Mins Read',
  },
  {
    id: 8,
    title: 'Power Billing Platform for Industrial Zone with 80 Tenants',
    category: 'Software',
    categoryColor: 'bg-rose-400',
    excerpt: 'Built a multi-tenant power billing engine for a private industrial area — time-of-use tariff calculation, automated invoice generation, and dispute management portal.',
    date: '15th May 2025',
    readTime: '3 Mins Read',
  },
  {
    id: 9,
    title: 'RTC Power Trading Analytics: 6 Months in Production',
    category: 'Trading',
    categoryColor: 'bg-emerald-500',
    excerpt: 'Custom analytics dashboard for a renewable energy trader operating on IEX — bid optimisation signals, real-time market data feeds, and post-trade settlement reporting.',
    date: '01st Apr 2025',
    readTime: '5 Mins Read',
  },
]
