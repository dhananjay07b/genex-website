import type { ReactNode } from 'react'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import { cn } from '@/lib/utils'
import { fieldClass, move } from './draft'

/** A numbered builder card ("1 Basics …") with an optional hint on the right. */
export function BuilderCard({ n, title, hint, children }: { n?: number; title: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-white border border-border rounded-2xl p-5 lg:p-6 flex flex-col gap-4 min-w-0">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-text-primary">
          {n !== undefined && (
            <span className="size-6 rounded-full bg-brand-tint text-primary text-xs font-bold flex items-center justify-center">{n}</span>
          )}
          {title}
        </h2>
        {hint && <p className="text-xs text-text-muted">{hint}</p>}
      </header>
      {children}
    </section>
  )
}

/** A side-rail panel. */
export function RailCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('bg-white border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm', className)}>{children}</div>
}

const iconBtn = 'size-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none'

/** Up / down / remove buttons for one row of an ordered list. */
export function RowControls({ label, index, count, onMove, onRemove }: {
  label: string
  index: number
  count: number
  onMove: (from: number, to: number) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <button type="button" className={iconBtn} disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Move ${label} up`}>
        <ArrowUpwardIcon sx={{ fontSize: 16 }} />
      </button>
      <button type="button" className={iconBtn} disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label={`Move ${label} down`}>
        <ArrowDownwardIcon sx={{ fontSize: 16 }} />
      </button>
      <button type="button" className={cn(iconBtn, 'hover:bg-red-50 hover:text-red-600')} onClick={onRemove} aria-label={`Remove ${label}`}>
        <CloseIcon sx={{ fontSize: 16 }} />
      </button>
    </div>
  )
}

/** Dashed "+ Add …" button. */
export function AddButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="self-start inline-flex items-center gap-1 rounded-md border border-dashed border-primary/50 bg-primary/5 px-3 py-1.5 text-sm font-bold text-primary hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:pointer-events-none">
      <AddIcon sx={{ fontSize: 17 }} /> {children}
    </button>
  )
}

/** An ordered list of short text lines (outcomes, prerequisites) with a counter and limit. */
export function ListEditor({ label, word, lines, max, maxLength, onChange, help, placeholder }: {
  label: string
  /** Singular noun for buttons and screen readers, e.g. "outcome". */
  word: string
  lines: string[]
  max: number
  maxLength: number
  onChange: (lines: string[]) => void
  help?: string
  placeholder?: string
}) {
  const set = (i: number, value: string) => onChange(lines.map((l, j) => (j === i ? value : l)))
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 text-sm font-semibold text-text-primary">
        <span>{label}</span>
        <span className="text-xs font-semibold text-text-muted tabular-nums">{lines.length}/{max}</span>
      </div>
      {lines.length > 0 && (
        <ol className="flex flex-col gap-2">
          {lines.map((line, i) => (
            <li key={i} className="flex items-center gap-2">
              <input className={fieldClass} value={line} maxLength={maxLength} placeholder={placeholder}
                onChange={e => set(i, e.target.value)} aria-label={`${label}: ${word} ${i + 1}`} />
              <RowControls label={`${word} ${i + 1}`} index={i} count={lines.length}
                onMove={(from, to) => onChange(move(lines, from, to))}
                onRemove={() => onChange(lines.filter((_, j) => j !== i))} />
            </li>
          ))}
        </ol>
      )}
      <AddButton onClick={() => onChange([...lines, ''])} disabled={lines.length >= max}>Add {word === 'outcome' ? 'an' : 'a'} {word}</AddButton>
      {help && <p className="text-xs text-text-muted">{help}</p>}
    </div>
  )
}
