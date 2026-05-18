import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import ArchitectureOutlinedIcon from '@mui/icons-material/ArchitectureOutlined'
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined'
import CableOutlinedIcon from '@mui/icons-material/CableOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import SchemaOutlinedIcon from '@mui/icons-material/SchemaOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'

const STEPS = [
  {
    number: '01',
    title: 'Discovery',
    Icon: SearchOutlinedIcon,
    description: 'We start with a site survey and requirements workshop. Our engineers map existing infrastructure, communication protocols, and operational pain points before writing a single line of code.',
    deliverable: 'Site survey report + requirements spec',
  },
  {
    number: '02',
    title: 'Architecture',
    Icon: ArchitectureOutlinedIcon,
    description: "System architecture is designed based on your site's constraints — connectivity, hardware, protocols, and scale. We define integration points, data flows, and failover requirements upfront.",
    deliverable: 'Architecture document + BoQ',
  },
  {
    number: '03',
    title: 'Development',
    Icon: CodeOutlinedIcon,
    description: 'Software is built against a defined spec with internal QA gates. We do not ship to production without internal validation at each milestone. Client review points are built into the timeline.',
    deliverable: 'Staged builds with review checkpoints',
  },
  {
    number: '04',
    title: 'Integration',
    Icon: CableOutlinedIcon,
    description: 'On-site commissioning with your field team. We validate every data point, protocol handshake, and alarm path against the requirements spec — and document deviations before sign-off.',
    deliverable: 'Commissioning report + FAT/SAT docs',
  },
  {
    number: '05',
    title: 'Deployment',
    Icon: RocketLaunchOutlinedIcon,
    description: "Go-live is planned around operational windows to minimise downtime. Rollback procedures are defined before deployment begins. We don't leave site until the system is stable.",
    deliverable: 'Go-live checklist + handover documentation',
  },
  {
    number: '06',
    title: 'Support',
    Icon: SupportAgentOutlinedIcon,
    description: 'Post-deployment support covers remote diagnostics, firmware updates, and 24×7 escalation for critical systems. SLA tiers are agreed at contract stage, not after an incident.',
    deliverable: 'SLA agreement + support portal access',
  },
]

const PRINCIPLES = [
  { Icon: VerifiedOutlinedIcon,  title: 'Spec Before Code',      body: 'We document requirements before implementation. Changes after spec sign-off are change requests — not scope creep absorbed silently.' },
  { Icon: SchemaOutlinedIcon,    title: 'Protocol-Agnostic',     body: 'We do not lock clients into proprietary hardware or communication stacks. Our platforms support open standards by default.' },
  { Icon: GroupsOutlinedIcon,    title: 'Site-First Engineering', body: 'Our engineers visit sites. Software designed without field context produces systems that work in demos and fail in operations.' },
  { Icon: SecurityOutlinedIcon,  title: 'Security by Design',    body: 'Cybersecurity is an architecture input, not a post-deployment checklist. We align with IEC 62443 and CERT-In guidance for critical infrastructure.' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
  transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

export default function HowWeWork() {
  return (
    <main>
      <PageHero
        label="How We Work"
        headline="Engineering Delivered. Not Just Quoted."
        subline="Six stages from site survey to long-term support — and the principles that run through every one of them."
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-text-muted">
          <Link to="/gelearn" className="hover:text-primary transition-colors">GeLearn</Link>
          <span>/</span>
          <span className="font-semibold text-text-primary">How We Work</span>
        </div>
      </div>

      {/* Process Steps */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-12">Our Process</p>
          <div className="space-y-0">
            {STEPS.map((step, i) => {
              const { Icon } = step
              return (
                <motion.div
                  key={step.number}
                  {...fadeUp(i * 0.07)}
                  className="grid lg:grid-cols-[80px_1fr_1fr] gap-6 lg:gap-12 py-10 border-b border-border last:border-0 items-start"
                >
                  {/* Number */}
                  <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-2">
                    <span className="text-4xl font-extrabold gradient-brand-text leading-none">{step.number}</span>
                  </div>

                  {/* Title + icon */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface border border-border">
                      <Icon className="text-primary" style={{ fontSize: 22 }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-text-primary mb-2">{step.title}</h3>
                      <p className="text-sm text-text-muted leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  {/* Deliverable */}
                  <div className="lg:pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-2">Deliverable</p>
                    <p className="text-sm font-semibold text-text-primary bg-surface border border-border rounded-xl px-4 py-3">
                      {step.deliverable}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Principles */}
      <section className="bg-surface py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">What Guides Us</p>
          <h2 className="text-3xl font-extrabold text-text-primary mb-10">Engineering Principles</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {PRINCIPLES.map(({ Icon, title, body }, i) => (
              <motion.div key={title} {...fadeUp(i * 0.08)}
                className="bg-white border border-border rounded-2xl p-7 flex items-start gap-5 hover:border-primary hover:shadow-sm transition-all duration-200"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-brand">
                  <Icon style={{ fontSize: 22, color: '#fff' }} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-text-primary mb-1.5">{title}</h4>
                  <p className="text-sm text-text-muted leading-relaxed">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Start a Project</p>
            <h2 className="text-xl font-extrabold text-text-primary">Ready to scope your next deployment?</h2>
            <p className="mt-1 text-sm text-text-muted">We'll start with a no-obligation discovery call.</p>
          </div>
          <Link to="/contact#demo" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Request a Demo <ArrowForwardIcon style={{ fontSize: 16 }} />
          </Link>
        </div>
      </section>
    </main>
  )
}
