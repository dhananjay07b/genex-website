import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  topic: z.string().min(1, 'Please add a topic, e.g. Field Ops, Training'),
  excerpt: z.string().min(20, 'Excerpt must be at least 20 characters').max(300, 'Keep the excerpt under 300 characters'),
  video_url: z.string().url('Enter a valid video URL'),
})

type FormData = z.infer<typeof schema>

export default function SubmitVideo() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setStatus('loading')
    try {
      await apiFetch('/api/snippets/video-submissions/', { method: 'POST', body: data })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main>
      <PageMeta title="Submit a Video — Genex GeLearn" description="Share a video with the Genex GeLearn community." canonical="/submit-video" />
      <PageHero label="Contribute" headline="Submit a Video" subline="Field walkthroughs, demos, and training clips — every submission is reviewed by our editorial team before publishing." />

      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center text-center py-12 bg-white rounded-2xl shadow-sm border border-border">
              <CheckCircleIcon className="w-14 h-14 text-secondary mb-6" />
              <h2 className="text-2xl font-extrabold text-text-primary mb-3">Submission received.</h2>
              <p className="text-text-muted max-w-sm leading-relaxed mb-6">
                Our editorial team will review your video. You can track its status from your account page.
              </p>
              <Button variant="primary" onClick={() => navigate('/account')}>Go to My Account</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 bg-white rounded-2xl shadow-sm border border-border p-8">
              <Input label="Title" placeholder="Commissioning a 5MW solar array — full walkthrough" error={errors.title?.message} {...register('title')} />
              <Input label="Topic" placeholder="Field Ops, Training, Product Demo…" error={errors.topic?.message} {...register('topic')} />
              <Input label="Video URL" placeholder="https://…" error={errors.video_url?.message} {...register('video_url')} />
              <Textarea label="Excerpt" placeholder="A short summary shown in listings" rows={3} error={errors.excerpt?.message} {...register('excerpt')} />

              {status === 'error' && (
                <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
              )}

              <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'} className="w-full justify-center">
                {status === 'loading' ? (
                  <>
                    <AutorenewIcon className="w-4 h-4 animate-spin mr-2" sx={{ fontSize: 16 }} />
                    Submitting…
                  </>
                ) : (
                  'Submit for Review'
                )}
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
