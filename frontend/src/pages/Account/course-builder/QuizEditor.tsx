import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import type { ReactNode } from 'react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import type { QuizQuestion } from '@/types/learning'
import { QUIZ_LIMITS, blankQuestion } from './quiz'

/**
 * The questions of a quiz lesson, edited in place: each with 2 to 6 answers,
 * the right ones ticked (more than one makes it "select all that apply"), and
 * an optional explanation learners see after answering. Plus the pass mark.
 */
export function QuizEditor({ questions, onChange, passMark, onPassMark, passMarkError }: {
  questions: QuizQuestion[]
  onChange: (next: QuizQuestion[]) => void
  passMark: string
  onPassMark: (value: string) => void
  passMarkError?: string
}) {
  const update = (index: number, next: Partial<QuizQuestion>) =>
    onChange(questions.map((q, i) => (i === index ? { ...q, ...next } : q)))
  const move = (index: number, by: number) => {
    const next = [...questions]
    const [q] = next.splice(index, 1)
    next.splice(index + by, 0, q)
    onChange(next)
  }
  const removeOption = (qi: number, oi: number) => {
    const q = questions[qi]
    update(qi, {
      options: q.options.filter((_, i) => i !== oi),
      correct: q.correct.filter(i => i !== oi).map(i => (i > oi ? i - 1 : i)),
    })
  }
  const toggleCorrect = (qi: number, oi: number) => {
    const q = questions[qi]
    update(qi, { correct: q.correct.includes(oi) ? q.correct.filter(i => i !== oi) : [...q.correct, oi].sort((a, b) => a - b) })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
        <div className="w-32">
          <Input id="quiz-pass-mark" label="Pass mark (%)" type="number" inputMode="numeric" min={1} max={100}
            value={passMark} error={passMarkError} onChange={e => onPassMark(e.target.value)} />
        </div>
        <p className="text-xs text-text-muted leading-relaxed pb-3 flex-1 min-w-48">
          Learners pass with at least this share of right answers. Passing completes the lesson; they can retake it as often as they like.
        </p>
      </div>

      {questions.length === 0 && (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">
          No questions yet. Add the first one below.
        </p>
      )}

      <ol className="flex flex-col gap-4">
        {questions.map((q, qi) => (
          <li key={qi} className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-700">
                Question {qi + 1}{q.correct.length > 1 ? ' · select all that apply' : ''}
              </span>
              <span className="flex items-center gap-1">
                <IconButton label={`Move question ${qi + 1} up`} disabled={qi === 0} onClick={() => move(qi, -1)}>
                  <ArrowUpwardIcon sx={{ fontSize: 17 }} />
                </IconButton>
                <IconButton label={`Move question ${qi + 1} down`} disabled={qi === questions.length - 1} onClick={() => move(qi, 1)}>
                  <ArrowDownwardIcon sx={{ fontSize: 17 }} />
                </IconButton>
                <IconButton label={`Remove question ${qi + 1}`} danger onClick={() => onChange(questions.filter((_, i) => i !== qi))}>
                  <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </span>
            </div>

            <Input id={`quiz-q${qi}-prompt`} aria-label={`Question ${qi + 1}`} placeholder="e.g. Which relay clears an internal transformer fault fastest?"
              maxLength={500} value={q.prompt} onChange={e => update(qi, { prompt: e.target.value })} />

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-xs font-semibold text-text-muted">Answers: tick every right one</legend>
              {q.options.map((option, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input type="checkbox" checked={q.correct.includes(oi)} onChange={() => toggleCorrect(qi, oi)}
                    aria-label={`Answer ${oi + 1} is right`} className="size-4 shrink-0 accent-emerald-600" />
                  <div className="flex-1 min-w-0">
                    <Input id={`quiz-q${qi}-o${oi}`} aria-label={`Answer ${oi + 1}`} placeholder={`Answer ${oi + 1}`} maxLength={200}
                      value={option} onChange={e => update(qi, { options: q.options.map((o, i) => (i === oi ? e.target.value : o)) })}
                      className={cn(q.correct.includes(oi) && 'border-emerald-500')} />
                  </div>
                  <IconButton label={`Remove answer ${oi + 1}`} disabled={q.options.length <= QUIZ_LIMITS.minOptions} onClick={() => removeOption(qi, oi)}>
                    <CloseIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </div>
              ))}
              {q.options.length < QUIZ_LIMITS.maxOptions && (
                <button type="button" onClick={() => update(qi, { options: [...q.options, ''] })}
                  className="self-start flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-primary hover:bg-white">
                  <AddIcon sx={{ fontSize: 15 }} /> Add an answer
                </button>
              )}
            </fieldset>

            <Input id={`quiz-q${qi}-why`} aria-label={`Explanation for question ${qi + 1} (optional)`} maxLength={1000}
              placeholder="Why this is the answer (optional, shown after answering)"
              value={q.explanation} onChange={e => update(qi, { explanation: e.target.value })} />
          </li>
        ))}
      </ol>

      <button type="button" onClick={() => onChange([...questions, blankQuestion()])} disabled={questions.length >= QUIZ_LIMITS.questions}
        className="self-start flex items-center gap-1.5 rounded-full border border-dashed border-primary px-4 py-2 text-xs font-bold text-primary hover:bg-sky-50 disabled:opacity-50">
        <AddIcon sx={{ fontSize: 16 }} /> Add a question
        <span className="font-semibold text-text-muted">({questions.length}/{QUIZ_LIMITS.questions})</span>
      </button>
    </div>
  )
}

function IconButton({ label, onClick, disabled, danger, children }: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: ReactNode
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label}
      className={cn('size-8 shrink-0 rounded-lg flex items-center justify-center text-text-muted disabled:opacity-30',
        danger ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-white hover:text-text-primary')}>
      {children}
    </button>
  )
}
