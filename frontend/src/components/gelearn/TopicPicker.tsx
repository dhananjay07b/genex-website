import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api/client'
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

/** Pill toggles, optionally under group headings, with a selection limit. */
function ChipPicker({ label, groups, value, max, onChange, help, error, loading }: ChipPickerProps) {
  const toggle = (id: number) => {
    if (value.includes(id)) onChange(value.filter(v => v !== id))
    else if (value.length < max) onChange([...value, id])
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold text-text-primary mb-1.5">
        {label} <span className="font-normal text-text-muted">(up to {max})</span>
      </legend>
      {loading && <p className="text-xs text-text-muted">Loading…</p>}
      {groups.map(group => (
        <div key={group.heading ?? 'other'} className="flex flex-col gap-1.5">
          {group.heading && (
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{group.heading}</span>
          )}
          <div className="flex flex-wrap gap-2">
            {group.options.map(option => {
              const active = value.includes(option.id)
              const disabled = !active && value.length >= max
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  disabled={disabled}
                  onClick={() => toggle(option.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    active
                      ? 'bg-primary text-white border-primary'
                      : disabled
                        ? 'bg-surface text-text-muted/50 border-border cursor-not-allowed'
                        : 'bg-white text-text-primary border-border hover:border-primary'
                  }`}
                >
                  {option.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {help && <p className="text-xs text-text-muted">{help}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </fieldset>
  )
}

let topicsCache: Promise<Topic[]> | null = null
let rolesCache: Promise<CareerRole[]> | null = null

function useList<T>(load: () => Promise<T[]>): { items: T[]; loading: boolean } {
  const [items, setItems] = useState<T[] | null>(null)
  useEffect(() => {
    let cancelled = false
    load().then(rows => { if (!cancelled) setItems(rows) }).catch(() => { if (!cancelled) setItems([]) })
    return () => { cancelled = true }
  }, [load])
  return { items: items ?? [], loading: items === null }
}

const loadTopics = () => {
  topicsCache ??= apiFetch<Topic[]>('/api/snippets/topics/').catch(err => { topicsCache = null; throw err })
  return topicsCache
}
const loadRoles = () => {
  rolesCache ??= apiFetch<CareerRole[]>('/api/learning/roles/').catch(err => { rolesCache = null; throw err })
  return rolesCache
}

/** Groups topics the way the Explore menu does; ungrouped topics go last under "Other". */
function groupTopics(topics: Topic[]): ChipGroup[] {
  const grouped = new Map<string, { order: number; options: Topic[] }>()
  const other: Topic[] = []
  for (const topic of topics) {
    if (!topic.group) { other.push(topic); continue }
    const entry = grouped.get(topic.group) ?? { order: topic.group_order ?? 0, options: [] }
    entry.options.push(topic)
    grouped.set(topic.group, entry)
  }
  const groups: ChipGroup[] = [...grouped.entries()]
    .sort((a, b) => a[1].order - b[1].order)
    .map(([heading, { options }]) => ({ heading, options: [...options].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) }))
  if (other.length) groups.push({ heading: groups.length ? 'Other' : null, options: other })
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
  return <ChipPicker label={label} groups={groupTopics(items)} value={value} max={max} onChange={onChange} help={help} error={error} loading={loading} />
}

export function RolePicker({ value, onChange, max = 3, label = 'Career roles', help, error }: PickerProps) {
  const { items, loading } = useList(loadRoles)
  return <ChipPicker label={label} groups={[{ heading: null, options: items }]} value={value} max={max} onChange={onChange} help={help} error={error} loading={loading} />
}
