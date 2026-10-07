import type { SectionId } from './format'

export const GAP = 16

/** Height of everything stuck to the top: the fixed GeLearn header plus the course tab bar. */
export function stuckHeight(bar: HTMLElement | null) {
  const header = document.querySelector('header')
  return (header?.getBoundingClientRect().height ?? 96) + (bar?.offsetHeight ?? 48)
}

/** Scrolls so a section's heading sits just below the header and tab bar. */
export function jumpTo(id: SectionId, bar: HTMLElement | null) {
  const section = document.getElementById(id)
  if (!section) return
  const top = section.getBoundingClientRect().top + window.scrollY - stuckHeight(bar) - GAP
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
}
