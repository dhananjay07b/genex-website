import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import LogoutIcon from '@mui/icons-material/Logout'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import { Button, buttonVariants } from '@/components/ui/Button'
import { apiFetch, ApiError } from '@/lib/api/client'
import type { CourseEnrollment } from '@/types/learning'
import { plural } from './format'

/**
 * Leave a course (un-enroll). Everything the learner did in it is deleted:
 * lessons done, quiz results and their review. Not possible once a
 * certificate was issued for the course; the dialog then says why.
 */
export function LeaveCourseDialog({ slug, title, enrollment, onLeft, onClose }: {
  slug: string
  title: string
  enrollment: CourseEnrollment
  onLeft: () => void
  onClose: () => void
}) {
  const titleId = useId()
  const [understood, setUnderstood] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const cancelRef = useRef<HTMLButtonElement>(null)
  const blocked = !enrollment.can_leave

  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  async function leave() {
    setBusy(true)
    setError('')
    try {
      await apiFetch(`/api/learning/courses/${slug}/enroll/`, { method: 'DELETE' })
      onLeft()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't leave the course. Please try again.")
      setBusy(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-dark-bg/45 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
      <div role={blocked ? 'dialog' : 'alertdialog'} aria-modal="true" aria-labelledby={titleId} className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
        {blocked ? (
          <>
            <div className="size-11 rounded-full bg-brand-tint text-sky-700 flex items-center justify-center mb-4">
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 22 }} />
            </div>
            <h2 id={titleId} className="text-base font-bold text-text-primary mb-1.5">You can&apos;t leave this course</h2>
            <p className="text-sm text-text-muted leading-relaxed mb-6">
              Your certificate for <b className="text-text-primary">{title}</b> was issued, and it stays on your record, so the course stays in
              My Learning too.
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <Button ref={cancelRef} type="button" variant="secondary" size="md" onClick={onClose}>Close</Button>
              {enrollment.certificate_code && (
                <Link to={`/certificates/${enrollment.certificate_code}`} className={buttonVariants({ size: 'md' })}>
                  <WorkspacePremiumOutlinedIcon sx={{ fontSize: 18 }} /> View your certificate
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="size-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <LogoutIcon sx={{ fontSize: 20 }} />
            </div>
            <h2 id={titleId} className="text-base font-bold text-text-primary mb-1.5">Leave “{title}”?</h2>
            <p className="text-sm text-text-muted leading-relaxed">All your progress in this course is deleted for good:</p>
            <ul className="my-3 list-disc pl-5 text-sm text-text-primary space-y-1">
              <li>{enrollment.completed > 0 ? `${enrollment.completed} of ${plural(enrollment.total, 'lesson')} done` : 'Your place in the course'}</li>
              <li>Your quiz results</li>
              <li>Your review of the course, if you wrote one</li>
            </ul>
            <p className="text-sm text-text-muted leading-relaxed mb-4">You can enroll again later, but you&apos;ll start from the beginning.</p>
            <label className="flex items-start gap-2.5 rounded-xl border border-border px-3.5 py-3 text-sm text-text-primary cursor-pointer hover:border-red-300 mb-5">
              <input type="checkbox" checked={understood} onChange={e => setUnderstood(e.target.checked)} className="mt-0.5 size-4 accent-red-600" />
              I understand my progress will be lost
            </label>
            {error && <p role="alert" className="text-sm font-semibold text-red-600 mb-3">{error}</p>}
            <div className="flex gap-3">
              <Button ref={cancelRef} type="button" variant="secondary" size="md" className="flex-1" onClick={onClose} disabled={busy}>
                Stay enrolled
              </Button>
              <button type="button" onClick={leave} disabled={!understood || busy}
                className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none">
                {busy ? 'Leaving…' : 'Leave course'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
