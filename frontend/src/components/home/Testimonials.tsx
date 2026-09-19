import { motion } from 'framer-motion'
import { TestimonialCarousel } from '@/components/ui/TestimonialCarousel'
import type { TestimonialApiValue } from '@/types/api'

const DEFAULT_TESTIMONIALS = [
  {
    quote:
      'The SCADA system Genex deployed for our 50 MW plant reduced fault response time from 4 hours to under 15 minutes. The ROI was visible within the first quarter.',
    name: 'Arjun Sharma',
    role: 'Head of Operations',
    company: 'Greenko Group',
    initials: 'AS',
  },
  {
    quote:
      "What sets Genex apart is their deep domain expertise. They didn't just install a monitoring system — they understood our grid constraints and designed around them.",
    name: 'Priya Nair',
    role: 'Plant Manager',
    company: 'SECI',
    initials: 'PN',
  },
  {
    quote:
      "We've worked with several automation vendors. Genex's Re-NMS is the first system our operators actually trust. The UI is fast, reliable, and built for real field conditions.",
    name: 'Suresh Patel',
    role: 'CTO',
    company: 'Torrent Power',
    initials: 'SP',
  },
  {
    quote:
      'Their AI Plant Health Checkup predicted an inverter failure 3 weeks before it happened. That single alert saved us ₹40 lakh in unplanned downtime.',
    name: 'Meera Krishnan',
    role: 'VP Engineering',
    company: 'Adani Green Energy',
    initials: 'MK',
  },
]

export function Testimonials({ testimonials: apiTestimonials }: { testimonials?: TestimonialApiValue[] }) {
  const TESTIMONIALS = apiTestimonials && apiTestimonials.length > 0 ? apiTestimonials : DEFAULT_TESTIMONIALS

  return (
    <section
      className="bg-white py-20 lg:py-28 overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
            Client Voices
          </p>
          <h2
            id="testimonials-heading"
            className="text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight"
          >
            Trusted by Engineers,<br className="hidden sm:block" /> Operators &amp; Planners.
          </h2>
        </motion.div>

        <TestimonialCarousel testimonials={TESTIMONIALS} />
      </div>
    </section>
  )
}
