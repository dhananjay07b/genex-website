import { useEffect, useRef, useState } from 'react'

/** Delays `active` becoming true until the pointer has hovered for `delayMs` — avoids flashing a popover on every incidental mouse-over. */
export function useHoverIntent(delayMs = 400) {
  const [active, setActive] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
  }, [])

  function onMouseEnter() {
    timeoutRef.current = window.setTimeout(() => setActive(true), delayMs)
  }

  function onMouseLeave() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setActive(false)
  }

  return { active, onMouseEnter, onMouseLeave }
}
