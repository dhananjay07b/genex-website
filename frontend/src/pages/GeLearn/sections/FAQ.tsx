import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'

// ── Data ──────────────────────────────────────────────────────────────────────

const SECTIONS = ['General Questions', 'Service Details', 'Procedures'] as const
type Section = typeof SECTIONS[number]

const FAQS: { section: Section; q: string; a: string }[] = [
  // General Questions
  { section: 'General Questions', q: 'What does Genex Technocrats do?', a: 'Genex is a software engineering company focused on the energy and automation sector. We build monitoring platforms, SCADA systems, EMS solutions, and IoT infrastructure for solar, wind, grid, and EV deployments across India.' },
  { section: 'General Questions', q: 'Where is Genex based and where do you deploy?', a: 'Our engineering team is based in India. We have delivered projects across 10+ states including Rajasthan, Gujarat, Maharashtra, Uttar Pradesh, Madhya Pradesh, and more. We operate at national scale.' },
  { section: 'General Questions', q: 'Do you work with international clients?', a: 'Our primary focus is the Indian market. We are open to international engagements where our platform expertise is relevant — particularly SCADA, EMS, and solar monitoring. Contact us to discuss.' },
  { section: 'General Questions', q: 'How do I start a project with Genex?', a: "The best starting point is a discovery call. We'll ask about your site, infrastructure, and operational needs — and tell you honestly whether our platforms are the right fit. Use the Request a Demo form to book a session." },
  { section: 'General Questions', q: 'Is there a free trial or pilot available?', a: 'We offer a scoped pilot for qualifying projects — typically a single site or limited data set — to validate fit before full commitment. This is discussed during the discovery call.' },

  // Service Details
  { section: 'Service Details', q: 'What communication protocols do your platforms support?', a: 'Our platforms support Modbus RTU/TCP, IEC 61850 (GOOSE and SV), DNP3, OPC-UA, MQTT, REST/HTTP, CAN, RS485, and more. We are protocol-agnostic and do not lock you into proprietary hardware.' },
  { section: 'Service Details', q: 'Can your software integrate with our existing SCADA or ERP?', a: 'Yes. Our platforms expose REST and OPC-UA APIs for third-party integration. We have integrated with SAP PM, Maximo, and custom CMMS platforms. We document integration specs before project sign-off.' },
  { section: 'Service Details', q: 'What happens to data when connectivity is lost?', a: 'Our Data Loggers buffer data locally (up to 30 days on-device using SQLite). When connectivity is restored, data syncs automatically with no loss. For cloud platforms, we maintain a queue with automatic retry.' },
  { section: 'Service Details', q: 'Is the platform hosted on your servers or on-premise?', a: 'Both options are available. Our default is cloud-hosted SaaS. For projects requiring on-premise deployment (air-gapped, compliance-driven, or high-security environments), we support self-hosted deployment.' },
  { section: 'Service Details', q: 'How is pricing structured?', a: 'Pricing varies by product and deployment type. SaaS platforms are priced per site or per data point per month. Custom integrations and turnkey projects are quoted on scope. We publish no hidden costs — all pricing is in the project agreement.' },

  // Procedures
  { section: 'Procedures', q: 'What is the typical project timeline from kickoff to go-live?', a: 'Small deployments (single site, standard protocols) typically take 4–6 weeks from kickoff to live. Multi-site or custom integration projects run 8–16 weeks depending on scope. We publish a detailed timeline at the architecture stage.' },
  { section: 'Procedures', q: 'Do you do turnkey projects or software-only?', a: 'We do both. For software-only engagements, we integrate with hardware your team procures. For turnkey projects, we can include hardware supply, cabling, and commissioning as part of scope.' },
  { section: 'Procedures', q: 'What is the minimum project size you work with?', a: "We work with single-site pilots as well as national rollouts. For smaller projects, we offer SaaS subscriptions that do not require a custom engagement. Contact us if you're unsure which model fits." },
  { section: 'Procedures', q: 'Can you take over a monitoring system from another vendor?', a: 'Yes. We have experience migrating from proprietary SCADA and monitoring systems. We assess the existing setup during discovery, define a migration path, and handle the cutover without operational downtime.' },
  { section: 'Procedures', q: 'What does post-deployment support cost?', a: 'Support SLAs are tiered. Standard support (business hours, email) is included with all subscriptions. Premium support (24×7 escalation, dedicated response times) is available as an add-on. SLA terms are agreed at contract stage.' },
]

// ── Accordion item ────────────────────────────────────────────────────────────

function AccordionItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[#e2e8f0] last:border-b-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 pr-2 py-6 text-left"
        aria-expanded={open}
      >
        <span className={`text-lg leading-snug ${open ? 'font-bold text-[#1e293b]' : 'font-medium text-[#1e293b]'}`}>
          {q}
        </span>
        <span className="shrink-0 bg-[#f1f5f9] size-6 rounded flex items-center justify-center text-[#1e293b]">
          {open
            ? <RemoveIcon style={{ fontSize: 14 }} />
            : <AddIcon style={{ fontSize: 14 }} />
          }
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-lg text-[#62748e] leading-snug pb-6 pr-12">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FAQ() {
  const [activeSection, setActiveSection] = useState<Section>('General Questions')
  const sectionRefs = useRef<Record<Section, HTMLDivElement | null>>({
    'General Questions': null,
    'Service Details': null,
    'Procedures': null,
  })

  function scrollToSection(section: Section) {
    setActiveSection(section)
    sectionRefs.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main>
      <PageMeta
        title="FAQ — Genex Technocrats"
        description="Answers to common questions about Genex products, deployment timelines, integration support, pricing, and partnerships."
        canonical="/gelearn/faq"
      />
      <PageHero
        label="Support"
        headline="Frequently Asked Questions"
        subline="Common technical and commercial questions — answered directly by our engineering team."
      />

      {/* ── MAIN LAYOUT ──────────────────────────────────────────────────── */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex gap-16 items-start">

          {/* Left sidebar — sticky vertical category nav */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
            {SECTIONS.map((section) => {
              const active = activeSection === section
              return (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`w-full text-left py-4 transition-colors duration-150 ${
                    active
                      ? 'border-b-2 border-[#1d293d] text-[#1d293d] font-bold text-lg'
                      : 'border-b border-[#e2e8f0] text-[#90a1b9] font-medium text-lg hover:text-[#1d293d] transition-colors'
                  }`}
                >
                  {section}
                </button>
              )
            })}
          </aside>

          {/* Right — FAQ groups */}
          <div className="flex-1 min-w-0 flex flex-col gap-16">
            {SECTIONS.map((section) => {
              const items = FAQS.filter(f => f.section === section)
              return (
                <div
                  key={section}
                  ref={(el) => { sectionRefs.current[section] = el }}
                  className="scroll-mt-28"
                >
                  {/* Section label pill */}
                  <div className="bg-[#f0f4f8] rounded-xl px-6 py-4 mb-2">
                    <span className="text-base font-bold text-[#1e293b]">{section}</span>
                  </div>

                  {/* Accordion items */}
                  <div>
                    {items.map((item, i) => (
                      <AccordionItem
                        key={i}
                        q={item.q}
                        a={item.a}
                        defaultOpen={i === 0}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-brand-tint py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' as const }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Still have questions?
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-4">
              Talk directly to our engineering team.
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              We respond to every serious enquiry. No sales scripts — just honest answers about what we can and cannot do for your project.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 gradient-brand text-white text-sm font-bold rounded-md hover:opacity-90 transition-opacity"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
