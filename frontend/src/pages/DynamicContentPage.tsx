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
  // Each result remembers the address it was loaded for; anything older counts as still loading.
  const [loaded, setLoaded] = useState<{ path: string; page: ContentPageData | null } | null>(null)

  const innerSegments = location.pathname
    .split('/')
    .filter(Boolean)
    .slice(1) // drop the leading section segment (e.g. "portfolio")

  useEffect(() => {
    if (innerSegments.length === 0) return  // nothing to resolve: redirected below
    const path = location.pathname
    resolveContentPage(sectionSlug, innerSegments)
      .then(result => setLoaded({ path, page: result }))
      .catch(() => setLoaded({ path, page: null }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const page = loaded?.path === location.pathname ? loaded.page : undefined
  if (innerSegments.length === 0 || page === null) return <Navigate to={fallbackPath} replace />
  if (page === undefined) return null

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
