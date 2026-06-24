import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  badge?: string
  headline: string
  body: string
  points: string[]
  href: string
  image: string
}

const TABS: Tab[] = [
  {
    id: 'solarlive',
    label: 'SolarLive™',
    badge: 'Flagship',
    headline: 'SolarLive™ — Real-Time Solar Analytics',
    body: 'Flagship platform for real-time solar plant monitoring, performance analytics, and remote diagnostics across distributed solar assets.',
    points: [
      'Live plant dashboard with PR, CUF, and yield tracking',
      'Fault detection and alarm management with SMS/email alerts',
      'Multi-site aggregation for portfolio-level visibility',
    ],
    href: '/portfolio/solarlive',
    image: '/images/what-we-build/solarlive real time analytics card.png',
  },
  {
    id: 'ems-bess',
    label: 'EMS - BESS Storage',
    headline: 'EMS - BESS Storage',
    body: 'Full-stack energy management system for battery energy storage projects — from cell-level control to grid-side dispatch optimisation.',
    points: [
      'SOC/SOH monitoring and cell balancing control',
      'Charge/discharge scheduling and peak shaving logic',
      'Grid-tied and off-grid BESS operation modes',
    ],
    href: '/portfolio/energy-storage',
    image: '/images/what-we-build/ems-bess card.png',
  },
  {
    id: 'wind-network',
    label: 'Wind Network System',
    headline: 'Wind Network System',
    body: 'Network monitoring and performance management platform for wind farm operations — tracking turbine health, generation, and network uptime.',
    points: [
      'Turbine-level SCADA integration and data acquisition',
      'Wind speed, rotor speed, and power curve analysis',
      'Alarm management and remote diagnostics for field teams',
    ],
    href: '/portfolio/wind-network',
    image: '/images/what-we-build/wind network system card.png',
  },
  {
    id: 'bms',
    label: 'BMS - Battery Management',
    headline: 'BMS — Battery Management System',
    body: 'Intelligent battery management system for multi-chemistry storage assets — ensuring safety, longevity, and peak performance at cell level.',
    points: [
      'Real-time cell voltage, temperature, and SOC monitoring',
      'Passive and active balancing with thermal protection',
      'Communication via CAN, Modbus, and RS485',
    ],
    href: '/portfolio/bms',
    image: '/images/what-we-build/bms - battery management system card.png',
  },
  {
    id: 'rms-kusum',
    label: 'RMS - PM Kusum',
    headline: 'RMS — PM Kusum Monitoring',
    body: 'Remote monitoring system purpose-built for PM Kusum scheme solar installations — centralized visibility across distributed rural sites.',
    points: [
      'Multi-site dashboard for pump and feeder monitoring',
      'Generation and consumption tracking per installation',
      'Automated reporting for government compliance',
    ],
    href: '/portfolio/rms',
    image: '/images/what-we-build/rms sytem card.png',
  },
  {
    id: 'scada',
    label: 'SCADA Platform',
    headline: 'SCADA Platform',
    body: 'Industrial supervisory control and data acquisition platform — purpose-built for power generation, transmission, and distribution facilities.',
    points: [
      'IEC 61850, Modbus, DNP3, and OPC-UA protocol support',
      'Sub-second data acquisition with real-time alarming',
      'Historian, trend analysis, and control room dashboards',
    ],
    href: '/portfolio/scada',
    image: '/images/what-we-build/scada card.png',
  },
  {
    id: 'ev-software',
    label: 'EV - Software Management',
    headline: 'EV Software Management',
    body: 'Comprehensive EV charging infrastructure management platform — covering charger control, session management, and fleet energy optimisation.',
    points: [
      'OCPP-compliant charger management and remote diagnostics',
      'User authentication, billing, and session reporting',
      'Fleet energy scheduling and load balancing',
    ],
    href: '/portfolio/ev-infrastructure',
    image: '/images/what-we-build/ev software management card.png',
  },
  {
    id: 'power-billing',
    label: 'Power Billing Tool',
    headline: 'Power Billing Tool (GNM & VNM)',
    body: 'Automated power billing system for gross net metering and virtual net metering installations — reducing manual effort and billing errors.',
    points: [
      'Automated unit calculation for GNM and VNM accounts',
      'Multi-tariff support with tax and surcharge computation',
      'Bulk bill generation and consumer portal access',
    ],
    href: '/portfolio/power-billing',
    image: '/images/what-we-build/power tool gnm and vnm.png',
  },
  {
    id: 'zero-export',
    label: 'Zero Export Tools',
    headline: 'Zero Export Tools',
    body: 'Real-time solar generation curtailment system that prevents excess power injection into the grid — maintaining compliance with utility requirements.',
    points: [
      'Real-time inverter control to match grid import',
      'Dynamic set-point adjustment as load varies',
      'Event logging and utility compliance reports',
    ],
    href: '/portfolio/zero-export',
    image: '/images/what-we-build/zero export tools .png',
  },
  {
    id: 'carbon-credit',
    label: 'Carbon Credit Tools',
    headline: 'Carbon Credit Tools',
    body: 'Automated carbon credit accounting platform — tracking renewable energy generation, calculating credits, and generating verified audit reports.',
    points: [
      'Automated MWh-to-credit conversion per registry standards',
      'Generation data integration from monitoring platforms',
      'Audit-ready reports for BEE and UNFCCC submissions',
    ],
    href: '/portfolio/carbon-credit',
    image: '/images/what-we-build/carbon credit tools .png',
  },
  {
    id: 'data-loggers',
    label: 'Data Loggers',
    headline: 'Data Loggers',
    body: 'Edge connectivity devices that aggregate field sensor data and relay it to cloud platforms — the hardware backbone of any monitoring system.',
    points: [
      'Multi-protocol support: Modbus, RS485, CAN, 4G/LTE',
      'Local buffering ensures no data loss during connectivity gaps',
      'Plug-and-play integration with SolarLive™ and SCADA Platform',
    ],
    href: '/portfolio/iot-gateway',
    image: '/images/what-we-build/data loggers.png',
  },
  {
    id: 'power-cloud',
    label: 'Power Cloud System',
    headline: 'Power Cloud System',
    body: 'Centralized cloud analytics platform that aggregates data from multiple energy assets — providing unified dashboards, KPIs, and scheduled reports.',
    points: [
      'Multi-asset, multi-site data aggregation and normalisation',
      'Customizable KPI dashboards with scheduled report delivery',
      'API-first architecture for third-party integrations',
    ],
    href: '/portfolio/power-cloud',
    image: '/images/what-we-build/power cloud system.png',
  },
  {
    id: 'rtc-power',
    label: 'RTC - Power Tools',
    headline: 'RTC Power Tools',
    body: 'Real-time control tools for precision power management — enabling dynamic load management, harmonic analysis, and power quality correction.',
    points: [
      'Real-time load profiling and demand forecasting',
      'Power factor correction and harmonic distortion analysis',
      'ISO 50001 energy management system reporting support',
    ],
    href: '/portfolio/rtc-power-tools',
    image: '/images/what-we-build/rtc tools.png',
  },
]

