import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { cn } from '@/lib/utils'
import { useExploreMenu } from '@/hooks/useExploreMenu'
import type { ExploreMenuData } from '@/types/discovery'

interface MenuLink {
  label: string
  href: string
}

interface MenuCategory {
  name: string
  title: string
  groups: { heading: string; links: MenuLink[] }[]
  footer: MenuLink[]
}

/** The five Explore categories. Names only: no icons, no descriptions. */
function categories(data: ExploreMenuData): MenuCategory[] {
  return [
    {
      name: 'Topics',
      title: 'Browse by topic',
      groups: data.topic_groups.map(group => ({
        heading: group.name,
        links: group.topics.map(t => ({ label: t.name, href: `/topics/${t.slug}` })),
      })),
      footer: [{ label: 'All topics', href: '/topics' }],
    },
    {
      name: 'Courses',
      title: 'Courses',
      groups: [
        { heading: 'By level', links: [
          { label: 'Beginner', href: '/search?type=course&level=beginner' },
          { label: 'Intermediate', href: '/search?type=course&level=intermediate' },
          { label: 'Advanced', href: '/search?type=course&level=advanced' },
        ] },
        { heading: 'By access', links: [
          { label: 'Free courses', href: '/search?type=course&access=free' },
          { label: 'Members courses', href: '/search?type=course&access=members' },
          { label: 'Paid courses', href: '/search?type=course&access=paid' },
        ] },
      ],
      footer: [{ label: 'All courses', href: '/courses' }],
    },
    {
      name: 'Career roles',
      title: 'Learn for a role',
      groups: [
        { heading: 'Roles', links: data.roles.map(r => ({ label: r.name, href: `/roles/${r.slug}` })) },
        { heading: 'Where you are now', links: [
          { label: 'Starting my career', href: '/search?type=course&level=beginner' },
          { label: 'Moving into renewables', href: '/topics/solar' },
          { label: 'Growing in my current role', href: '/search?type=course&level=advanced' },
        ] },
      ],
      footer: [{ label: 'Explore all roles', href: '/roles' }],
    },
    {
      name: 'Library',
      title: 'Articles, research and media',
      groups: [
        { heading: 'Learn', links: [
          { label: 'GeAcademy', href: '/geacademy' },
          { label: 'Live sessions', href: '/live-sessions' },
          { label: 'Videos', href: '/videos' },
          { label: 'Podcasts', href: '/podcasts' },
          { label: 'Blog', href: '/blog' },
        ] },
        { heading: 'Reference', links: [
          { label: 'Research', href: '/research' },
          { label: 'Whitepapers', href: '/whitepapers' },
          { label: 'Policies & Tenders', href: '/policies-tenders' },
        ] },
      ],
      footer: [{ label: 'Browse the library', href: '/search' }],
    },
    {
      name: 'Companies',
      title: 'Verified companies',
      groups: [
        { heading: 'Publishing on GeLearn', links: data.companies.map(c => ({ label: c.name, href: `/c/${c.slug}` })) },
        { heading: 'For companies', links: [
          { label: 'GeLearn for Companies', href: '/for-companies' },
          { label: 'Company Studio', href: '/studio' },
        ] },
      ],
      footer: [{ label: 'All companies', href: '/companies' }],
    },
  ]
}

/**
 * The header's Explore button and its two-pane menu: categories on the left,
 * that category's grouped links on the right. Hover or click switches
 * category; arrow keys move through categories; Escape closes.
 */
