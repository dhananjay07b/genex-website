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
  const [page, setPage] = useState<SectionPageData | null | undefined>(undefined)

  useEffect(() => {
    setPage(undefined)
    apiFetch<WagtailListResponse<SectionPageData>>(
      `/api/v2/pages/?type=pages.SectionPage&slug=${sectionSlug}&fields=*&limit=1`
    )
      .then(res => setPage(res.items[0] ?? null))
      .catch(() => setPage(null))
  }, [sectionSlug])

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
