import { useEffect, useState } from 'react'
import { PageMeta } from '@/components/seo/PageMeta'
import { apiFetch } from '@/lib/api/client'
import { renderStreamField } from '@/lib/streamfield/renderStreamField'
import { blockRegistry, pageHeadingBlockId } from '@/lib/streamfield/blockRegistry'
import { PageHero } from '@/components/ui/PageHero'
import NotFound from './NotFound'
import type { SectionPageData, WagtailListResponse } from '@/types/api'
import { PageSkeleton } from '@/components/ui/PageSkeleton'

interface DynamicSectionPageProps {
  /** The SectionPage's own slug — e.g. "portfolio", "innovations", "about". */
  sectionSlug: string
  fallbackTitle: string
  fallbackDescription: string
}

export default function DynamicSectionPage({ sectionSlug, fallbackTitle, fallbackDescription }: DynamicSectionPageProps) {
  // Each result remembers the section it was loaded for; anything older counts as still loading.
  const [loaded, setLoaded] = useState<{ slug: string; page: SectionPageData | null } | null>(null)

  useEffect(() => {
    apiFetch<WagtailListResponse<SectionPageData>>(
      `/api/v2/pages/?type=pages.SectionPage&slug=${sectionSlug}&fields=*&limit=1`
    )
      .then(res => setLoaded({ slug: sectionSlug, page: res.items[0] ?? null }))
      .catch(() => setLoaded({ slug: sectionSlug, page: null }))
  }, [sectionSlug])

  const page = loaded?.slug === sectionSlug ? loaded.page : undefined

  if (page === undefined) return <PageSkeleton />
  // Not created (or not published) in the CMS yet: say so instead of a blank page.
  if (page === null) return <NotFound />

  const body = page.hide_footer_cta ? page.body.filter(b => b.type !== 'cta') : page.body
  const headingBlock = pageHeadingBlockId(body)

  return (
    <main>
      <PageMeta
        title={page.seo_title || fallbackTitle}
        description={page.search_description || fallbackDescription}
        canonical={`/${sectionSlug}`}
      />
      {/* Nothing in the body gives the page its <h1> — show the page title. */}
      {!headingBlock && <PageHero label="Genex Technocrats" headline={page.title} subline={page.search_description || undefined} />}
      {renderStreamField(body, blockRegistry, headingBlock)}
    </main>
  )
}
