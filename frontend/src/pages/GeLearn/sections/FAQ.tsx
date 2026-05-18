import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'

const CATEGORIES = ['General', 'Technical', 'Projects', 'Pricing'] as const
type Category = typeof CATEGORIES[number]

const FAQS: { category: Category; q: string; a: string }[] = [
  // General
  { category: 'General', q: 'What does Genex Technocrats do?', a: 'Genex is a software engineering company focused on the energy and automation sector. We build monitoring platforms, SCADA systems, EMS solutions, and IoT infrastructure for solar, wind, grid, and EV deployments across India.' },
  { category: 'General', q: 'Where is Genex based and where do you deploy?', a: 'Our engineering team is based in India. We have delivered projects across 10+ states including Rajasthan, Gujarat, Maharashtra, Uttar Pradesh, Madhya Pradesh, and more. We operate at national scale.' },
  { category: 'General', q: 'Do you work with international clients?', a: 'Our primary focus is the Indian market. We are open to international engagements where our platform expertise is relevant — particularly SCADA, EMS, and solar monitoring. Contact us to discuss.' },
  { category: 'General', q: 'How do I start a project with Genex?', a: "The best starting point is a discovery call. We'll ask about your site, infrastructure, and operational needs — and tell you honestly whether our platforms are the right fit. Use the Request a Demo form to book a session." },

  // Technical
  { category: 'Technical', q: 'What communication protocols do your platforms support?', a: 'Our platforms support Modbus RTU/TCP, IEC 61850 (GOOSE and SV), DNP3, OPC-UA, MQTT, REST/HTTP, CAN, RS485, and more. We are protocol-agnostic and do not lock you into proprietary hardware.' },
  { category: 'Technical', q: 'Can your software integrate with our existing SCADA or ERP?', a: 'Yes. Our platforms expose REST and OPC-UA APIs for third-party integration. We have integrated with SAP PM, Maximo, and custom CMMS platforms. We document integration specs before project sign-off.' },
  { category: 'Technical', q: 'What happens to data when connectivity is lost?', a: 'Our Data Loggers buffer data locally (up to 30 days on-device using SQLite). When connectivity is restored, data syncs automatically with no loss. For cloud platforms, we maintain a queue with automatic retry.' },
  { category: 'Technical', q: 'Is the platform hosted on your servers or on-premise?', a: 'Both options are available. Our default is cloud-hosted SaaS. For projects requiring on-premise deployment (air-gapped, compliance-driven, or high-security environments), we support self-hosted deployment.' },

  // Projects
  { category: 'Projects', q: 'What is the typical project timeline from kickoff to go-live?', a: 'Small deployments (single site, standard protocols) typically take 4–6 weeks from kickoff to live. Multi-site or custom integration projects run 8–16 weeks depending on scope. We publish a detailed timeline at the architecture stage.' },
  { category: 'Projects', q: 'Do you do turnkey projects or software-only?', a: 'We do both. For software-only engagements, we integrate with hardware your team procures. For turnkey projects, we can include hardware supply, cabling, and commissioning as part of scope.' },
  { category: 'Projects', q: 'What is the minimum project size you work with?', a: "We work with single-site pilots as well as national rollouts. For smaller projects, we offer SaaS subscriptions that do not require a custom engagement. Contact us if you're unsure which model fits." },
  { category: 'Projects', q: 'Can you take over a monitoring system from another vendor?', a: 'Yes. We have experience migrating from proprietary SCADA and monitoring systems. We assess the existing setup during discovery, define a migration path, and handle the cutover without operational downtime.' },

  // Pricing
  { category: 'Pricing', q: 'How is pricing structured?', a: 'Pricing varies by product and deployment type. SaaS platforms are priced per site or per data point per month. Custom integrations and turnkey projects are quoted on scope. We publish no hidden costs — all pricing is in the project agreement.' },
  { category: 'Pricing', q: 'Is there a free trial available?', a: 'We offer a scoped pilot for qualifying projects — typically a single site or limited data set — to validate fit before full commitment. This is discussed during the discovery call.' },
  { category: 'Pricing', q: 'What does post-deployment support cost?', a: 'Support SLAs are tiered. Standard support (business hours, email) is included with all subscriptions. Premium support (24×7 escalation, dedicated response times) is available as an add-on. SLA terms are agreed at contract stage.' },
  { category: 'Pricing', q: 'Do you offer government or PSU pricing?', a: 'We are empanelled with select government bodies and can participate in government tenders. Pricing for public sector projects follows standard procurement norms. Contact us for more information.' },
]

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-surface transition-colors duration-150"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-text-primary leading-snug">{q}</span>
        <span className="shrink-0 text-primary">
          {open ? <RemoveIcon style={{ fontSize: 18 }} /> : <AddIcon style={{ fontSize: 18 }} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-2 border-t border-border bg-surface">
              <p className="text-sm text-text-muted leading-relaxed">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [activeTab, setActiveTab] = useState<Category>('General')
  const filtered = FAQS.filter(f => f.category === activeTab)

  return (
    <main>
      <PageHero
        label="FAQ"
        headline="Frequently Asked Questions"
        subline="Common technical and commercial questions — answered directly by our engineering team."
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-text-muted">
          <Link to="/gelearn" className="hover:text-primary transition-colors">GeLearn</Link>
          <span>/</span>
          <span className="font-semibold text-text-primary">FAQ</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-border sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={['shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                  activeTab === cat ? 'gradient-brand text-white shadow-sm' : 'text-text-muted border border-border hover:text-primary hover:border-primary hover:bg-surface',
                ].join(' ')}
              >{cat}</button>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-surface py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {filtered.map((f, i) => (
                <AccordionItem key={i} q={f.q} a={f.a} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Still have questions?</p>
            <h2 className="text-xl font-extrabold text-text-primary">Talk directly to our engineering team.</h2>
          </div>
          <Link to="/contact" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Contact Us <ArrowForwardIcon style={{ fontSize: 16 }} />
          </Link>
        </div>
      </section>
    </main>
  )
}
