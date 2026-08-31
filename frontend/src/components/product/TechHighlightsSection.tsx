import { motion } from 'framer-motion'
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet'
import CloudQueueIcon from '@mui/icons-material/CloudQueue'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import WifiIcon from '@mui/icons-material/Wifi'
import BarChartIcon from '@mui/icons-material/BarChart'
import type SvgIcon from '@mui/material/SvgIcon'

type SvgIconComponent = typeof SvgIcon

export interface TechHighlight {
  title: string
  description: string
}

type Category = 'protocol' | 'security' | 'ai' | 'connectivity' | 'integration' | 'analytics' | 'redundancy' | 'default'

interface ClassifyRule {
  test: RegExp
  icon: SvgIconComponent
  category: Category
}

// ── Keyword → {icon, category} inference (no per-item metadata exists in the data) ──
// Icon and accent share the same classification, so a card's bottom accent always
// matches what its icon is actually about instead of just its position in the grid.
const RULES: ClassifyRule[] = [
  { test: /iec|dnp3|modbus|opc-?ua|bacnet|can bus|rs485|protocol/i, icon: SettingsEthernetIcon, category: 'protocol' },
  { test: /security|auth|encrypt|dsc|signature|pci|sha-256/i, icon: LockOutlinedIcon, category: 'security' },
  { test: /\bai\b|\bml\b|model|predict|lstm|transformer|reinforcement|random forest|xgboost|explainable|scikit|pytorch/i, icon: PsychologyOutlinedIcon, category: 'ai' },
  { test: /4g|lte|wi-?fi|nb-iot|gprs|fiber|connectivity|ethernet/i, icon: WifiIcon, category: 'connectivity' },
  { test: /cloud|sync|stream|websocket|mqtt|api|rest|graphql|integration/i, icon: CloudQueueIcon, category: 'integration' },
  { test: /report|dashboard|analytics|forecast|calculation|scoring|kpi|reporting/i, icon: BarChartIcon, category: 'analytics' },
  { test: /redundan|failover|standby|protection|overcurrent|overvoltage|verified|compliance/i, icon: VerifiedOutlinedIcon, category: 'redundancy' },
]

function classify(title: string): { Icon: SvgIconComponent; category: Category } {
  const rule = RULES.find(r => r.test.test(title))
  return rule ? { Icon: rule.icon, category: rule.category } : { Icon: BoltOutlinedIcon, category: 'default' }
}

const CATEGORY_VALUE_COLOR: Record<Category, string> = {
  protocol: 'text-sky-700',
  security: 'text-emerald-700',
  ai: 'text-violet-700',
  connectivity: 'text-sky-700',
  integration: 'text-blue-700',
  analytics: 'text-primary',
  redundancy: 'text-[#0f2930]',
  default: 'text-[#62748e]',
}

// ── Real number extraction — when a highlight's own title states an actual figure
// (a latency, a scale, a version, a buffer window), surface that instead of a
// generic decoration, so the accent reflects this specific highlight, not just its slot ──
interface Metric {
  value: string
  label: string
}

function extractMetric(title: string): Metric | null {
  let m = title.match(/<\s?(\d+(?:\.\d+)?)\s?(ms|s|sec|seconds|min|minutes|hrs?|hours)\b/i)
  if (m) {
    const isMinutesOrHours = /min|hr/i.test(m[2])
    const unit = /ms/i.test(m[2]) ? 'ms' : isMinutesOrHours ? (/hr/i.test(m[2]) ? ' hr' : ' min') : 's'
    return { value: `< ${m[1]}${unit}`, label: isMinutesOrHours ? 'Turnaround' : 'Response Time' }
  }

  m = title.match(/\bsub-(second|minute)\b/i)
  if (m) return { value: `Sub-${m[1].toLowerCase()}`, label: 'Cycle Time' }

  m = title.match(/\b(\d+)\s?days?\b/i)
  if (m) return { value: `${m[1]} Days`, label: 'Data Buffer' }

  m = title.match(/\bv(\d+(?:\.\d+)*)\b/i)
  if (m) return { value: `v${m[1]}`, label: 'Version' }

  // Only treat comma-grouped or explicitly "+"-suffixed numbers as a scale metric —
  // avoids misreading standard/protocol numbers like "IEC 61850" or "ISO 15765" as stats.
  m = title.match(/\b(\d{1,3}(?:,\d{3})+\+?|\d{4,}\+)\b/)
  if (m) return { value: m[1], label: 'Scale' }

  return null
}

// ── Category-driven fallback accents (used when no explicit number is present) ──

function ProtocolAccent() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={`h-1.5 rounded-full ${i === 1 ? 'bg-primary flex-[2.5]' : 'bg-[#e2e8f0] flex-1'}`}
        />
      ))}
    </div>
  )
}

