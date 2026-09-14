import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { apiFetch } from '@/lib/api/client'
import type { CTABandValue, FAQItemValue, FaqPageData, HeroSectionApiValue, WagtailListResponse } from '@/types/api'

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
  const [page, setPage] = useState<FaqPageData | null | undefined>(undefined)

  useEffect(() => {
    apiFetch<WagtailListResponse<FaqPageData>>('/api/v2/pages/?type=pages.FaqPage&fields=body&limit=1')
      .then(res => setPage(res.items[0] ?? null))
      .catch(() => setPage(null))
  }, [])

  const body = page?.body ?? []
  const hero = body.find(b => b.type === 'hero')?.value as HeroSectionApiValue | undefined
  const faqSection = body.find(b => b.type === 'faq_section')?.value as { heading: string; items: FAQItemValue[] } | undefined
  const cta = body.find(b => b.type === 'cta')?.value as CTABandValue | undefined
  const items = faqSection?.items ?? []
  const sections = Array.from(new Set(items.map(f => f.section || 'General').filter(Boolean)))

  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const activeSection = selectedSection ?? sections[0] ?? ''

  function scrollToSection(section: string) {
    setSelectedSection(section)
    sectionRefs.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (page === undefined) return null

  return (
    <main>
      <PageMeta
        title="FAQ — Genex Technocrats"
        description="Answers to common questions about Genex products, deployment timelines, integration support, pricing, and partnerships."
        canonical="/about/faq"
      />
      <PageHero
        label={hero?.label ?? 'Support'}
        headline={hero?.heading ?? 'Frequently Asked Questions'}
        subline={hero?.description ?? 'Common technical and commercial questions — answered directly by our engineering team.'}
      />

      {/* ── MAIN LAYOUT ──────────────────────────────────────────────────── */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex gap-16 items-start">

          {/* Left sidebar — sticky vertical category nav */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
            {sections.map((section) => {
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
            {sections.map((section) => {
              const sectionItems = items.filter(f => (f.section || 'General') === section)
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
                    {sectionItems.map((item, i) => (
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
              {cta?.heading ?? 'Talk directly to our engineering team.'}
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              {cta?.description ?? 'We respond to every serious enquiry. No sales scripts — just honest answers about what we can and cannot do for your project.'}
            </p>
            <Link
              to={cta?.primary_cta_link ?? '/contact'}
              className="inline-flex items-center gap-2 px-8 py-4 gradient-brand text-white text-sm font-bold rounded-md hover:opacity-90 transition-opacity"
            >
              {cta?.primary_cta_text ?? 'Contact Us'}
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
