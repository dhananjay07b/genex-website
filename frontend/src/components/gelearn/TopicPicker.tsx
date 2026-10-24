import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { apiFetch } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type { CareerRole, Topic } from '@/types/api'

interface ChipOption {
  id: number
  name: string
}

interface ChipGroup {
  heading: string | null
  options: ChipOption[]
}

interface ChipPickerProps {
  label: string
  groups: ChipGroup[]
  value: number[]
  max: number
  onChange: (next: number[]) => void
  help?: string
  error?: string
  loading?: boolean
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)

/**
 * A searchable dropdown (combobox): what's chosen sits above it as removable
 * chips; the list is grouped, alphabetical and filtered as you type, and it
 * switches off once the limit is reached.
 */
function ChipPicker({ label, groups, value, max, onChange, help, error, loading }: ChipPickerProps) {
  const id = useId()
  const listId = `${id}-list`
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const full = value.length >= max

  const names = useMemo(() => new Map(groups.flatMap(g => g.options).map(o => [o.id, o.name])), [groups])

  // Unchosen options whose name matches the search, still grouped; plus a flat list for the keyboard.
  const { visible, flat } = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const shown = groups
      .map(group => ({
        ...group,
        options: group.options.filter(o => !value.includes(o.id) && (!needle || o.name.toLowerCase().includes(needle))),
      }))
      .filter(group => group.options.length)
    return { visible: shown, flat: shown.flatMap(g => g.options) }
  }, [groups, query, value])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  function choose(option: ChipOption) {
    if (full) return
    const next = [...value, option.id]
    onChange(next)
    setQuery('')
    setActive(0)
    if (next.length >= max) setOpen(false)
  }

  function remove(optionId: number) {
    onChange(value.filter(v => v !== optionId))
    inputRef.current?.focus()
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(i => Math.min(i + 1, flat.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') {
      e.preventDefault()  // never submit the surrounding form from here
      if (open && flat[active]) choose(flat[active])
    } else if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'Backspace' && !query && value.length) onChange(value.slice(0, -1))
  }

  const activeOption = open ? flat[active] : undefined

  return (
    <div ref={wrapRef} className="flex flex-col gap-2">
      <label htmlFor={`${id}-input`} className="text-sm font-semibold text-text-primary">
        {label} <span className="font-normal text-text-muted">(up to {max})</span>
      </label>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label={`Selected ${label.toLowerCase()}`}>
          {value.map(v => (
            <li key={v} className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-3 pr-1 text-xs font-bold text-sky-800">
              {names.get(v) ?? '…'}
              <button type="button" onClick={() => remove(v)} aria-label={`Remove ${names.get(v) ?? 'item'}`}
                className="size-5 rounded-full flex items-center justify-center hover:bg-primary/20">
                <CloseIcon sx={{ fontSize: 13 }} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="text"
          role="combobox"
          aria-expanded={open && !full}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeOption ? `${id}-opt-${activeOption.id}` : undefined}
          aria-invalid={!!error}
          disabled={full || loading}
          placeholder={loading ? 'Loading…' : full ? `Maximum of ${max} selected` : 'Search or choose…'}
          value={query}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setActive(0); setOpen(true) }}
          onKeyDown={onKeyDown}
          className={cn(
            'h-11 w-full rounded-md border bg-white pl-3.5 pr-9 text-sm text-text-primary placeholder:text-text-muted outline-none',
            'focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface',
            error ? 'border-red-500' : 'border-border',
          )}
        />
        <ExpandMoreIcon sx={{ fontSize: 20 }} aria-hidden
          className={cn('pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted transition-transform', open && !full && 'rotate-180')} />

        {open && !full && (
          <div id={listId} role="listbox" aria-label={label}
            className="absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-white py-1 shadow-lg">
            {visible.length === 0 && <p className="px-3 py-2.5 text-sm text-text-muted">{query ? 'No matches' : 'Nothing left to choose'}</p>}
            {visible.map(group => (
              <div key={group.heading ?? 'all'} role="group" aria-label={group.heading ?? undefined}>
                {group.heading && (
                  <p className="px-3 pt-2.5 pb-1 text-xs font-bold uppercase tracking-wider text-text-muted">{group.heading}</p>
                )}
                {group.options.map(option => {
                  const isActive = activeOption?.id === option.id
                  return (
                    <div
                      key={option.id}
                      id={`${id}-opt-${option.id}`}
                      role="option"
                      aria-selected={isActive}
                      onMouseDown={e => e.preventDefault()}  // keep focus in the input
                      onMouseEnter={() => setActive(flat.indexOf(option))}
                      onClick={() => choose(option)}
                      className={cn('cursor-pointer px-3 py-2 text-sm text-text-primary', isActive && 'bg-primary/10')}
                    >
                      {option.name}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {help && <p className="text-xs text-text-muted">{help}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const NO_ITEMS: never[] = []  // one empty list while loading, so memoised groups stay put
let topicsCache: Promise<Topic[]> | null = null
let rolesCache: Promise<CareerRole[]> | null = null

function useList<T>(load: () => Promise<T[]>): { items: T[]; loading: boolean } {
  const [items, setItems] = useState<T[] | null>(null)
  useEffect(() => {
    let cancelled = false
    load().then(rows => { if (!cancelled) setItems(rows) }).catch(() => { if (!cancelled) setItems([]) })
    return () => { cancelled = true }
  }, [load])
  return { items: items ?? (NO_ITEMS as T[]), loading: items === null }
}

const loadTopics = () => {
  topicsCache ??= apiFetch<Topic[]>('/api/snippets/topics/').catch(err => { topicsCache = null; throw err })
  return topicsCache
}
const loadRoles = () => {
  rolesCache ??= apiFetch<CareerRole[]>('/api/learning/roles/').catch(err => { rolesCache = null; throw err })
  return rolesCache
}

/** Topics under their Explore-menu group, groups and topics A–Z; ungrouped topics go last under "Other". */
function groupTopics(topics: Topic[]): ChipGroup[] {
  const grouped = new Map<string, Topic[]>()
  const other: Topic[] = []
  for (const topic of topics) {
    if (!topic.group) { other.push(topic); continue }
    grouped.set(topic.group, [...(grouped.get(topic.group) ?? []), topic])
  }
  const groups: ChipGroup[] = [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([heading, options]) => ({ heading, options: [...options].sort(byName) }))
  if (other.length) groups.push({ heading: groups.length ? 'Other' : null, options: [...other].sort(byName) })
  return groups
}

interface PickerProps {
  value: number[]
  onChange: (next: number[]) => void
  max?: number
  label?: string
  help?: string
  error?: string
}

export function TopicPicker({ value, onChange, max = 5, label = 'Topics', help, error }: PickerProps) {
  const { items, loading } = useList(loadTopics)
  const groups = useMemo(() => groupTopics(items), [items])
  return <ChipPicker label={label} groups={groups} value={value} max={max} onChange={onChange} help={help} error={error} loading={loading} />
}

export function RolePicker({ value, onChange, max = 3, label = 'Career roles', help, error }: PickerProps) {
  const { items, loading } = useList(loadRoles)
  const groups = useMemo(() => [{ heading: null, options: [...items].sort(byName) }], [items])
  return <ChipPicker label={label} groups={groups} value={value} max={max} onChange={onChange} help={help} error={error} loading={loading} />
}
