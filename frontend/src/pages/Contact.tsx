import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import ChatIcon from '@mui/icons-material/Chat'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { apiFetch, ApiError } from '@/lib/api/client'
import { getMuiIcon } from '@/lib/muiIconRegistry'
import type { CTABandValue, HeroSectionApiValue, WagtailListResponse } from '@/types/api'

const schema = z.object({
  name:        z.string().min(2, 'Name is required'),
  company:     z.string(),  // required for enquiries, optional for job applications (checked on submit)
  email:       z.string().email('Enter a valid email address'),
  phone:       z.string().regex(/^[+\d\s\-()]{7,}$/, 'Enter a valid phone number'),
  projectType: z.string().min(1, 'Please select a project type'),
  message:     z.string().min(10, 'Message must be at least 10 characters'),
  // Hidden from people; bots that fill every field give themselves away.
  website:     z.string().optional(),
})

/** Careers → Apply opens this form with ?subject=Application: <role>; those get their own type. */
const JOB_APPLICATION = { value: 'job-application', label: 'Job application' }

type FormData = z.infer<typeof schema>

interface ProjectTypeApiValue {
  value: string
  label: string
}

interface ContactDetailApiValue {
  icon: string
  label: string
  lines: string[]
  note: string | null
}

interface MapEmbedApiValue {
  embed_url: string
  zoom_level: number
}

