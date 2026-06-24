import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import PhoneIcon from '@mui/icons-material/Phone'
// import ChatIcon from '@mui/icons-material/Chat'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/Button'
import type { NavConfig } from '@/types/navigation'

interface MobileMenuProps {
  config: NavConfig
  solidBg?: boolean
}

export function MobileMenu({ config, solidBg = true }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    setIsOpen(false)
    setOpenSection(null)
  }, [location.pathname])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const isActive = (item: NavConfig['items'][number]) => {
    if (item.href) return location.pathname === item.href
    if (item.dropdown) {
      const firstHref = item.dropdown.sections[0]?.items[0]?.href ?? ''
      const base = firstHref.split('/')[1]
      return base ? location.pathname.startsWith(`/${base}`) : false
    }
    return false
  }

  return (
    <>
      <button
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'lg:hidden flex items-center justify-center h-10 w-10 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors',
          solidBg ? 'text-text-primary hover:bg-surface' : 'text-white hover:bg-white/10'
        )}
      >
        {isOpen ? <CloseIcon sx={{ fontSize: 22 }} /> : <MenuIcon sx={{ fontSize: 22 }} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 lg:hidden flex flex-col shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
                <span className="text-base font-bold text-text-primary">Menu</span>
                <button
                  aria-label="Close menu"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center h-9 w-9 rounded-md text-text-muted hover:text-text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </button>
              </div>

              {/* Nav items — scrollable */}
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-0.5">
                  {config.items.map((item) => {
                    const hasDropdown = !!item.dropdown
                    const isExpanded = openSection === item.label
                    const active = isActive(item)

                    return (
                      <li key={item.label}>
                        {hasDropdown ? (
                          <>
                            <button
                              aria-expanded={isExpanded}
                              onClick={() =>
                                setOpenSection(isExpanded ? null : item.label)
                              }
                              className={cn(
                                'w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                active
                                  ? 'text-primary bg-primary/5'
                                  : 'text-text-primary hover:bg-surface hover:text-primary'
                              )}
                            >
                              {item.label}
                              <KeyboardArrowDownIcon
                                sx={{ fontSize: 16 }}
                                className={cn(
                                  'text-text-muted transition-transform duration-200',
                                  isExpanded && 'rotate-180'
                                )}
                              />
                            </button>

                            <AnimatePresence initial={false}>
                              {isExpanded && item.dropdown && (
                                <motion.ul
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                                  className="overflow-hidden pl-3 mt-0.5 space-y-0.5"
                                >
                                  {item.dropdown.sections.flatMap((s) =>
                                    s.items.map((sub) => (
                                      <li key={sub.href}>
                                        <Link
                                          to={sub.href}
                                          className="flex flex-col px-3 py-2.5 rounded-lg hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
                                        >
                                          <span className="text-sm font-medium text-text-primary hover:text-primary flex items-center gap-2">
                                            {sub.label}
                                            {sub.badge && (
                                              <span className="inline-flex items-center rounded-full bg-linear-to-r from-[#1AAEE8] to-[#00D97E] px-2 py-0.5 text-[10px] font-bold text-white leading-none">
                                                {sub.badge}
                                              </span>
                                            )}
                                          </span>
                                          <span className="text-xs text-text-muted mt-0.5 leading-snug">
                                            {sub.description}
                                          </span>
                                        </Link>
                                      </li>
                                    ))
                                  )}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <Link
                            to={item.href ?? '/'}
                            className={cn(
                              'block px-3 py-3 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                              active
                                ? 'text-primary bg-primary/5'
                                : 'text-text-primary hover:bg-surface hover:text-primary'
                            )}
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* Pinned footer */}
              <div className="shrink-0 border-t border-border px-5 py-5 space-y-3">
                <Link
                  to={config.cta.href}
                  className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full justify-center')}
                >
                  {config.cta.label}
                </Link>
                {/* Uncomment after launch event:
                <a
                  href={`tel:${config.contact.phone}`}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-md border border-border text-sm font-medium text-text-primary hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <PhoneIcon sx={{ fontSize: 15 }} />
                  Call Us
                </a>
                */}
                {/* Uncomment after launch event:
                <a
                  href={config.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-md border border-border text-sm font-medium text-text-primary hover:border-[#25D366] hover:text-[#25D366] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                >
                  <ChatIcon sx={{ fontSize: 15 }} />
                  WhatsApp
                </a>
                */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
