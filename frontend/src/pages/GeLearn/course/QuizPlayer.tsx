import { useState, type FormEvent } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ReplayIcon from '@mui/icons-material/Replay'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import { Button } from '@/components/ui/Button'
import { apiFetch, ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type { CourseLessonContent, QuizResult } from '@/types/learning'

type Quiz = NonNullable<CourseLessonContent['quiz']>

/**
 * Takes a quiz lesson: answer, submit, see the result. Grading happens on the
 * server, which never sends the right answers before submitting (and shows
 * which options were right only once the quiz is passed). For an enrolled
 * learner, passing completes the lesson; retakes are unlimited.
 */
export function QuizPlayer({ slug, lessonId, quiz, saving, onPassed }: {
  slug: string
  lessonId: number
  quiz: Quiz
  /** The viewer's attempts are saved (an enrolled learner, not a preview of edits). */
  saving: boolean
  onPassed: (certificateCode: string | null) => void
}) {
  const { questions, pass_mark: passMark } = quiz
  const [answers, setAnswers] = useState<number[][]>(() => questions.map(() => []))
  const [result, setResult] = useState<QuizResult | null>(null)
  const [best, setBest] = useState(quiz.best)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const unanswered = answers.filter(a => a.length === 0).length

  const choose = (qi: number, oi: number, multiple: boolean) => {
    setError('')
    setAnswers(prev => prev.map((a, i) => {
      if (i !== qi) return a
      if (!multiple) return [oi]
      return a.includes(oi) ? a.filter(x => x !== oi) : [...a, oi].sort((x, y) => x - y)
    }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (unanswered) {
      setError(`Answer every question first (${unanswered} left).`)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const graded = await apiFetch<QuizResult>(`/api/learning/courses/${slug}/lessons/${lessonId}/attempts/`, {
        method: 'POST', body: { answers },
      })
      setResult(graded)
      if (graded.best) setBest(graded.best)
      if (graded.passed && graded.saved) onPassed(graded.certificate_code)
    } catch (err) {
      setError(err instanceof ApiError ? (err.fields.answers ?? err.message) : "Couldn't submit your answers. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const retry = () => {
    setResult(null)
    setAnswers(questions.map(() => []))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <form onSubmit={submit} className="flex max-w-3xl flex-col gap-5" aria-label="Quiz">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-slate-700">
        <span><b className="text-text-primary">{questions.length} question{questions.length === 1 ? '' : 's'}</b> · pass with {passMark}% or more</span>
        {best && (
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', best.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700')}>
            {best.passed ? 'Passed' : 'Best so far'}: {best.score} of {best.total}
          </span>
        )}
      </p>

      {result && <Score result={result} saving={saving} onRetry={retry} />}

      <ol className="flex flex-col gap-4">
        {questions.map((q, qi) => {
          const graded = result?.results[qi]
          return (
            <li key={qi}>
              <fieldset className={cn('flex flex-col gap-2 rounded-2xl border px-5 py-4',
                graded ? (graded.correct ? 'border-emerald-300 bg-emerald-50/50' : 'border-red-200 bg-red-50/50') : 'border-border bg-white')}>
                <legend className="sr-only">Question {qi + 1}</legend>
                <p className="flex items-start gap-2 text-base font-bold text-text-primary">
                  <span className="text-sky-700">{qi + 1}.</span>
                  <span className="flex-1">{q.prompt}</span>
                  {graded && (graded.correct
                    ? <CheckCircleIcon sx={{ fontSize: 22 }} className="shrink-0 text-emerald-600" titleAccess="Right" />
                    : <CancelIcon sx={{ fontSize: 22 }} className="shrink-0 text-red-500" titleAccess="Not right" />)}
                </p>
                {q.multiple && <p className="text-xs font-semibold text-text-muted">Select all that apply.</p>}
                {q.options.map((option, oi) => {
                  const chosen = answers[qi].includes(oi)
                  const right = graded?.correct_options?.includes(oi)
                  return (
                    <label key={oi} className={cn('flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm',
                      right ? 'border-emerald-500 bg-emerald-50' : chosen ? 'border-primary bg-sky-50' : 'border-border bg-white',
                      result ? 'cursor-default' : 'cursor-pointer hover:border-primary')}>
                      <input type={q.multiple ? 'checkbox' : 'radio'} name={`q${qi}`} checked={chosen} disabled={Boolean(result)}
                        onChange={() => choose(qi, oi, q.multiple)} className="size-4 shrink-0 accent-primary" />
                      <span className="flex-1 text-slate-800">{option}</span>
                      {right && <span className="text-xs font-bold text-emerald-700">Right answer</span>}
                    </label>
                  )
                })}
                {graded?.explanation && <p className="mt-1 text-sm text-slate-700"><b>Why:</b> {graded.explanation}</p>}
              </fieldset>
            </li>
          )
        })}
      </ol>

      {error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}
      {result ? (
        !result.passed && (
          <Button type="button" variant="primary" size="md" className="self-start" onClick={retry}>
            <ReplayIcon sx={{ fontSize: 18 }} /> Try again
          </Button>
        )
      ) : (
        <Button type="submit" variant="primary" size="md" className="self-start" disabled={submitting}>
          {submitting ? 'Checking…' : 'Submit answers'}
        </Button>
      )}
    </form>
  )
}

function Score({ result, saving, onRetry }: { result: QuizResult; saving: boolean; onRetry: () => void }) {
  return (
    <div role="status" className={cn('flex flex-wrap items-center gap-3 rounded-2xl border px-5 py-4',
      result.passed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-300 bg-amber-50')}>
      {result.passed
        ? <EmojiEventsOutlinedIcon sx={{ fontSize: 26 }} className="text-emerald-700" />
        : <ReplayIcon sx={{ fontSize: 24 }} className="text-amber-700" />}
      <p className={cn('flex-1 min-w-48 text-sm', result.passed ? 'text-emerald-900' : 'text-amber-900')}>
        <b className="block text-base">
          {result.passed ? `You passed: ${result.score} of ${result.total} right (${result.percent}%)` : `${result.score} of ${result.total} right (${result.percent}%)`}
        </b>
        {result.passed
          ? saving ? 'This lesson is complete.' : 'This try isn’t saved. Enroll in the course to track your progress.'
          : `You need ${result.pass_mark}% to pass. Check the explanations below, then try again.`}
      </p>
      {!result.passed && (
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>Try again</Button>
      )}
    </div>
  )
}
