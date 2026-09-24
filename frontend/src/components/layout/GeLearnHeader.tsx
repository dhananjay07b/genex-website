import { Link, useLocation } from 'react-router-dom'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { cn } from '@/lib/utils'
import { marketingPath } from '@/lib/host'
import { AccountMenu } from './AccountMenu'

const GELEARN_NAV_LINKS = [
  { label: 'Technology', href: '/technology' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Tenders', href: '/tenders' },
  { label: 'Whitepapers', href: '/whitepapers' },
  { label: 'Videos', href: '/videos' },
  { label: 'Blog', href: '/blog' },
  { label: 'Podcasts', href: '/podcasts' },
]

export function GeLearnHeader() {
  const { pathname } = useLocation()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-5 lg:px-8 gap-4">
        {/* Wordmark */}
        <Link
          to="/"
          aria-label="GeLearn — Home"
          className="flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <img src="/favicon1:1.svg" alt="" className="h-14 w-auto" />
          <span className="text-2xl font-extrabold text-text-primary">GeLearn</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="GeLearn sections">
          {GELEARN_NAV_LINKS.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
                pathname === link.href
                  ? 'text-primary'
                  : 'text-text-primary hover:text-primary'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Account + back-to-main-site */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={marketingPath()}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
          >
            genextechnocrats.com <OpenInNewIcon style={{ fontSize: 13 }} />
          </a>

          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
