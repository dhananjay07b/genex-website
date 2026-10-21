import { useEffect, useState } from 'react'
import { PageMeta } from '@/components/seo/PageMeta'
import { RichText } from '@/components/ui/RichText'
import { apiFetch } from '@/lib/api/client'
import NotFound from '@/pages/NotFound'
import type { WagtailListResponse } from '@/types/api'
import { PageSkeleton } from '@/components/ui/PageSkeleton'

interface LegalPageData {
  id: number
  title: string
  meta: { slug: string }
  seo_title: string
  search_description: string
  last_updated: string | null
  body_html: string
}

/**
 * Privacy Policy, Terms of Use: a CMS "Legal Page" (pages.LegalPage) with this slug,
 * on both sites. Until it's published in the CMS, the address shows "page not found".
 */
export default function LegalPage({ slug }: { slug: string }) {
  // undefined while loading; null when there's no published page.
  const [page, setPage] = useState<LegalPageData | null | undefined>(undefined)

  useEffect(() => {
    apiFetch<WagtailListResponse<LegalPageData>>(
      `/api/v2/pages/?type=pages.LegalPage&slug=${encodeURIComponent(slug)}&fields=seo_title,search_description,last_updated,body_html`,
    )
      .then(res => setPage(res.items[0] ?? null))
      .catch(() => setPage(null))
  }, [slug])

  if (page === undefined) return <PageSkeleton />
  if (page === null) return <NotFound />

  const updated = page.last_updated
    ? new Date(`${page.last_updated}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <main className="bg-white px-6 pt-32 pb-20 lg:pb-28">
      <PageMeta title={page.seo_title || page.title} description={page.search_description || page.title} canonical={`/${slug}`} />
      <article className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">{page.title}</h1>
        {updated && <p className="mt-3 text-sm text-text-muted">Last updated {updated}</p>}
        <RichText html={page.body_html} className="mt-10 text-base leading-relaxed text-text-primary" />
      </article>
    </main>
  )
}
