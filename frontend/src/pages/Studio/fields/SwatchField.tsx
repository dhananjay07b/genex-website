import CheckIcon from '@mui/icons-material/Check'
import { cn } from '@/lib/utils'

interface SwatchFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  /** `swatchClassName` renders the option; `preview` shows a text sample on it (palettes). */
  options: { value: string; label: string; swatchClassName: string }[]
  preview?: string
  error?: string
}

/** Pick one colour from a fixed design-token palette. */
export function SwatchField({ label, value, onChange, options, preview, error }: SwatchFieldProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-text-primary mb-1.5">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              title={option.label}
              className={cn(
                'relative flex items-center justify-center rounded-lg border-2 transition-colors',
                preview ? 'h-8 px-3 text-xs font-bold' : 'size-8',
                option.swatchClassName,
                active ? 'border-text-primary' : 'border-transparent hover:border-border',
              )}
            >
              {preview ? preview : active && <CheckIcon sx={{ fontSize: 16 }} className="text-white" />}
              <span className="sr-only">{option.label}</span>
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </fieldset>
  )
}
