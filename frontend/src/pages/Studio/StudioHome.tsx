import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { PageMeta } from '@/components/seo/PageMeta'
import { apiFetch } from '@/lib/api/client'
import type { StudioCompany } from '@/types/studio'
import { STUDIO_TYPES } from './studioTypes'

export default function StudioHome() {
  const [company, setCompany] = useState<StudioCompany | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    apiFetch<StudioCompany>('/api/studio/company/').then(setCompany).catch(() => setFailed(true))
  }, [])

  return (
    <div className="flex flex-col gap-7">
      <PageMeta title="Company Studio — Genex GeLearn" description="Publish your company's content on GeLearn." canonical="/studio" />

      <div>
        <h2 className="text-xl font-extrabold text-text-primary">What would you like to publish?</h2>
        <p className="text-sm text-text-muted mt-1">
          Everything you publish goes live immediately under your company&apos;s name and verified badge.
        </p>
        {company?.website && (
          <a href={company.website} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-2 hover:underline">
            {company.website.replace(/^https?:\/\//, '')} <OpenInNewIcon sx={{ fontSize: 12 }} />
          </a>
        )}
        {failed && <p className="text-sm text-red-600 mt-2">Couldn&apos;t load your company details. Refresh to try again.</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STUDIO_TYPES.map(type => {
          const Icon = type.icon
          return (
            <div key={type.key} className="border border-border rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-3.5">
                <span className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon sx={{ fontSize: 22 }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-bold text-text-primary">{type.label}</p>
                    <span className="text-sm font-extrabold text-text-primary">{company ? company.counts[type.countKey] : '–'}</span>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed mt-1">{type.description}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                <Link to={`/studio/${type.key}/new`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary text-white text-sm font-bold py-2 hover:opacity-90 transition-opacity">
                  <AddIcon sx={{ fontSize: 16 }} /> New
                </Link>
                <Link to={`/studio/${type.key}`}
                  className="flex-1 inline-flex items-center justify-center rounded-full border border-border text-sm font-bold text-text-primary py-2 hover:border-primary hover:text-primary transition-colors">
                  Manage
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
