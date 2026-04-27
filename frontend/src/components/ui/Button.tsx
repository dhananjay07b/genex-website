import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap',
  {
    variants: {
      variant: {
        primary:
          'bg-[linear-gradient(to_right,#1AAEE8,#00C5B0,#00D97E,#00C5B0,#1AAEE8)] bg-[size:200%_100%] bg-[position:0%_50%] hover:bg-[position:100%_50%] transition-[background-position] duration-500 ease-in-out text-white shadow-sm active:scale-[0.98]',
        secondary:
          'border border-primary text-primary bg-transparent hover:bg-primary/5 active:bg-primary/10',
        ghost:
          'text-text-primary bg-transparent hover:text-primary hover:bg-primary/5',
        dark:
          'bg-white text-dark-bg hover:bg-surface active:scale-[0.98]',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