export function ExploreMenu() {
  const data = useExploreMenu()
  const cats = categories(data)
  const location = useLocation()
  // The page the menu was opened on: navigating anywhere closes it, with no effect needed.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === location.key
  const setOpen = (next: boolean) => setOpenOn(next ? location.key : null)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const catRefs = useRef<(HTMLButtonElement | null)[]>([])
  const hoverTimer = useRef<number | undefined>(undefined)
  const baseId = useId()

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenOn(null)
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenOn(null)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (open) catRefs.current[active]?.focus({ preventScroll: true })
    // Focus the active category only when the menu opens, not on every switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function onCategoryKey(e: KeyboardEvent<HTMLUListElement>) {
    const n = cats.length
    const move = { ArrowDown: 1, ArrowUp: -1 }[e.key] ?? (window.innerWidth < 768 ? { ArrowRight: 1, ArrowLeft: -1 }[e.key] : undefined)
    let next: number | undefined
    if (move) next = (active + move + n) % n
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = n - 1
    else if (e.key === 'ArrowRight') {
      e.preventDefault()
      document.getElementById(`${baseId}-pane`)?.querySelector('a')?.focus()
      return
    }
    if (next === undefined) return
    e.preventDefault()
    setActive(next)
    catRefs.current[next]?.focus()
  }

  const current = cats[active]

  return (
    <div ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={`${baseId}-menu`}
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center gap-0.5 rounded-lg border bg-white py-1.5 pr-2 pl-3.5 text-sm font-bold transition-colors',
          open ? 'border-primary text-sky-700' : 'border-border text-text-primary hover:border-primary hover:text-sky-700',
        )}
      >
        Explore
        <ExpandMoreIcon sx={{ fontSize: 20 }} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <nav
          id={`${baseId}-menu`}
          aria-label="Explore GeLearn"
          className="max-h-below-header absolute inset-x-0 top-full overflow-y-auto border-y border-border bg-white shadow-xl shadow-slate-900/10"
        >
          <span className="block h-0.5 gradient-brand" aria-hidden="true" />
          <div className="mx-auto max-w-330 px-4 md:flex md:px-6">
            <ul
              role="tablist"
              aria-orientation="vertical"
              aria-label="Explore categories"
              onKeyDown={onCategoryKey}
              className="scrollbar-hidden flex gap-1 overflow-x-auto border-b border-border py-3 md:w-56 md:shrink-0 md:flex-col md:gap-0 md:border-r md:border-b-0 md:py-5"
            >
              {cats.map((cat, i) => (
                <li key={cat.name} role="presentation">
                  <button
                    ref={el => { catRefs.current[i] = el }}
                    type="button"
                    role="tab"
                    id={`${baseId}-cat-${i}`}
                    aria-selected={i === active}
                    aria-controls={`${baseId}-pane`}
                    tabIndex={i === active ? 0 : -1}
                    onClick={() => setActive(i)}
                    onPointerEnter={e => {
                      if (e.pointerType === 'touch') return
                      window.clearTimeout(hoverTimer.current)
                      hoverTimer.current = window.setTimeout(() => setActive(i), 90)
                    }}
                    onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3.5 py-2 text-left text-sm font-semibold transition-colors',
                      'md:-mr-px md:rounded-none md:border-r-2 md:py-2.5 md:pr-4 md:pl-0',
                      i === active
                        ? 'bg-surface text-sky-700 md:border-primary md:bg-transparent md:font-bold'
                        : 'text-slate-700 hover:text-text-primary md:border-transparent',
                    )}
                  >
                    {cat.name}
                    <ChevronRightIcon sx={{ fontSize: 18 }} className={cn('hidden md:block', i === active ? 'opacity-100' : 'opacity-0')} />
                  </button>
                </li>
              ))}
            </ul>

            {current && (
              <div id={`${baseId}-pane`} role="tabpanel" aria-labelledby={`${baseId}-cat-${active}`} className="flex min-h-72 min-w-0 flex-1 flex-col gap-5 py-5 md:py-6 md:pl-8">
                <h3 className="text-xl font-extrabold text-text-primary">{current.title}</h3>
                <div className="grid grid-cols-1 gap-x-7 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                  {current.groups.filter(g => g.links.length > 0).map(group => (
                    <div key={group.heading}>
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">{group.heading}</h4>
                      <ul className="grid">
                        {group.links.map(link => (
                          <li key={link.href + link.label}>
                            <Link to={link.href} className="block py-1 text-sm font-semibold text-text-primary hover:text-sky-700 hover:underline hover:underline-offset-2">
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-3.5">
                  {current.footer.map(link => (
                    <Link key={link.href} to={link.href} className="inline-flex items-center gap-0.5 text-sm font-bold text-sky-700 hover:text-sky-800">
                      {link.label} <ArrowForwardIcon sx={{ fontSize: 18 }} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
      )}
    </div>
  )
}
