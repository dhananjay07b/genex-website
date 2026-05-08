import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { NavDropdown } from '@/types/navigation'

interface MegaMenuProps {
  dropdown: NavDropdown
  isOpen: boolean
}

export function MegaMenu({ dropdown, isOpen }: MegaMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-140 max-w-180 bg-white border border-border rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] z-50 overflow-hidden"
          role="menu"
          aria-label="Submenu"
        >
          {dropdown.sections.map((section, si) => (
            <div key={si} className="p-5">
              {section.title && (
                <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3 px-1">
                  {section.title}
                </p>
              )}
              <ul
                className={cn(
                  'grid gap-1',
                  section.items.length > 4 ? 'grid-cols-2' : 'grid-cols-1'
                )}
              >
                {section.items.map((item) => (
                    <li key={item.href} role="none">
                      <Link
                        to={item.href}
                        role="menuitem"
                        className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-surface transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="inline-flex items-center rounded-full bg-linear-to-r from-[#1AAEE8] to-[#00D97E] px-2 py-0.5 text-[10px] font-bold text-white leading-none">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
