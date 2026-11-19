import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import CloseIcon from '@mui/icons-material/Close'
import { Button } from './Button'
import { Input } from './Input'

export interface LinkChoice {
  href: string
  /** Text to insert when nothing was selected; empty when the selection becomes the link. */
  text: string
}

/** "example.com/x" → "https://example.com/x"; mailto:, tel:, site paths (/…) and #anchors are kept as typed. */
function normaliseHref(raw: string): string {
  const href = raw.trim()
  if (!href || /^(https?:|mailto:|tel:|\/|#)/i.test(href)) return href
  return `https://${href}`
}

/**
 * Adds or edits a link in the rich-text editor (instead of the browser's
 * prompt): the web address, plus the link text when nothing is selected.
 */
export function RichTextLinkDialog({ initialHref, askText, onApply, onRemove, onClose }: {
  initialHref: string
  /** Nothing is selected, so the link needs its own text. */
  askText: boolean
  onApply: (choice: LinkChoice) => void
  /** Only for an existing link. */
  onRemove?: () => void
  onClose: () => void
}) {
  const titleId = useId()
  const [href, setHref] = useState(initialHref)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function submit(e: FormEvent) {
    e.preventDefault()
    e.stopPropagation() // React events still bubble out of a portal to the page's form
    const url = normaliseHref(href)
    if (!url) { setError('Enter a web address.'); return }
    if (askText && !text.trim()) { setError('Enter the text to show for the link.'); return }
    onApply({ href: url, text: askText ? text.trim() : '' })
  }

  // A portal keeps this form out of the page's own form in the DOM.
  return createPortal(
    <div className="fixed inset-0 z-50 bg-dark-bg/45 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <form role="dialog" aria-modal="true" aria-labelledby={titleId} onSubmit={submit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border">
          <h2 id={titleId} className="text-base font-bold text-text-primary">{onRemove ? 'Edit link' : 'Add a link'}</h2>
          <button type="button" onClick={onClose} aria-label="Close"
            className="size-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface hover:text-text-primary">
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
        <div className="flex flex-col gap-4 px-5 py-5">
          {askText && (
            <Input ref={firstRef} label="Text" placeholder="e.g. the register map" value={text}
              onChange={e => { setText(e.target.value); setError('') }} />
          )}
          <Input ref={askText ? undefined : firstRef} label="Web address" placeholder="https://" inputMode="url" value={href}
            onChange={e => { setHref(e.target.value); setError('') }} />
          {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}
        </div>
        <div className="flex flex-wrap justify-between gap-2 px-5 py-3 border-t border-border bg-surface">
          {onRemove ? <Button type="button" variant="secondary" size="sm" onClick={onRemove}>Remove link</Button> : <span />}
          <span className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">{onRemove ? 'Save link' : 'Add link'}</Button>
          </span>
        </div>
      </form>
    </div>,
    document.body,
  )
}
