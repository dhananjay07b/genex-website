import { Link } from 'react-router-dom'
import EmailIcon from '@mui/icons-material/Email'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { MARKETING_URL } from '@/lib/host'

const SECTION_LINKS = [
  { label: 'Technology Deep Dives', href: '/technology' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Tenders & Opportunities', href: '/tenders' },
  { label: 'Whitepapers & Reports', href: '/whitepapers' },
  { label: 'Video Library', href: '/videos' },
  { label: 'Blog & Insights', href: '/blog' },
  { label: 'Podcasts & Interviews', href: '/podcasts' },
]

export function GeLearnFooter() {
  return (
    <footer className="bg-white border-t border-border" aria-label="GeLearn footer">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img src="/images/logo/logo-on-light.svg" alt="Genex Technocrats" className="h-8 w-auto" />
              <span className="text-base font-extrabold text-text-primary">GeLearn</span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-70">
              The engineering knowledge hub from Genex Technocrats — case studies, technical deep dives, and community insights on India's power infrastructure.
            </p>
            <a
              href={MARKETING_URL}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Visit genextechnocrats.com <OpenInNewIcon style={{ fontSize: 14 }} />
            </a>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">Explore</h3>
            <ul className="space-y-2.5">
              {SECTION_LINKS.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-text-muted hover:text-text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">Contact</h3>
            <a
              href="mailto:info@genextechnocrats.com"
              className="flex items-center gap-2.5 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <EmailIcon sx={{ fontSize: 14 }} className="shrink-0 text-primary" />
              info@genextechnocrats.com
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Genex Technocrats Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
