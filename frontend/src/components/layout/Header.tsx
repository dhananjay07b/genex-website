import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useScrolled } from '@/hooks/useScrolled'
import { DesktopNav } from './DesktopNav'
import { MobileMenu } from './MobileMenu'
import { buttonVariants } from '@/components/ui/Button'
import { navConfig } from '@/config/navigation'

export function Header() {
  const scrolled = useScrolled(60)

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-200',
        scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-[0_1px_0_0_#E5E7EB]'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          aria-label="Genex Technocrats — Home"
          className="flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <span className="text-xl font-extrabold tracking-tight text-text-primary">
            Genex
            <span className="bg-linear-to-r from-[#1AAEE8] to-[#00D97E] bg-clip-text text-transparent">
              .
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <DesktopNav items={navConfig.items} />

        {/* Desktop CTA + Mobile trigger */}
        <div className="flex items-center gap-3">
          <Link
            to={navConfig.cta.href}
            className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'hidden lg:inline-flex')}
          >
            {navConfig.cta.label}
          </Link>

          <MobileMenu config={navConfig} />
        </div>
      </div>
    </header>
  )
}
