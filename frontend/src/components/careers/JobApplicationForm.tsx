import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { apiFetch, ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'

const MAX_CV_BYTES = 5 * 1024 * 1024
const optionalUrl = z.string().trim().refine(v => !v || /^https?:\/\/\S+\.\S+/.test(v), 'Enter a full link starting with https://')

const schema = z.object({
  name:       z.string().trim().min(2, 'Name is required'),
  email:      z.string().trim().email('Enter a valid email address'),
  phone:      z.string().trim().regex(/^[+\d\s\-()]{7,40}$/, 'Enter a valid phone number'),
  linkedin:   optionalUrl,
  portfolio:  optionalUrl,
  experience: z.string().trim().max(100),
  message:    z.string().trim().max(5000),
  consent:    z.boolean().refine(v => v, 'Please agree to the Privacy Policy to apply.'),
  // Hidden from people; bots that fill every field give themselves away.
  website:    z.string().optional(),
})

type FormData = z.infer<typeof schema>
const FIELDS = ['name', 'email', 'phone', 'linkedin', 'portfolio', 'experience', 'message', 'consent'] as const

/**
 * The Apply form on an open job page. Saved to Django admin → Job applications
 * (backend enquiries.views.JobApplicationCreateView); the CV is stored privately
 * and only Genex can download it.
 */
export function JobApplicationForm({ jobId, jobTitle }: { jobId: number; jobTitle: string }) {
  const [cv, setCv] = useState<File | null>(null)
  const [cvError, setCvError] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [formError, setFormError] = useState('')

  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', linkedin: '', portfolio: '', experience: '', message: '', consent: false, website: '' },
  })

  function pickCv(file: File | undefined) {
    setCvError('')
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) { setCv(null); setCvError('Upload your CV as a PDF.'); return }
    if (file.size > MAX_CV_BYTES) { setCv(null); setCvError('Your CV must be 5 MB or smaller.'); return }
    setCv(file)
  }

  async function onSubmit(data: FormData) {
    if (!cv) { setCvError('Attach your CV (PDF).'); return }
    setStatus('sending')
    setFormError('')
    const body = new FormData()
    body.append('job', String(jobId))
    for (const field of FIELDS) body.append(field, String(data[field]))
    body.append('website', data.website ?? '')
    body.append('cv', cv)
    try {
      await apiFetch('/api/enquiries/applications/', { method: 'POST', body })
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      if (err instanceof ApiError && err.status === 400) {
        for (const field of FIELDS) if (err.fields[field]) setError(field, { message: err.fields[field] })
        if (err.fields.cv) setCvError(err.fields.cv)
        setFormError(err.fields.job ?? 'Please check the highlighted fields.')
      } else if (err instanceof ApiError && err.status === 429) {
        setFormError("You've sent several applications already. Please try again in an hour.")
      } else {
        setFormError("Your application couldn't be sent. Please try again, or email it to connect@genextechnocrats.com.")
      }
    }
  }

  return (
    <AnimatePresence mode="wait">
      {status === 'sent' ? (
        <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center py-10" role="status">
          <CheckCircleIcon className="text-secondary mb-5" sx={{ fontSize: 56 }} />
          <h3 className="text-2xl font-extrabold text-text-primary mb-3">Application received.</h3>
          <p className="text-text-muted max-w-md leading-relaxed">
            Thank you for applying for {jobTitle}. Our team reviews every application and will contact you by email if your profile is a match.
          </p>
        </motion.div>
      ) : (
        <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit(onSubmit, () => { if (!cv) setCvError('Attach your CV (PDF).') })} noValidate className="flex flex-col gap-5">
          {/* Spam trap: invisible to people and screen readers. */}
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register('website')} />

          <div className="grid sm:grid-cols-2 gap-5">
            <Input id="apply-name" label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
            <Input id="apply-email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Input id="apply-phone" label="Phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" error={errors.phone?.message} {...register('phone')} />
            <Input id="apply-experience" label="Experience (optional)" placeholder="e.g. 6 years" error={errors.experience?.message} {...register('experience')} />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Input id="apply-linkedin" label="LinkedIn (optional)" type="url" placeholder="https://linkedin.com/in/…" error={errors.linkedin?.message} {...register('linkedin')} />
            <Input id="apply-portfolio" label="Portfolio or website (optional)" type="url" placeholder="https://…" error={errors.portfolio?.message} {...register('portfolio')} />
          </div>
          <Textarea id="apply-message" label="Why this role? (optional)" rows={5} error={errors.message?.message} {...register('message')} />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-text-primary">CV</span>
            <label className={cn(
              'flex items-center gap-3 rounded-md border border-dashed bg-surface px-4 py-4 cursor-pointer transition-colors hover:border-primary',
              'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
              cvError ? 'border-red-500' : 'border-border',
            )}>
              <UploadFileOutlinedIcon sx={{ fontSize: 24 }} className="text-primary shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-text-primary truncate">{cv ? cv.name : 'Choose your CV'}</span>
                <span className="block text-xs text-text-muted">PDF, up to 5 MB</span>
              </span>
              <input type="file" accept="application/pdf,.pdf" className="sr-only" aria-invalid={!!cvError}
                onChange={e => pickCv(e.target.files?.[0])} />
            </label>
            {cvError && <p className="text-xs text-red-500">{cvError}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-start gap-3 text-sm text-text-muted leading-relaxed">
              <input type="checkbox" className="mt-1 size-4 accent-primary shrink-0" {...register('consent')} />
              <span>
                I agree that Genex Technocrats may use these details and my CV to assess my application, as described in the{' '}
                <Link to="/privacy-policy" className="font-semibold text-primary hover:underline">Privacy Policy</Link>.
              </span>
            </label>
            {errors.consent && <p className="text-xs text-red-500">{errors.consent.message}</p>}
          </div>

          {formError && <p role="alert" className="text-sm font-semibold text-red-600">{formError}</p>}

          <Button type="submit" size="lg" disabled={status === 'sending'} className="w-full sm:w-auto sm:self-start justify-center">
            {status === 'sending' ? 'Sending…' : 'Submit application'}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
