import { forwardRef, useState } from 'react'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { cn } from '@/lib/utils'
import type { InputProps } from './Input'

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            className={cn(
              'h-11 w-full rounded-md border bg-white pl-3.5 pr-11 text-sm text-text-primary placeholder:text-text-muted',
              'transition-colors duration-150 outline-none',
              'focus:border-primary focus:ring-2 focus:ring-primary/20',
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            {visible ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
          </button>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
