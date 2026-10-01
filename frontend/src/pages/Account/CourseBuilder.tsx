import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { RolePicker, TopicPicker } from '@/components/gelearn/TopicPicker'
import { AccessField } from '@/components/gelearn/AccessField'
import { AccessBadge } from '@/components/gelearn/AccessBadge'
import { FileField } from '@/pages/Studio/fields/FileField'
import { apiFetch, ApiError } from '@/lib/api/client'
import type { ContentAccess } from '@/types/api'
import type { CourseLevel, CourseTarget, MyCourse } from '@/types/learning'

const MAX_ITEMS = 100
const LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = [
  { value: '', label: 'Not set' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]
const keyOf = (t: Pick<CourseTarget, 'kind' | 'id'>) => `${t.kind}:${t.id}`

function KindIcon({ kind }: { kind: CourseTarget['kind'] }) {
  return kind === 'video'
    ? <PlayCircleOutlineIcon sx={{ fontSize: 18 }} className="text-primary shrink-0" />
    : <ArticleOutlinedIcon sx={{ fontSize: 18 }} className="text-secondary shrink-0" />
}

/** Keyed by route so switching between courses always starts fresh. */
export default function CourseBuilder() {
  const { id } = useParams<{ id: string }>()
  return <CourseBuilderForm key={id ?? 'new'} id={id} />
}

function CourseBuilderForm({ id }: { id: string | undefined }) {
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [course, setCourse] = useState<MyCourse | null | undefined>(isEditing ? undefined : null)
  const [library, setLibrary] = useState<CourseTarget[] | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState<CourseLevel>('')
  const [topics, setTopics] = useState<number[]>([])
  const [roles, setRoles] = useState<number[]>([])
  const [access, setAccess] = useState<ContentAccess>('free')
  const [price, setPrice] = useState('')
  const [items, setItems] = useState<CourseTarget[]>([])
  const [cover, setCover] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState<'draft' | 'submit' | null>(null)

  useEffect(() => {
    apiFetch<CourseTarget[]>('/api/learning/me/library/').then(setLibrary).catch(() => setLibrary([]))
  }, [])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    apiFetch<MyCourse>(`/api/learning/me/courses/${id}/`)
      .then(loaded => {
        if (cancelled) return
        setCourse(loaded)
        setTitle(loaded.title)
        setDescription(loaded.description)
        setLevel(loaded.level)
        setTopics(loaded.topics)
        setRoles(loaded.roles)
        setAccess(loaded.access)
        setPrice(loaded.price ?? '')
        setItems(loaded.items)
      })
      .catch(() => { if (!cancelled) setCourse(null) })
    return () => { cancelled = true }
  }, [id])

  if (isEditing && course === null) return <Navigate to="/account?tab=courses" replace />
  if (isEditing && course === undefined) return <div className="min-h-screen" />

  const chosen = new Set(items.map(keyOf))
  const available = (library ?? []).filter(t => !chosen.has(keyOf(t)))
  const isLive = course?.status === 'published'
  const canSubmit = !isLive && course?.status !== 'pending'

  function move(index: number, delta: -1 | 1) {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
  }

  async function save(submit: boolean) {
    const found: Record<string, string> = {}
    if (title.trim().length < 3) found.title = 'Give the course a title of at least 3 characters.'
    if (access === 'paid' && !(Number(price) >= 1)) found.price = 'Enter a price of at least ₹1.'
    if (submit && items.length === 0) found.items = 'Add at least one video or post before submitting.'
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length) return

    setSaving(submit ? 'submit' : 'draft')
    try {
      const meta = { title, description, level, topics, roles, access, price: access === 'paid' ? price : null }
      let saved = await apiFetch<MyCourse>(
        isEditing ? `/api/learning/me/courses/${id}/` : '/api/learning/me/courses/',
        { method: isEditing ? 'PATCH' : 'POST', body: meta },
      )
      saved = await apiFetch<MyCourse>(`/api/learning/me/courses/${saved.id}/items/`, {
        method: 'PUT',
        body: items.map(({ kind, id: targetId }) => ({ kind, id: targetId })),
      })
      if (cover) {
        const form = new FormData()
        form.append('file', cover)
        saved = await apiFetch<MyCourse>(`/api/learning/me/courses/${saved.id}/cover/`, { method: 'POST', body: form })
      }
      if (submit) {
        await apiFetch(`/api/learning/me/courses/${saved.id}/submit/`, { method: 'POST' })
      }
      navigate('/account?tab=courses')
    } catch (err) {
      const fields = err instanceof ApiError ? err.fields : {}
      setErrors(fields)
      setFormError(fields.items ?? fields.title ?? fields.price ?? (err instanceof ApiError ? err.message : "Couldn't save the course. Please try again."))
    } finally {
      setSaving(null)
    }
  }

  const heading = isEditing ? 'Edit course' : 'New course'

  return (
    <main className="min-h-screen pb-10 bg-brand-tint bg-brand-tint-static">
      <PageMeta title={`${heading} — Genex GeLearn`} description="Build a course from your published videos and posts." canonical="/account/courses/new" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16 flex flex-col lg:flex-row gap-7 items-start">
        {/* Course content */}
        <div className="flex-1 min-w-0 w-full bg-white border border-border rounded-3xl shadow-sm p-6 lg:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{heading}</p>
            <Link to="/account?tab=courses"
              className="flex items-center gap-1.5 border border-border rounded-full px-4 py-2 text-xs font-bold text-text-primary hover:border-primary hover:text-primary transition-colors">
              <ArrowBackIcon sx={{ fontSize: 13 }} /> My Courses
            </Link>
          </div>

          <div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Course title" aria-label="Course title" maxLength={200}
              className="w-full border-none outline-none text-2xl lg:text-3xl font-extrabold text-text-primary p-0 placeholder:text-text-muted/50" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <Textarea label="What learners will get from it" rows={5} value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Who it's for, what it covers, and what they'll be able to do after." />

          <section>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-text-primary">Course outline</span>
              <span className="text-xs text-text-muted">{items.length}/{MAX_ITEMS}</span>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-text-muted border border-dashed border-border rounded-2xl px-5 py-6 text-center">
                Add videos and posts from your library below. They play in this order.
              </p>
            ) : (
              <ol className="border border-border rounded-2xl divide-y divide-border">
                {items.map((item, index) => (
                  <li key={keyOf(item)} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-6 text-xs font-bold text-text-muted text-right shrink-0">{index + 1}</span>
                    <KindIcon kind={item.kind} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-text-primary truncate">{item.title}</span>
                      {item.meta && <span className="block text-xs text-text-muted truncate">{item.meta}</span>}
                    </span>
                    <AccessBadge access={item.access} price={item.price} currency={item.currency} />
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${item.title} up`}
                      className="size-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface disabled:opacity-30">
                      <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                    </button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label={`Move ${item.title} down`}
                      className="size-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface disabled:opacity-30">
                      <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                    </button>
                    <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} aria-label={`Remove ${item.title}`}
                      className="size-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-red-50 hover:text-red-600">
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </button>
                  </li>
                ))}
              </ol>
            )}
            {errors.items && <p className="text-xs text-red-500 mt-1.5">{errors.items}</p>}
          </section>

          <section>
            <p className="text-sm font-semibold text-text-primary mb-2">Your library</p>
            {library === null ? (
              <div className="min-h-20" />
            ) : library.length === 0 ? (
              <p className="text-sm text-text-muted">
                Courses are built from your published videos and posts. <Link to="/submit-post" className="text-primary font-semibold hover:underline">Submit a post</Link> or{' '}
                <Link to="/submit-video" className="text-primary font-semibold hover:underline">a video</Link> first.
              </p>
            ) : available.length === 0 ? (
              <p className="text-sm text-text-muted">Everything in your library is already in this course.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {available.map(target => (
                  <li key={keyOf(target)}>
                    <button type="button" disabled={items.length >= MAX_ITEMS} onClick={() => setItems([...items, target])}
                      className="w-full flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-left hover:border-primary transition-colors disabled:opacity-50">
                      <KindIcon kind={target.kind} />
                      <span className="min-w-0 flex-1 text-sm font-semibold text-text-primary truncate">{target.title}</span>
                      <AddIcon sx={{ fontSize: 17 }} className="text-primary shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Settings rail */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
          <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <FileField kind="image" label="Cover image" currentUrl={course?.cover_url} file={cover} onChange={setCover} />
            <AccessField access={access} price={price} priceError={errors.price}
              onChange={next => { setAccess(next.access); setPrice(next.price) }} />
          </div>

          <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-5 shadow-sm">
            <Select label="Level" options={LEVEL_OPTIONS} value={level} error={errors.level}
              onChange={e => setLevel(e.target.value as CourseLevel)} />
            <TopicPicker value={topics} onChange={setTopics} error={errors.topics}
              help="Helps learners find the course by topic." />
            <RolePicker value={roles} onChange={setRoles} error={errors.roles}
              help="Roles this course prepares people for." />
          </div>

          <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm lg:sticky lg:top-24">
            {canSubmit && (
              <Button type="button" variant="primary" size="md" className="w-full justify-center" disabled={saving !== null} onClick={() => save(true)}>
                {saving === 'submit' ? 'Submitting…' : 'Submit for review'}
              </Button>
            )}
            <Button type="button" variant={canSubmit ? 'secondary' : 'primary'} size="md" className="w-full justify-center" disabled={saving !== null} onClick={() => save(false)}>
              {saving === 'draft' ? 'Saving…' : isLive ? 'Save changes' : 'Save draft'}
            </Button>
            <p className="text-xs text-text-muted leading-relaxed">
              {isLive
                ? 'Reordering goes live straight away. Changing the title, description or access sends the course back for review.'
                : course?.status === 'pending'
                  ? 'This course is being reviewed. You can keep editing; changes are included in the review.'
                  : 'Courses are reviewed by the Genex team before they go live.'}
            </p>
            {formError && <p role="alert" className="text-xs font-semibold text-red-600">{formError}</p>}
          </div>
        </div>
      </div>
    </main>
  )
}