interface ContactPageData {
  id: number
  title: string
  body: { type: string; value: unknown; id: string }[]
}

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [searchParams] = useSearchParams()
  const subject = (searchParams.get('subject') ?? '').slice(0, 200)
  const isApplication = subject.startsWith('Application:')
  const [page, setPage] = useState<ContactPageData | null | undefined>(undefined)

  useEffect(() => {
    apiFetch<WagtailListResponse<ContactPageData>>('/api/v2/pages/?type=pages.ContactPage&fields=body&limit=1')
      .then(res => setPage(res.items[0] ?? null))
      .catch(() => setPage(null))
  }, [])

  const body = page?.body ?? []
  const hero = body.find(b => b.type === 'hero')?.value as HeroSectionApiValue | undefined
  const contactDetails = (body.find(b => b.type === 'contact_details')?.value as ContactDetailApiValue[] | undefined) ?? []
  const cmsProjectTypes = (body.find(b => b.type === 'project_types')?.value as ProjectTypeApiValue[] | undefined) ?? []
  const projectTypes = isApplication ? [JOB_APPLICATION, ...cmsProjectTypes] : cmsProjectTypes
  const map = body.find(b => b.type === 'map')?.value as MapEmbedApiValue | undefined
  const cta = body.find(b => b.type === 'cta')?.value as CTABandValue | undefined

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { projectType: isApplication ? JOB_APPLICATION.value : '' },
  })

  async function onSubmit(data: FormData) {
    if (!isApplication && !data.company.trim()) {
      setError('company', { message: 'Company name is required' })
      return
    }
    setStatus('loading')
    setErrorMessage('')
    try {
      // Saved in Django admin (Enquiries) and emailed to the Genex inbox.
      await apiFetch('/api/enquiries/', {
        method: 'POST',
        body: {
          name: data.name,
          company: data.company,
          email: data.email,
          phone: data.phone,
          project_type: projectTypes.find(t => t.value === data.projectType)?.label ?? data.projectType,
          subject,
          message: data.message,
          website: data.website ?? '',
        },
      })
      setStatus('success')
    } catch (err) {
      setErrorMessage(err instanceof ApiError && err.status === 429
        ? "You've sent several messages already. Please try again in an hour, or email us directly at"
        : err instanceof ApiError && err.status === 400 ? `${err.message} If this keeps happening, email us at` : 'Something went wrong. Email us directly at')
      setStatus('error')
    }
  }

  if (page === undefined) return null

  return (
    <main>
      <PageMeta
        title="Contact Genex — Request a Demo or Project Discussion"
        description="Get in touch with Genex Technocrats. Request a product demo, discuss a project, or explore partnership opportunities with India's energy technology team."
        canonical="/contact"
      />
      <PageHero
        label={hero?.label ?? 'Get in Touch'}
        headline={hero?.heading ?? "Let's Build Something Together."}
        subline={hero?.description ?? 'Our engineering team is available Mon–Sat, 10am–7pm IST. We respond to every message within 24 hours.'}
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16 items-start">

            {/* Form card */}
            <div id="demo" className="bg-white rounded-2xl shadow-sm border border-border p-8 lg:p-10">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center py-12"
                  >
                    <CheckCircleIcon className="w-14 h-14 text-secondary mb-6" />
                    <h2 className="text-2xl font-extrabold text-text-primary mb-3">
                      Message received.
                    </h2>
                    <p className="text-text-muted max-w-sm leading-relaxed">
                      Expect a reply within 24 hours. For urgent matters, reach us directly on WhatsApp.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-bold text-text-primary mb-2">{isApplication ? 'Apply' : 'Send us a message'}</h2>
                    {subject && (
                      <p className="-mt-3 text-sm text-text-muted">
                        Regarding: <span className="font-semibold text-text-primary">{subject.replace(/^Application:\s*/, '')}</span>
                      </p>
                    )}
                    {/* Spam trap: invisible to people and screen readers. */}
                    <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register('website')} />

                    {/* Row 1 */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Input
                        label="Full Name"
                        placeholder="Rahul Sharma"
                        error={errors.name?.message}
                        {...register('name')}
                      />
                      <Input
                        label={isApplication ? 'Current company (optional)' : 'Company'}
                        placeholder="Your Company Pvt. Ltd."
                        error={errors.company?.message}
                        {...register('company')}
                      />
                    </div>

                    {/* Row 2 */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Input
                        label="Email"
                        type="email"
                        placeholder="rahul@company.com"
                        error={errors.email?.message}
                        {...register('email')}
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                    </div>

                    {/* Project type */}
                    <Select
                      label="Project Type"
                      placeholder="Select a project type"
                      options={projectTypes}
                      error={errors.projectType?.message}
                      {...register('projectType')}
                    />

                    {/* Message */}
                    <Textarea
                      label="Message"
                      placeholder={isApplication
                        ? 'Tell us about your experience and why this role. Add a link to your CV or LinkedIn profile.'
                        : 'Tell us about your project — scale, location, timeline, and any specific requirements.'}
                      rows={6}
                      error={errors.message?.message}
                      {...register('message')}
                    />

                    {status === 'error' && (
                      <p className="text-sm text-red-500">
                        {errorMessage}{' '}
                        <a href="mailto:info@genextechnocrats.com" className="underline">
                          info@genextechnocrats.com
                        </a>
                      </p>
                    )}

                    <Button
                      variant="primary"
                      size="lg"
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full justify-center"
                    >
                      {status === 'loading' ? (
                        <>
                          <AutorenewIcon className="w-4 h-4 animate-spin mr-2" sx={{ fontSize: 16 }} />
                          Sending…
                        </>
                      ) : (
                        isApplication ? 'Send Application →' : 'Send Message →'
                      )}
                    </Button>

                    <p className="text-xs text-text-muted text-center">
                      No spam. We respond to every message.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Contact details */}
            <motion.div
              className="space-y-8 lg:pt-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            >
              {contactDetails.map(({ icon, label, lines, note }) => {
                const Icon = getMuiIcon(icon)
                return (
                  <div key={label} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                        {label}
                      </p>
                      {lines.map(line => (
                        <p key={line} className="text-sm font-semibold text-text-primary leading-snug">
                          {line}
                        </p>
                      ))}
                      {note && (
                        <p className="text-xs text-text-muted mt-0.5">{note}</p>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* WhatsApp */}
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <ChatIcon className="w-5 h-5 text-secondary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                    WhatsApp
                  </p>
                  <a
                    href="https://wa.me/91XXXXXXXXXX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-secondary border border-secondary/30 rounded-full px-4 py-1.5 hover:bg-secondary/10 transition-colors duration-200"
                  >
                    Chat with us
                  </a>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="border-t border-border pt-8">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">
                  Location
                </p>
                <div className="w-full h-52 rounded-xl overflow-hidden bg-surface border border-border flex items-center justify-center">
                  {map?.embed_url ? (
                    <iframe
                      src={map.embed_url}
                      title="Genex office location"
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <p className="text-sm text-text-muted">Map embed goes here</p>
                  )}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {cta && (
        <section className="bg-brand-tint py-20 lg:py-28">
          <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight mb-4">
              {cta.heading}
            </h2>
            {cta.description && (
              <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
                {cta.description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {cta.primary_cta_text && (
                <a href={cta.primary_cta_link ?? '#'}>
                  <Button variant="primary" size="lg">{cta.primary_cta_text}</Button>
                </a>
              )}
              {cta.secondary_cta_text && (
                <a href={cta.secondary_cta_link ?? '#'}>
                  <Button variant="secondary" size="lg">{cta.secondary_cta_text}</Button>
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
