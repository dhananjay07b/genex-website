import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import VerifiedIcon from '@mui/icons-material/Verified'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageMeta } from '@/components/seo/PageMeta'
import { AccessBadge } from '@/components/gelearn/AccessBadge'
import { apiFetch } from '@/lib/api/client'
import { formatDisplayDate, getMediaUrl } from '@/lib/utils'
import type { CompanyPageData } from '@/types/company'

// Section → its GeLearn listing, for "View all".
const SECTION_HREF: Record<string, string> = {
  geacademy: '/geacademy',
  research: '/research',
  policies_tenders: '/policies-tenders',
  whitepapers: '/whitepapers',
  podcasts: '/podcasts',
}

export default function CompanyPage() {
  const { slug } = useParams<{ slug: string }>()
  const [company, setCompany] = useState<CompanyPageData | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    apiFetch<CompanyPageData>(`/api/organizations/companies/${slug}/`)
      .then(data => { if (!cancelled) setCompany(data) })
      .catch(() => { if (!cancelled) setCompany(null) })
    return () => { cancelled = true }
  }, [slug])

  if (company === undefined) return <div className="min-h-screen" />
  if (company === null) return <Navigate to="/" replace />

  const nothingYet = company.content.length === 0 && company.courses.length === 0

  return (
    <main>
      <PageMeta
        title={`${company.name} on GeLearn`}
        description={company.description || `Research, articles, podcasts and courses from ${company.name} and its verified experts.`}
        canonical={`/c/${company.slug}`}
      />

      <section className="bg-brand-tint border-b border-border pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center gap-6">
          <span className="size-24 rounded-3xl bg-white border border-border flex items-center justify-center p-4 shrink-0">
            {company.logo_url
              ? <img src={getMediaUrl(company.logo_url)} alt={`${company.name} logo`} className="w-full h-full object-contain" />
              : <span className="text-3xl font-extrabold text-primary">{company.name.slice(0, 1)}</span>}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-2">
              <VerifiedIcon sx={{ fontSize: 15 }} /> Verified company on GeLearn
            </p>
            <h1 className="text-4xl font-extrabold text-text-primary">{company.name}</h1>
            {company.description && <p className="text-base text-text-muted leading-relaxed mt-3 max-w-3xl">{company.description}</p>}
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-3 hover:underline">
                {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')} <OpenInNewIcon sx={{ fontSize: 14 }} />
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="bg-white py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-16">
          {nothingYet && (
            <p className="text-center text-text-muted">{company.name} hasn&apos;t published on GeLearn yet.</p>
          )}

          {company.courses.length > 0 && (
            <section>
              <h2 className="text-2xl font-extrabold text-text-primary mb-6">Courses by {company.name} experts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {company.courses.map(course => (
                  <Link key={course.slug} to={`/courses/${course.slug}`}
                    className="group border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-sm transition-all">
                    <span className="relative flex aspect-video bg-brand-tint items-center justify-center">
                      {course.cover_url
                        ? <img src={getMediaUrl(course.cover_url)} alt="" className="w-full h-full object-cover" />
                        : <SchoolOutlinedIcon sx={{ fontSize: 36 }} className="text-primary/40" />}
                      <AccessBadge access={course.access} price={course.price} currency={course.currency} className="absolute top-3 right-3" />
                    </span>
                    <span className="block p-4">
                      <span className="block font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">{course.title}</span>
                      <span className="block text-xs text-text-muted mt-1">by {course.owner_name}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {company.content.map(section => (
            <section key={section.key}>
              <div className="flex items-end justify-between gap-4 mb-6">
                <h2 className="text-2xl font-extrabold text-text-primary">
                  {section.label} <span className="text-base font-bold text-text-muted">({section.count})</span>
                </h2>
                {SECTION_HREF[section.key] && (
                  <Link to={SECTION_HREF[section.key]} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline shrink-0">
                    All {section.label} <ArrowForwardIcon sx={{ fontSize: 15 }} />
                  </Link>
                )}
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map(item => (
                  <li key={item.id}>
                    <Link to={item.path} className="group flex gap-3 border border-border rounded-2xl p-3 h-full hover:border-primary/40 transition-colors">
                      {item.image_url && (
                        <img src={getMediaUrl(item.image_url)} alt="" className="size-16 rounded-xl object-cover shrink-0" />
                      )}
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors">{item.title}</span>
                        <span className="block text-xs text-text-muted mt-1 truncate">
                          {[item.meta, item.date ? formatDisplayDate(item.date) : ''].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {company.experts.length > 0 && (
            <section>
              <h2 className="text-2xl font-extrabold text-text-primary mb-2">Verified experts</h2>
              <p className="text-sm text-text-muted mb-6">Professionals who confirmed a {company.name} email and publish on GeLearn.</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {company.experts.map(expert => (
                  <li key={expert.username}>
                    <Link to={`/u/${expert.username}`} className="group flex items-center gap-3 border border-border rounded-2xl p-4 hover:border-primary/40 transition-colors">
                      <span className="size-12 rounded-full bg-primary text-white font-bold flex items-center justify-center overflow-hidden shrink-0">
                        {expert.avatar_url
                          ? <img src={getMediaUrl(expert.avatar_url)} alt="" className="w-full h-full object-cover" />
                          : (expert.display_name || expert.username).slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1 text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                          <span className="truncate">{expert.display_name || expert.username}</span>
                          <VerifiedIcon sx={{ fontSize: 14 }} className="text-primary shrink-0" />
                        </span>
                        {expert.role_title && <span className="block text-xs text-text-muted truncate">{expert.role_title}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
