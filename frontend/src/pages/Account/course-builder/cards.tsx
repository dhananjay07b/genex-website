import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { AddButton, BuilderCard, ListEditor, RowControls } from './parts'
import { LANGUAGES, LIMITS, fieldClass, move, type Draft } from './draft'

type Patch = (next: Partial<Draft>) => void

export function BasicsCard({ draft, patch, titleError }: { draft: Draft; patch: Patch; titleError?: string }) {
  return (
    <BuilderCard n={1} title="Basics" hint="Shown at the top of the course page">
      <div>
        <input value={draft.title} onChange={e => patch({ title: e.target.value })} placeholder="Course title" aria-label="Course title"
          maxLength={LIMITS.title}
          className="w-full border-0 border-b border-dashed border-transparent hover:border-border focus:border-border outline-none text-2xl lg:text-3xl font-extrabold text-text-primary py-1 placeholder:text-text-muted/50" />
        {titleError && <p className="text-xs text-red-500 mt-1">{titleError}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cb-summary" className="flex justify-between gap-2 text-sm font-semibold text-text-primary">
          Summary <span className="text-xs font-semibold text-text-muted tabular-nums">{draft.summary.length}/{LIMITS.summary}</span>
        </label>
        <input id="cb-summary" className={fieldClass} value={draft.summary} maxLength={LIMITS.summary}
          onChange={e => patch({ summary: e.target.value })}
          placeholder="One or two sentences: what the course covers and who it's for." />
        <p className="text-xs text-text-muted">Under the title and on course cards.</p>
      </div>
      <Textarea label="About this course" rows={5} value={draft.description} onChange={e => patch({ description: e.target.value })}
        placeholder="What the course covers, how it's organised, and what learners will be able to do after it." />
      <div className="sm:max-w-xs">
        <Select label="Language" options={LANGUAGES.map(l => ({ value: l, label: l }))} value={draft.language}
          onChange={e => patch({ language: e.target.value })} />
      </div>
    </BuilderCard>
  )
}

export function WhatLearnersGetCard({ draft, patch }: { draft: Draft; patch: Patch }) {
  return (
    <BuilderCard n={2} title="What learners get" hint={`Short lines, up to ${LIMITS.line} characters each`}>
      <ListEditor label="What you'll learn" word="outcome" lines={draft.outcomes} max={LIMITS.outcomes} maxLength={LIMITS.line}
        onChange={outcomes => patch({ outcomes })}
        placeholder="e.g. Map Modbus registers for a new inverter"
        help="2 to 8 lines. Start each with a verb." />
      <ListEditor label="Before you start" word="prerequisite" lines={draft.prerequisites} max={LIMITS.prerequisites} maxLength={LIMITS.line}
        onChange={prerequisites => patch({ prerequisites })}
        placeholder="e.g. Basic electrical systems"
        help="Optional. The first one also shows in the course's facts." />
    </BuilderCard>
  )
}

export function FaqCard({ draft, patch, n }: { draft: Draft; patch: Patch; n: number }) {
  const faqs = draft.faqs
  const set = (i: number, key: 'question' | 'answer', value: string) =>
    patch({ faqs: faqs.map((f, j) => (j === i ? { ...f, [key]: value } : f)) })
  return (
    <BuilderCard n={n} title="Course FAQ" hint={`${faqs.length}/${LIMITS.faqs} · optional`}>
      {faqs.length === 0 && (
        <p className="text-sm text-text-muted border border-dashed border-border rounded-xl px-4 py-4 text-center">No questions yet. Add the ones learners ask you most.</p>
      )}
      {faqs.map((faq, i) => (
        <div key={i} className="flex gap-2 items-start border border-border rounded-xl p-3">
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <input className={fieldClass} value={faq.question} maxLength={LIMITS.question} placeholder="Question"
              onChange={e => set(i, 'question', e.target.value)} aria-label={`Question ${i + 1}`} />
            <textarea className={`${fieldClass} min-h-20 resize-y`} value={faq.answer} maxLength={LIMITS.answer} placeholder="Answer"
              onChange={e => set(i, 'answer', e.target.value)} aria-label={`Answer ${i + 1}`} />
          </div>
          <RowControls label={`question ${i + 1}`} index={i} count={faqs.length}
            onMove={(from, to) => patch({ faqs: move(faqs, from, to) })}
            onRemove={() => patch({ faqs: faqs.filter((_, j) => j !== i) })} />
        </div>
      ))}
      <AddButton onClick={() => patch({ faqs: [...faqs, { question: '', answer: '' }] })} disabled={faqs.length >= LIMITS.faqs}>Add a question</AddButton>
      <p className="text-xs text-text-muted">Shown before GeLearn&apos;s standard questions (access, certificates, progress). Questions without an answer aren&apos;t saved.</p>
    </BuilderCard>
  )
}
