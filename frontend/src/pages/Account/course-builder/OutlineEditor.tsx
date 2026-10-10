import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { AccessBadge } from '@/components/gelearn/AccessBadge'
import { COURSE_ITEM_KINDS } from '@/components/gelearn/courseItemKinds'
import type { CourseTarget } from '@/types/learning'
import { AddButton, BuilderCard, RowControls } from './parts'
import { LIMITS, allLessons, fieldClass, formatMinutes, keyOf, lessonDetail, move, newKey, totalMinutes, type Draft, type DraftModule } from './draft'

type Patch = (next: Partial<Draft>) => void

/** Where a lesson lives: a module's index, or "loose" for lessons in no module. */
type Place = number | 'loose'


function LessonRow({ item, index, count, place, modules, onMove, onRemove, onRelocate }: {
  item: CourseTarget
  index: number
  count: number
  place: Place
  modules: DraftModule[]
  onMove: (from: number, to: number) => void
  onRemove: () => void
  onRelocate: (to: Place) => void
}) {
  const { icon: Icon } = COURSE_ITEM_KINDS[item.kind]
  return (
    <li className="flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-2 px-3 py-2.5 border-l-2 border-transparent hover:bg-sky-50 hover:border-primary transition-colors">
      {/* On phones the title takes its own line and the controls wrap underneath. */}
      <span className="flex items-center gap-3 min-w-0 w-full sm:w-auto sm:flex-1">
        <Icon sx={{ fontSize: 19 }} className="text-sky-700 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-text-primary truncate">{item.title}</span>
          <span className="block text-xs text-text-muted truncate">{lessonDetail(item, COURSE_ITEM_KINDS[item.kind].label)}</span>
        </span>
      </span>
      <span className="flex flex-wrap items-center justify-end gap-2 ml-auto">
      <AccessBadge access={item.access} price={item.price} currency={item.currency} />
      {modules.length > 0 && (
        <select value={String(place)} onChange={e => onRelocate(e.target.value === 'loose' ? 'loose' : Number(e.target.value))}
          aria-label={`Move ${item.title} to`}
          className="rounded-md border border-border bg-white px-2 py-1 text-xs font-semibold text-text-primary max-w-40">
          {modules.map((m, i) => <option key={m.key} value={i}>Module {i + 1}{m.title ? `: ${m.title}` : ''}</option>)}
          <option value="loose">Not in a module</option>
        </select>
      )}
      <RowControls label={item.title} index={index} count={count} onMove={onMove} onRemove={onRemove} />
      </span>
    </li>
  )
}

