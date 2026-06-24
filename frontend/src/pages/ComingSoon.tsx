import { useEffect, useRef, useState } from 'react'
import { PageMeta } from '@/components/seo/PageMeta'
import { EVENT_CONFIG } from '@/config/eventConfig'
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/Button';

// ── Countdown hook ──────────────────────────────────────────────────────────

interface TimeLeft {
  days: number; hours: number; minutes: number; seconds: number
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1_000),
  }
}

function useCountdown(target: Date): TimeLeft {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target))
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1_000)
    return () => clearInterval(id)
  }, [target])
  return timeLeft
}

// ── Particle repulsion field ────────────────────────────────────────────────
// Cursor pushes particles away → visible clearing bubble follows the cursor.
// Particles spring back to home when cursor leaves.

// Brand gradient stops as RGB for smooth interpolation
const COLOR_STOPS: [number, number, number][] = [
  [26,  174, 232],  // #1AAEE8 blue
  [0,   197, 176],  // #00C5B0 teal
  [0,   217, 126],  // #00D97E green
]

function phaseToColor(phase: number): string {
  const n  = COLOR_STOPS.length
  const t  = ((phase % 1) + 1) % 1   // clamp to 0–1
  const s  = t * n
  const i  = Math.floor(s) % n
  const f  = s - Math.floor(s)
  const a  = COLOR_STOPS[i]
  const b  = COLOR_STOPS[(i + 1) % n]
  const r  = a[0] + (b[0] - a[0]) * f
  const g  = a[1] + (b[1] - a[1]) * f
  const bl = a[2] + (b[2] - a[2]) * f
  return `rgb(${r|0},${g|0},${bl|0})`
}

const REPEL_R   = 320    // wide radiation zone
const REPEL_F   = 6.5    // radial push force
const SPRING_K  = 0.032  // gentle spring-back
const DAMPING   = 0.87   // inertia
const WOBBLE    = 0.04   // organic micro-drift

interface Dot {
  baseX: number; baseY: number
  x: number;     y: number
  vx: number;    vy: number
  r: number
  scalePhase: number
  scaleFreq:  number
  colorPhase: number   // 0–1, position along gradient cycle
  colorSpeed: number   // how fast this dot cycles through colors
  alpha: number
}

function makeDot(bx: number, by: number): Dot {
  return {
    baseX: bx, baseY: by, x: bx, y: by,
    vx: 0, vy: 0,
    r: 2.0 + Math.random() * 0.8,
    scalePhase: Math.random() * Math.PI * 2,
    scaleFreq:  0.007 + Math.random() * 0.010,
    colorPhase: Math.random(),                      // random start along gradient
    colorSpeed: 0.0008 + Math.random() * 0.0012,   // full cycle in ~14–21s
    alpha:  0.15 + Math.random() * 0.15,
  }
}

function buildDots(w: number, h: number): Dot[] {
  // Perfect grid — compute spacing from viewport size
  const spacing = window.innerWidth < 768 ? 38 : 28
  const cols = Math.floor(w / spacing)
  const rows = Math.floor(h / spacing)
  const padX = (w - (cols - 1) * spacing) / 2
  const padY = (h - (rows - 1) * spacing) / 2
  const out: Dot[] = []
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      out.push(makeDot(padX + i * spacing, padY + j * spacing))
    }
  }
  return out
}

function updateDot(d: Dot, cx: number, cy: number, repelR: number, repelF: number): void {
  const dx   = d.x - cx
  const dy   = d.y - cy
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist < repelR && dist > 0.5) {
    // Quadratic falloff — very strong near cursor, fades toward edge
    const t        = 1 - dist / repelR
    const strength = t * t * repelF
    d.vx += (dx / dist) * strength
    d.vy += (dy / dist) * strength
  }

  // Spring back to home
  d.vx += (d.baseX - d.x) * SPRING_K
  d.vy += (d.baseY - d.y) * SPRING_K

  d.vx = d.vx * DAMPING + (Math.random() - 0.5) * WOBBLE
  d.vy = d.vy * DAMPING + (Math.random() - 0.5) * WOBBLE

  d.x += d.vx
  d.y += d.vy
}

function drawDot(ctx: CanvasRenderingContext2D, d: Dot, frame: number): void {
  d.colorPhase = (d.colorPhase + d.colorSpeed) % 1
  const breathe = 0.55 + 0.45 * Math.sin(frame * d.scaleFreq + d.scalePhase)
  const r = d.r * breathe
  ctx.beginPath()
  ctx.arc(d.x, d.y, r, 0, Math.PI * 2)
  ctx.globalAlpha = d.alpha
  ctx.fillStyle   = phaseToColor(d.colorPhase)
  ctx.fill()
}

