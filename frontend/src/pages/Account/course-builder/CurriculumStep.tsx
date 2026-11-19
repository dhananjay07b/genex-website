import { useState, type ReactNode } from 'react'
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined'
import { COURSE_LESSON_TYPES } from '@/components/gelearn/courseItemKinds'
import { apiFetch } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/pages/Account/dashboard/ConfirmDialog'
import type { CourseLesson, CourseLessonSaved, CourseLessonType, CourseRevisionInfo, CourseTarget } from '@/types/learning'
import { MoreMenu, type MenuEntry } from './MoreMenu'
import { LIMITS, allLessons, blankModule, formatMinutes, move, type Draft, type DraftModule } from './draft'

type Patch = (next: Partial<Draft>) => void

/** A lesson to open: an existing one, or a new one of a type in a module. */
export type LessonTarget = { lessonId: number } | { kind: CourseLessonType; moduleKey: string }

const NEW_TYPES: { kind: CourseLessonType; hint: string }[] = [
  { kind: 'text', hint: 'Write it here, with headings, images and tables' },
  { kind: 'video', hint: 'Paste a YouTube or Vimeo link' },
  { kind: 'quiz', hint: 'Questions learners must pass' },
]

/** Each lesson type's icon tile colours. */
const TYPE_TILE: Record<CourseLessonType, string> = {
  text: 'bg-sky-100 text-sky-700',
  video: 'bg-emerald-50 text-emerald-700',
  quiz: 'bg-amber-50 text-amber-700',
}

/** Closing the "how courses are built" note is remembered in this browser; "How courses are built" brings it back. */
const HELP_KEY = 'gelearn.builder.curriculumHelpHidden'
const MODULE_ID = (m: DraftModule) => `module:${m.key}`
const LESSON_ID = (item: CourseTarget) => `lesson:${item.id}`

function readHelpHidden() {
  try { return window.localStorage.getItem(HELP_KEY) === '1' } catch { return false }
}

/** Where a lesson of a live course stands in Genex review, or null when there's nothing to say. */
function reviewTag(lesson: CourseLesson, sentWithOutline: boolean, status: CourseRevisionInfo['status'] | null) {
  const waiting = lesson.review === 'changed' || (lesson.review === 'new' && sentWithOutline)
  if (waiting && status === 'rejected') return { label: 'Sent back by Genex', className: 'bg-amber-100 text-amber-800' }
  if (lesson.review === 'changed') return { label: 'Changes in review', className: 'bg-sky-100 text-sky-800' }
  if (waiting) return { label: 'New · in review', className: 'bg-sky-100 text-sky-800' }
  if (lesson.review === 'new') return { label: 'Not live yet', className: 'bg-surface text-text-primary border border-border' }
  return null
}

/** "Video lesson · 12:30", "Quiz · 5 questions · pass at 70%", "Text lesson · about 8 min". */
function lessonLine(item: CourseTarget, lesson: CourseLesson | undefined) {
  const type = lesson?.kind ?? item.lesson_type ?? 'text'
  const detail = type === 'video'
    ? lesson?.duration ?? item.meta
    : type === 'quiz'
      ? lesson && lesson.questions.length ? `${lesson.questions.length} question${lesson.questions.length === 1 ? '' : 's'} · pass at ${lesson.pass_mark}%` : ''
      : (lesson?.minutes ?? item.minutes) ? `about ${formatMinutes(lesson?.minutes ?? item.minutes)}` : ''
  return [COURSE_LESSON_TYPES[type].label, detail].filter(Boolean).join(' · ')
}

/**
 * Step 2 of the builder: modules and their lessons. Every lesson sits in a module.
 * "Add lesson" under a module picks a type, opens its editor, and puts the saved
 * lesson in that module. Drag by the handle to reorder (keyboard too), or use ⋯.
 */
