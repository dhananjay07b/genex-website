import { useEffect, useState } from 'react'
import { PageMeta } from '@/components/seo/PageMeta'
import { apiFetch } from '@/lib/api/client'
import { renderStreamField } from '@/lib/streamfield/renderStreamField'
import { blockRegistry } from '@/lib/streamfield/blockRegistry'
import type { SectionPageData, WagtailListResponse } from '@/types/api'

export default function About() {
  const [page, setPage] = useState<SectionPageData | null | undefined>(undefined)

  useEffect(() => {
    apiFetch<WagtailListResponse<SectionPageData>>('/api/v2/pages/?type=pages.SectionPage&slug=about&fields=*&limit=1')
      .then(res => setPage(res.items[0] ?? null))
      .catch(() => setPage(null))
  }, [])

  if (page === undefined) return null

  const body = page?.hide_footer_cta ? (page?.body ?? []).filter(b => b.type !== 'cta') : page?.body ?? []

  return (
    <main>
      <PageMeta
        title={page?.meta_title || "About Genex Technocrats — India's Energy Intelligence Platform"}
        description={page?.meta_description || "Genex Technocrats builds the software and systems that run India's renewable energy infrastructure."}
        canonical="/about"
      />
      {renderStreamField(body, blockRegistry)}
    </main>
  )
}
