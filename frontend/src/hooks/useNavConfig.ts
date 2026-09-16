import { useEffect, useState } from 'react'
import { navConfig as staticNavConfig } from '@/config/navigation'
import { apiFetch } from '@/lib/api/client'
import { gelearnPath } from '@/lib/host'
import type { NavConfig, NavItem, NavSubItem } from '@/types/navigation'
import type { WagtailListResponse } from '@/types/api'

interface WagtailNavPage {
  id: number
  title: string
  meta: { type: string; slug: string }
}

interface WagtailPageDetail {
  meta: { parent: { id: number } | null }
}

const GELEARN_INDEX_TYPE = 'pages.GeLearnIndexPage'
const GELEARN_FETCH_TIMEOUT_MS = 3000

/**
 * Page types the frontend only ever routes a single, fixed instance of
 * (Careers.tsx/Contact.tsx always fetch "the" CareersPage/ContactPage with
 * no slug filter, and the router only registers one literal /careers and
 * /contact path). If an editor creates a second instance of one of these
 * types and checks "Show in menus" on it, the tree-walk below would
 * otherwise build a nav link to a URL the router has no route for at all
 * (e.g. /careers2) — so only the first instance found is ever included.
 */
const SINGLETON_PAGE_TYPES = new Set(['pages.CareersPage', 'pages.ContactPage'])

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('nav fetch timed out')), ms)),
  ])
}

/**
 * Wagtail-invisible super-root, above every Site's own root page. `parent`
 * is only exposed on the page DETAIL endpoint, not the list endpoint, so
 * this is a find-then-fetch: find any known top-level page (HomePage),
 * then read its parent id from its own detail view.
 */
async function resolveTreeRootId(): Promise<number | null> {
  const listRes = await apiFetch<WagtailListResponse<{ id: number }>>(
    '/api/v2/pages/?type=pages.HomePage&limit=1'
  )
  const homeId = listRes.items[0]?.id
  if (!homeId) return null

  const detail = await apiFetch<WagtailPageDetail>(`/api/v2/pages/${homeId}/`)
  return detail.meta.parent?.id ?? null
}

/**
 * Only pages an editor has explicitly checked "Show in menus" for (Promote
 * tab) are candidates. No `order=` param — Wagtail's default page-list
 * ordering is already tree/path order, matching admin drag-and-drop order.
 */
async function fetchMenuChildren(parentId: number): Promise<WagtailNavPage[]> {
  const res = await apiFetch<WagtailListResponse<WagtailNavPage>>(
    `/api/v2/pages/?child_of=${parentId}&show_in_menus=true&fields=*&limit=100`
  )
  return res.items
}

async function buildNavItemForPage(page: WagtailNavPage): Promise<NavItem> {
  const children = await fetchMenuChildren(page.id)

  if (children.length === 0) {
    return { label: page.title, href: `/${page.meta.slug}` }
  }

  const items: NavSubItem[] = children.map(child => ({
    label: child.title,
    href: `/${page.meta.slug}/${child.meta.slug}`,
  }))

  return { label: page.title, dropdown: { sections: [{ items }] } }
}

/**
 * GeLearn's nav branch — deliberately isolated from the rest of the
 * tree-walk (its own fetch, own timeout, own fallback) because GeLearn is
 * planned to move to a separate project. When that happens, this is the
 * ONLY function that needs to change — swap its body to call GeLearn's own
 * public nav-manifest endpoint instead of walking this backend's page tree.
 * Nothing else in this file needs to know GeLearn moved.
 */
async function fetchGeLearnNavItem(indexPageId: number, indexTitle: string): Promise<NavItem> {
  try {
    const sections = await withTimeout(fetchMenuChildren(indexPageId), GELEARN_FETCH_TIMEOUT_MS)

    if (sections.length === 0) {
      return { label: indexTitle, href: gelearnPath('/') }
    }

    return {
      label: indexTitle,
      dropdown: {
        sections: [{
          items: sections.map(s => ({ label: s.title, href: gelearnPath(`/${s.meta.slug}`) })),
        }],
      },
    }
  } catch {
    // GeLearn slow/unreachable — degrade to a plain link, never block the rest of the nav.
    return { label: indexTitle, href: gelearnPath('/') }
  }
}

/**
 * Builds the top-level nav from the live Wagtail page tree — no page type,
 * slug, or label is hardcoded (aside from the two carve-outs above: GeLearn
 * routes through a different shell, and Careers/Contact are known
 * singletons). A page becomes a dropdown trigger if it has any menu-visible
 * children, or a plain link otherwise.
 */
async function buildNavItems(rootId: number): Promise<NavItem[]> {
  const topLevel = await fetchMenuChildren(rootId)

  const geLearnPageIndex = topLevel.findIndex(p => p.meta.type === GELEARN_INDEX_TYPE)
  const geLearnPage = geLearnPageIndex !== -1 ? topLevel[geLearnPageIndex] : null

  const seenSingletons = new Set<string>()
  const treePages = topLevel.filter((page, i) => {
    if (i === geLearnPageIndex) return false
    if (SINGLETON_PAGE_TYPES.has(page.meta.type)) {
      if (seenSingletons.has(page.meta.type)) return false
      seenSingletons.add(page.meta.type)
    }
    return true
  })

  const [treeItems, geLearnItem] = await Promise.all([
    Promise.all(treePages.map(buildNavItemForPage)),
    geLearnPage ? fetchGeLearnNavItem(geLearnPage.id, geLearnPage.title) : Promise.resolve(null),
  ])

  if (geLearnItem && geLearnPageIndex !== -1) {
    // Re-insert at its original tree position so menu order doesn't shuffle.
    treeItems.splice(geLearnPageIndex, 0, geLearnItem)
  }

  return treeItems
}

/**
 * Builds the ENTIRE top-level navigation (which items exist, their labels,
 * their dropdowns) live from the Wagtail page tree — adding a new
 * SectionPage (or any page type) and checking "Show in menus" makes it
 * appear here automatically, no code change needed. Falls back to the
 * static shell in config/navigation.ts only if the fetch itself fails
 * (e.g. backend unreachable) or returns nothing at all.
 */
export function useNavConfig(): NavConfig {
  const [config, setConfig] = useState<NavConfig>(staticNavConfig)

  useEffect(() => {
    let cancelled = false

    resolveTreeRootId()
      .then(rootId => (rootId ? buildNavItems(rootId) : []))
      .then(items => {
        if (cancelled || items.length === 0) return
        setConfig(prev => ({ ...prev, items }))
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [])

  return config
}
