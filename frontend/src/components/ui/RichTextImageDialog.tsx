import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import CloseIcon from '@mui/icons-material/Close'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiFetch, ApiError } from '@/lib/api/client'

/** What POST /api/accounts/me/images/ returns: a Wagtail image, resized for pages. */
export interface UploadedImage {
  id: number
  url: string
  width: number
  height: number
}

const TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024

/**
 * Picks an image from the computer, asks for its description (alt text, for
 * screen readers and when the image can't load), uploads it, then hands it
 * to the editor to insert.
 */
export function RichTextImageDialog({ onInsert, onClose }: {
  onInsert: (image: UploadedImage, alt: string) => void
  onClose: () => void
}) {
  const titleId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [alt, setAlt] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fileRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  // The local preview's object URL is released when it's replaced or the dialog closes.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  function pick(next: File | undefined) {
    setError('')
    if (!next) return
    if (!TYPES.includes(next.type)) {
      setError('Choose a PNG, JPG or WebP image.')
      return
    }
    if (next.size > MAX_BYTES) {
      setError('Images must be 10 MB or smaller.')
      return
    }
    setFile(next)
    setPreview(URL.createObjectURL(next))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    e.stopPropagation()  // React events still bubble out of a portal to the page's form
    if (!file) { setError('Choose an image first.'); return }
    if (!alt.trim()) { setError('Describe the image in a few words.'); return }
    setBusy(true)
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      const image = await apiFetch<UploadedImage>('/api/accounts/me/images/', { method: 'POST', body })
      onInsert(image, alt.trim())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't upload the image. Please try again.")
      setBusy(false)
    }
  }

  // Portalled: the editor sits inside the page's own <form>, and forms can't nest.
  return createPortal(
    <div className="fixed inset-0 z-50 bg-dark-bg/45 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
      <form role="dialog" aria-modal="true" aria-labelledby={titleId} onSubmit={submit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border">
          <h2 id={titleId} className="text-base font-bold text-text-primary">Insert image</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close"
            className="size-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface hover:text-text-primary disabled:opacity-50">
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5">
          <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-6 text-center cursor-pointer hover:border-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            {preview
              ? <img src={preview} alt="" className="max-h-40 w-auto rounded-lg object-contain" />
              : <ImageOutlinedIcon sx={{ fontSize: 32 }} className="text-text-muted" />}
            <span className="text-sm font-semibold text-text-primary">{file ? file.name : 'Choose an image from your computer'}</span>
            <span className="text-xs text-text-muted">PNG, JPG or WebP, up to 10 MB</span>
            <input ref={fileRef} type="file" accept={TYPES.join(',')} className="sr-only" disabled={busy}
              onChange={e => pick(e.target.files?.[0])} />
          </label>

          <Input label="Image description" placeholder="e.g. Single-line diagram of a 33 kV substation" value={alt}
            maxLength={250} disabled={busy} onChange={e => setAlt(e.target.value)} />

          {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border bg-surface">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" size="sm" disabled={busy}>{busy ? 'Uploading…' : 'Insert image'}</Button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
