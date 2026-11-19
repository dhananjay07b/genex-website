import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { cn } from '@/lib/utils'
import type { QuizQuestion } from '@/types/learning'
import { MoreMenu } from './MoreMenu'
import { QuizPreview } from './QuizPreview'
import { QUIZ_LIMITS, blankQuestion, questionProblem } from './quiz'
import { fieldClass } from './draft'

/** What a question asks for, read from its answers: one right answer or several. */
function typeChip(q: QuizQuestion) {
  if (q.correct.length === 0) return { label: 'Mark the right answer', className: 'bg-amber-50 text-amber-800' }
  if (q.correct.length > 1) return { label: 'Select all that apply', className: 'bg-violet-50 text-violet-800' }
  return { label: 'One right answer', className: 'bg-sky-50 text-sky-800' }
}

/**
 * The questions of a quiz lesson. Each card collapses to a one-line summary.
 * Click an answer's circle to mark it right; marking more than one makes it
 * "select all that apply". The pass mark is a slider that also says how many
 * questions that means. "Preview as learner" tries the quiz with local grading.
 */
export function QuizEditor({ questions, onChange, passMark, onPassMark, passMarkError }: {
  questions: QuizQuestion[]
  onChange: (next: QuizQuestion[]) => void
  passMark: string
  onPassMark: (value: string) => void
  passMarkError?: string
}) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  // Which cards are open, by position (kept in step when questions move or go).
  const [open, setOpen] = useState<boolean[]>(() => questions.map((_, i) => questions.length <= 3 || i === 0))
  const mark = Number(passMark) || 0
  const needed = questions.length ? Math.ceil((mark * questions.length) / 100) : 0

  const update = (index: number, next: Partial<QuizQuestion>) =>
    onChange(questions.map((q, i) => (i === index ? { ...q, ...next } : q)))
  const reorder = <T,>(list: T[], from: number, to: number) => {
    const next = [...list]
    const [row] = next.splice(from, 1)
    next.splice(to, 0, row)
    return next
  }
  const moveQuestion = (from: number, to: number) => {
    onChange(reorder(questions, from, to))
    setOpen(prev => reorder(prev, from, to))
  }
  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index))
    setOpen(prev => prev.filter((_, i) => i !== index))
  }
  const duplicate = (index: number) => {
    const copy = { ...questions[index], options: [...questions[index].options], correct: [...questions[index].correct] }
    onChange([...questions.slice(0, index + 1), copy, ...questions.slice(index + 1)])
    setOpen(prev => [...prev.slice(0, index + 1), true, ...prev.slice(index + 1)])
  }
  const addQuestion = () => {
    onChange([...questions, blankQuestion()])
    setOpen(prev => [...prev, true])
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Quiz view" className="inline-flex rounded-xl border border-border bg-surface p-1">
          {([['edit', 'Edit questions', EditOutlinedIcon], ['preview', 'Preview as learner', VisibilityOutlinedIcon]] as const).map(([key, label, Icon]) => (
            <button key={key} type="button" aria-pressed={mode === key} onClick={() => setMode(key)}
              className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors',
                mode === key ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-primary')}>
              <Icon sx={{ fontSize: 17 }} /> {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted">Learners can retake it as often as they like. Passing completes the lesson.</p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="quiz-pass-mark" className="flex flex-wrap items-baseline justify-between gap-2 text-sm font-semibold text-text-primary">
            Pass mark
            <span className="text-sm font-extrabold text-primary tabular-nums">
              {mark}%{questions.length > 0 && <span className="font-semibold text-text-muted"> · {needed} of {questions.length} question{questions.length === 1 ? '' : 's'} to pass</span>}
            </span>
          </label>
          <input id="quiz-pass-mark" type="range" min={10} max={100} step={5} value={mark}
            onChange={e => onPassMark(e.target.value)} className="w-full accent-primary" />
          {passMarkError && <p className="text-xs text-red-500">{passMarkError}</p>}
        </div>
        <p className="text-sm text-text-muted sm:text-right">
          <b className="block text-2xl font-extrabold text-text-primary tabular-nums">{questions.length}</b>
          question{questions.length === 1 ? '' : 's'} · up to {QUIZ_LIMITS.questions}
        </p>
      </div>

      {mode === 'preview' ? (
        <QuizPreview questions={questions} passMark={mark} />
      ) : (
        <>
          {questions.length === 0 && (
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">
              No questions yet. Add the first one below.
            </p>
          )}

          <ol className="flex flex-col gap-3">
            {questions.map((q, qi) => {
              const isOpen = open[qi] ?? true
              const chip = typeChip(q)
              const problem = questionProblem(q)
              return (
                <li key={qi} className={cn('rounded-2xl border bg-white', isOpen ? 'border-sky-200' : 'border-border')}>
                  <div className="flex items-center gap-2 py-2 pl-3 pr-2">
                    <button type="button" aria-expanded={isOpen} onClick={() => setOpen(prev => prev.map((v, i) => (i === qi ? !isOpen : v)))}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 text-left">
                      <span className="size-7 shrink-0 rounded-full bg-brand-tint text-xs font-extrabold text-primary flex items-center justify-center">{qi + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-text-primary">{q.prompt.trim() || `Question ${qi + 1}`}</span>
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                          <span className={cn('rounded-full px-2 py-px font-bold', chip.className)}>{chip.label}</span>
                          {q.options.length} answers
                          {problem && !isOpen && <span className="font-semibold text-amber-800">· {problem}</span>}
                        </span>
                      </span>
                      <ExpandMoreIcon sx={{ fontSize: 20 }} className={cn('shrink-0 text-text-muted transition-transform', isOpen && 'rotate-180')} />
                    </button>
                    <MoreMenu label={`Question ${qi + 1} options`} entries={[
                      { label: 'Move up', icon: ArrowUpwardIcon, disabled: qi === 0, onSelect: () => moveQuestion(qi, qi - 1) },
                      { label: 'Move down', icon: ArrowDownwardIcon, disabled: qi === questions.length - 1, onSelect: () => moveQuestion(qi, qi + 1) },
                      { label: 'Duplicate', icon: ContentCopyOutlinedIcon, disabled: questions.length >= QUIZ_LIMITS.questions, onSelect: () => duplicate(qi) },
                      { kind: 'separator' },
                      { label: 'Delete question', icon: DeleteOutlineIcon, danger: true, onSelect: () => removeQuestion(qi) },
                    ]} />
                  </div>

                  {isOpen && (
                    <div className="flex flex-col gap-3 border-t border-border px-4 pb-4 pt-3">
                      <textarea id={`quiz-q${qi}-prompt`} aria-label={`Question ${qi + 1}`} rows={2} maxLength={500}
                        placeholder="e.g. Which relay clears an internal transformer fault fastest?"
                        value={q.prompt} onChange={e => update(qi, { prompt: e.target.value })}
                        className={cn(fieldClass, 'resize-y text-base font-semibold')} />

                      <fieldset className="flex flex-col gap-2">
                        <legend className="mb-1.5 text-xs font-semibold text-text-muted">Answers · click the circle next to every right answer</legend>
                        {q.options.map((option, oi) => {
                          const right = q.correct.includes(oi)
                          return (
                            <div key={oi} className={cn('flex items-center gap-2 rounded-xl border px-2 py-1.5',
                              right ? 'border-emerald-300 bg-emerald-50' : 'border-border bg-white')}>
                              <button type="button" role="checkbox" aria-checked={right} onClick={() => toggleCorrect(qi, oi)}
                                aria-label={`Answer ${oi + 1} is right`} title={right ? 'Right answer' : 'Mark as right'}
                                className={cn('size-8 shrink-0 rounded-full flex items-center justify-center',
                                  right ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600')}>
                                {right ? <CheckCircleIcon sx={{ fontSize: 22 }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 22 }} />}
                              </button>
                              <input id={`quiz-q${qi}-o${oi}`} aria-label={`Answer ${oi + 1}`} placeholder={`Answer ${oi + 1}`} maxLength={200}
                                value={option} onChange={e => update(qi, { options: q.options.map((o, i) => (i === oi ? e.target.value : o)) })}
                                className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm text-text-primary outline-none placeholder:text-text-muted" />
                              {right && <span className="hidden sm:inline text-xs font-bold text-emerald-700">Right</span>}
                              <button type="button" onClick={() => removeOption(qi, oi)} disabled={q.options.length <= QUIZ_LIMITS.minOptions}
                                aria-label={`Remove answer ${oi + 1}`}
                                className="size-8 shrink-0 rounded-lg flex items-center justify-center text-text-muted hover:bg-white hover:text-red-600 disabled:opacity-30">
                                <CloseIcon sx={{ fontSize: 17 }} />
                              </button>
                            </div>
                          )
                        })}
                      </fieldset>

                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {q.options.length < QUIZ_LIMITS.maxOptions && (
                          <button type="button" onClick={() => update(qi, { options: [...q.options, ''] })}
                            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                            <AddIcon sx={{ fontSize: 17 }} /> Add answer
                          </button>
                        )}
                        {q.explanation === '' && (
                          <button type="button" onClick={() => update(qi, { explanation: ' ' })}
                            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                            <AddIcon sx={{ fontSize: 17 }} /> Add explanation
                          </button>
                        )}
                      </div>
                      {q.explanation !== '' && (
                        <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-primary">
                          <span className="flex justify-between gap-2">
                            Explanation <span className="font-normal text-text-muted">Shown after answering</span>
                          </span>
                          <textarea rows={2} maxLength={1000} autoFocus={q.explanation === ' '}
                            placeholder="Why this is the answer"
                            value={q.explanation === ' ' ? '' : q.explanation}
                            onChange={e => update(qi, { explanation: e.target.value || ' ' })}
                            className={cn(fieldClass, 'resize-y font-normal')} />
                          <button type="button" onClick={() => update(qi, { explanation: '' })} className="self-start text-xs font-bold text-text-muted hover:text-red-600">
                            Remove explanation
                          </button>
                        </label>
                      )}
                      {problem && <p className="text-xs font-semibold text-amber-800">{problem}</p>}
                    </div>
                  )}
                </li>
              )
            })}
          </ol>

          <button type="button" onClick={addQuestion} disabled={questions.length >= QUIZ_LIMITS.questions}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-sky-300 bg-brand-tint px-3 py-3 text-sm font-bold text-primary hover:border-solid transition disabled:opacity-40">
            <AddIcon sx={{ fontSize: 18 }} /> Add a question
          </button>
        </>
      )}
    </div>
  )
}
