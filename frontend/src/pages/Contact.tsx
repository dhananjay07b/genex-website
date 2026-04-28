import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Phone, Mail, MessageCircle, CheckCircle, Loader2 } from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  name:        z.string().min(2, 'Name is required'),
  company:     z.string().min(1, 'Company name is required'),
  email:       z.string().email('Enter a valid email address'),
  phone:       z.string().regex(/^[+\d\s\-()]{7,}$/, 'Enter a valid phone number'),
  projectType: z.string().min(1, 'Please select a project type'),
  message:     z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

const PROJECT_TYPES = [
  { value: 'solar-rooftop',  label: 'Solar Rooftop System'      },
  { value: 'solar-plant',    label: 'Solar Power Plant (EPC)'   },
  { value: 'scada-rms',      label: 'SCADA / RMS Deployment'    },
  { value: 'wind-energy',    label: 'Wind Energy Monitoring'    },
  { value: 'industrial',     label: 'Industrial Energy Mgmt'    },
  { value: 'request-demo',   label: 'Request a Product Demo'    },
  { value: 'other',          label: 'Other / General Inquiry'   },
]

const CONTACT_DETAILS = [
  {
    icon: MapPin,
    label: 'Office',
    lines: ['Genex Technocrats Pvt. Ltd.', 'Pune, Maharashtra, India'],
  },
  {
    icon: Phone,
    label: 'Phone',
    lines: ['+91 XXXXX XXXXX'],
    note: 'Mon–Sat · 10am–7pm IST',
  },
  {
    icon: Mail,
    label: 'Email',
    lines: ['info@genextechnocrats.com'],
  },
]

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setStatus('loading')
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      console.log('Form data:', data)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main>
      <PageHero
        label="Get in Touch"
        headline="Let's Build Something Together."
        subline="Our engineering team is available Mon–Sat, 10am–7pm IST. We respond to every message within 24 hours."
      />

      <section className="bg-surface py-20 lg:py-28">
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
                    <CheckCircle className="w-14 h-14 text-secondary mb-6" />
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
                    <h2 className="text-xl font-bold text-text-primary mb-2">Send us a message</h2>

                    {/* Row 1 */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Input
                        label="Full Name"
                        placeholder="Rahul Sharma"
                        error={errors.name?.message}
                        {...register('name')}
                      />
                      <Input
                        label="Company"
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
                      options={PROJECT_TYPES}
                      error={errors.projectType?.message}
                      {...register('projectType')}
                    />

                    {/* Message */}
                    <Textarea
                      label="Message"
                      placeholder="Tell us about your project — scale, location, timeline, and any specific requirements."
                      rows={6}
                      error={errors.message?.message}
                      {...register('message')}
                    />

                    {status === 'error' && (
                      <p className="text-sm text-red-500">
                        Something went wrong. Email us directly at{' '}
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
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Sending…
                        </>
                      ) : (
                        'Send Message →'
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
              {CONTACT_DETAILS.map(({ icon: Icon, label, lines, note }) => (
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
              ))}

              {/* WhatsApp */}
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
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
                <div className="w-full h-52 rounded-xl overflow-hidden bg-surface-alt border border-border flex items-center justify-center">
                  <p className="text-sm text-text-muted">Map embed goes here</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </main>
  )
}
