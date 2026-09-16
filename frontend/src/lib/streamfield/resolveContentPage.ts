import { apiFetch } from '@/lib/api/client'
import type { ContentPageData, SectionPageData, WagtailListResponse } from '@/types/api'

/**
 * Resolves a ContentPage by walking the URL path segment-by-segment, scoped
 * by `child_of` at each level. Wagtail slugs are only unique among siblings,
 * not globally, so a bare `?slug=` lookup can silently match the wrong page
 * once ContentPage nesting is more than one level deep (or once two
 * sections happen to reuse the same inner-page slug) — this avoids that.
 */
export async function resolveContentPage(
  sectionSlug: string,
  innerSegments: string[],
): Promise<ContentPageData | null> {
  const sectionRes = await apiFetch<WagtailListResponse<SectionPageData>>(
    `/api/v2/pages/?type=pages.SectionPage&slug=${sectionSlug}&fields=*&limit=1`
  )
  const section = sectionRes.items[0]
  if (!section || innerSegments.length === 0) return null

  let parentId = section.id
  let resolved: ContentPageData | null = null

  for (const segment of innerSegments) {
    const res = await apiFetch<WagtailListResponse<ContentPageData>>(
      `/api/v2/pages/?type=pages.ContentPage&child_of=${parentId}&slug=${segment}&fields=tags,icon_url,meta_title,meta_description,hide_footer_cta,body&limit=1`
    )
    const page = res.items[0]
    if (!page) return null
    parentId = page.id
    resolved = page
  }

  return resolved
}
