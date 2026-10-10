import { useEffect, useState } from 'react'
import { PageMeta } from '@/components/seo/PageMeta'
import { apiFetch } from '@/lib/api/client'
import { renderStreamField } from '@/lib/streamfield/renderStreamField'
import { blockRegistry } from '@/lib/streamfield/blockRegistry'
import type { SectionPageData, WagtailListResponse } from '@/types/api'

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

  if (page === undefined) return null

  const body = page?.hide_footer_cta ? (page?.body ?? []).filter(b => b.type !== 'cta') : page?.body ?? []

  return (
    <main>
      <PageMeta
        title={page?.seo_title || fallbackTitle}
        description={page?.search_description || fallbackDescription}
        canonical={`/${sectionSlug}`}
      />
      {renderStreamField(body, blockRegistry)}
    </main>
  )
}
