import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { Input } from '@/components/ui/Input'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import type { StudioSection } from '@/types/studio'

interface SectionsFieldProps {
  label: string
  value: StudioSection[]
  onChange: (sections: StudioSection[]) => void
  maxItems?: number
  error?: string
}

/**
 * Ordered heading + rich-text sections. Each section keeps a stable React key
 * (tracked alongside the value, since this component is the only thing that
 * changes it) so moving a section doesn't remount its editor.
 */
export function SectionsField({ label, value, onChange, maxItems = 30, error }: SectionsFieldProps) {
  const [keys, setKeys] = useState<number[]>(() => value.map((_, i) => i))
  const [nextKey, setNextKey] = useState(value.length)

  function update(index: number, patch: Partial<StudioSection>) {
    onChange(value.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function move(index: number, delta: -1 | 1) {
    const target = index + delta
    if (target < 0 || target >= value.length) return
    const swap = <T,>(list: T[]) => {
      const next = [...list]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    }
    setKeys(swap(keys))
    onChange(swap(value))
  }

  function remove(index: number) {
    setKeys(keys.filter((_, i) => i !== index))
    onChange(value.filter((_, i) => i !== index))
  }

  function add() {
    setKeys([...keys, nextKey])
    setNextKey(nextKey + 1)
    onChange([...value, { heading: '', body: '' }])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        <span className="text-xs text-text-muted">{value.length}/{maxItems}</span>
      </div>

      <div className="flex flex-col gap-4">
        {value.map((section, index) => (
          <div key={keys[index]} className="border border-border rounded-2xl p-4 bg-surface/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted shrink-0">Section {index + 1}</span>
              <div className="flex-1" />
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move section up"
                className="size-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-white hover:text-text-primary disabled:opacity-30">
                <ArrowUpwardIcon sx={{ fontSize: 16 }} />
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === value.length - 1} aria-label="Move section down"
                className="size-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-white hover:text-text-primary disabled:opacity-30">
                <ArrowDownwardIcon sx={{ fontSize: 16 }} />
              </button>
              <button type="button" onClick={() => remove(index)} aria-label="Remove section"
                className="size-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-red-50 hover:text-red-600">
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Section heading"
                aria-label={`Section ${index + 1} heading`}
                value={section.heading}
                onChange={e => update(index, { heading: e.target.value })}
              />
              <RichTextEditor
                variant="basic"
                minHeightClassName="min-h-40"
                value={section.body}
                onChange={body => update(index, { body })}
              />
            </div>
          </div>
        ))}
      </div>

      {value.length < maxItems && (
        <button
          type="button"
          onClick={add}
          className="mt-3 w-full flex items-center justify-center gap-1.5 border border-dashed border-border rounded-2xl py-3 text-sm font-bold text-text-muted hover:border-primary hover:text-primary transition-colors"
        >
          <AddIcon sx={{ fontSize: 17 }} /> Add section
        </button>
      )}
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  )
}
