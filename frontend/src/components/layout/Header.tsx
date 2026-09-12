import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScrolled } from '@/hooks/useScrolled'
import { DesktopNav } from './DesktopNav'
import { MobileMenu } from './MobileMenu'
import { buttonVariants } from '@/components/ui/Button'
import { navConfig } from '@/config/navigation'

export function Header() {
  const scrolled = useScrolled(60)
  const [headerHovered, setHeaderHovered] = useState(false)
  const { pathname } = useLocation()

  const isHome = pathname === '/'
  const solidBg = !isHome || scrolled || headerHovered

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16"
      onMouseEnter={() => setHeaderHovered(true)}
      onMouseLeave={() => setHeaderHovered(false)}
    >
      {/* Translucent dark layer — always visible when not solid */}
      <div
        className={cn(
          'absolute inset-0 bg-black/5 backdrop-blur-lg transition-opacity duration-200',
          solidBg ? 'opacity-0' : 'opacity-100'
        )}
      />

      {/* Animated white backdrop — slides down on scroll or hover */}
      <AnimatePresence>
        {solidBg && (
          <motion.div
            key="nav-backdrop"
            className="absolute inset-0 bg-white/95 backdrop-blur-sm shadow-[0_1px_0_0_#E5E7EB]"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            style={{ transformOrigin: 'top' }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto h-full flex items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          aria-label="Genex Technocrats — Home"
          className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <img
            src={'/images/logo/logo-mark.svg'}
            alt="Genex Technocrats"
            className="h-7 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <DesktopNav items={navConfig.items} solidBg={solidBg} />

        {/* Desktop CTA + Mobile trigger */}
        <div className="flex items-center gap-3">
          <Link
            to={navConfig.cta.href}
            className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'hidden lg:inline-flex')}
          >
            {navConfig.cta.label}
          </Link>

          <MobileMenu config={navConfig} solidBg={solidBg} />
        </div>
      </div>
    </header>
  )
}
