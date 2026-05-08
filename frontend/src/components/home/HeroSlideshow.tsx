import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Slide {
  headline: string
  subline: string
  media: { type: 'video'; src: string } | { type: 'image'; src: string }
}

const SLIDES: Slide[] = [
  {
    headline: "Next Generation Power Management",
    subline: 'Complete solution for all your renewable and industrial assets.',
    media: { type: 'video', src: '/images/hero/slide1.mp4' },
  },
  {
    headline: 'Monitoring Every Watt. In Real Time.',
    subline: 'Real-time visibility across every solar, wind, and industrial asset.',
    media: { type: 'image', src: '/images/hero/slide2.png' },
  },
  {
    headline: 'Intelligence from the Field to the Cloud.',
    subline: 'SCADA, DERMS, and analytics built on open standards.',
    media: { type: 'image', src: '/images/hero/slide3.png' },
  },
  {
    headline: 'Built by Engineers. For Engineers.',
    subline: 'Indian engineering at global scale — deployed across 8 states.',
    media: { type: 'image', src: '/images/hero/slide4.png' },
  },
]

const INTERVAL_MS = 7500
const RING_RADIUS = 16
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS // ≈ 100.53

export function HeroSlideshow() {
  const [active, setActive]       = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [resetKey, setResetKey]   = useState(0)

  // Restart interval whenever resetKey changes or play state changes
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setActive(i => (i + 1) % SLIDES.length)
      setResetKey(k => k + 1)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [isPlaying, resetKey])

  function goToSlide(i: number) {
    if (i === active) return
    setActive(i)
    setResetKey(k => k + 1)
  }

  function togglePlay() {
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      setResetKey(k => k + 1) // restart ring from full when resuming
    }
  }

  const slide = SLIDES[active]

  return (
    <section className="relative h-screen min-h-150 overflow-hidden bg-dark-bg" aria-label="Hero slideshow">
      {/* Background slides — crossfade */}
      <AnimatePresence>
        <motion.div
          key={active}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          {slide.media.type === 'video' ? (
            <video
              key={slide.media.src}
              className="absolute inset-0 w-full h-full object-cover"
              src={slide.media.src}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src={slide.media.src}
              alt=""
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_100%)]" />
        </motion.div>
      </AnimatePresence>

      {/* Text — bottom-left, editorial */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 lg:px-16 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${active}`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] max-w-3xl tracking-tight">
              {slide.headline}
            </h1>
            <p className="mt-5 font-bold text-base lg:text-lg text-white/70 max-w-xl leading-relaxed">
              {slide.subline}
            </p>
            <div className="mt-8 flex flex-col lg:flex-row gap-4">
              <Link to="/contact#demo" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'justify-center lg:justify-start')}>
                Request Demo
              </Link>
              <Link
                to="/portfolio"
                className="inline-flex items-center justify-center h-12 px-7 rounded-md border border-white/50 text-white font-semibold text-base hover:border-white/90 hover:bg-white/10 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                View Our Work
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Left arrow */}
      <button
        onClick={() => goToSlide((active - 1 + SLIDES.length) % SLIDES.length)}
        aria-label="Previous slide"
        className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 hidden sm:flex items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 hover:border-white/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <KeyboardArrowLeftIcon className="w-5 h-5" />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => goToSlide((active + 1) % SLIDES.length)}
        aria-label="Next slide"
        className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 hidden sm:flex items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 hover:border-white/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <KeyboardArrowRightIcon className="w-5 h-5" />
      </button>

      {/* Bottom controls: dots + play/pause */}
      <div className="absolute bottom-5 left-0 right-0 z-10 flex items-center justify-center gap-3">
        {/* Slide dots */}
        <div role="tablist" aria-label="Slideshow navigation" className="flex items-center gap-2.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goToSlide(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                i === active ? 'w-8 bg-white' : 'w-3 bg-white/35 hover:bg-white/60'
              )}
            />
          ))}
        </div>

        {/* Divider */}
        <span className="w-px h-4 bg-white/25" aria-hidden="true" />

        {/* Play / Pause button with timer ring */}
        <div className="relative w-9 h-9">
          {/* SVG ring — rotated so progress starts from top */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 36 36"
            aria-hidden="true"
          >
            {/* Track */}
            <circle
              cx="18" cy="18" r={RING_RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
            />
            {/* Animated progress — key forces remount to restart CSS animation */}
            <circle
              key={`ring-${resetKey}`}
              cx="18" cy="18" r={RING_RADIUS}
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              style={{
                strokeDashoffset: RING_CIRCUMFERENCE,
                animation: `timer-ring ${INTERVAL_MS}ms linear forwards`,
                animationPlayState: isPlaying ? 'running' : 'paused',
              }}
            />
          </svg>

          {/* Button */}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            className="absolute inset-0 flex items-center justify-center text-white focus-visible:outline-none"
          >
            {isPlaying
              ? <PauseIcon className="w-3.5 h-3.5" />
              : <PlayArrowIcon className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </div>
    </section>
  )
}
