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
  topic: z.string().min(1, 'Please add a topic, e.g. Policy, Engineering'),
  excerpt: z.string().min(20, 'Excerpt must be at least 20 characters').max(300, 'Keep the excerpt under 300 characters'),
  body: z.string().min(200, 'Post body must be at least 200 characters'),
})

type FormData = z.infer<typeof schema>

export default function SubmitPost() {
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
      await apiFetch('/api/snippets/blog-submissions/', { method: 'POST', body: data })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main>
      <PageMeta title="Submit a Post — Genex GeLearn" description="Share your expertise with the Genex GeLearn community." canonical="/gelearn/submit-post" />
      <PageHero label="Contribute" headline="Submit a Post" subline="Share your knowledge with the GeLearn community. Every submission is reviewed by our editorial team before publishing." />

      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center text-center py-12 bg-white rounded-2xl shadow-sm border border-border">
              <CheckCircleIcon className="w-14 h-14 text-secondary mb-6" />
              <h2 className="text-2xl font-extrabold text-text-primary mb-3">Submission received.</h2>
              <p className="text-text-muted max-w-sm leading-relaxed mb-6">
                Our editorial team will review your post. You can track its status from your account page.
              </p>
              <Button variant="primary" onClick={() => navigate('/account')}>Go to My Account</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 bg-white rounded-2xl shadow-sm border border-border p-8">
              <Input label="Title" placeholder="How we cut O&M response time by 60%" error={errors.title?.message} {...register('title')} />
              <Input label="Topic" placeholder="Policy, Engineering, Field Notes…" error={errors.topic?.message} {...register('topic')} />
              <Textarea label="Excerpt" placeholder="A short summary shown in listings" rows={3} error={errors.excerpt?.message} {...register('excerpt')} />
              <Textarea label="Post Body" placeholder="Write your full post here" rows={12} error={errors.body?.message} {...register('body')} />

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
