import type { ContentAccess } from '@/types/api'
import type { CourseFaq, CourseLevel, CourseTarget, MyCourse } from '@/types/learning'
import { timeIsEstimated } from '@/components/gelearn/courseItemKinds'

// Limits mirror backend learning.models (MAX_*); the server enforces them too.
export const LIMITS = {
  title: 200,
  summary: 220,
  line: 120,
  outcomes: 8,
  prerequisites: 5,
  modules: 20,
  moduleTitle: 120,
  moduleSummary: 300,
  faqs: 6,
  question: 200,
  answer: 1000,
  instructors: 3,
  items: 100,
  reading: 20,
} as const

/** The builder's steps, kept in the address as ?step=. */
export type StepKey = 'details' | 'curriculum' | 'reading' | 'settings'

export const LANGUAGES = ['English', 'Hindi', 'English and Hindi'] as const

export interface DraftModule {
  /** Stable React key; `id` is null until the module is saved. */
  key: string
  id: number | null
  title: string
  summary: string
  items: CourseTarget[]
}

/** Everything the builder edits, in one shape, so "unsaved changes" is a plain comparison. */
export interface Draft {
  title: string
  summary: string
  description: string
  language: string
  outcomes: string[]
  prerequisites: string[]
  level: CourseLevel
  topics: number[]
  roles: number[]
  instructors: number[]
  access: ContentAccess
  price: string
  /** Every lesson sits in a module. */
  modules: DraftModule[]
  faqs: CourseFaq[]
  /** Optional Further reading: the author's published content, after the lessons. Saved straight to the live course. */
  reading: CourseTarget[]
}

let keySeq = 0
export const newKey = () => `m${++keySeq}`

export const keyOf = (t: Pick<CourseTarget, 'kind' | 'id'>) => `${t.kind}:${t.id}`

/** A module ready to type into. A new course starts with one, so "Add lesson" is right there. */
export const blankModule = (): DraftModule => ({ key: newKey(), id: null, title: '', summary: '', items: [] })

/** A module that was never touched (no title, summary or lessons) isn't saved. */
const isBlank = (m: DraftModule) => m.id === null && !m.title.trim() && !m.summary.trim() && m.items.length === 0

export const emptyDraft = (): Draft => ({
  title: '', summary: '', description: '', language: 'English', outcomes: [], prerequisites: [],
  level: '', topics: [], roles: [], instructors: [], access: 'free', price: '',
  modules: [blankModule()], faqs: [], reading: [],
})

export function draftFromCourse(course: MyCourse): Draft {
  const modules = course.modules.map(m => ({
    key: newKey(), id: m.id, title: m.title, summary: m.summary,
    items: course.items.filter(i => i.module_id === m.id),
  }))
  return {
    title: course.title,
    summary: course.summary,
    description: course.description,
    language: course.language || 'English',
    outcomes: course.outcomes,
    prerequisites: course.prerequisites,
    level: course.level,
    topics: course.topics,
    roles: course.roles,
    instructors: course.instructors,
    access: course.access,
    price: course.price ?? '',
    modules: modules.length ? modules : [blankModule()],
    faqs: course.faqs.map(({ question, answer }) => ({ question, answer })),
    reading: course.reading ?? [],
  }
}

export const allLessons = (d: Draft) => d.modules.flatMap(m => m.items)

/** The modules that are saved: all but untouched blank ones. */
export const keptModules = (d: Draft) => d.modules.filter(m => !isBlank(m))

export const totalMinutes = (items: CourseTarget[]) => items.reduce((sum, i) => sum + (i.minutes || 0), 0)

/**
 * A lesson's detail line: its type, its stored detail (length, read time, pages,
 * or a blog post's topic), and an "about N min" estimate only where that detail
 * isn't already a time (blog posts and whitepapers).
 */
export function lessonDetail(item: CourseTarget, kindLabel: string): string {
  const estimate = timeIsEstimated(item) && item.minutes ? `about ${formatMinutes(item.minutes)}` : ''
  return [kindLabel, item.meta, estimate].filter(Boolean).join(' · ')
}

export function formatMinutes(minutes: number): string {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return [h ? `${h} h` : '', m ? `${m} min` : ''].filter(Boolean).join(' ')
}

