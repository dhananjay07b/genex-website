import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { Button } from '@/components/ui/Button'

interface ConfirmDeleteDialogProps {
  label: string
  onCancel: () => void
  onConfirm: () => void
  confirming?: boolean
}

export function ConfirmDeleteDialog({ label, onCancel, onConfirm, confirming }: ConfirmDeleteDialogProps) {
  return (
    <div className="fixed inset-0 bg-dark-bg/45 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
        <div className="w-11 h-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <DeleteOutlineIcon sx={{ fontSize: 20 }} />
        </div>
        <p className="text-base font-bold text-text-primary mb-1.5">Remove this item?</p>
        <p className="text-sm text-text-muted leading-relaxed mb-6">
          &ldquo;{label}&rdquo; will be removed from your GeLearn account. This can&apos;t be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1 justify-center" onClick={onCancel} disabled={confirming}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 h-11 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {confirming ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}
