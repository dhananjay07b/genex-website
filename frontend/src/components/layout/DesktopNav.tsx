import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { cn } from '@/lib/utils'
import { MegaMenu } from './MegaMenu'
import type { NavItem } from '@/types/navigation'

interface DesktopNavProps {
  items: NavItem[]
  solidBg?: boolean
}

export function DesktopNav({ items, solidBg = true }: DesktopNavProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const navRef = useRef<HTMLUListElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const location = useLocation()

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const close = useCallback(() => {
    cancelClose()
    setOpenIndex(null)
  }, [cancelClose])

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenIndex(null), 120)
  }, [])

  useEffect(() => {
    close()
  }, [location.pathname, close])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        close()
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [close])

  const isActive = (item: NavItem) => {
    if (item.href) return location.pathname === item.href
    if (item.dropdown) {
      const firstHref = item.dropdown.sections[0]?.items[0]?.href ?? ''
      const base = firstHref.split('/')[1]
      return base ? location.pathname.startsWith(`/${base}`) : false
    }
    return false
  }

  return (
    <ul ref={navRef} className="hidden lg:flex items-center gap-1" role="menubar">
      {items.map((item, i) => {
        const hasDropdown = !!item.dropdown
        const active = isActive(item)
        const open = openIndex === i

        return (
          <li
              key={item.label}
              className="relative"
              role="none"
            >
            {hasDropdown ? (
              <button
                role="menuitem"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : i)}
                onMouseEnter={() => { cancelClose(); setOpenIndex(i) }}
                onMouseLeave={scheduleClose}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  active
                    ? 'text-primary'
                    : solidBg
                      ? 'text-text-primary hover:text-primary'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                )}
              >
                {item.label}
                <KeyboardArrowDownIcon
                  sx={{ fontSize: 14 }}
                  className={cn(
                    'transition-transform duration-150',
                    solidBg ? 'text-text-muted' : 'text-white/60',
                    open && 'rotate-180'
                  )}
                />
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ) : (
              <Link
                to={item.href ?? '/'}
                role="menuitem"
                onMouseEnter={close}
                className={cn(
                  'relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  active
                    ? 'text-primary'
                    : solidBg
                      ? 'text-text-primary hover:text-primary'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            )}

            {hasDropdown && item.dropdown && (
              <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                <MegaMenu dropdown={item.dropdown} isOpen={open} />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
