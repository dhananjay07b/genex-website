import { useEffect, useId, useRef, useState, type ComponentType, type KeyboardEvent } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { cn } from '@/lib/utils'

export type MenuEntry =
  | { kind?: 'item'; label: string; icon: ComponentType<SvgIconProps>; onSelect: () => void; disabled?: boolean; danger?: boolean; on?: boolean }
  | { kind: 'heading'; label: string }
  | { kind: 'separator' }

/**
 * A "⋯" button with a small menu of actions. Arrow keys move between items,
 * Escape or a click outside closes it, and focus goes back to the button.
 */
export function MoreMenu({ label, entries, icon: Icon = MoreVertIcon }: {
  /** Names the button for screen readers, e.g. "More for Lesson 3". */
  label: string
  entries: MenuEntry[]
  icon?: ComponentType<SvgIconProps>
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const items = () => [...(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [])]

  useEffect(() => {
    if (!open) return
    items()[0]?.focus()
    const onDown = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const close = () => { setOpen(false); buttonRef.current?.focus() }

  const onKey = (e: KeyboardEvent) => {
    const list = items()
    const at = list.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'Escape') { e.preventDefault(); close() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); list[(at + 1) % list.length]?.focus() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); list[(at - 1 + list.length) % list.length]?.focus() }
    else if (e.key === 'Home') { e.preventDefault(); list[0]?.focus() }
    else if (e.key === 'End') { e.preventDefault(); list[list.length - 1]?.focus() }
    else if (e.key === 'Tab') setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button ref={buttonRef} type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(o => !o)}
        className={cn('size-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-slate-200/70 hover:text-text-primary transition-colors',
          open && 'bg-slate-200/70 text-text-primary')}>
        <Icon sx={{ fontSize: 19 }} />
      </button>
      {open && (
        <div ref={menuRef} id={menuId} role="menu" aria-label={label} onKeyDown={onKey}
          className="absolute right-0 top-full mt-1 z-30 w-64 rounded-xl border border-border bg-white p-1.5 shadow-lg flex flex-col">
          {entries.map((entry, i) => {
            if (entry.kind === 'separator') return <div key={i} role="separator" className="h-px bg-border my-1" />
            if (entry.kind === 'heading') {
              return <span key={i} className="px-2.5 pt-1.5 pb-0.5 text-xs font-extrabold uppercase tracking-widest text-text-muted">{entry.label}</span>
            }
            const { icon: ItemIcon } = entry
            return (
              <button key={i} type="button" role="menuitem" disabled={entry.disabled}
                onClick={() => { setOpen(false); buttonRef.current?.focus(); entry.onSelect() }}
                className={cn('flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-semibold hover:bg-surface focus:bg-surface outline-none disabled:opacity-40 disabled:pointer-events-none',
                  entry.danger ? 'text-red-700' : 'text-text-primary')}>
                <ItemIcon sx={{ fontSize: 18 }} className={cn('shrink-0', entry.danger ? 'text-red-700' : entry.on ? 'text-emerald-700' : 'text-text-muted')} />
                <span className="min-w-0 truncate">{entry.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
