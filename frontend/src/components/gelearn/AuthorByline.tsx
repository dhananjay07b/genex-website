import type { ReactNode } from 'react'
import { CompanyBadge } from './CompanyBadge'
import type { CompanyDisplay } from '@/types/auth'

interface AuthorBylineProps {
  /** What was published — "Post", "Video", "Course"… */
  kind: string
  /** The author's name, already wrapped in whatever hover/link behaviour the page needs. */
  name: ReactNode
  company: CompanyDisplay | null
}

/**
 * Person first, company second — "Post by Jane Doe · [logo] Google ✓".
 * The logo and verified tick appear only for verified companies; an
 * unverified or unlisted company is plain text ("Post by Jane Doe · Acme").
 */
export function AuthorByline({ kind, name, company }: AuthorBylineProps) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
      <span>{kind} by {name}</span>
      {company && (
        <>
          <span aria-hidden="true">·</span>
          <CompanyBadge company={company} />
        </>
      )}
    </span>
  )
}