export function WhatWeBuild() {
  const [activeId, setActiveId] = useState(TABS[0].id)
  const activeTab = TABS.find(t => t.id === activeId) ?? TABS[0]

  return (
    <section className="py-20 lg:py-28 bg-white" aria-labelledby="what-we-build-heading">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.h2
          id="what-we-build-heading"
          className="text-4xl lg:text-5xl font-extrabold text-text-primary mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          What We Build
        </motion.h2>

        {/* Tab bar — horizontally scrollable on mobile */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none"
          role="tablist"
          aria-label="Portfolio categories"
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tab.id === activeId}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                'shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                tab.id === activeId
                  ? 'gradient-brand text-white shadow-sm'
                  : 'border border-border text-text-muted hover:bg-surface hover:border-primary hover:text-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="grid lg:grid-cols-[3fr_2fr] overflow-hidden rounded-2xl border border-border shadow-sm min-h-105">
          {/* Left: visual */}
          <div className="relative overflow-hidden min-h-70 lg:min-h-0">
            <AnimatePresence>
              <motion.div
                key={activeId}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                aria-hidden="true"
              >
                <img
                  src={activeTab.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  width="800" height="600"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_55%,rgba(255,255,255,0.08)_100%)]" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${activeId}`}
              id={`panel-${activeId}`}
              role="tabpanel"
              className="flex flex-col justify-center p-8 lg:p-10 bg-white"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {activeTab.badge && (
                <span className="self-start mb-4 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/40 rounded-full px-2.5 py-0.5">
                  {activeTab.badge}
                </span>
              )}

              <h3 className="text-2xl lg:text-3xl font-bold text-text-primary leading-snug">
                {activeTab.headline}
              </h3>

              <p className="mt-4 text-text-muted leading-relaxed">
                {activeTab.body}
              </p>

              <ul className="mt-6 space-y-2.5" aria-label="Key capabilities">
                {activeTab.points.map(point => (
                  <li key={point} className="flex items-start gap-3 text-sm text-text-primary">
                    <span className="mt-0.75 shrink-0 w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>

              <Link
                to={activeTab.href}
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:underline"
                aria-label={`Explore ${activeTab.headline} portfolio`}
              >
                Explore Portfolio
                <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
