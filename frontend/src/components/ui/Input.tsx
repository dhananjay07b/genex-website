import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-11 w-full rounded-md border bg-white px-3.5 text-sm text-text-primary placeholder:text-text-muted',
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
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
