import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

/** Resolves a Wagtail image/document URL (relative, e.g. /media/images/x.jpg) against the backend host. */
export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${API_BASE}${url}`
}

/** True for an absolute URL (e.g. a cross-origin GeLearn subdomain link) vs an internal route. */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

/** YouTube/Vimeo watch URL → its embeddable iframe URL, or null if it's neither (e.g. a direct file/CDN link). */
export function embedVideoUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

/** "3 days ago" style relative time for dashboard timestamps. */
export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
  const diffWeek = Math.round(diffDay / 7)
  if (diffWeek < 5) return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`
  const diffMonth = Math.round(diffDay / 30)
  if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`
  const diffYear = Math.round(diffDay / 365)
  return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`
}
