import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { Button } from '@/components/ui/Button'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
  confirming?: boolean
}

export function ConfirmDialog({ title, description, confirmLabel, onCancel, onConfirm, confirming }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-dark-bg/45 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
        <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <WarningAmberOutlinedIcon sx={{ fontSize: 20 }} />
        </div>
        <p className="text-base font-bold text-text-primary mb-1.5">{title}</p>
        <p className="text-sm text-text-muted leading-relaxed mb-6">{description}</p>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1 justify-center" onClick={onCancel} disabled={confirming}>
            Cancel
          </Button>
          <Button variant="primary" size="md" className="flex-1 justify-center" onClick={onConfirm} disabled={confirming}>
            {confirming ? 'Saving…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