function SecurityAccent() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <LockOutlinedIcon style={{ fontSize: 14 }} className="text-emerald-600 shrink-0" />
      <span className="text-xs font-medium text-emerald-700">Encrypted</span>
      <div className="flex-1 h-1.5 rounded-full bg-emerald-100 overflow-hidden">
        <div className="h-full w-full bg-emerald-500 rounded-full" />
      </div>
    </div>
  )
}

function AIAccent() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <PsychologyOutlinedIcon style={{ fontSize: 14 }} className="text-violet-600 shrink-0" />
      <span className="text-xs font-medium text-violet-700">Model-Driven</span>
      <div className="flex-1 h-1.5 rounded-full bg-violet-100 overflow-hidden">
        <div className="h-full w-2/3 bg-violet-500 rounded-full" />
      </div>
    </div>
  )
}

function ConnectivityAccent() {
  return (
    <div className="flex items-end gap-1" aria-hidden="true">
      {[6, 10, 14, 18].map((h, i) => (
        <div key={i} className="flex-1 bg-sky-400 rounded-sm" style={{ height: h }} />
      ))}
      <span className="text-xs font-medium text-sky-700 ml-2">Connected</span>
    </div>
  )
}

function IntegrationAccent() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-sky-500" />
      </span>
      <span className="text-xs font-medium text-sky-700">Live Sync</span>
      <div className="flex-1 h-px bg-[#e2e8f0]" />
    </div>
  )
}

function AnalyticsAccent() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="border-4 border-primary rounded-full size-9 flex items-center justify-center shrink-0">
        <span className="text-[9px] font-bold text-[#0f2930]">Live</span>
      </div>
      <div className="flex-1 flex items-end gap-1 h-6">
        <div className="flex-1 bg-[#e2e8f0] rounded-t-sm h-3" />
        <div className="flex-1 bg-[#0f2930] rounded-t-sm h-full" />
        <div className="flex-1 bg-primary rounded-t-sm h-4" />
        <div className="flex-1 bg-[#e2e8f0] rounded-t-sm h-2.5" />
      </div>
    </div>
  )
}

function RedundancyAccent() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-[#0f2930] text-white rounded-full">
        Verified
      </span>
      <div className="flex-1 h-px bg-[#e2e8f0]" />
    </div>
  )
}

function DefaultAccent() {
  return <div className="h-px bg-[#e2e8f0]" aria-hidden="true" />
}

const CATEGORY_ACCENTS: Record<Category, () => React.JSX.Element> = {
  protocol: ProtocolAccent,
  security: SecurityAccent,
  ai: AIAccent,
  connectivity: ConnectivityAccent,
  integration: IntegrationAccent,
  analytics: AnalyticsAccent,
  redundancy: RedundancyAccent,
  default: DefaultAccent,
}

function MetricAccent({ value, label, category }: Metric & { category: Category }) {
  return (
    <div className="flex items-end justify-between pt-1" aria-hidden="true">
      <span className={`text-2xl font-extrabold tabular-nums ${CATEGORY_VALUE_COLOR[category]}`}>
        {value}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa5b1] pb-0.5">
        {label}
      </span>
    </div>
  )
}

const CARD_TINTS = [
  'bg-white border border-[#e2e8f0] shadow-sm',
  'bg-[#f0f9ff] border border-[#e0f2fe]',
  'bg-[#f0fdf4] border border-[#dcfce7]',
  'bg-white border border-[#e2e8f0] shadow-sm',
]

const ICON_TINTS = [
  'bg-[#f0f4f8] text-[#0f2930]',
  'bg-[#e0f2fe] text-[#1c398e]',
  'bg-[#dcfce7] text-[#0d542b]',
  'bg-[#f0f4f8] text-[#0f2930]',
]

interface TechHighlightsSectionProps {
  highlights: TechHighlight[]
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
            const { Icon, category } = classify(item.title)
            const metric = extractMetric(item.title)
            const Accent = CATEGORY_ACCENTS[category]
            return (
              <motion.div
                key={i}
                className={`rounded-3xl p-8 flex flex-col gap-6 ${CARD_TINTS[i % CARD_TINTS.length]}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' as const }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' as const }}
              >
                <div className="flex items-start justify-between">
                  <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${ICON_TINTS[i % ICON_TINTS.length]}`}>
                    <Icon style={{ fontSize: 24 }} />
                  </div>
                  <span className="text-xs font-bold text-[#9aa5b1] tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-[#0f2930] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#62748e] leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {metric ? <MetricAccent {...metric} category={category} /> : <Accent />}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
