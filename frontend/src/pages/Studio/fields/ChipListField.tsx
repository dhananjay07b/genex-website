import { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'

interface ChipListFieldProps {
  label: string
  value: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  maxItems?: number
  error?: string
  help?: string
}

/** Short text items (tags, takeaways): type and press Enter to add. */
export function ChipListField({ label, value, onChange, placeholder, maxItems = 12, error, help }: ChipListFieldProps) {
  const [draft, setDraft] = useState('')
  const full = value.length >= maxItems

  function add() {
    const item = draft.trim()
    if (!item || full || value.some(v => v.toLowerCase() === item.toLowerCase())) return
    onChange([...value, item])
    setDraft('')
  }

  return (
    <div>
      <label className="flex items-center justify-between text-sm font-semibold text-text-primary mb-1.5">
        {label}
        <span className="text-xs font-normal text-text-muted">{value.length}/{maxItems}</span>
      </label>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-2">
          {value.map(item => (
            <li key={item} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs font-bold pl-3 pr-1.5 py-1 max-w-full">
              <span className="truncate">{item}</span>
              <button type="button" onClick={() => onChange(value.filter(v => v !== item))} aria-label={`Remove ${item}`}
                className="size-5 rounded-full flex items-center justify-center hover:bg-primary/15">
                <CloseIcon sx={{ fontSize: 13 }} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        value={draft}
        disabled={full}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            add()
          }
        }}
        onBlur={add}
        placeholder={full ? `Limit of ${maxItems} reached` : placeholder}
        aria-label={label}
        className="h-11 w-full rounded-md border border-border bg-white px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
      />
      {help && <p className="text-xs text-text-muted mt-1.5">{help}</p>}
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  )
}
