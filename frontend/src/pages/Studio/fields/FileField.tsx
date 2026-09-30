import { useEffect, useMemo, useRef } from 'react'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { getMediaUrl } from '@/lib/utils'

interface FileFieldProps {
  kind: 'image' | 'document'
  label: string
  /** What's already saved on the item. */
  currentUrl: string | null | undefined
  file: File | null
  onChange: (file: File | null) => void
  error?: string
}

const ACCEPT = { image: 'image/png,image/jpeg,image/webp', document: 'application/pdf' }
const HELP = { image: 'PNG, JPG or WebP.', document: 'PDF, up to 25 MB.' }

/** Picks a file to upload after the item is saved (the upload endpoints need the item's id). */
export function FileField({ kind, label, currentUrl, file, onChange, error }: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const preview = useMemo(() => (file && kind === 'image' ? URL.createObjectURL(file) : null), [file, kind])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const imageSrc = kind === 'image' ? (file ? preview : currentUrl ? getMediaUrl(currentUrl) : null) : null

  return (
    <div>
      <span className="block text-sm font-semibold text-text-primary mb-1.5">{label}</span>

      {imageSrc && (
        <div className="relative rounded-xl overflow-hidden border border-border aspect-video mb-2">
          <img src={imageSrc} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {kind === 'document' && (file || currentUrl) && (
        <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 mb-2 text-sm">
          <PictureAsPdfOutlinedIcon sx={{ fontSize: 18 }} className="text-red-600 shrink-0" />
          {file ? (
            <span className="truncate text-text-primary">{file.name}</span>
          ) : (
            <a href={getMediaUrl(currentUrl)} target="_blank" rel="noopener noreferrer" className="truncate text-primary font-semibold hover:underline">
              Current PDF
            </a>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 border border-dashed border-border rounded-xl py-2.5 text-sm font-bold text-text-muted hover:border-primary hover:text-primary transition-colors"
        >
          <CloudUploadOutlinedIcon sx={{ fontSize: 17 }} />
          {file || currentUrl ? 'Replace' : 'Upload'} {kind === 'image' ? 'image' : 'PDF'}
        </button>
        {file && (
          <button type="button" onClick={() => onChange(null)} aria-label="Discard selected file"
            className="size-10 rounded-xl border border-border flex items-center justify-center text-text-muted hover:text-red-600 hover:border-red-300">
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        className="hidden"
        onChange={e => {
          onChange(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
      />
      <p className="text-xs text-text-muted mt-1.5">{HELP[kind]}</p>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  )
}
