import { motion } from 'framer-motion'
import { TestimonialCarousel } from '@/components/ui/TestimonialCarousel'
import type { TestimonialApiValue } from '@/types/api'

interface ProductTestimonialsSectionProps {
  heading: string
  items: TestimonialApiValue[]
}

export function ProductTestimonialsSection({ heading, items }: ProductTestimonialsSectionProps) {
  return (
    <section className="bg-[#f8fafc] py-16 lg:py-24 border-t border-[#f1f5f9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.h2
          className="text-4xl font-bold text-[#162456] leading-tight text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          {heading}
        </motion.h2>

        <TestimonialCarousel testimonials={items} compact />
      </div>
    </section>
  )
}
