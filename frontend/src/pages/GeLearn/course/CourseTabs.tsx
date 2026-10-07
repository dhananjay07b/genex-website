import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { cn } from '@/lib/utils'
import { SECTIONS, type SectionId } from './format'
import { GAP, jumpTo, stuckHeight } from './scroll'

/**
 * The course page's sticky "On this page" bar. Only sections the course has
 * are listed; the highlight follows the section under the bar.
 */
export function CourseTabs({ present, barRef }: { present: Set<SectionId>; barRef: RefObject<HTMLElement | null> }) {
  const tabs = useMemo(() => SECTIONS.filter(([id]) => present.has(id)), [present])
  const [current, setCurrent] = useState<SectionId>(tabs[0]?.[0] ?? 'cp-about')
  const jumping = useRef<number | null>(null)

  useEffect(() => {
    const spy = () => {
      if (jumping.current !== null) return
      const line = stuckHeight(barRef.current) + GAP + 4
      let next = tabs[0]?.[0]
      for (const [id] of tabs) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) next = id
      }
      // At the very bottom, short last sections can never reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) next = tabs[tabs.length - 1]?.[0]
      if (next) setCurrent(next)
    }
    const onScroll = () => requestAnimationFrame(spy)
    window.addEventListener('scroll', onScroll, { passive: true })
    spy()
    return () => window.removeEventListener('scroll', onScroll)
  }, [tabs, barRef])

  if (tabs.length < 2) return null
  return (
    <nav ref={barRef as RefObject<HTMLElement>} aria-label="On this page" className="sticky top-24 z-20 border-b border-border bg-white">
      <div className="scrollbar-hidden mx-auto flex max-w-330 gap-1 overflow-x-auto px-4 md:px-6">
        {tabs.map(([id, label]) => (
          <a key={id} href={`#${id}`} aria-current={current === id ? 'true' : undefined}
            onClick={e => {
              e.preventDefault()
              setCurrent(id)
              // Ignore the scroll spy while the smooth scroll runs, so the highlight doesn't flicker.
              if (jumping.current !== null) window.clearTimeout(jumping.current)
              jumping.current = window.setTimeout(() => { jumping.current = null }, 900)
              jumpTo(id, barRef.current)
            }}
            className={cn(
              'whitespace-nowrap border-b-2 px-3 py-3 text-sm font-bold transition-colors',
              current === id ? 'border-primary text-text-primary' : 'border-transparent text-slate-700 hover:text-text-primary',
            )}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  )
}
