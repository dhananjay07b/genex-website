import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl } from '@/lib/utils'
import { ConfirmDialog } from './dashboard/ConfirmDialog'
import type { Topic } from '@/types/api'
import type { UserBlogPost } from '@/types/auth'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  topics: z.array(z.number()).min(1, 'Select at least 1 topic').max(3, 'Select at most 3 topics'),
  other_topic: z.string().optional(),
  excerpt: z.string().min(20, 'Excerpt must be at least 20 characters').max(300, 'Keep the excerpt under 300 characters'),
  body: z.string().min(200, 'Post body must be at least 200 characters (formatting tags included)'),
})

type FormData = z.infer<typeof schema>

const COMING_SOON = [
  {
    icon: EventOutlinedIcon,
    title: 'Scheduled publishing',
    description: 'Submit now, publish later — pick a future date and we\'ll take it live automatically once approved.',
    chipClass: 'bg-linear-to-br from-primary to-secondary',
  },
  {
    icon: EditNoteOutlinedIcon,
    title: 'Browse the media library',
    description: 'Image insertion currently takes a URL. Browsing and reusing images already in GeLearn’s library is coming.',
    chipClass: 'bg-linear-to-br from-amber-500 to-orange-500',
  },
]

export default function SubmitPost() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [loaded, setLoaded] = useState(!isEditing)
  const [topics, setTopics] = useState<Topic[]>([])
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [wasPublished, setWasPublished] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<FormData | null>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { body: '', topics: [] } })

  const selectedTopics = watch('topics')

  useEffect(() => {
    apiFetch<Topic[]>('/api/snippets/topics/').then(setTopics).catch(() => setTopics([]))
  }, [])

  useEffect(() => {
    if (!id) return
    apiFetch<UserBlogPost>(`/api/snippets/blog-submissions/${id}/`).then(sub => {
      reset({ title: sub.title, topics: sub.topics, other_topic: sub.other_topic, excerpt: sub.excerpt, body: sub.body })
      setWasPublished(sub.status === 'published')
      if (sub.image_url) setThumbnailPreview(getMediaUrl(sub.image_url))
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [id, reset])

  function handleThumbnailChange(file: File | null) {
    setThumbnail(file)
    setThumbnailPreview(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
  }

  async function submitForm(data: FormData, draft: boolean) {
    setStatus('loading')
    try {
      const body = { ...data, status: draft ? 'draft' : 'pending' }
      const submission = isEditing
        ? await apiFetch<{ id: number }>(`/api/snippets/blog-submissions/${id}/`, { method: 'PATCH', body })
        : await apiFetch<{ id: number }>('/api/snippets/blog-submissions/', { method: 'POST', body })
      if (thumbnail) {
        const formData = new FormData()
        formData.append('file', thumbnail)
        await apiFetch(`/api/snippets/blog-submissions/${submission.id}/image/`, { method: 'POST', body: formData })
      }
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  function onSubmit(data: FormData) {
    if (isEditing && wasPublished) {
      setPendingSubmit(data)
      return
    }
    submitForm(data, false)
  }

  function onSaveDraft() {
    handleSubmit(data => submitForm(data, true))()
  }

  function toggleTopic(topicId: number, onChange: (v: number[]) => void) {
    const next = selectedTopics.includes(topicId)
      ? selectedTopics.filter(t => t !== topicId)
      : selectedTopics.length < 3 ? [...selectedTopics, topicId] : selectedTopics
    onChange(next)
  }

  if (!loaded) return null

  return (
    <main className="min-h-screen pb-10 bg-brand-tint bg-brand-tint-static">
      <PageMeta title={`${isEditing ? 'Edit' : 'Submit'} a Post — Genex GeLearn`} description="Share your expertise with the Genex GeLearn community." canonical="/submit-post" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        {status === 'success' ? (
          <div className="flex flex-col items-center text-center py-16 bg-white rounded-2xl shadow-sm border border-border">
            <CheckCircleIcon className="w-14 h-14 text-secondary mb-6" />
            <h2 className="text-2xl font-extrabold text-text-primary mb-3">
              {isEditing ? 'Changes saved.' : 'Submission received.'}
            </h2>
            <p className="text-text-muted max-w-sm leading-relaxed mb-6">
              Our editorial team will review your post. You can track its status from your account page.
            </p>
            <Button variant="primary" onClick={() => navigate('/account')}>Go to My Account</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col lg:flex-row gap-7 items-start">
            {/* Editor column */}
            <div className="flex-1 min-w-0 w-full bg-white border border-border rounded-3xl shadow-sm p-6 lg:p-8">
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{isEditing ? 'Edit Post' : 'Submit a Post'}</p>
                <Link
                  to="/account"
                  className="flex items-center gap-1.5 border border-border rounded-full px-4 py-2 text-xs font-bold text-text-primary hover:border-primary hover:text-primary transition-colors"
                >
                  <ArrowBackIcon sx={{ fontSize: 13 }} /> Back to Dashboard
                </Link>
              </div>

              <input
                placeholder="Post title"
                className="w-full border-none outline-none text-2xl lg:text-3xl font-extrabold text-text-primary mb-1 p-0 placeholder:text-text-muted/50"
                {...register('title')}
              />
              {errors.title && <p className="text-xs text-red-500 mb-4">{errors.title.message}</p>}

              <Controller
                name="body"
                control={control}
                render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange} error={errors.body?.message} />
                )}
              />

              {status === 'error' && (
                <p className="text-sm text-red-500 mt-4">Something went wrong. Please try again.</p>
              )}

              <div className="flex items-center justify-between gap-4 mt-5">
                <p className="text-xs text-text-muted">Every submission is reviewed by our editorial team before publishing.</p>
                <div className="flex items-center gap-2 shrink-0">
                  <Button type="button" variant="secondary" size="md" disabled={status === 'loading'} onClick={onSaveDraft}>
                    Save as Draft
                  </Button>
                  <Button type="submit" variant="primary" size="md" disabled={status === 'loading'}>
                    {status === 'loading' ? (
                      <>
                        <AutorenewIcon className="w-4 h-4 animate-spin mr-2" sx={{ fontSize: 16 }} />
                        Submitting…
                      </>
                    ) : (
                      'Submit for Review'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right rail */}
            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
              <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                <div>
                  <label className="text-sm font-semibold text-text-primary block mb-1.5">Topics (up to 3)</label>
                  <Controller
                    name="topics"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-2">
                        {topics.map(t => {
                          const active = field.value.includes(t.id)
                          const disabled = !active && field.value.length >= 3
                          return (
                            <button
                              key={t.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => toggleTopic(t.id, field.onChange)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                                active
                                  ? 'bg-primary text-white border-primary'
                                  : disabled
                                    ? 'bg-surface text-text-muted/50 border-border cursor-not-allowed'
                                    : 'bg-white text-text-primary border-border hover:border-primary'
                              }`}
                            >
                              {t.name}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  />
                  {errors.topics && <p className="text-xs text-red-500 mt-1.5">{errors.topics.message}</p>}
                </div>

                <Input
                  label="Suggest a new topic (optional)"
                  placeholder="Not listed above? Suggest one"
                  {...register('other_topic')}
                />

                <Textarea label="Excerpt" placeholder="A short summary shown in listings" rows={4} error={errors.excerpt?.message} {...register('excerpt')} />

                <div>
                  <label className="text-sm font-semibold text-text-primary block mb-1.5">Cover image (optional)</label>
                  {thumbnailPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border h-32">
                      <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleThumbnailChange(null)}
                        aria-label="Remove cover image"
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 border border-border text-text-muted flex items-center justify-center hover:text-red-500 hover:border-red-500"
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="w-full h-24 rounded-xl border border-dashed border-border text-text-muted flex flex-col items-center justify-center gap-1 hover:border-primary hover:text-primary transition-colors"
                    >
                      <ImageOutlinedIcon sx={{ fontSize: 20 }} />
                      <span className="text-xs font-semibold">Upload cover image</span>
                    </button>
                  )}
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleThumbnailChange(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>

              <div className="border border-secondary/25 rounded-2xl p-5 bg-secondary/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <VerifiedOutlinedIcon sx={{ fontSize: 16 }} className="text-secondary" />
                  <p className="text-sm font-bold text-text-primary">Before it goes live</p>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Our editorial team reviews every submission for accuracy and tone. You&apos;ll see the status on your
                  dashboard, and a note here if changes are needed.
                </p>
              </div>
            </div>
          </form>
        )}

        {/* Coming soon */}
        <div className="mt-10 bg-white border border-dashed border-border rounded-2xl p-6">
          <p className="text-sm font-bold text-text-primary mb-4">Coming to the editor</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMING_SOON.map(item => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <span className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 ${item.chipClass}`}>
                    <Icon sx={{ fontSize: 18 }} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{item.title}</p>
                    <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {pendingSubmit && (
        <ConfirmDialog
          title="Send this post back for review?"
          description="This post is already published. Saving your changes will send it back for review before it goes live again — are you sure you want to continue?"
          confirmLabel="Yes, resubmit for review"
          confirming={status === 'loading'}
          onCancel={() => setPendingSubmit(null)}
          onConfirm={() => {
            const data = pendingSubmit
            setPendingSubmit(null)
            if (data) submitForm(data, false)
          }}
        />
      )}
    </main>
  )
}
