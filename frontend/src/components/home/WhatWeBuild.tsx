import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  headline: string
  body: string
  points: string[]
  href: string
  gradient: string
  image: string
}

const TABS: Tab[] = [
  {
    id: 'solar-rooftop',
    label: 'Solar Rooftop',
    headline: 'Solar Rooftop Systems',
    body: 'End-to-end design, supply, and deployment for commercial and industrial rooftop solar installations.',
    points: [
      '500 kW to 50 MW capacity range',
      'Grid-tied and hybrid configurations',
      'Integrated real-time SCADA monitoring',
    ],
    href: '/portfolio/solar-rooftop',
    gradient: 'linear-gradient(135deg, #1a2d0a 0%, #2a4a15 50%, #0d2545 100%)',
    image: '/images/what-we-build/solar-rooftop.png',
  },
  {
    id: 'solar-plants',
    label: 'Solar Plants',
    headline: 'Solar Power Plants',
    body: 'Utility-scale ground-mount solar EPC, from site assessment and civil work to go-live and O&M.',
    points: [
      'MW-scale ground-mount EPC',
      'SCADA and remote operations centre integration',
      'Performance ratio optimisation and loss analysis',
    ],
    href: '/portfolio/solar-power-plants',
    gradient: 'linear-gradient(135deg, #1a1a0a 0%, #2d2a10 50%, #1a3a10 100%)',
    image: '/images/what-we-build/solar-plants.png',
  },
  {
    id: 'scada',
    label: 'SCADA & DERMS',
    headline: 'SCADA & Energy Management',
    body: 'Supervisory control and distributed energy resource management systems for power and industrial facilities.',
    points: [
      'IEC 61850, Modbus, DNP3 protocol support',
      'Sub-second data acquisition and alarming',
      'Full reporting, analytics, and dashboard suite',
    ],
    href: '/portfolio/rms',
    gradient: 'linear-gradient(135deg, #0a1628 0%, #0d2545 50%, #0a2060 100%)',
    image: '/images/what-we-build/scada.png',
  },
  {
    id: 'industrial',
    label: 'Industrial',
    headline: 'Industrial Energy Management',
    body: 'Energy optimisation and power quality monitoring for manufacturing and heavy processing facilities.',
    points: [
      'Load profiling and peak demand management',
      'Power quality and harmonic distortion analysis',
      'ISO 50001 energy management reporting support',
    ],
    href: '/portfolio/industrial-energy',
    gradient: 'linear-gradient(135deg, #1a0a28 0%, #2d1040 50%, #1a0d35 100%)',
    image: '/images/what-we-build/industrial.jpeg',
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

        {/* Tab bar */}
        <div
          className="flex gap-2 flex-wrap mb-8"
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
                'px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                tab.id === activeId
                  ? 'gradient-brand text-white shadow-sm'
                  : 'border border-border text-text-muted hover:border-primary hover:text-primary'
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
