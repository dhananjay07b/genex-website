import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()

  // Browsers restore the previous scroll position on back/forward nav by
  // default (history.scrollRestoration = "auto") — and that native
  // restoration runs after this component's own effect below, silently
  // undoing the scroll-to-top on every back navigation. Taking manual
  // control here makes this component the sole authority on scroll
  // position across route changes, including back/forward.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
