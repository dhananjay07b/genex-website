import { useState } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ReplayIcon from '@mui/icons-material/Replay'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { QuizQuestion } from '@/types/learning'
import { questionProblem } from './quiz'

const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every(x => b.includes(x))

/**
 * The quiz as learners will take it, graded here in the browser (nothing is
 * saved). Unlike the real player, it shows the right answers after every check,
 * since the author already knows them.
 */
export function QuizPreview({ questions, passMark }: { questions: QuizQuestion[]; passMark: number }) {
  const ready = questions.filter(q => !questionProblem(q))
  const [answers, setAnswers] = useState<number[][]>(() => ready.map(() => []))
  const [checked, setChecked] = useState(false)

  if (ready.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">
        Finish a question (its text, answers and the right answer) to preview it.
      </p>
    )
  }

  // The questions may have changed since the preview opened.
  const given = ready.map((_, i) => answers[i] ?? [])
  const right = ready.map((q, i) => sameSet(given[i], q.correct))
  const score = right.filter(Boolean).length
  const percent = Math.round((score * 100) / ready.length)
  const passed = percent >= passMark

  const choose = (qi: number, oi: number, multiple: boolean) => {
    setAnswers(() => given.map((a, i) => {
      if (i !== qi) return a
      if (!multiple) return [oi]
      return a.includes(oi) ? a.filter(x => x !== oi) : [...a, oi].sort((x, y) => x - y)
    }))
  }
  const reset = () => { setChecked(false); setAnswers(ready.map(() => [])) }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-900">
        Preview: answers are checked here and not saved.
        {ready.length < questions.length && ` ${questions.length - ready.length} unfinished question${questions.length - ready.length === 1 ? ' is' : 's are'} left out.`}
      </p>
      <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-slate-700">
        <b className="text-text-primary">{ready.length} question{ready.length === 1 ? '' : 's'}</b> · pass with {passMark}% or more
      </p>

      {checked && (
        <div role="status" className={cn('flex flex-wrap items-center gap-3 rounded-2xl border px-5 py-4 text-sm',
          passed ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-300 bg-amber-50 text-amber-900')}>
          <b className="flex-1 text-base">{passed ? 'Passed' : 'Not passed'}: {score} of {ready.length} right ({percent}%)</b>
          <Button type="button" variant="secondary" size="sm" onClick={reset}><ReplayIcon sx={{ fontSize: 17 }} /> Try again</Button>
        </div>
      )}

      <ol className="flex flex-col gap-4">
        {ready.map((q, qi) => {
          const multiple = q.correct.length > 1
          return (
            <li key={qi}>
              <fieldset className={cn('flex flex-col gap-2 rounded-2xl border px-5 py-4',
                checked ? (right[qi] ? 'border-emerald-300 bg-emerald-50/50' : 'border-red-200 bg-red-50/50') : 'border-border bg-white')}>
                <legend className="sr-only">Question {qi + 1}</legend>
                <p className="flex items-start gap-2 text-base font-bold text-text-primary">
                  <span className="text-sky-700">{qi + 1}.</span>
                  <span className="flex-1">{q.prompt}</span>
                  {checked && (right[qi]
                    ? <CheckCircleIcon sx={{ fontSize: 22 }} className="shrink-0 text-emerald-600" titleAccess="Right" />
                    : <CancelIcon sx={{ fontSize: 22 }} className="shrink-0 text-red-500" titleAccess="Not right" />)}
                </p>
                {multiple && <p className="text-xs font-semibold text-text-muted">Select all that apply.</p>}
                {q.options.map((option, oi) => {
                  const chosen = given[qi].includes(oi)
                  const isRight = checked && q.correct.includes(oi)
                  return (
                    <label key={oi} className={cn('flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm',
                      isRight ? 'border-emerald-500 bg-emerald-50' : chosen ? 'border-primary bg-sky-50' : 'border-border bg-white',
                      checked ? 'cursor-default' : 'cursor-pointer hover:border-primary')}>
                      <input type={multiple ? 'checkbox' : 'radio'} name={`preview-q${qi}`} checked={chosen} disabled={checked}
                        onChange={() => choose(qi, oi, multiple)} className="size-4 shrink-0 accent-primary" />
                      <span className="flex-1 text-slate-800">{option}</span>
                      {isRight && <span className="text-xs font-bold text-emerald-700">Right answer</span>}
                    </label>
                  )
                })}
                {checked && q.explanation.trim() && <p className="mt-1 text-sm text-slate-700"><b>Why:</b> {q.explanation.trim()}</p>}
              </fieldset>
            </li>
          )
        })}
      </ol>

      {!checked && (
        <Button type="button" variant="primary" size="md" className="self-start" onClick={() => setChecked(true)}
          disabled={given.some(a => a.length === 0)}>
          Check answers
        </Button>
      )}
    </div>
  )
}
