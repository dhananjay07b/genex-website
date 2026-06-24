import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { WorldMapPaths } from './WorldMapPaths'

// ─── Coordinate mapping ────────────────────────────────────────────────────
// world.svg geoViewBox: west=-169.110266, north=83.600842, east=190.486279, south=-58.508473
// SVG canvas:           width=1009.6727, height=665.96301
const toX = (lon: number) => (lon + 169.110266) / 359.596545 * 1009.6727
const _yN = Math.log(Math.tan(Math.PI / 4 + 83.600842  * Math.PI / 360))
const _yS = Math.log(Math.tan(Math.PI / 4 + -58.508473 * Math.PI / 360))
const toY = (lat: number) => {
  const yL = Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))
  return (_yN - yL) / (_yN - _yS) * 665.96301
}

interface Pin {
  id: string
  name: string
  x: number
  y: number
  delay: number
}

const PROJECT_PINS: Pin[] = [
  { id: 'IN', name: 'India',          x: toX(77.2),   y: toY(28.6),   delay: 0.00 },
  { id: 'US', name: 'United States',  x: toX(-98.0),  y: toY(38.0),   delay: 0.10 },
  { id: 'SG', name: 'Singapore',      x: toX(103.8),  y: toY(1.35),   delay: 0.20 },
  { id: 'GB', name: 'United Kingdom', x: toX(-0.12),  y: toY(51.5),   delay: 0.08 },
  { id: 'CN', name: 'China',          x: toX(116.4),  y: toY(39.9),   delay: 0.14 },
  { id: 'CA', name: 'Canada',         x: toX(-75.7),  y: toY(45.4),   delay: 0.06 },
  { id: 'CO', name: 'Colombia',       x: toX(-74.1),  y: toY(4.7),    delay: 0.24 },
  { id: 'FR', name: 'France',         x: toX(2.35),   y: toY(48.85),  delay: 0.12 },
  { id: 'IT', name: 'Italy',          x: toX(12.48),  y: toY(41.9),   delay: 0.18 },
  { id: 'KE', name: 'Kenya',          x: toX(36.8),   y: toY(-1.3),   delay: 0.30 },
  { id: 'ZA', name: 'South Africa',   x: toX(28.0),   y: toY(-26.2),  delay: 0.36 },
]

// ─── Connections ───────────────────────────────────────────────────────────
const RAW_CONNECTIONS = [
  { id: 'in-sg', from: 'IN', to: 'SG', dur: 3.0 },
  { id: 'in-cn', from: 'IN', to: 'CN', dur: 2.6 },
  { id: 'cn-sg', from: 'CN', to: 'SG', dur: 2.4 },
  { id: 'in-gb', from: 'IN', to: 'GB', dur: 3.8 },
  { id: 'gb-fr', from: 'GB', to: 'FR', dur: 2.2 },
  { id: 'gb-it', from: 'GB', to: 'IT', dur: 2.4 },
  { id: 'fr-it', from: 'FR', to: 'IT', dur: 2.1 },
  { id: 'gb-ca', from: 'GB', to: 'CA', dur: 3.6 },
  { id: 'gb-us', from: 'GB', to: 'US', dur: 3.8 },
  { id: 'us-ca', from: 'US', to: 'CA', dur: 2.3 },
  { id: 'us-co', from: 'US', to: 'CO', dur: 2.8 },
  { id: 'cn-us', from: 'CN', to: 'US', dur: 4.2 },
  { id: 'in-ke', from: 'IN', to: 'KE', dur: 3.2 },
  { id: 'in-za', from: 'IN', to: 'ZA', dur: 3.5 },
  { id: 'ke-za', from: 'KE', to: 'ZA', dur: 2.0 },
]

function arcPath(x1: number, y1: number, x2: number, y2: number) {
  const dist = Math.hypot(x2 - x1, y2 - y1)
  const cpx = (x1 + x2) / 2
  const cpy = (y1 + y2) / 2 - dist * 0.50
  return `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`
}

const CONNECTIONS = RAW_CONNECTIONS.map((c, i) => {
  const p1 = PROJECT_PINS.find(p => p.id === c.from)!
  const p2 = PROJECT_PINS.find(p => p.id === c.to)!
  return {
    ...c,
    d: arcPath(p1.x, p1.y, p2.x, p2.y),
    drawDelay: i * 0.12,
  }
})

