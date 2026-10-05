import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { apiFetch, ApiError } from '@/lib/api/client'
import type { ContentAccess } from '@/types/api'
import type { StudioItem, StudioPerson, StudioSection, StudioValue } from '@/types/studio'
import { getStudioType, type StudioField, type StudioTypeConfig } from './studioTypes'
import { SectionsField } from './fields/SectionsField'
import { ChipListField } from './fields/ChipListField'
import { AccessField } from '@/components/gelearn/AccessField'
import { CollaboratorsField } from './fields/CollaboratorsField'
import { FileField } from './fields/FileField'
import { TopicPicker } from '@/components/gelearn/TopicPicker'

type Values = Record<string, StudioValue>
type Errors = Record<string, string>

const today = () => new Date().toISOString().slice(0, 10)

function emptyValue(field: StudioField): StudioValue {
  switch (field.kind) {
    case 'sections':
    case 'list':
    case 'collaborators':
    case 'topics':
      return []
    case 'date':
      return today()
    case 'select':
      return field.options?.[0]?.value ?? ''
    case 'access':
      return 'free'
    default:
      return ''
  }
}

function initialValues(config: StudioTypeConfig, item: StudioItem | null): Values {
  const values: Values = {}
  for (const field of config.fields) {
    const saved = item?.[field.name]
    values[field.name] = saved === undefined || saved === null ? emptyValue(field) : (saved as StudioValue)
  }
  if (config.fields.some(f => f.kind === 'access')) {
    values.price = typeof item?.price === 'string' ? item.price : ''
  }
  return values
}

const asString = (v: StudioValue) => (typeof v === 'string' ? v : '')
const asStrings = (v: StudioValue) => (Array.isArray(v) ? (v as string[]) : [])
const asSections = (v: StudioValue) => (Array.isArray(v) ? (v as StudioSection[]) : [])
const asPeople = (v: StudioValue) => (Array.isArray(v) ? (v as StudioPerson[]) : [])
const asIds = (v: StudioValue) => (Array.isArray(v) ? (v as number[]) : [])
const isBlankHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim() === ''

function validate(config: StudioTypeConfig, values: Values): Errors {
  const errors: Errors = {}
  for (const field of config.fields) {
    const value = values[field.name]
    if (field.required && typeof value === 'string' && !value.trim()) {
      errors[field.name] = `${field.label} is required.`
    }
    if (field.kind === 'sections' && asSections(value).some(s => !s.heading.trim() || isBlankHtml(s.body))) {
      errors[field.name] = 'Every section needs a heading and some text. Remove empty sections.'
    }
    if (field.kind === 'access' && value === 'paid' && !(Number(values.price) >= 1)) {
      errors.price = 'Enter a price of at least ₹1.'
    }
  }
  return errors
}

function toPayload(config: StudioTypeConfig, values: Values) {
  const payload: Record<string, unknown> = {}
  for (const field of config.fields) {
    const value = values[field.name]
    if (field.kind === 'collaborators') payload[field.name] = asPeople(value).map(p => p.username)
    else if (field.kind === 'sections') payload[field.name] = asSections(value).map(({ heading, body }) => ({ heading, body }))
    else if (field.kind === 'access') {
      payload.access = value
      payload.price = value === 'paid' ? values.price : null
    } else payload[field.name] = value
  }
  return payload
}

/** Keyed by route so switching between items (or to "new") always starts with fresh form state. */
export default function StudioEditor() {
  const { type, id } = useParams<{ type: string; id: string }>()
  return <StudioEditorForm key={`${type}:${id ?? 'new'}`} type={type} id={id} />
}

