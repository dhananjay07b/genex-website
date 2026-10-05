import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { isExternalHref } from '@/lib/utils'

interface SectionHeadingProps {
  id?: string
  title: ReactNode
  subtitle?: string
  seeAllLabel?: string
  seeAllUrl?: string
}

/** A GeLearn section title with optional subtitle and a "Show more →" link on the right. */
export function SectionHeading({ id, title, subtitle, seeAllLabel = 'Show more', seeAllUrl }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h2 id={id} className="text-balance text-xl font-extrabold text-text-primary lg:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
      </div>
      {seeAllUrl && <SeeAllLink href={seeAllUrl}>{seeAllLabel}</SeeAllLink>}
    </div>
  )
}

export function SeeAllLink({ href, children }: { href: string; children: ReactNode }) {
  const classes = 'group inline-flex shrink-0 items-center gap-0.5 text-sm font-bold text-sky-700 hover:text-sky-800'
  const content = (
    <>
      {children}
      <ArrowForwardIcon sx={{ fontSize: 18 }} className="transition-transform group-hover:translate-x-0.5" />
    </>
  )
  return isExternalHref(href) ? <a href={href} className={classes}>{content}</a> : <Link to={href} className={classes}>{content}</Link>
}
