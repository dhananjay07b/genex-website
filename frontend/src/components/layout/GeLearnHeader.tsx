import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SearchIcon from '@mui/icons-material/Search'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import { cn } from '@/lib/utils'
import { marketingPath } from '@/lib/host'
import { useAuth } from '@/context/useAuth'
import { useRole } from '@/hooks/useRole'
import { buttonVariants } from '@/components/ui/Button'
import { AccountMenu } from './AccountMenu'
import { ExploreMenu } from './ExploreMenu'
import { NotificationBell } from '@/pages/Account/dashboard/NotificationBell'

const AUDIENCES = [
  { label: 'For Learners', href: '/' },
  { label: 'For Professionals', href: '/for-professionals' },
  { label: 'For Companies', href: '/for-companies' },
]

function SearchBox({ className }: { className?: string }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { pathname } = useLocation()
  const [query, setQuery] = useState(pathname === '/search' ? params.get('q') ?? '' : '')

  function submit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <form role="search" onSubmit={submit} className={cn('flex min-w-0 items-center rounded-full border border-slate-300 bg-white py-1 pr-1 pl-4 focus-within:border-primary', className)}>
      <label htmlFor="gelearn-search" className="sr-only">Search GeLearn</label>
      <input
        id="gelearn-search"
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="What do you want to learn? Try “IEC 61850” or “BESS”"
        className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
      />
      <button type="submit" aria-label="Search" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:opacity-90">
        <SearchIcon sx={{ fontSize: 18 }} />
      </button>
    </form>
  )
}

/**
 * GeLearn's fixed header: an audience strip (h-8) above the main bar (h-16)
 * with the logo, Explore menu, search and account. GeLearnLayout reserves the
 * strip's height; pages already leave room for the 4rem bar.
 */
export function GeLearnHeader() {
  const { pathname } = useLocation()
  const { user, isLoading } = useAuth()
  const { isLearner, isProfessional } = useRole()

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Audience strip */}
      <div className="h-8 border-b border-border bg-slate-50 text-xs">
        <div className="scrollbar-hidden mx-auto flex h-full max-w-330 items-center gap-1 overflow-x-auto px-4 md:px-6">
          {AUDIENCES.map(a => (
            <Link
              key={a.href}
              to={a.href}
              className={cn(
                'flex h-full items-center whitespace-nowrap border-b-2 px-2.5 font-semibold transition-colors',
                pathname === a.href ? 'border-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary',
              )}
            >
              {a.label}
            </Link>
          ))}
          <a href={marketingPath()} className="ml-auto inline-flex items-center gap-1 whitespace-nowrap px-2.5 font-semibold text-text-muted hover:text-text-primary">
            Genex Technocrats <OpenInNewIcon sx={{ fontSize: 13 }} />
          </a>
        </div>
      </div>

      {/* Main bar */}
      <div className="relative h-16 border-b border-border bg-white">
        <div className="mx-auto flex h-full max-w-330 items-center gap-3 px-4 md:gap-4 md:px-6">
          <Link
            to="/"
            aria-label="GeLearn home"
            className="flex shrink-0 items-center gap-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <img src="/favicon1:1.svg" alt="" className="h-11 w-auto" />
            <span className="text-xl font-extrabold text-text-primary">GeLearn</span>
          </Link>

          <ExploreMenu />
          <SearchBox className="hidden flex-1 lg:flex" />

          <div className="ml-auto flex shrink-0 items-center gap-1.5 lg:ml-0">
            <Link to="/search" aria-label="Search" className="flex size-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 lg:hidden">
              <SearchIcon sx={{ fontSize: 22 }} />
            </Link>
            {!isLoading && !user && (
              <>
                <Link to="/login" className="hidden px-2.5 py-2 text-sm font-bold text-sky-700 hover:text-sky-800 sm:inline-flex">
                  Log in
                </Link>
                <Link to="/register" className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'whitespace-nowrap')}>
                  Join for free
                </Link>
              </>
            )}
            {user && (isLearner || isProfessional) && (
              <Link to="/account?tab=learning" className="hidden px-2.5 py-2 text-sm font-bold text-sky-700 hover:text-sky-800 xl:inline-flex">
                My Learning
              </Link>
            )}
            {user && (
              <>
                <Link to="/account?tab=saved" aria-label="Saved items" className="hidden size-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 sm:flex">
                  <BookmarkBorderIcon sx={{ fontSize: 22 }} />
                </Link>
                <NotificationBell />
                <AccountMenu />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