const clean = (lines: string[]) => lines.map(l => l.trim()).filter(Boolean)
const cleanFaqs = (faqs: CourseFaq[]) =>
  faqs.map(f => ({ question: f.question.trim(), answer: f.answer.trim() })).filter(f => f.question && f.answer)

/** Comparable snapshots, so edits that are only whitespace or empty rows don't count as changes. */
const metaOf = (d: Draft) => JSON.stringify({
  title: d.title.trim(), summary: d.summary.trim(), description: d.description.trim(), language: d.language,
  outcomes: clean(d.outcomes), prerequisites: clean(d.prerequisites), level: d.level, topics: d.topics,
  roles: d.roles, instructors: d.instructors, access: d.access, price: d.access === 'paid' ? d.price : '',
})
const outlineOf = (d: Draft) => JSON.stringify(
  keptModules(d).map(m => ({ id: m.id, title: m.title.trim(), summary: m.summary.trim(), items: m.items.map(keyOf) })),
)
const faqsOf = (d: Draft) => JSON.stringify(cleanFaqs(d.faqs))
const readingOf = (d: Draft) => JSON.stringify(d.reading.map(keyOf))

export function changes(saved: Draft, current: Draft) {
  const meta = metaOf(saved) !== metaOf(current)
  const outline = outlineOf(saved) !== outlineOf(current)
  const faqs = faqsOf(saved) !== faqsOf(current)
  const reading = readingOf(saved) !== readingOf(current)
  return { meta, outline, faqs, reading, any: meta || outline || faqs || reading }
}

/**
 * Edits that send a live course back to Genex for review (backend REVIEWED_FIELDS,
 * plus new or reworded modules and changed FAQs). Reordering and moving lessons don't.
 */
export function needsReview(saved: Draft, current: Draft): boolean {
  const promised = (d: Draft) => JSON.stringify({
    title: d.title.trim(), summary: d.summary.trim(), description: d.description.trim(),
    outcomes: clean(d.outcomes), prerequisites: clean(d.prerequisites),
    access: d.access, price: d.access === 'paid' ? d.price : '',
  })
  const savedModules = new Map(saved.modules.filter(m => m.id !== null).map(m => [m.id, m]))
  const reworded = keptModules(current).some(m => {
    const before = m.id === null ? undefined : savedModules.get(m.id)
    return !before || before.title.trim() !== m.title.trim() || before.summary.trim() !== m.summary.trim()
  })
  // A lesson Genex hasn't reviewed yet holds the outline for review too.
  const newLesson = allLessons(current).some(i => i.kind === 'lesson' && i.approved === false)
  return promised(saved) !== promised(current) || reworded || newLesson || faqsOf(saved) !== faqsOf(current)
}

export function metaPayload(d: Draft, includeInstructors: boolean) {
  return {
    title: d.title.trim(),
    summary: d.summary.trim(),
    description: d.description,
    language: d.language,
    outcomes: clean(d.outcomes),
    prerequisites: clean(d.prerequisites),
    level: d.level,
    topics: d.topics,
    roles: d.roles,
    access: d.access,
    price: d.access === 'paid' ? d.price : null,
    ...(includeInstructors ? { instructors: d.instructors } : {}),
  }
}

const ref = ({ kind, id }: CourseTarget) => ({ kind, id })

export function outlinePayload(d: Draft) {
  return {
    modules: keptModules(d).map(m => ({ id: m.id, title: m.title.trim(), summary: m.summary.trim(), items: m.items.map(ref) })),
    loose_items: [],
  }
}

export const faqsPayload = (d: Draft) => cleanFaqs(d.faqs)

export const readingPayload = (d: Draft) => ({ items: d.reading.map(ref) })

/** Moves one row of a list to another position. */
export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [row] = next.splice(from, 1)
  next.splice(to, 0, row)
  return next
}

export const fieldClass =
  'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'

/** Every lesson in the outline passed through `fn`; returning null removes it. */
export function mapItems(d: Draft, fn: (item: CourseTarget) => CourseTarget | null): Draft {
  const keep = (items: CourseTarget[]) => items.map(fn).filter((item): item is CourseTarget => item !== null)
  return { ...d, modules: d.modules.map(m => ({ ...m, items: keep(m.items) })) }
}