const PIN_ENTRANCE_DELAYS = PROJECT_PINS.map(() => 0.3 + Math.random() * 1.1)

const STATS = [
  { value: '11',   label: 'Countries'  },
  { value: '4',    label: 'Continents' },
  { value: '24×7', label: 'Operations' },
]

// ─── TravelingDot ──────────────────────────────────────────────────────────
interface TravelingDotProps {
  pathId: string
  r: number
  fill: string
  dur: number
  keyPoints: string
  opacityDelay: number
}

function TravelingDot({ pathId, r, fill, dur, keyPoints, opacityDelay }: TravelingDotProps) {
  const animRef = useRef<SVGAnimationElement>(null)
  useEffect(() => {
    animRef.current?.beginElement()
  }, [])
  return (
    <circle r={r} fill={fill} opacity={0}>
      <animate
        attributeName="opacity"
        from="0" to="1"
        dur="0.6s"
        begin={`${opacityDelay}s`}
        fill="freeze"
      />
      <animateMotion
        ref={animRef}
        begin="indefinite"
        dur={`${dur}s`}
        repeatCount="indefinite"
        keyPoints={keyPoints}
        keyTimes="0;1"
        calcMode="spline"
        keySplines="0.4 0 0.6 1"
      >
        <mpath href={pathId} />
      </animateMotion>
    </circle>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────
export function OperationsMap() {
  const sectionRef   = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [activePin,  setActivePin]  = useState<Pin | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [dotsActive, setDotsActive] = useState(false)

  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })

  useEffect(() => {
    if (!isInView) return
    const t = setTimeout(() => setDotsActive(true), 3600)
    return () => clearTimeout(t)
  }, [isInView])

  const handlePinEnter = useCallback((pin: Pin, e: React.MouseEvent<SVGGElement>) => {
    if (!containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const target = (e.currentTarget as SVGGElement).getBoundingClientRect()
    setActivePin(pin)
    setTooltipPos({
      x: target.left + target.width / 2 - containerRect.left,
      y: target.top - containerRect.top,
    })
  }, [])

  const handlePinLeave = useCallback(() => setActivePin(null), [])

  return (
    <section
      ref={sectionRef}
      className="bg-white py-14 sm:py-20 lg:py-28 overflow-hidden"
      aria-labelledby="operations-map-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[4fr_7fr] gap-6 lg:gap-10 items-center">

          {/* ── Left: copy + stats ── */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Global Footprint
            </p>
            <h2
              id="operations-map-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight mb-6"
            >
              Our Global<br />Footprint.
            </h2>
            <p className="text-text-muted text-base leading-relaxed mb-4 max-w-sm">
              Genex technology platforms are deployed across power infrastructure projects
              spanning Asia, Europe, the Americas, and Africa — connecting operators,
              engineers, and decision-makers in real time across continents.
            </p>
            <p className="text-text-muted text-base leading-relaxed mb-6 max-w-sm">
              From renewable energy monitoring in India to grid intelligence in
              Europe and emerging markets across Africa, our systems run 24×7 at global scale.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-10 max-w-sm">
              {[
                'Asia Pacific — India, Singapore, China',
                'Europe — UK, France, Italy',
                'Americas — US, Canada, Colombia',
                'Africa — Kenya, South Africa',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-3 gap-4">
              {STATS.map(({ value, label }) => (
                <div key={label} className="border-l-2 border-primary/20 pl-3">
                  <span className="text-4xl font-extrabold gradient-brand-text">{value}</span>
                  <p className="text-sm text-text-muted mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: SVG map ── */}
          <motion.div
            ref={containerRef}
            className="relative flex justify-center mt-10 lg:mt-0"
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-primary/8 via-transparent to-secondary/8 blur-2xl -z-10" />

            <svg
              viewBox="0 0 1009.67 665.96"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full max-w-sm sm:max-w-md lg:max-w-none"
              aria-label="World map showing Genex global operations"
            >
              <style>{`
                #world-map-svg path {
                  fill: url(#state-fill);
                  stroke: rgba(255,255,255,0.75);
                  stroke-width: 0.6;
                  stroke-linejoin: round;
                }
              `}</style>

              <defs>
                <linearGradient id="state-fill" x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%"   stopColor="#D6EFFA" />
                  <stop offset="55%"  stopColor="#B4DCF2" />
                  <stop offset="100%" stopColor="#96CAEC" />
                </linearGradient>

                <linearGradient id="conn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#1AAEE8" />
                  <stop offset="100%" stopColor="#00D97E" />
                </linearGradient>

                <filter id="map-glow" x="-6%" y="-6%" width="112%" height="112%">
                  <feDropShadow dx="0" dy="3"  stdDeviation="6"  floodColor="#1AAEE8" floodOpacity="0.18" />
                  <feDropShadow dx="0" dy="10" stdDeviation="18" floodColor="#0050A0" floodOpacity="0.16" />
                </filter>

                <filter id="arc-shadow" x="-15%" y="-15%" width="130%" height="160%">
                  <feDropShadow dx="0" dy="6" stdDeviation="4"
                    floodColor="#003366" floodOpacity="0.35" />
                </filter>

                <linearGradient id="glass-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stopColor="white" stopOpacity="0.22" />
                  <stop offset="45%"  stopColor="white" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="white" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* World country paths */}
              <g id="world-map-svg" filter="url(#map-glow)">
                <WorldMapPaths />
              </g>

              {/* Glass sheen overlay */}
              <rect
                x="0" y="0" width="1009.67" height="665.96"
                fill="url(#glass-sheen)"
                style={{ pointerEvents: 'none' }}
              />

              {/* Connecting arcs */}
              {CONNECTIONS.map((c) => (
                <g key={c.id}>
                  <path
                    d={c.d}
                    fill="none"
                    stroke="url(#conn-grad)"
                    strokeWidth={2}
                    strokeDasharray="4 7"
                    opacity={0.4}
                    strokeLinecap="round"
                  />
                  <motion.path
                    id={`arc-${c.id}`}
                    d={c.d}
                    fill="none"
                    stroke="url(#conn-grad)"
                    strokeWidth={1}
                    strokeLinecap="round"
                    opacity={0.5}
                    filter="url(#arc-shadow)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: isInView ? 1 : 0 }}
                    transition={{ duration: 1.4, delay: 0.6 + c.drawDelay, ease: 'easeOut' }}
                  />
                  {dotsActive && (
                    <>
                      <TravelingDot
                        pathId={`#arc-${c.id}`}
                        r={4.5} fill="#1AAEE8" dur={c.dur}
                        keyPoints="0;1"
                        opacityDelay={c.drawDelay * 0.3}
                      />
                      <TravelingDot
                        pathId={`#arc-${c.id}`}
                        r={3.5} fill="#00D97E" dur={c.dur}
                        keyPoints="1;0"
                        opacityDelay={c.drawDelay * 0.3 + 0.2}
                      />
                    </>
                  )}
                </g>
              ))}

              {/* Country pins */}
              {PROJECT_PINS.map((pin, i) => (
                <motion.g
                  key={pin.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ duration: 0.45, delay: PIN_ENTRANCE_DELAYS[i], ease: 'backOut' }}
                  style={{ transformOrigin: `${pin.x}px ${pin.y}px`, cursor: 'pointer' }}
                  onMouseEnter={(e) => handlePinEnter(pin, e)}
                  onMouseLeave={handlePinLeave}
                >
                  <circle cx={pin.x} cy={pin.y} r={22} fill="transparent" />
                  <motion.circle
                    cx={pin.x}
                    cy={pin.y}
                    r={9}
                    fill="none"
                    stroke="#1AAEE8"
                    strokeWidth={2.5}
                    animate={{ r: [9, 28], opacity: [0.65, 0] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      delay: pin.delay % 1.2,
                      ease: 'easeOut',
                    }}
                  />
                  <circle cx={pin.x} cy={pin.y} r={9} fill="none" stroke="#1AAEE8" strokeWidth={2} opacity={0.4} />
                  <circle cx={pin.x} cy={pin.y} r={9} fill="#1AAEE8" />
                  <circle cx={pin.x} cy={pin.y} r={4} fill="white" />
                </motion.g>
              ))}
            </svg>

            {/* Tooltip */}
            <AnimatePresence>
              {activePin && (
                <motion.div
                  key={activePin.id}
                  className="pointer-events-none absolute z-10 bg-white rounded-xl shadow-lg border border-border px-3.5 py-2.5"
                  style={{
                    left: tooltipPos.x > (containerRef.current?.offsetWidth ?? 500) * 0.75
                      ? tooltipPos.x - 140
                      : tooltipPos.x + 10,
                    top: tooltipPos.y - 52,
                  }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="text-sm font-bold text-text-primary">{activePin.name}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
