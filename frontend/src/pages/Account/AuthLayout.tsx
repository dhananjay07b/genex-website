import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import MailOutlinedIcon from '@mui/icons-material/MailOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { marketingPath } from '@/lib/host'

interface AuthLayoutProps {
  eyebrow: string
  headline: string
  description: string
  panelExtra: ReactNode
  footerIcon: ReactNode
  footerText: string
  children: ReactNode
}

const ORBS = [
  { className: 'w-56 h-56 -top-16 -right-20', color: 'rgba(26,174,232,0.35)', delay: '0s' },
  { className: 'w-40 h-40 bottom-10 -left-12', color: 'rgba(0,217,126,0.3)', delay: '1.4s' },
  { className: 'w-24 h-24 bottom-56 right-8', color: 'rgba(0,197,176,0.35)', delay: '2.6s' },
]

export function AuthLayout({ eyebrow, headline, description, panelExtra, footerIcon, footerText, children }: AuthLayoutProps) {
  return (
    <main className="h-screen overflow-hidden flex flex-col lg:flex-row">
      {/* Brand panel — hidden on small screens so the form alone fills the viewport without stacking overflow */}
      <div className="relative hidden lg:flex lg:w-96 shrink-0 bg-[linear-gradient(160deg,#0A1628_0%,#0d1f38_55%,#0A1628_100%)] flex-col px-10 py-10 overflow-hidden">
        <div className="auth-grid-overlay" />
        {ORBS.map((orb, i) => (
          <div
            key={i}
            className={`auth-orb ${orb.className}`}
            style={{ background: `radial-gradient(circle, ${orb.color}, transparent 70%)`, animationDelay: orb.delay }}
          />
        ))}

        <div className="relative flex flex-col h-full">
          <div className="flex items-center gap-2.5">
            <img src="/favicon1:1.svg" alt="" className="h-20 rounded-lg" />
            <span className="text-3xl font-extrabold text-white tracking-tight">GeLearn</span>
          </div>

          <div className="flex-1 flex flex-col justify-center pt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3.5">{eyebrow}</p>
            <h1 className="text-3xl font-extrabold text-white leading-tight mb-4">{headline}</h1>
            <p className="text-sm leading-relaxed text-white/70 max-w-sm">{description}</p>
            <div className="mt-8">{panelExtra}</div>
          </div>

          <div className="pt-5 border-t border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="text-secondary shrink-0">{footerIcon}</span>
              <span className="text-xs font-semibold text-white/65">{footerText}</span>
            </div>

            <div className="mt-4 bg-white/6 border border-white/10 rounded-2xl px-4 py-3.5">
              <div className="flex items-center gap-2 mb-2.5">
                <HelpOutlineOutlinedIcon sx={{ fontSize: 15 }} className="text-white/60" />
                <span className="text-xs font-bold text-white">Can&apos;t sign in?</span>
              </div>
              <a
                href="mailto:info@genextechnocrats.com"
                className="flex items-center gap-2 text-xs font-semibold text-white/65 hover:text-white transition-colors mb-1.5"
              >
                <MailOutlinedIcon sx={{ fontSize: 14 }} className="shrink-0" />
                info@genextechnocrats.com
              </a>
              <a
                href={marketingPath('/contact')}
                className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-white transition-colors"
              >
                Contact Us <ArrowForwardIcon sx={{ fontSize: 12 }} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel — scrolls internally as a fallback on short viewports, so the page itself never scrolls */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {children}
        </motion.div>
      </div>
    </main>
  )
}
