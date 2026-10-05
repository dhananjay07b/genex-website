import { Link } from 'react-router-dom'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { marketingPath } from '@/lib/host'
import { useExploreMenu } from '@/hooks/useExploreMenu'

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

const LEARN: FooterLink[] = [
  { label: 'Courses', href: '/courses' },
  { label: 'Live sessions', href: '/live-sessions' },
  { label: 'GeAcademy', href: '/geacademy' },
  { label: 'Research', href: '/research' },
  { label: 'Policies & Tenders', href: '/policies-tenders' },
  { label: 'Whitepapers', href: '/whitepapers' },
  { label: 'Videos', href: '/videos' },
  { label: 'Blog', href: '/blog' },
  { label: 'Podcasts', href: '/podcasts' },
]

const COMMUNITY: FooterLink[] = [
  { label: 'Become a Professional', href: '/for-professionals' },
  { label: 'GeLearn for Companies', href: '/for-companies' },
  { label: 'Verified companies', href: '/companies' },
  { label: 'Leading Professionals', href: '/professionals' },
]

const GENEX: FooterLink[] = [
  { label: 'About Genex', href: marketingPath('/about'), external: true },
  { label: 'Portfolio', href: marketingPath('/portfolio'), external: true },
  { label: 'Innovations', href: marketingPath('/innovations'), external: true },
  { label: 'Careers', href: marketingPath('/careers'), external: true },
  { label: 'Contact', href: marketingPath('/contact'), external: true },
]

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-extrabold text-text-primary">{title}</h3>
      <ul className="grid gap-2">
        {links.map(link => (
          <li key={link.href}>
            {link.external ? (
              <a href={link.href} className="text-sm text-text-muted transition-colors hover:text-sky-700">{link.label}</a>
            ) : (
              <Link to={link.href} className="text-sm text-text-muted transition-colors hover:text-sky-700">{link.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** GeLearn's light footer: brand, topics, learning sections, community and Genex links. */
export function GeLearnFooter() {
  const { topic_groups } = useExploreMenu()
  // The first topic of each group, then the rest, up to seven: a cross-section of the sector.
  const firsts = topic_groups.flatMap(g => g.topics.slice(0, 1))
  const rest = topic_groups.flatMap(g => g.topics.slice(1))
  const topics: FooterLink[] = [...firsts, ...rest].slice(0, 7).map(t => ({ label: t.name, href: `/topics/${t.slug}` }))

  return (
    <footer className="border-t border-border bg-slate-50" aria-label="GeLearn footer">
      <div className="mx-auto grid max-w-330 grid-cols-2 gap-8 px-4 pt-12 pb-8 md:px-6 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-1">
          <Link to="/" className="inline-flex items-center gap-1.5">
            <img src="/favicon1:1.svg" alt="" className="h-10 w-auto" />
            <span className="text-lg font-extrabold text-text-primary">GeLearn</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-text-muted">
            The learning platform of Genex Technocrats Pvt. Ltd., built for the power, energy and automation sector.
          </p>
        </div>
        <FooterColumn title="Topics" links={[...topics, { label: 'All topics', href: '/topics' }]} />
        <FooterColumn title="Learn" links={LEARN} />
        <FooterColumn title="Community" links={COMMUNITY} />
        <FooterColumn title="Genex" links={GENEX} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-330 flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-text-muted md:px-6">
          <span>© {new Date().getFullYear()} Genex Technocrats Pvt. Ltd. All rights reserved.</span>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="mailto:info@genextechnocrats.com" className="hover:text-text-primary">info@genextechnocrats.com</a>
            <a href={marketingPath()} className="inline-flex items-center gap-1 hover:text-text-primary">
              genextechnocrats.com <OpenInNewIcon sx={{ fontSize: 12 }} />
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
