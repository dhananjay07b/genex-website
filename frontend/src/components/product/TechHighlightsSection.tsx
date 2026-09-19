import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getMuiIcon } from '@/lib/muiIconRegistry'
import type { TechHighlightCardType, TechHighlightItemValue } from '@/types/api'

interface CardBodyProps {
  icon: string | null
  heading: string
  description: string
  sub_text: string | null
}

const CARD_BG: Record<TechHighlightCardType, string> = {
  icon: 'bg-white',
  ring_stat: 'bg-[#F0F9FF]',
  diagram: 'bg-[#EAF4FB]',
  chat: 'bg-[#E8F8F5]',
  security: 'bg-[#F1F5F9]',
  signal: 'bg-[#EBFBF7]',
  timeline: 'bg-[#FAFAF9]',
}

// Shared caption used by several card types: a pill when sub_text is present,
// otherwise a thin divider so card height rhythm stays consistent either way.
function SubTextCaption({ sub_text }: { sub_text: string | null }) {
  return sub_text ? (
    <span className="inline-flex px-2.5 py-1 rounded-full bg-white/70 text-[11px] font-semibold text-[#62748e] w-fit border border-[#e2e8f0]">
      {sub_text}
    </span>
  ) : (
    <div className="h-px bg-[#e2e8f0]" aria-hidden="true" />
  )
}

// ── Icon Card — plain baseline: icon chip, heading, description, caption ──

function IconCardBody({ icon, heading, description, sub_text }: CardBodyProps) {
  const Icon = getMuiIcon(icon)
  return (
    <>
      <div className="size-12 rounded-2xl bg-white text-[#0f2930] flex items-center justify-center shrink-0 border border-[#e2e8f0]">
        <Icon style={{ fontSize: 24 }} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[#0f2930] leading-snug">{heading}</h3>
        <p className="text-sm text-[#62748e] leading-relaxed">{description}</p>
      </div>
      <SubTextCaption sub_text={sub_text} />
    </>
  )
}

// ── Ring Stat Card — icon inside an animated gauge ring, stat + label centered ──

function RingStatCardBody({ icon, heading, description, sub_text }: CardBodyProps) {
  const Icon = getMuiIcon(icon)
  const r = 27
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="relative size-20">
        <svg viewBox="0 0 64 64" className="size-20 -rotate-90">
          <circle cx={32} cy={32} r={r} strokeWidth={5} className="stroke-white fill-none" />
          <motion.circle
            cx={32}
            cy={32}
            r={r}
            strokeWidth={5}
            strokeLinecap="round"
            className="stroke-primary fill-none"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 0.75 }}
            viewport={{ once: true, margin: '-40px' as const }}
            transition={{ duration: 1, ease: 'easeOut' as const }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon style={{ fontSize: 22 }} className="text-primary" />
        </div>
      </div>
      {sub_text && (
        <span className="gradient-brand-text text-2xl font-extrabold leading-none">{sub_text}</span>
      )}
      <h3 className="text-sm font-bold uppercase tracking-wide text-[#0f2930]">{heading}</h3>
      <p className="text-xs text-[#62748e] leading-relaxed">{description}</p>
    </div>
  )
}

// ── Diagram Card — a real bar + trend-line combo chart ──

const DIAGRAM_BAR_HEIGHTS = [10, 18, 14, 26, 20, 30]