export function OutlineEditor({ draft, patch, error }: { draft: Draft; patch: Patch; error?: string }) {
  const { modules, loose } = draft
  const lessons = allLessons(draft)
  const paid = lessons.filter(l => l.access === 'paid')
  const total = totalMinutes(lessons)

  const setModule = (i: number, next: Partial<DraftModule>) =>
    patch({ modules: modules.map((m, j) => (j === i ? { ...m, ...next } : m)) })

  const removeModule = (i: number) =>
    // Its lessons stay in the course, under "Not in a module".
    patch({ modules: modules.filter((_, j) => j !== i), loose: [...loose, ...modules[i].items] })

  const relocate = (item: CourseTarget, from: Place, to: Place) => {
    if (from === to) return
    const key = keyOf(item)
    const nextModules = modules.map((m, i) => ({
      ...m,
      items: i === to ? [...m.items.filter(x => keyOf(x) !== key), item] : m.items.filter(x => keyOf(x) !== key),
    }))
    const nextLoose = to === 'loose' ? [...loose.filter(x => keyOf(x) !== key), item] : loose.filter(x => keyOf(x) !== key)
    patch({ modules: nextModules, loose: nextLoose })
  }

  const rows = (items: CourseTarget[], place: Place, setItems: (items: CourseTarget[]) => void) => (
    <ol className="border border-border rounded-xl divide-y divide-border overflow-hidden">
      {items.map((item, i) => (
        <LessonRow key={keyOf(item)} item={item} index={i} count={items.length} place={place} modules={modules}
          onMove={(from, to) => setItems(move(items, from, to))}
          onRemove={() => setItems(items.filter((_, j) => j !== i))}
          onRelocate={to => relocate(item, place, to)} />
      ))}
    </ol>
  )

  return (
    <BuilderCard n={3} title="Lessons and modules"
      hint={`${modules.length ? `${modules.length} module${modules.length === 1 ? '' : 's'} · ` : ''}${lessons.length}/${LIMITS.items} lessons${total ? ` · about ${formatMinutes(total)}` : ''}`}>
      {modules.map((m, i) => {
        const mins = totalMinutes(m.items)
        return (
          <details key={m.key} open className="group border border-border rounded-xl overflow-hidden">
            <summary className="flex items-center gap-3 px-4 py-3 bg-surface cursor-pointer list-none details-marker-hidden">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-text-primary truncate">Module {i + 1}{m.title ? `: ${m.title}` : ''}</span>
                <span className="block text-xs text-text-muted">{m.items.length} lesson{m.items.length === 1 ? '' : 's'}{mins ? ` · ${formatMinutes(mins)}` : ''}</span>
              </span>
              <ExpandMoreIcon sx={{ fontSize: 20 }} className="text-primary transition-transform group-open:rotate-180" />
            </summary>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-end gap-3">
                <label className="flex-1 min-w-0 flex flex-col gap-1.5 text-sm font-semibold text-text-primary">
                  Module title
                  <input className={fieldClass} value={m.title} maxLength={LIMITS.moduleTitle} placeholder="e.g. Field communication"
                    onChange={e => setModule(i, { title: e.target.value })} />
                </label>
                <label className="flex-1 min-w-0 flex flex-col gap-1.5 text-sm font-semibold text-text-primary">
                  <span>Short summary <span className="font-normal text-text-muted">(optional)</span></span>
                  <input className={fieldClass} value={m.summary} maxLength={LIMITS.moduleSummary} placeholder="One line on what this module covers"
                    onChange={e => setModule(i, { summary: e.target.value })} />
                </label>
                <RowControls label={`module ${i + 1}`} index={i} count={modules.length}
                  onMove={(from, to) => patch({ modules: move(modules, from, to) })} onRemove={() => removeModule(i)} />
              </div>
              {m.items.length
                ? rows(m.items, i, items => setModule(i, { items }))
                : <p className="text-sm text-text-muted border border-dashed border-border rounded-xl px-4 py-3 text-center">No lessons yet. Add them from the library below.</p>}
            </div>
          </details>
        )
      })}

      {(loose.length > 0 || modules.length === 0) && (
        <div className="flex flex-col gap-2">
          {modules.length > 0 && <p className="text-sm font-bold text-text-primary">Not in a module <span className="font-normal text-text-muted">· shown after the modules</span></p>}
          {loose.length
            ? rows(loose, 'loose', items => patch({ loose: items }))
            : <p className="text-sm text-text-muted border border-dashed border-border rounded-xl px-4 py-6 text-center">Add lessons from the library below. They play in this order.</p>}
        </div>
      )}

      {paid.length > 0 && draft.access !== 'paid' && (
        // Learners must open every lesson to complete a course; a paid one has to be bought first.
        <p role="status" className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
          <InfoOutlinedIcon sx={{ fontSize: 16 }} className="mt-px shrink-0 text-amber-700" />
          <span>
            <b>{paid.length === 1 ? '1 lesson is paid' : `${paid.length} lessons are paid`}</b> ({paid.map(l => `“${l.title}”`).join(', ')}).
            Learners must buy {paid.length === 1 ? 'it' : 'them'} to complete this {draft.access === 'free' ? 'free' : 'members'} course and get the certificate.
            The course page tells them before they enroll.
          </span>
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <AddButton disabled={modules.length >= LIMITS.modules}
        onClick={() => patch({ modules: [...modules, { key: newKey(), id: null, title: '', summary: '', items: [] }] })}>
        Add a module
      </AddButton>
      <p className="flex gap-2 text-xs text-text-muted">
        <InfoOutlinedIcon sx={{ fontSize: 15 }} className="text-primary shrink-0 mt-px" />
        Modules are optional. Without them, lessons show as one list. Learners keep their progress when you reorder or move lessons.
      </p>
    </BuilderCard>
  )
}