function ParticleField() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const dotsRef      = useRef<Dot[]>([])
  const cursorRef    = useRef({ x: -9999, y: -9999 })
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    const dpr    = window.devicePixelRatio || 1
    let lw = 0, lh = 0, frame = 0

    function resize(): void {
      lw = window.innerWidth; lh = window.innerHeight
      canvas.width  = lw * dpr; canvas.height = lh * dpr
      canvas.style.width = `${lw}px`; canvas.style.height = `${lh}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function loop(): void {
      ctx.clearRect(0, 0, lw, lh)
      const { x: cx, y: cy } = cursorRef.current
      const dots    = dotsRef.current
      const mobile  = lw < 768
      const repelR  = mobile ? 130 : REPEL_R
      const repelF  = mobile ? 3.0 : REPEL_F
      for (let i = 0; i < dots.length; i++) {
        updateDot(dots[i], cx, cy, repelR, repelF)
        drawDot(ctx, dots[i], frame)
      }
      frame++
      animFrameRef.current = requestAnimationFrame(loop)
    }

    const onMove  = (e: MouseEvent)  => { cursorRef.current = { x: e.clientX, y: e.clientY } }
    const onLeave = ()                => { cursorRef.current = { x: -9999, y: -9999 } }
    const onTouch = (e: TouchEvent)  => { cursorRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    const onVis   = ()               => { document.hidden ? cancelAnimationFrame(animFrameRef.current) : loop() }

    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(animFrameRef.current)
        resize(); dotsRef.current = buildDots(lw, lh); loop()
      }, 150)
    }

    resize()
    dotsRef.current = buildDots(lw, lh)
    loop()

    window.addEventListener('mousemove',          onMove,  { passive: true })
    window.addEventListener('mouseleave',          onLeave)
    window.addEventListener('touchmove',           onTouch, { passive: true })
    window.addEventListener('resize',              onResize)
    document.addEventListener('visibilitychange',  onVis)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      clearTimeout(resizeTimer)
      window.removeEventListener('mousemove',          onMove)
      window.removeEventListener('mouseleave',          onLeave)
      window.removeEventListener('touchmove',           onTouch)
      window.removeEventListener('resize',              onResize)
      document.removeEventListener('visibilitychange',  onVis)
    }
  }, [])

  return (
    <canvas ref={canvasRef} aria-hidden="true" style={{
      position: 'fixed', inset: 0, zIndex: 1,
      pointerEvents: 'none', display: 'block',
    }} />
  )
}

// ── Corner glows ────────────────────────────────────────────────────────────

function CornerGlows() {
  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }} aria-hidden="true">
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full blur-3xl"
           style={{ background: '#1AAEE8', opacity: 0.08 }} />
      <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full blur-3xl"
           style={{ background: '#00D97E', opacity: 0.07 }} />
    </div>
  )
}

// ── Countdown tile ──────────────────────────────────────────────────────────

function CountdownTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex w-17 flex-col items-center gap-1.5 rounded-xl border border-border bg-white/70 px-3 py-3 shadow-sm backdrop-blur-sm md:w-auto md:min-w-28 md:gap-2 md:px-6 md:py-5">
      <span className="gradient-brand-text font-heading text-3xl font-extrabold tabular-nums leading-none md:text-5xl"
            aria-label={`${value} ${label}`}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-widest text-text-muted md:text-[11px]">
        {label}
      </span>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function ComingSoon() {
  const { days, hours, minutes, seconds } = useCountdown(EVENT_CONFIG.date)

  useEffect(() => {
    if (window.innerWidth < 768) return
    const root = document.documentElement
    root.style.overflow = 'hidden'
    return () => { root.style.overflow = '' }
  }, [])

  const eventDateLabel = EVENT_CONFIG.date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
  })

  return (
    <>
      <PageMeta
        title="Coming Soon — Genex Technocrats"
        description="Genex Technocrats is launching a new era in India's energy intelligence. Register for our upcoming webinar."
        canonical="/"
        noIndex
      />

      <CornerGlows />
      <ParticleField />

      <div className="relative h-1 w-full"
           style={{ background: 'linear-gradient(to right, #1AAEE8, #00C5B0, #00D97E)', zIndex: 10 }}
           aria-hidden="true" />

      <main className="relative flex flex-col items-center justify-center px-6 pt-20 pb-10 text-center min-h-[calc(100dvh-4px)] md:pt-24 md:pb-16"
            style={{ zIndex: 10 }}>
        <div className="flex flex-col items-center">

          <p className="mb-6 font-heading text-base font-bold uppercase tracking-[0.18em] text-text-primary md:mb-14">
            Genex Technocrats
          </p>

          <span className="mb-3 inline-block rounded-full border border-primary/20 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur-sm md:mb-5">
            <span className="block sm:inline">Upcoming Launch Webinar</span>
            <span className="mx-1 hidden sm:inline">&nbsp;·&nbsp;</span>
            <span className="block sm:inline">{eventDateLabel}</span>
          </span>

          <h1 className="font-heading text-4xl font-extrabold leading-tight text-text-primary md:text-6xl lg:text-7xl">
            Something <span className="gradient-brand-text">Big</span> Is Coming.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-text-muted md:mt-6 md:text-lg">
            {EVENT_CONFIG.description}
          </p>

          <div className="mt-6 flex flex-nowrap items-center justify-center gap-2 md:mt-12 md:gap-4"
               aria-label="Countdown to event">
            <CountdownTile value={days}    label="Days"    />
            <CountdownTile value={hours}   label="Hours"   />
            <CountdownTile value={minutes} label="Minutes" />
            <CountdownTile value={seconds} label="Seconds" />
          </div>

          <a
            href={EVENT_CONFIG.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'mt-6')}
          >
            Register Now
          </a>

        </div>

        {/* Pinned to viewport bottom */}
        <p className="absolute bottom-5 text-xs text-text-muted">
          Genex Technocrats Pvt. Ltd. | Next Generation Energy Intelligence
        </p>
      </main>
    </>
  )
}
