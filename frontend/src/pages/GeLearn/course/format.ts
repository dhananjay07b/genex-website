import type { CourseItemKind } from '@/types/learning'

export const LEVEL_LABEL: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

const KIND_WORDS: Record<CourseItemKind, [string, string]> = {
  video: ['video', 'videos'],
  post: ['blog post', 'blog posts'],
  article: ['GeAcademy article', 'GeAcademy articles'],
  research: ['research piece', 'research pieces'],
  whitepaper: ['whitepaper', 'whitepapers'],
  podcast: ['podcast', 'podcasts'],
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

/** "10 videos and 8 blog posts" from the lesson counts, biggest first. */
export function lessonFormats(counts: Partial<Record<CourseItemKind, number>>): string {
  const parts = (Object.entries(counts) as [CourseItemKind, number][])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([kind, n]) => plural(n, ...KIND_WORDS[kind]))
  if (parts.length <= 1) return parts[0] ?? ''
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

/** "4 h 6 min", "45 min"; empty for 0. */
export function formatMinutes(minutes: number): string {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return [h ? `${h} h` : '', m ? `${m} min` : ''].filter(Boolean).join(' ')
}

/** "About 4 hours" style, for the course's total time. */
export function aboutTime(minutes: number): string {
  if (!minutes) return ''
  if (minutes < 60) return `About ${minutes} min`
  const hours = Math.round(minutes / 30) / 2
  return `About ${hours} hour${hours === 1 ? '' : 's'}`
}

export const monthYear = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

export const longDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?'

/** The section ids the tab bar jumps to, in page order. */
export const SECTIONS = [
  ['cp-about', 'About'],
  ['cp-path', 'Career path'],
  ['cp-lessons', 'Lessons'],
  ['cp-reviews', 'Reviews'],
  ['cp-more', 'More courses'],
  ['cp-faq', 'FAQ'],
] as const
export type SectionId = (typeof SECTIONS)[number][0]

/** Paid lessons inside a free or members course: they must be bought to complete it (and get the certificate). */
export const paidLessons = (course: { access: string; items: { access: string }[] }) =>
  course.access === 'paid' ? 0 : course.items.filter(item => item.access === 'paid').length

export const paidLessonNote = (n: number) =>
  `${n === 1 ? '1 lesson is' : `${n} lessons are`} paid: buy ${n === 1 ? 'it' : 'them'} to complete the course and get the certificate.`
