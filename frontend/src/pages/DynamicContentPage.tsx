import { useEffect, useState } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { PageMeta } from '@/components/seo/PageMeta'
import { renderStreamField } from '@/lib/streamfield/renderStreamField'
import { blockRegistry } from '@/lib/streamfield/blockRegistry'
import { resolveContentPage } from '@/lib/streamfield/resolveContentPage'
import type { ContentPageData } from '@/types/api'

interface DynamicContentPageProps {
  /** The SectionPage's own slug — e.g. "portfolio", "innovations", "about". */
  sectionSlug: string
  /** Fallback route to redirect to if the page can't be resolved. */
  fallbackPath: string
}

export default function DynamicContentPage({ sectionSlug, fallbackPath }: DynamicContentPageProps) {
  const location = useLocation()
  const [page, setPage] = useState<ContentPageData | null | undefined>(undefined)

  const innerSegments = location.pathname
    .split('/')
    .filter(Boolean)
    .slice(1) // drop the leading section segment (e.g. "portfolio")

  useEffect(() => {
    setPage(undefined)
    if (innerSegments.length === 0) { setPage(null); return }
    resolveContentPage(sectionSlug, innerSegments)
      .then(result => setPage(result))
      .catch(() => setPage(null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  if (page === undefined) return null
  if (page === null) return <Navigate to={fallbackPath} replace />

  const body = page.hide_footer_cta ? page.body.filter(b => b.type !== 'cta') : page.body

  return (
    <main>
      <PageMeta
        title={page.seo_title || page.title}
        description={page.search_description || ''}
        canonical={location.pathname}
        image={page.icon_url}
      />
      {renderStreamField(body, blockRegistry)}
    </main>
  )
}
