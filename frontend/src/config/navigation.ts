import type { NavConfig } from '@/types/navigation'

/**
 * Last-resort fallback ONLY — used if useNavConfig() (src/hooks/useNavConfig.ts)
 * can't reach the CMS at all (e.g. backend unreachable) before first render.
 * In normal operation the entire `items` list — which top-level entries
 * exist, their labels, and their dropdowns — is replaced wholesale with
 * whatever's live in the Wagtail page tree (any page with "Show in menus"
 * checked). Nothing here reflects real content; don't add new sections to
 * this list expecting them to appear in the live nav.
 */
export const navConfig: NavConfig = {
  items: [
    {
      label: 'Contact',
      href: '/contact',
    },
    {
      label: 'Careers',
      href: '/careers',
    },
  ],
  cta: {
    label: 'Request Demo',
    href: '/contact#demo',
  },
  contact: {
    phone: '+91 00000 00000',
    whatsapp: 'https://wa.me/910000000000',
  },
}