function DiagramCardBody({ icon, heading, description, sub_text }: CardBodyProps) {
  const Icon = getMuiIcon(icon)
  const barW = 12
  const gap = 10
  const chartH = 32
  const chartW = DIAGRAM_BAR_HEIGHTS.length * (barW + gap) - gap
  const linePath = `M${DIAGRAM_BAR_HEIGHTS
    .map((h, i) => `${i * (barW + gap) + barW / 2},${chartH - h}`)
    .join(' L')}`

  return (
    <>
      <div className="size-12 rounded-2xl bg-white text-[#0f2930] flex items-center justify-center shrink-0 border border-[#e2e8f0]">
        <Icon style={{ fontSize: 24 }} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[#0f2930] leading-snug">{heading}</h3>
        <p className="text-sm text-[#62748e] leading-relaxed">{description}</p>
      </div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-10" aria-hidden="true">
        {DIAGRAM_BAR_HEIGHTS.map((h, i) => (
          <motion.rect
            key={i}
            x={i * (barW + gap)}
            width={barW}
            rx={2}
            className="fill-primary/25"
            initial={{ height: 0, y: chartH }}
            whileInView={{ height: h, y: chartH - h }}
            viewport={{ once: true, margin: '-40px' as const }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' as const }}
          />
        ))}
        <motion.path
          d={linePath}
          className="stroke-secondary fill-none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '-40px' as const }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' as const }}
        />
      </svg>
      {sub_text && <span className="text-[11px] font-semibold text-[#62748e]">{sub_text}</span>}
    </>
  )
}

// ── Chat Card — support mockup: message bubbles rotating through canned Q&A ──

const SUPPORT_CHAT_PAIRS: { q: string; a: string }[] = [
  { q: 'Does this support Modbus and IEC 61850?', a: 'Yes — both, out of the box.' },
  { q: "What's the typical response time?", a: 'Under 10ms in the field.' },
  { q: 'Can we get a live demo?', a: "Absolutely, let's set one up." },
  { q: 'Is 24/7 support included?', a: 'Yes, our engineers are always on call.' },
  { q: 'Does it scale to multi-site deployments?', a: 'Built for it from day one.' },
]

function ChatCardBody({ icon, heading, description, sub_text }: CardBodyProps) {
  const Icon = getMuiIcon(icon)
  const [pairIndex, setPairIndex] = useState(() => Math.floor(Math.random() * SUPPORT_CHAT_PAIRS.length))

  useEffect(() => {
    const id = setInterval(() => {
      setPairIndex((prev) => {
        if (SUPPORT_CHAT_PAIRS.length <= 1) return prev
        let next = Math.floor(Math.random() * SUPPORT_CHAT_PAIRS.length)
        while (next === prev) next = Math.floor(Math.random() * SUPPORT_CHAT_PAIRS.length)
        return next
      })
    }, 4500)
    return () => clearInterval(id)
  }, [])

  const pair = SUPPORT_CHAT_PAIRS[pairIndex]

  return (
    <>
      <div className="size-12 rounded-2xl bg-white text-[#0f2930] flex items-center justify-center shrink-0 border border-[#e2e8f0]">
        <Icon style={{ fontSize: 24 }} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[#0f2930] leading-snug">{heading}</h3>
        <p className="text-sm text-[#62748e] leading-relaxed">{description}</p>
      </div>
      <div className="min-h-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={pairIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: 'easeOut' as const }}
            className="flex flex-col gap-1.5"
          >
            <div className="self-start max-w-[85%] bg-white border border-[#e2e8f0] rounded-2xl rounded-bl-sm px-3 py-1.5">
              <p className="text-[11px] text-[#45556c] leading-snug">{pair.q}</p>
            </div>
            <div className="self-end max-w-[85%] bg-primary rounded-2xl rounded-br-sm px-3 py-1.5">
              <p className="text-[11px] text-white leading-snug">{pair.a}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {sub_text && <span className="text-[11px] font-semibold text-[#62748e]">{sub_text}</span>}
    </>
  )
}

// ── Security Card — icon inside a shield outline that pulses once on scroll-in ──

function SecurityCardBody({ icon, heading, description, sub_text }: CardBodyProps) {
  const Icon = getMuiIcon(icon)
  return (
    <>
      <div className="relative size-14 shrink-0">
        <motion.svg
          viewBox="0 0 40 44"
          className="size-14"
          initial={{ scale: 0.85, opacity: 0.6 }}
          whileInView={{ scale: [0.85, 1.08, 1], opacity: 1 }}
          viewport={{ once: true, margin: '-40px' as const }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
        >
          <path
            d="M20 2 L36 9 V21 C36 32 29 39 20 42 C11 39 4 32 4 21 V9 Z"
            className="stroke-primary fill-white"
            strokeWidth={2}
          />
        </motion.svg>
        <div className="absolute inset-0 flex items-center justify-center pb-1">
          <Icon style={{ fontSize: 20 }} className="text-primary" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[#0f2930] leading-snug">{heading}</h3>
        <p className="text-sm text-[#62748e] leading-relaxed">{description}</p>
      </div>
      <SubTextCaption sub_text={sub_text} />
    </>
  )
}

// ── Signal Card — ascending bars filling in, like a signal-strength indicator ──

const SIGNAL_BAR_HEIGHTS = [8, 14, 20, 26]

function SignalCardBody({ icon, heading, description, sub_text }: CardBodyProps) {
  const Icon = getMuiIcon(icon)
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-2xl bg-white text-[#0f2930] flex items-center justify-center shrink-0 border border-[#e2e8f0]">
          <Icon style={{ fontSize: 24 }} />
        </div>
        <div className="flex items-end gap-1 h-7" aria-hidden="true">
          {SIGNAL_BAR_HEIGHTS.map((h, i) => (
            <motion.div
              key={i}
              className={`w-2 rounded-sm ${i === SIGNAL_BAR_HEIGHTS.length - 1 ? 'bg-primary' : 'bg-primary/50'}`}
              initial={{ height: 0 }}
              whileInView={{ height: h }}
              viewport={{ once: true, margin: '-40px' as const }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' as const }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[#0f2930] leading-snug">{heading}</h3>
        <p className="text-sm text-[#62748e] leading-relaxed">{description}</p>
      </div>
      <SubTextCaption sub_text={sub_text} />
    </>
  )
}

// ── Timeline Card — 3 dots connected by a line that draws in, for process highlights ──

function TimelineCardBody({ icon, heading, description, sub_text }: CardBodyProps) {
  const Icon = getMuiIcon(icon)
  return (
    <>
      <div className="size-12 rounded-2xl bg-white text-[#0f2930] flex items-center justify-center shrink-0 border border-[#e2e8f0]">
        <Icon style={{ fontSize: 24 }} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[#0f2930] leading-snug">{heading}</h3>
        <p className="text-sm text-[#62748e] leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`flex items-center ${i < 2 ? 'flex-1' : ''}`}>
            <motion.span
              className="size-2.5 rounded-full bg-primary shrink-0"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' as const }}
              transition={{ duration: 0.3, delay: i * 0.15, ease: 'easeOut' as const }}
            />
            {i < 2 && (
              <motion.div
                className="flex-1 h-px bg-primary origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: '-40px' as const }}
                transition={{ duration: 0.4, delay: i * 0.15 + 0.15, ease: 'easeOut' as const }}
              />
            )}
          </div>
        ))}
      </div>
      {sub_text && <span className="text-[11px] font-semibold text-[#62748e]">{sub_text}</span>}
    </>
  )
}

const CARD_BODY: Record<TechHighlightCardType, (props: CardBodyProps) => React.JSX.Element> = {
  icon: IconCardBody,
  ring_stat: RingStatCardBody,
  diagram: DiagramCardBody,
  chat: ChatCardBody,
  security: SecurityCardBody,
  signal: SignalCardBody,
  timeline: TimelineCardBody,
}

interface TechHighlightsSectionProps {
  highlights: TechHighlightItemValue[]
  eyebrow?: string
  intro?: string
}

export function TechHighlightsSection({
  highlights,
  eyebrow = 'Built for Reliability',
  intro = "Purpose-engineered for the complexity of India's power infrastructure — built to last and scale.",
}: TechHighlightsSectionProps) {
  return (
    <section className="bg-white py-16 lg:py-24 border-t border-[#f1f5f9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
            {eyebrow}
          </p>
          <h2 className="text-4xl font-bold text-[#111827] capitalize mb-4">
            Technical Highlights
          </h2>
          <p className="text-base text-[#6b7280] max-w-xl mx-auto">
            {intro}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {highlights.map((item, i) => {
            const CardBody = CARD_BODY[item.card_type] ?? IconCardBody
            return (
              <motion.div
                key={i}
                className={`relative rounded-3xl p-8 flex flex-col gap-6 border border-[#e2e8f0] ${CARD_BG[item.card_type] ?? 'bg-white'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' as const }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' as const }}
              >
                <span className="absolute top-8 right-8 text-xs font-bold text-[#9aa5b1] tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <CardBody
                  icon={item.icon}
                  heading={item.heading}
                  description={item.description}
                  sub_text={item.sub_text}
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
