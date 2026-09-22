import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6 border border-border rounded-2xl">
      <div className="w-14 h-14 rounded-full bg-surface text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="font-bold text-text-primary">{title}</p>
      <p className="text-sm text-text-muted max-w-sm mt-1.5 leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