function StudioEditorForm({ type, id }: { type: string | undefined; id: string | undefined }) {
  const config = getStudioType(type)
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [item, setItem] = useState<StudioItem | null | undefined>(isEditing ? undefined : null)
  const [values, setValues] = useState<Values | null>(() => (config && !isEditing ? initialValues(config, null) : null))
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)

  useEffect(() => {
    if (!config || !isEditing) return
    let cancelled = false
    apiFetch<StudioItem>(`/api/studio/${config.key}/${id}/`)
      .then(loaded => {
        if (cancelled) return
        setItem(loaded)
        setValues(initialValues(config, loaded))
      })
      .catch(() => { if (!cancelled) setItem(null) })
    return () => { cancelled = true }
  }, [config, id, isEditing])

  if (!config) return <Navigate to="/studio" replace />
  if (isEditing && item === null) return <Navigate to={`/studio/${config.key}`} replace />
  if (!values) return <div className="min-h-96" />

  const set = (name: string, value: StudioValue) => setValues(prev => (prev ? { ...prev, [name]: value } : prev))

  async function save() {
    if (!config || !values) return
    const found = validate(config, values)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length) {
      setFormError('Please fix the highlighted fields.')
      return
    }

    setSaving(true)
    let saved: StudioItem
    try {
      saved = await apiFetch<StudioItem>(
        isEditing ? `/api/studio/${config.key}/${id}/` : `/api/studio/${config.key}/`,
        { method: isEditing ? 'PATCH' : 'POST', body: toPayload(config, values) },
      )
    } catch (err) {
      const fields = err instanceof ApiError ? err.fields : {}
      setErrors(fields)
      setFormError(
        Object.keys(fields).length
          ? 'Please fix the highlighted fields.'
          : err instanceof ApiError ? err.message : "Couldn't save. Please try again.",
      )
      setSaving(false)
      return
    }

    // Media uploads need the item's id, so they follow the save.
    const uploads: [File | null, string][] = [[imageFile, 'image'], [documentFile, 'document']]
    for (const [file, endpoint] of uploads) {
      if (!file) continue
      const form = new FormData()
      form.append('file', file)
      try {
        await apiFetch(`/api/studio/${config.key}/${saved.id}/${endpoint}/`, { method: 'POST', body: form })
      } catch (err) {
        setSaving(false)
        setFormError(`Saved, but the ${endpoint === 'image' ? 'image' : 'PDF'} upload failed: ${err instanceof ApiError ? err.message : 'please try again.'}`)
        if (!isEditing) navigate(`/studio/${config.key}/${saved.id}/edit`, { replace: true })
        return
      }
    }

    navigate(`/studio/${config.key}`, {
      state: { flash: `${isEditing ? 'Saved' : 'Published'} “${saved.title}”.` },
    })
  }

  function renderField(field: StudioField): ReactNode {
    if (!config || !values) return null
    const value = values[field.name]
    const error = errors[field.name]
    switch (field.kind) {
      case 'title':
        return (
          <div key={field.name}>
            <input
              value={asString(value)}
              onChange={e => set(field.name, e.target.value)}
              placeholder={field.placeholder}
              aria-label={field.label}
              maxLength={255}
              className="w-full border-none outline-none text-2xl lg:text-3xl font-extrabold text-text-primary p-0 placeholder:text-text-muted/50"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        )
      case 'text':
      case 'url':
        return (
          <Input key={field.name} label={field.label} type={field.kind === 'url' ? 'url' : 'text'} placeholder={field.placeholder}
            value={asString(value)} error={error} onChange={e => set(field.name, e.target.value)} />
        )
      case 'date':
        return <Input key={field.name} label={field.label} type="date" value={asString(value)} error={error} onChange={e => set(field.name, e.target.value)} />
      case 'textarea':
        return (
          <div key={field.name}>
            <Textarea label={field.label} rows={field.column === 'main' ? 8 : 4} placeholder={field.placeholder}
              value={asString(value)} error={error} onChange={e => set(field.name, e.target.value)} />
            {field.help && <p className="text-xs text-text-muted mt-1.5">{field.help}</p>}
          </div>
        )
      case 'select':
        return <Select key={field.name} label={field.label} options={field.options ?? []} value={asString(value)} error={error} onChange={e => set(field.name, e.target.value)} />
      case 'richtext':
        return (
          <RichTextEditor key={field.name} label={field.label} variant="basic" minHeightClassName="min-h-48"
            value={asString(value)} error={error} onChange={html => set(field.name, html)} />
        )
      case 'sections':
        return <SectionsField key={field.name} label={field.label} value={asSections(value)} maxItems={field.maxItems} error={error} onChange={v => set(field.name, v)} />
      case 'list':
        return (
          <ChipListField key={field.name} label={field.label} value={asStrings(value)} placeholder={field.placeholder}
            maxItems={field.maxItems} help={field.help} error={error} onChange={v => set(field.name, v)} />
        )
      case 'access':
        return (
          <AccessField key={field.name} access={asString(value) as ContentAccess} price={asString(values.price)}
            accessError={error} priceError={errors.price}
            onChange={next => setValues(prev => (prev ? { ...prev, [field.name]: next.access, price: next.price } : prev))} />
        )
      case 'topics':
        return (
          <TopicPicker key={field.name} label={field.label} value={asIds(value)} max={field.maxItems} help={field.help}
            error={error} onChange={v => set(field.name, v)} />
        )
      case 'collaborators':
        return (
          <CollaboratorsField key={field.name} label={field.label} value={asPeople(value)} maxItems={field.maxItems}
            help={field.help} error={error} onChange={v => set(field.name, v)} />
        )
    }
  }

  const mainFields = config.fields.filter(f => f.column === 'main')
  const sideFields = config.fields.filter(f => f.column === 'side')
  const heading = `${isEditing ? 'Edit' : 'New'} ${config.singular}`

  return (
    <div className="flex flex-col lg:flex-row gap-7 items-start">
      <PageMeta title={`${heading} — Company Studio`} description={config.description} canonical={`/studio/${config.key}`} />

      {/* Writing column */}
      <div className="flex-1 min-w-0 w-full bg-white border border-border rounded-3xl shadow-sm p-6 lg:p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{heading}</p>
          <Link to={`/studio/${config.key}`}
            className="flex items-center gap-1.5 border border-border rounded-full px-4 py-2 text-xs font-bold text-text-primary hover:border-primary hover:text-primary transition-colors">
            <ArrowBackIcon sx={{ fontSize: 13 }} /> Back to {config.label}
          </Link>
        </div>
        {mainFields.map(renderField)}
      </div>

      {/* Details rail */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
        <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          {sideFields.map(renderField)}
        </div>

        {(config.image || config.document) && (
          <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            {config.image && (
              <FileField kind="image" label="Cover image" currentUrl={item?.image_url} file={imageFile} onChange={setImageFile} />
            )}
            {config.document && (
              <FileField kind="document" label="Whitepaper PDF" currentUrl={item?.document_url} file={documentFile} onChange={setDocumentFile} />
            )}
          </div>
        )}

        <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm lg:sticky lg:top-24">
          <Button type="button" variant="primary" size="md" disabled={saving} onClick={save} className="w-full justify-center">
            {saving ? (
              <>
                <AutorenewIcon sx={{ fontSize: 16 }} className="animate-spin mr-2" />
                Saving…
              </>
            ) : isEditing ? 'Save changes' : 'Publish'}
          </Button>
          <p className="text-xs text-text-muted leading-relaxed">
            {isEditing ? 'Changes go live as soon as you save.' : 'Publishes immediately under your company’s name.'}
          </p>
          {formError && <p role="alert" className="text-xs font-semibold text-red-600">{formError}</p>}
        </div>
      </div>
    </div>
  )
}
