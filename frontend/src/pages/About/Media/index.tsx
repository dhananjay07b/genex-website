import { motion } from 'framer-motion'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Link } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'

// ─── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' as const },
  transition: { duration: 0.6, ease: 'easeOut' as const, delay },
})

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Achievement {
  badge: string
  BadgeIcon: React.ComponentType<{ sx?: Record<string, unknown> }>
  heading: string
  body: string
  image: string
  imageAlt: string
}

interface PhotoItem {
  src: string
  alt: string
  spanCols: 1 | 2
  spanRows?: 2
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const achievements: Achievement[] = [
  {
    badge: 'Certificate',
    BadgeIcon: WorkspacePremiumOutlinedIcon,
    heading: 'Recognized at India Solar Week 2024 for Energy Innovation.',
    body: 'Genex Technocrats received the Certificate of Recognition from ASSOCHAM at India Solar Week 2024 — honoring our contribution to smart SCADA infrastructure and real-time remote monitoring technology across 200+ MW of solar installations across India.',
    image: '/images/media/cert-recognition.jpg',
    imageAlt: 'Certificate of Recognition — India Solar Week 2024, ASSOCHAM',
  },
  {
    badge: 'Award',
    BadgeIcon: EmojiEventsOutlinedIcon,
    heading: 'SolarLive™ Wins Technology & Innovation Excellence Award.',
    body: 'Our flagship SolarLive™ real-time plant monitoring platform was honored at the AI Impact Summit for advancing predictive fault detection, live analytics, and centralized plant intelligence at utility-scale solar and wind sites across India.',
    image: '/images/media/award-solar-week.jpg',
    imageAlt: 'SolarLive™ Technology & Innovation Excellence Award — AI Impact Summit',
  },
]

const pressPhotos: PhotoItem[] = [
  { src: '/images/media/press-1.jpg', alt: 'Genex Technocrats at India Solar Week 2024 main stage', spanCols: 2, spanRows: 2 },
  { src: '/images/media/press-2.jpg', alt: 'Award ceremony at AI Impact Summit 2024', spanCols: 1 },
  { src: '/images/media/press-3.jpg', alt: 'Genex team receiving ASSOCHAM recognition certificate', spanCols: 1 },
  { src: '/images/media/press-4.jpg', alt: 'Panel discussion on renewable energy technology and innovation', spanCols: 2 },
]

const galleryPhotos: PhotoItem[] = [
  { src: '/images/media/gallery-1.jpg', alt: 'Solar plant commissioning — Rajasthan installation site', spanCols: 2, spanRows: 2 },
  { src: '/images/media/gallery-2.jpg', alt: 'SCADA control room at Genex headquarters, Jaipur', spanCols: 1 },
  { src: '/images/media/gallery-3.jpg', alt: 'Field engineer commissioning solar inverter and data logger', spanCols: 1 },
  { src: '/images/media/gallery-4.jpg', alt: 'SolarLive™ monitoring dashboard — live plant view', spanCols: 2 },
  { src: '/images/media/gallery-5.jpg', alt: 'Wind energy turbine data acquisition setup', spanCols: 2, spanRows: 2 },
  { src: '/images/media/gallery-6.jpg', alt: 'IoT gateway deployment at PM Kusum scheme site', spanCols: 1 },
  { src: '/images/media/gallery-7.jpg', alt: 'Genex engineering team at industrial solar plant', spanCols: 1 },
  { src: '/images/media/gallery-8.jpg', alt: 'Smart metering and protection panel installation', spanCols: 2 },
]

// ─── Photo card ───────────────────────────────────────────────────────────────
function PhotoCard({ item }: { item: PhotoItem }) {
  const colClass = item.spanCols === 2 ? 'col-span-2' : 'col-span-1'
  const rowClass = item.spanRows === 2 ? 'lg:row-span-2' : ''
  const heightClass =
    item.spanRows === 2
      ? 'h-56 sm:h-72 lg:h-auto'
      : item.spanCols === 2
        ? 'h-48 sm:h-60 lg:h-auto'
        : 'h-40 sm:h-48 lg:h-auto'

  return (
    <motion.div
      variants={staggerChild}
      className={`${colClass} ${rowClass} ${heightClass} relative overflow-hidden rounded-2xl border border-[#e2e8f0] shadow-sm group cursor-pointer`}
    >
      <img
        src={item.src}
        alt={item.alt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        loading="lazy"
        width={600}
        height={400}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(22,36,86,0.55)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Media() {
  return (
    <>
      <PageMeta
        title="Media & Achievements — Genex Technocrats"
        description="Explore Genex Technocrats' media coverage, industry awards, certificates of recognition, and press appearances across India's renewable energy sector."
        canonical="/about/media"
      />

      <PageHero
        label="About Genex"
        headline="Engineering India's Energy Future"
        subline="Awards, certifications, press moments, and the milestones that mark our journey in power sector technology."
      />

      {/* ── Achievements ──────────────────────────────────────────────────────── */}
      <section className="bg-white" aria-label="Awards and certifications">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {achievements.map((ach, idx) => {
            const Icon = ach.BadgeIcon
            return (
              <div
                key={idx}
                className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${
                  idx === 0 ? 'py-20 lg:py-28' : 'pb-20 lg:pb-28'
                } ${idx > 0 ? 'border-t border-[#e2e8f0] pt-16 lg:pt-24' : ''}`}
              >
                {/* Image card */}
                <motion.div
                  {...fadeUp(0)}
                  className="w-full lg:w-5/12 flex-shrink-0 relative"
                >
                  {/* Tilted bg decoration */}
                  <div
                    className="absolute inset-0 bg-[#dbeafe] rounded-3xl opacity-60"
                    style={{ transform: 'rotate(3deg) scale(1.07)' }}
                  />
                  {/* Card */}
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.35, ease: 'easeOut' as const }}
                    className="relative overflow-hidden rounded-3xl border border-[#dcebfe] shadow-2xl aspect-[3/4]"
                  >
                    <img
                      src={ach.image}
                      alt={ach.imageAlt}
                      className="w-full h-full object-cover"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      width={420}
                      height={560}
                    />
                  </motion.div>
                </motion.div>

                {/* Text content */}
                <motion.div
                  {...fadeUp(0.15)}
                  className="w-full lg:w-7/12 space-y-6"
                >
                  {/* Badge chip */}
                  <div className="inline-flex items-center gap-2 px-4 py-[9px] rounded bg-[#f3f0fd] border border-[#cbe9fb]">
                    <Icon sx={{ fontSize: 16, color: '#003878' }} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#003878]">
                      {ach.badge}
                    </span>
                  </div>

                  <h2 className="text-3xl lg:text-[36px] font-bold text-[#162456] leading-tight capitalize">
                    {ach.heading}
                  </h2>

                  <p className="text-[18px] text-[#45556c] leading-[1.65]">
                    {ach.body}
                  </p>
                </motion.div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Media & Press ─────────────────────────────────────────────────────── */}
      <section className="bg-[#f1f5f8] border-y border-[#e2e8f0] py-24" aria-label="Media and press">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">

          <motion.div {...fadeUp(0)} className="flex items-end justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl lg:text-[36px] font-bold text-[#162456]">
                Media &amp; Press
              </h2>
              <p className="text-lg text-[#62748e]">
                Industry moments that define our public presence and sector recognition.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-[272px_272px] gap-4"
          >
            {pressPhotos.map((photo, i) => (
              <PhotoCard key={i} item={photo} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Gallery ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-24" aria-label="Photo gallery">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">

          <motion.div {...fadeUp(0)}>
            <div className="space-y-2">
              <h2 className="text-3xl lg:text-[36px] font-bold text-[#162456]">Gallery</h2>
              <p className="text-lg text-[#62748e]">
                A glimpse into the physical infrastructure our software empowers.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-[272px_272px_272px_272px] gap-4"
          >
            {galleryPhotos.map((photo, i) => (
              <PhotoCard key={i} item={photo} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="bg-[#f1f5f8] border-t border-[#e2e8f0] py-24" aria-label="Contact call to action">
        <motion.div
          {...fadeUp(0)}
          className="max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-6"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-[#162456]">
            Ready to work with us?
          </h2>
          <p className="text-lg text-[#62748e] max-w-xl mx-auto">
            Whether you're a solar developer, utility operator, or EPC contractor —{' '}
            let's build the monitoring layer your project deserves.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Link to="/contact#demo">
              <Button variant="primary" size="lg">
                Request a Demo
                <ArrowForwardIcon sx={{ fontSize: 18 }} />
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button variant="secondary" size="lg">
                View Our Portfolio
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  )
}
