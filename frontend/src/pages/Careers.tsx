import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import BoltIcon from '@mui/icons-material/Bolt'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import GroupsIcon from '@mui/icons-material/Groups'

const WHY_GENEX = [
  {
    icon: <BoltIcon sx={{ fontSize: 28 }} />,
    title: 'Real-World Impact',
    description: 'Your code runs live across hundreds of MW of India\'s renewable energy infrastructure — not in a demo environment. What you build matters.',
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
    title: 'Ownership & Growth',
    description: 'Small teams, large scope. Engineers at Genex own full features — architecture, implementation, deployment, and iteration — from day one.',
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 28 }} />,
    title: 'Engineering Culture',
    description: 'We debate decisions openly, ship production code carefully, and invest in the team. Reading time, tool budgets, and internal talks are standard.',
  },
]

const OPEN_ROLES = [
  {
    title: 'Full-Stack Engineer (React + Django)',
    department: 'Engineering',
    location: 'Jaipur / Remote',
    type: 'Full-time',
    description: 'Build and maintain the frontend and API layer for SolarLive™ and our next-generation monitoring platforms. You\'ll own features end-to-end — from UI components to backend REST endpoints and database queries.',
  },
  {
    title: 'Embedded Systems Engineer',
    department: 'Hardware & Firmware',
    location: 'Jaipur',
    type: 'Full-time',
    description: 'Design and develop firmware for Genex data loggers and edge devices. Work with Modbus, RS485, MQTT, and 4G communication stacks in C/C++ on industrial-grade hardware.',
  },
  {
    title: 'ML / Data Engineer — Energy Systems',
    department: 'AI & Innovations',
    location: 'Jaipur / Remote',
    type: 'Full-time',
    description: 'Develop and deploy time-series machine learning models for fault prediction, performance anomaly detection, and energy optimization across solar and storage assets.',
  },
  {
    title: 'SCADA / Control Systems Engineer',
    department: 'Engineering',
    location: 'Jaipur',
    type: 'Full-time',
    description: 'Design and deploy SCADA architectures for power generation and distribution clients. Deep experience with IEC 61850, DNP3, OPC-UA, or Modbus required.',
  },
  {
    title: 'Technical Project Manager — Energy',
    department: 'Delivery',
    location: 'Jaipur / Field',
    type: 'Full-time',
    description: 'Lead end-to-end delivery of monitoring and automation projects — from client requirement gathering and technical scoping to site commissioning and handover.',
  },
]

const PERKS = [
  'Health Insurance (family floater)',
  'Learning & Tool Budget',
  'Flexible Working Hours',
  'Performance ESOPs',
]

export default function Careers() {
  const subject = encodeURIComponent('Open Application — Genex Technocrats')

  return (
    <main>
      <PageMeta
        title="Careers at Genex Technocrats — Join India's Energy Tech Team"
        description="Work on software that powers India's energy grid. Explore open roles in engineering, AI, and energy systems at Genex Technocrats, Jaipur."
        canonical="/careers"
      />
      <PageHero
        label="Join Genex"
        headline="Build the Future of Energy"
        subline="We're a small, senior team solving hard engineering problems in India's energy sector. If you want your work to matter, you're in the right place."
      />

      {/* Why Genex */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Why Genex</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight">
              We build differently.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {WHY_GENEX.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-surface rounded-2xl border border-border p-8"
              >
                <div className="text-primary mb-5" aria-hidden="true">
                  {item.icon}
                </div>
                <h3 className="text-base font-extrabold text-text-primary mb-3">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture strip */}
      <section className="bg-surface py-16 lg:py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Culture</p>
              <blockquote className="text-2xl lg:text-3xl font-extrabold text-text-primary leading-tight mb-6">
                "We are not a factory for features. We are a team of engineers who care deeply about the quality of what we ship."
              </blockquote>
              <p className="text-sm text-text-muted leading-relaxed">
                At Genex, every engineer understands the field context behind their code. We visit sites, talk to operators, and build empathy for the people who depend on our software running reliably — often in remote locations with no fallback.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl bg-white border border-border overflow-hidden"
            >
              <div
                className="h-52 bg-linear-to-br from-primary/20 via-secondary/10 to-surface flex items-center justify-center"
                role="img"
                aria-label="Genex engineering team at work"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Team photo coming soon
                </p>
              </div>
              <div className="px-6 py-5 border-t border-border">
                <p className="text-xs text-text-muted">Genex engineering team — Jaipur HQ</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-white py-14 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">Perks & Benefits</p>
          <div className="flex flex-wrap gap-3">
            {PERKS.map(perk => (
              <span
                key={perk}
                className="px-5 py-2.5 rounded-full border border-border bg-surface text-sm font-semibold text-text-primary"
              >
                {perk}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="bg-surface py-20 lg:py-28 border-t border-border scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Open Positions</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight">
              Current openings.
            </h2>
          </motion.div>

          <div className="space-y-4">
            {OPEN_ROLES.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-white border border-border rounded-2xl px-6 py-6 lg:px-8 lg:py-7 flex flex-col lg:flex-row lg:items-center gap-5 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex-1">
                  <h3 className="text-base font-extrabold text-text-primary mb-2">{role.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed mb-3">{role.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface border border-border text-text-muted">
                      {role.department}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface border border-border text-text-muted">
                      {role.location}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {role.type}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/contact?subject=${encodeURIComponent(`Application: ${role.title}`)}`}
                  className="shrink-0"
                >
                  <Button variant="secondary" size="sm">Apply Now</Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open application CTA */}
      <section className="bg-brand-tint py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Open Application
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight mb-4">
              Don't see your role listed?
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              We hire for exceptional engineers and domain experts regardless of open postings. Send us your CV and a short note on what you'd like to build.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`mailto:careers@genextechnocrats.com?subject=${subject}`}
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="lg">Send Your Profile</Button>
              </a>
              <Link to="/contact">
                <Button variant="secondary" size="lg">Contact Us</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
