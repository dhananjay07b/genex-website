import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MegaMenu } from './MegaMenu'
import type { NavItem } from '@/types/navigation'

interface DesktopNavProps {
  items: NavItem[]
}

export function DesktopNav({ items }: DesktopNavProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const navRef = useRef<HTMLUListElement>(null)
  const location = useLocation()

  const close = useCallback(() => setOpenIndex(null), [])

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
    return false
  }

  return (
    <ul ref={navRef} className="hidden lg:flex items-center gap-1" role="menubar">
      {items.map((item, i) => {
        const hasDropdown = !!item.dropdown
        const active = isActive(item)
        const open = openIndex === i

        return (
          <li key={item.label} className="relative" role="none">
            {hasDropdown ? (
              <button
                role="menuitem"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : i)}
                onMouseEnter={() => setOpenIndex(i)}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  active
                    ? 'text-primary'
                    : 'text-text-primary hover:text-primary hover:bg-surface'
                )}
              >
                {item.label}
                <ChevronDown
                  size={14}
                  className={cn(
                    'transition-transform duration-150 text-text-muted',
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
                className={cn(
                  'relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  active
                    ? 'text-primary'
                    : 'text-text-primary hover:text-primary hover:bg-surface'
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            )}

            {hasDropdown && item.dropdown && (
              <div onMouseLeave={close}>
                <MegaMenu dropdown={item.dropdown} isOpen={open} />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