export function CurriculumStep({
  courseId, live, revision, draft, patch, lessons, setLessons, error, opening, onOpenLesson,
  onLessonSaved, onLessonDeleted, onRevision,
}: {
  /** null until the course is first saved. */
  courseId: number | null
  live: boolean
  revision: CourseRevisionInfo | null
  draft: Draft
  patch: Patch
  /** The course's own lessons, with their review state; null while loading. */
  lessons: CourseLesson[] | null
  setLessons: (update: (prev: CourseLesson[] | null) => CourseLesson[] | null) => void
  error?: string
  /** The course is being saved before a lesson's editor opens. */
  opening: boolean
  /** Opens a lesson's editor page (a new one goes into that module); the builder saves pending changes first. */
  onOpenLesson: (target: LessonTarget) => void
  /** Keeps the outline's copy of a lesson in step after an edit. */
  onLessonSaved: (card: CourseTarget) => void
  /** The server already took it out of the outline. */
  onLessonDeleted: (card: CourseTarget) => void
  onRevision: (revision: CourseRevisionInfo | null) => void
}) {
  const { modules } = draft
  const [picking, setPicking] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<{ title: string; lessons: CourseTarget[]; moduleKey: string | null; busy: boolean } | null>(null)
  const [helpHidden, setHelpHidden] = useState(readHelpHidden)
  const [message, setMessage] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const byId = new Map((lessons ?? []).map(l => [l.id, l]))
  const placed = allLessons(draft)
  const placedIds = new Set(placed.map(i => i.id))
  const unplaced = (lessons ?? []).filter(l => !placedIds.has(l.id))
  const full = placed.length + unplaced.length >= LIMITS.items
  const outlineHeld = revision?.changed.includes('outline') ?? false
  const counts = { text: 0, video: 0, quiz: 0 }
  placed.forEach(i => { counts[byId.get(i.id)?.kind ?? i.lesson_type ?? 'text'] += 1 })
  const minutes = placed.reduce((sum, i) => sum + (byId.get(i.id)?.minutes ?? i.minutes ?? 0), 0)

  const setModule = (key: string, next: Partial<DraftModule>) =>
    patch({ modules: modules.map(m => (m.key === key ? { ...m, ...next } : m)) })
  const setItems = (key: string, items: CourseTarget[]) => setModule(key, { items })

  const moveLesson = (item: CourseTarget, toKey: string, toIndex?: number) => {
    const without = modules.map(m => ({ ...m, items: m.items.filter(x => x.id !== item.id) }))
    patch({
      modules: without.map(m => {
        if (m.key !== toKey) return m
        const items = [...m.items]
        items.splice(toIndex ?? items.length, 0, item)
        return { ...m, items }
      }),
    })
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId.startsWith('module:')) {
      const from = modules.findIndex(m => MODULE_ID(m) === activeId)
      const to = modules.findIndex(m => MODULE_ID(m) === overId || m.items.some(i => LESSON_ID(i) === overId))
      if (from >= 0 && to >= 0) patch({ modules: move(modules, from, to) })
      return
    }
    const from = modules.find(m => m.items.some(i => LESSON_ID(i) === activeId))
    const item = from?.items.find(i => LESSON_ID(i) === activeId)
    if (!from || !item) return
    // Dropped on a lesson: take its place. Dropped on a module (e.g. an empty one): go to its end.
    const target = modules.find(m => m.items.some(i => LESSON_ID(i) === overId)) ?? modules.find(m => MODULE_ID(m) === overId)
    if (!target) return
    if (target.key === from.key) {
      const i = from.items.indexOf(item)
      const j = from.items.findIndex(x => LESSON_ID(x) === overId)
      if (j >= 0) setItems(from.key, move(from.items, i, j))
      return
    }
    const j = target.items.findIndex(x => LESSON_ID(x) === overId)
    moveLesson(item, target.key, j >= 0 ? j : undefined)
  }

  function start(kind: CourseLessonType, moduleKey: string) {
    setMessage('')
    setPicking(null)
    onOpenLesson({ kind, moduleKey })
  }

  function saved({ course_revision, ...lesson }: CourseLessonSaved) {
    setLessons(prev => (prev ?? []).map(l => (l.id === lesson.id ? lesson : l)))
    onLessonSaved(lesson.card)
    onRevision(course_revision)
  }

  async function togglePreview(item: CourseTarget) {
    if (courseId === null) return
    const lesson = byId.get(item.id)
    try {
      const result = await apiFetch<CourseLessonSaved>(`/api/learning/me/courses/${courseId}/lessons/${item.id}/`, {
        method: 'PATCH', body: { is_preview: !(lesson?.is_preview ?? item.is_preview) },
      })
      saved(result)
    } catch {
      setMessage("Couldn't change the free preview. Please try again.")
    }
  }

  async function confirmDelete() {
    if (!deleting || courseId === null) return
    setDeleting({ ...deleting, busy: true })
    try {
      let latest: CourseRevisionInfo | null = revision
      for (const card of deleting.lessons) {
        const { course_revision } = await apiFetch<{ course_revision: CourseRevisionInfo | null }>(
          `/api/learning/me/courses/${courseId}/lessons/${card.id}/`, { method: 'DELETE' })
        latest = course_revision
        setLessons(prev => (prev ?? []).filter(l => l.id !== card.id))
        onLessonDeleted(card)
      }
      onRevision(latest)
      if (deleting.moduleKey) patch({ modules: modules.filter(m => m.key !== deleting.moduleKey) })
      setDeleting(null)
    } catch {
      setMessage("Couldn't delete everything. Please try again.")
      setDeleting(null)
    }
  }

  function removeModule(m: DraftModule) {
    if (m.items.length === 0) {
      patch({ modules: modules.filter(x => x.key !== m.key) })
      return
    }
    setDeleting({ title: m.title.trim() || `Module ${modules.indexOf(m) + 1}`, lessons: m.items, moduleKey: m.key, busy: false })
  }

  function hideHelp() {
    setHelpHidden(true)
    try { window.localStorage.setItem(HELP_KEY, '1') } catch { /* the help just shows again next time */ }
  }

  function showHelp() {
    setHelpHidden(false)
    try { window.localStorage.removeItem(HELP_KEY) } catch { /* nothing to undo */ }
  }

  const lessonMenu = (item: CourseTarget, m: DraftModule, index: number): MenuEntry[] => {
    const lesson = byId.get(item.id)
    const preview = lesson?.is_preview ?? item.is_preview ?? false
    const others = modules.filter(x => x.key !== m.key)
    return [
      { label: 'Edit lesson', icon: EditOutlinedIcon, onSelect: () => onOpenLesson({ lessonId: item.id }) },
      { label: `Free preview ${preview ? 'on' : 'off'}`, icon: preview ? ToggleOnIcon : ToggleOffOutlinedIcon, on: preview, onSelect: () => void togglePreview(item) },
      { kind: 'separator' },
      { label: 'Move up', icon: ArrowUpwardIcon, disabled: index === 0, onSelect: () => setItems(m.key, move(m.items, index, index - 1)) },
      { label: 'Move down', icon: ArrowDownwardIcon, disabled: index === m.items.length - 1, onSelect: () => setItems(m.key, move(m.items, index, index + 1)) },
      ...(others.length ? [{ kind: 'heading', label: 'Move to' } as const] : []),
      ...others.map(x => ({
        label: `Module ${modules.indexOf(x) + 1}${x.title.trim() ? `: ${x.title.trim()}` : ''}`,
        icon: DriveFileMoveOutlinedIcon, onSelect: () => moveLesson(item, x.key),
      })),
      { kind: 'separator' },
      { label: 'Delete lesson', icon: DeleteOutlineIcon, danger: true, onSelect: () => setDeleting({ title: item.title, lessons: [item], moduleKey: null, busy: false }) },
    ]
  }

  const moduleMenu = (m: DraftModule, index: number): MenuEntry[] => [
    { label: 'Move module up', icon: ArrowUpwardIcon, disabled: index === 0, onSelect: () => patch({ modules: move(modules, index, index - 1) }) },
    { label: 'Move module down', icon: ArrowDownwardIcon, disabled: index === modules.length - 1, onSelect: () => patch({ modules: move(modules, index, index + 1) }) },
    { kind: 'separator' },
    {
      label: m.items.length ? `Delete module and its ${m.items.length} lesson${m.items.length === 1 ? '' : 's'}` : 'Delete module',
      icon: DeleteOutlineIcon, danger: true, onSelect: () => removeModule(m),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {!helpHidden && (
        <div className="flex gap-3 items-start rounded-2xl border border-border border-l-4 border-l-primary bg-white p-4">
          <ol className="flex-1 grid gap-3 md:grid-cols-3">
            {[
              ['Make a module', 'A module is a chapter, such as “Field communication”.'],
              ['Add lessons to it', 'A text lesson, a video lesson or a quiz. Each lesson sits in one module.'],
              ['Learners finish every lesson', 'They open each text and video lesson and pass each quiz to get the certificate.'],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-2.5">
                <span className="size-6 shrink-0 rounded-full bg-sky-50 border border-sky-200 text-xs font-extrabold text-primary flex items-center justify-center">{i + 1}</span>
                <span className="min-w-0">
                  <b className="block text-sm text-text-primary">{title}</b>
                  <span className="block text-xs text-text-muted leading-relaxed">{body}</span>
                </span>
              </li>
            ))}
          </ol>
          <button type="button" onClick={hideHelp} aria-label="Hide this help"
            className="size-8 shrink-0 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface hover:text-text-primary">
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      )}

      {live && (
        <p className="flex gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-xs text-sky-900 leading-relaxed">
          <InfoOutlinedIcon sx={{ fontSize: 15 }} className="shrink-0 mt-px" />
          This course is live. Edits to a lesson go to Genex for review, and learners keep the current version until they&apos;re
          approved. A new lesson goes for review when you save the course.
        </p>
      )}

      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
        <span><b className="text-text-primary tabular-nums">{modules.length}</b> module{modules.length === 1 ? '' : 's'}</span>
        <span><b className="text-text-primary tabular-nums">{placed.length}</b>/{LIMITS.items} lessons</span>
        {(['text', 'video', 'quiz'] as const).map(t => {
          const { icon: Icon } = COURSE_LESSON_TYPES[t]
          return (
            <span key={t} className="inline-flex items-center gap-1">
              <Icon sx={{ fontSize: 16 }} className="text-text-muted" />
              <b className="text-text-primary tabular-nums">{counts[t]}</b> {t === 'quiz' ? (counts[t] === 1 ? 'quiz' : 'quizzes') : t}
            </span>
          )
        })}
        {minutes > 0 && <span>about {formatMinutes(minutes)}</span>}
        {helpHidden && (
          <button type="button" onClick={showHelp} className="ml-auto inline-flex items-center gap-1 font-bold text-primary hover:underline">
            <HelpOutlineIcon sx={{ fontSize: 16 }} /> How courses are built
          </button>
        )}
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={modules.map(MODULE_ID)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3.5">
            {modules.map((m, mi) => (
              <ModuleCard key={m.key} module={m} index={mi} menu={moduleMenu(m, mi)}
                titleMissing={Boolean(error) && !m.title.trim() && m.items.length > 0}
                onChange={next => setModule(m.key, next)}>
                <SortableContext items={m.items.map(LESSON_ID)} strategy={verticalListSortingStrategy}>
                  <ol className="flex flex-col gap-0.5 p-1.5 min-h-2" aria-label={`Lessons in module ${mi + 1}`}>
                    {m.items.map((item, li) => {
                      const lesson = byId.get(item.id)
                      const tag = lesson ? reviewTag(lesson, outlineHeld, revision?.status ?? null) : null
                      return (
                        <LessonRow key={item.id} item={item} lesson={lesson} line={lessonLine(item, lesson)} tag={tag}
                          menu={lessonMenu(item, m, li)}
                          onEdit={() => onOpenLesson({ lessonId: item.id })} />
                      )
                    })}
                  </ol>
                </SortableContext>
                <div className="px-3.5 pb-3.5 pt-1">
                  {picking === m.key ? (
                    <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold text-text-primary">What kind of lesson?</span>
                        <button type="button" onClick={() => setPicking(null)} aria-label="Cancel"
                          className="size-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-white hover:text-text-primary">
                          <CloseIcon sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {NEW_TYPES.map(({ kind, hint }) => {
                          const { icon: Icon, label } = COURSE_LESSON_TYPES[kind]
                          return (
                            <button key={kind} type="button" onClick={() => start(kind, m.key)} disabled={opening}
                              className="flex items-center gap-2.5 rounded-xl border border-border bg-white p-2.5 text-left hover:border-primary hover:shadow-sm transition disabled:opacity-50">
                              <span className={cn('size-9 shrink-0 rounded-lg flex items-center justify-center', TYPE_TILE[kind])}><Icon sx={{ fontSize: 20 }} /></span>
                              <span className="min-w-0">
                                <b className="block text-sm text-text-primary">{label}</b>
                                <span className="block text-xs text-text-muted leading-snug">{hint}</span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      {opening && <p role="status" className="text-xs font-semibold text-text-muted">Saving the course…</p>}
                    </div>
                  ) : (
                    <button type="button" onClick={() => { setMessage(''); setPicking(m.key) }} disabled={full}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-sky-300 px-3 py-2.5 text-sm font-bold text-primary hover:border-solid hover:border-primary hover:bg-sky-100 hover:text-sky-800 transition-colors disabled:opacity-40">
                      <AddIcon sx={{ fontSize: 18 }} /> Add lesson to module {mi + 1}
                    </button>
                  )}
                </div>
              </ModuleCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {modules.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">Start with your first module.</p>
      )}

      <button type="button" onClick={() => patch({ modules: [...modules, blankModule()] })} disabled={modules.length >= LIMITS.modules}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-sky-300 bg-sky-50 px-3 py-3 text-sm font-bold text-primary hover:border-solid hover:border-primary hover:bg-sky-100 hover:text-sky-800 transition-colors disabled:opacity-40">
        <AddIcon sx={{ fontSize: 18 }} /> Add a module
      </button>

      {unplaced.length > 0 && (
        <section aria-label="Lessons not in a module" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col gap-2">
          <p className="text-sm text-amber-900">
            <b>{unplaced.length === 1 ? '1 lesson isn’t' : `${unplaced.length} lessons aren’t`} in a module yet.</b> Learners only see lessons in a module.
          </p>
          <ul className="flex flex-col gap-1">
            {unplaced.map(lesson => (
              <li key={lesson.id} className="flex items-center gap-2 rounded-lg bg-white border border-amber-200 px-3 py-2">
                <span className="min-w-0 flex-1 text-sm font-semibold text-text-primary truncate">{lesson.title}</span>
                <MoreMenu label={`Place ${lesson.title}`} icon={MoreHorizIcon} entries={[
                  { kind: 'heading', label: 'Add to' },
                  ...modules.map((x, i) => ({
                    label: `Module ${i + 1}${x.title.trim() ? `: ${x.title.trim()}` : ''}`, icon: DriveFileMoveOutlinedIcon,
                    onSelect: () => setItems(x.key, [...x.items, lesson.card]),
                  })),
                  { kind: 'separator' },
                  { label: 'Delete lesson', icon: DeleteOutlineIcon, danger: true, onSelect: () => setDeleting({ title: lesson.title, lessons: [lesson.card], moduleKey: null, busy: false }) },
                ]} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {(error || message) && <p role="alert" className="text-sm font-semibold text-red-600">{message || error}</p>}
      <p className="flex gap-2 text-xs text-text-muted">
        <InfoOutlinedIcon sx={{ fontSize: 15 }} className="text-primary shrink-0 mt-px" />
        <span>Drag a lesson or module by its handle, or use <b>⋯</b> to move it. Learners keep their progress when you reorder. Save to keep the changes.</span>
      </p>

      {deleting && (
        <ConfirmDialog
          title={deleting.moduleKey ? `Delete “${deleting.title}” and its ${deleting.lessons.length} lesson${deleting.lessons.length === 1 ? '' : 's'}?` : `Delete “${deleting.title}”?`}
          description={`${deleting.lessons.length === 1 ? 'The lesson is' : 'The lessons are'} deleted for good${live ? ' and taken out of the live course straight away' : ''}. This can't be undone.`}
          confirmLabel={deleting.moduleKey ? 'Delete module' : 'Delete lesson'} confirming={deleting.busy}
          onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
      )}
    </div>
  )
}

function DragHandle({ label, listeners, attributes }: {
  label: string
  listeners: ReturnType<typeof useSortable>['listeners']
  attributes: ReturnType<typeof useSortable>['attributes']
}) {
  return (
    <button type="button" aria-label={label} {...attributes} {...listeners}
      className="size-7 shrink-0 rounded-md flex items-center justify-center text-slate-400 hover:text-text-primary hover:bg-white cursor-grab active:cursor-grabbing touch-none">
      <DragIndicatorIcon sx={{ fontSize: 18 }} />
    </button>
  )
}

function ModuleCard({ module: m, index, menu, titleMissing, onChange, children }: {
  module: DraftModule
  index: number
  menu: MenuEntry[]
  titleMissing: boolean
  onChange: (next: Partial<DraftModule>) => void
  children: ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: MODULE_ID(m) })
  const inline = 'w-full min-w-0 rounded-lg border border-transparent bg-transparent px-2 py-1 text-text-primary outline-none hover:border-slate-300 hover:bg-white focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20'
  return (
    <section ref={setNodeRef} aria-label={`Module ${index + 1}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn('rounded-2xl border border-sky-200 bg-white', isDragging && 'relative z-10 shadow-lg opacity-90')}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-0.5 rounded-t-2xl border-b border-sky-200 bg-tint py-2.5 pl-2 pr-2.5">
        <span className="flex items-center gap-1">
          <DragHandle label={`Drag module ${index + 1}`} listeners={listeners} attributes={attributes} />
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-widest text-white whitespace-nowrap">Module {index + 1}</span>
        </span>
        <input value={m.title} maxLength={LIMITS.moduleTitle} placeholder="Module title" aria-label={`Module ${index + 1} title`}
          aria-invalid={titleMissing || undefined}
          onChange={e => onChange({ title: e.target.value })}
          className={cn(inline, 'text-base font-extrabold', titleMissing && 'border-red-400 bg-white')} />
        <MoreMenu label={`Module ${index + 1} options`} icon={MoreHorizIcon} entries={menu} />
        <input value={m.summary} maxLength={LIMITS.moduleSummary} placeholder="Add a one-line summary (optional)" aria-label={`Module ${index + 1} summary`}
          onChange={e => onChange({ summary: e.target.value })}
          className={cn(inline, 'col-span-3 sm:col-start-2 sm:col-span-2 text-sm text-text-muted placeholder:text-text-muted')} />
      </div>
      {children}
    </section>
  )
}

function LessonRow({ item, lesson, line, tag, menu, onEdit }: {
  item: CourseTarget
  lesson: CourseLesson | undefined
  line: string
  tag: { label: string; className: string } | null
  menu: MenuEntry[]
  onEdit: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: LESSON_ID(item) })
  const type = lesson?.kind ?? item.lesson_type ?? 'text'
  const { icon: Icon } = COURSE_LESSON_TYPES[type]
  const preview = lesson?.is_preview ?? item.is_preview
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn('grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl p-1.5 hover:bg-sky-50',
        isDragging && 'relative z-10 bg-white shadow-lg')}>
      <DragHandle label={`Drag ${item.title}`} listeners={listeners} attributes={attributes} />
      <span className={cn('size-9 rounded-lg flex items-center justify-center', TYPE_TILE[type])}><Icon sx={{ fontSize: 20 }} /></span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-text-primary truncate">{item.title}</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
          {line}
          {preview && <span className="rounded-full bg-emerald-50 px-2 py-px font-bold text-emerald-800">Free preview</span>}
          {tag && <span className={cn('rounded-full px-2 py-px font-bold', tag.className)}>{tag.label}</span>}
          {lesson?.problem && (
            <span className="rounded-full bg-amber-50 px-2 py-px font-bold text-amber-800" title={`To finish: ${lesson.problem}`}>Not finished</span>
          )}
        </span>
      </span>
      <span className="flex items-center gap-1">
        <button type="button" onClick={onEdit} aria-label={`Edit ${item.title}`}
          className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-xs font-bold text-text-primary hover:border-primary hover:text-primary">
          <EditOutlinedIcon sx={{ fontSize: 15 }} /> Edit
        </button>
        <MoreMenu label={`More for ${item.title}`} entries={menu} />
      </span>
    </li>
  )
}
