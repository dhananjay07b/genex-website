import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { apiFetch } from '@/lib/api/client'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  topic: z.string().min(1, 'Please add a topic, e.g. Policy, Engineering'),
  excerpt: z.string().min(20, 'Excerpt must be at least 20 characters').max(300, 'Keep the excerpt under 300 characters'),
  body: z.string().min(200, 'Post body must be at least 200 characters (formatting tags included)'),
})

type FormData = z.infer<typeof schema>

const COMING_SOON = [
  {
    icon: EditNoteOutlinedIcon,
    title: 'Save as draft',
    description: 'Every submission goes straight to review today. Saving progress and coming back later is next.',
    chipClass: 'bg-gradient-to-br from-primary to-secondary',
  },
  {
    icon: PhotoLibraryOutlinedIcon,
    title: 'Browse the media library',
    description: 'Image insertion currently takes a URL. Browsing and reusing images already in GeLearn’s library is coming.',
    chipClass: 'bg-gradient-to-br from-amber-500 to-orange-500',
  },
]

export default function SubmitPost() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { body: '' } })

  async function onSubmit(data: FormData) {
    setStatus('loading')
    try {
      await apiFetch('/api/snippets/blog-submissions/', { method: 'POST', body: data })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen pb-10 bg-brand-tint bg-brand-tint-static">
      <PageMeta title="Submit a Post — Genex GeLearn" description="Share your expertise with the Genex GeLearn community." canonical="/submit-post" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        {status === 'success' ? (
          <div className="flex flex-col items-center text-center py-16 bg-white rounded-2xl shadow-sm border border-border">
            <CheckCircleIcon className="w-14 h-14 text-secondary mb-6" />
            <h2 className="text-2xl font-extrabold text-text-primary mb-3">Submission received.</h2>
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
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Submit a Post</p>
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
                <Button type="submit" variant="primary" size="md" disabled={status === 'loading'} className="shrink-0">
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

            {/* Right rail */}
            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
              <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                <Input label="Topic" placeholder="Policy, Engineering, Field Notes…" error={errors.topic?.message} {...register('topic')} />
                <Textarea label="Excerpt" placeholder="A short summary shown in listings" rows={4} error={errors.excerpt?.message} {...register('excerpt')} />
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
    </main>
  )
}
