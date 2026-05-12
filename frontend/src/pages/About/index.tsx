import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'

// Testing 

const MILESTONES = [
  {
    year: '2010',
    title: 'Founded in Jaipur',
    description: 'Genex Technocrats started as a power electronics consultancy, providing engineering services to industrial and commercial clients in Rajasthan.',
  },
  {
    year: '2014',
    title: 'First SCADA Deployment',
    description: 'Delivered the first industrial SCADA system for a 10 MW solar farm — the beginning of Genex\'s transition from services to products.',
  },
  {
    year: '2017',
    title: 'SolarLive™ Launched',
    description: 'Launched SolarLive™, the flagship solar monitoring platform. Within 18 months, it was deployed across 50+ sites in 4 states.',
  },
  {
    year: '2019',
    title: 'PM Kusum Rollout',
    description: 'Won first state-level PM Kusum monitoring contract, deploying RMS across 500+ rural solar pumping installations in Rajasthan.',
  },
  {
    year: '2021',
    title: '500 MW Milestone',
    description: 'Crossed 500 MW of renewable capacity under active monitoring across SolarLive™, SCADA, and RMS deployments nationwide.',
  },
  {
    year: '2024',
    title: 'AI & Innovation Division',
    description: 'Launched the AI research division — developing next-generation products including AI-RMS, Drone Monitoring, and Smart Grid platforms.',
  },
]

const STATS = [
  { value: '14+',    label: 'Years of Operation'   },
  { value: '120+',   label: 'Projects Delivered'   },
  { value: '500 MW', label: 'Capacity Monitored'   },
  { value: '10+',    label: 'States Covered'        },
]

const LEADERSHIP = [
  {
    title: 'Founder & CEO',
    bio: 'Power systems engineer with 20+ years in industrial automation and renewable energy. Led the company from consultancy to a full-stack energy technology platform.',
    initials: 'G',
  },
  {
    title: 'Head of Engineering',
    bio: 'Led SCADA and monitoring platform development across 80+ deployments. Expert in IEC 61850, OPC-UA, and distributed systems architecture.',
    initials: 'E',
  },
  {
    title: 'Head of AI & Innovations',
    bio: 'Data scientist specializing in time-series ML for energy systems. Leads the AI research division building next-generation predictive platforms.',
    initials: 'A',
  },
]

const PARTNERS = [
  'Siemens', 'Schneider Electric', 'ABB', 'Huawei Solar',
  'SMA Solar', 'Delta Electronics', 'Fronius', 'Growatt',
]

const CERTIFICATIONS = [
  { name: 'ISO 9001:2015',    label: 'Quality Management'                  },
  { name: 'ISO 27001',        label: 'Information Security'                },
  { name: 'IEC 61850',        label: 'Power System Communication Standard' },
  { name: 'MNRE Empanelled',  label: 'Ministry of New & Renewable Energy'  },
]

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center py-8 lg:py-0 px-4 lg:px-10 text-center"
    >
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-5xl lg:text-6xl font-extrabold text-white tabular-nums"
      >
        {value}
      </motion.span>
      <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/60">
        {label}
      </p>
    </div>
  )
}

export default function About() {
  return (
    <main>
      <PageHero
        label="About Genex"
        headline="Engineering India's Energy Future"
        subline="We are a Jaipur-based energy technology company — building the software and systems that run India's renewable energy infrastructure, one platform at a time."
      />

      {/* Our Story */}
      <section id="story" className="bg-white py-20 lg:py-28 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Our Story</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight max-w-2xl">
              From a power electronics consultancy to an energy intelligence platform.
            </h2>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-border lg:-translate-x-px" aria-hidden="true" />

            <div className="space-y-12">
              {MILESTONES.map((milestone, i) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative pl-14 lg:pl-0 lg:grid lg:grid-cols-2 lg:gap-16"
                >
                  {/* Dot */}
                  <div
                    className="absolute left-2 lg:left-1/2 top-1.5 w-5 h-5 rounded-full border-2 border-primary bg-white lg:-translate-x-2.5 z-10"
                    aria-hidden="true"
                  />

                  {/* Content: alternates left/right on desktop */}
                  <div
                    className={
                      i % 2 === 0
                        ? 'lg:text-right lg:pr-16'
                        : 'lg:col-start-2 lg:pl-16'
                    }
                  >
                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">
                      {milestone.year}
                    </span>
                    <h3 className="text-lg font-extrabold text-text-primary mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section id="vision" className="bg-surface py-20 lg:py-28 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Vision & Mission</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight">
              Why we exist.
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl p-8 lg:p-10 text-white"
              style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1a2a4a 100%)' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Vision</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold leading-tight mb-4">
                To be the intelligence layer of India's energy transition.
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                We believe India's energy transformation will be won on data and software — not just hardware. Every solar farm, battery system, and smart grid needs a brain. We're building that brain.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl p-8 lg:p-10 text-white"
              style={{ background: 'linear-gradient(135deg, #007a4d 0%, #00C5B0 100%)' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Mission</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold leading-tight mb-4">
                To make every megawatt perform at its peak — safely, reliably, and profitably.
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                We deliver end-to-end technology — from field devices to cloud dashboards — that helps our customers generate more, waste less, and operate with confidence at any scale.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* By the Numbers */}
      <section id="numbers" className="bg-primary py-16 lg:py-20 scroll-mt-24" aria-label="Company statistics">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/20">
            {STATS.map(({ value, label }) => (
              <AnimatedStat key={label} value={value} label={label} />
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section id="leadership" className="bg-white py-20 lg:py-28 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Leadership</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight">
              The team behind the platform.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {LEADERSHIP.map((person, i) => (
              <motion.div
                key={person.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-surface rounded-2xl border border-border p-8"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-extrabold text-white mb-5"
                  style={{ background: 'linear-gradient(90deg, #1AAEE8, #00D97E)' }}
                  aria-hidden="true"
                >
                  {person.initials}
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                  {person.title}
                </p>
                <p className="text-sm text-text-muted leading-relaxed">
                  {person.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners & Certifications */}
      <section id="partners" className="bg-surface py-20 lg:py-28 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Partners & Certifications
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight">
              Built with the industry's best.
            </h2>
          </motion.div>

          <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">
            Technology Partners
          </p>
          <div className="flex flex-wrap gap-3 mb-14">
            {PARTNERS.map(partner => (
              <span
                key={partner}
                className="px-5 py-2.5 rounded-xl bg-white border border-border text-sm font-semibold text-text-primary"
              >
                {partner}
              </span>
            ))}
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">
            Certifications & Accreditations
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CERTIFICATIONS.map(cert => (
              <div
                key={cert.name}
                className="bg-white border border-border rounded-xl px-6 py-5"
              >
                <p className="text-base font-extrabold text-text-primary mb-1">{cert.name}</p>
                <p className="text-xs text-text-muted">{cert.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-tint py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Get Involved
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight mb-4">
              Ready to work with us?
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              Whether you're a developer, discom, or enterprise — we'd like to understand your project and show you what Genex can deliver.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact">
                <Button variant="primary" size="lg">Contact Us</Button>
              </Link>
              <Link to="/portfolio">
                <Button variant="secondary" size="lg">See Our Work</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
