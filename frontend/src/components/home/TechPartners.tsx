import { motion } from 'framer-motion'
import type { TechPartnerApiValue, WagtailImage } from '@/types/api'
import { getMediaUrl } from '@/lib/utils'

interface Partner {
  name: string
  abbr: string
  href: string
  logo: WagtailImage | null
}

const DEFAULT_PARTNERS: Partner[] = [
  { name: 'Amazon Web Services', abbr: 'AWS',       href: 'https://aws.amazon.com',      logo: null },
  { name: 'Microsoft Azure',     abbr: 'Azure',     href: 'https://azure.microsoft.com', logo: null },
  { name: 'Google Cloud',        abbr: 'GCP',       href: 'https://cloud.google.com',    logo: null },
  { name: 'Modbus Organization', abbr: 'Modbus',    href: 'https://modbus.org',          logo: null },
  { name: 'IEC 61850 Standard',  abbr: 'IEC 61850', href: 'https://www.iec.ch',          logo: null },
  { name: 'OPC Foundation',      abbr: 'OPC-UA',    href: 'https://opcfoundation.org',   logo: null },
  { name: 'MQTT.org',            abbr: 'MQTT',      href: 'https://mqtt.org',            logo: null },
  { name: 'DNP Users Group',     abbr: 'DNP3',      href: 'https://www.dnp.org',         logo: null },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function TechPartners({ partners: apiPartners }: { partners?: TechPartnerApiValue[] }) {
  const PARTNERS = apiPartners && apiPartners.length > 0
    ? apiPartners.map(p => ({ name: p.name, abbr: p.abbr, href: p.href ?? '#', logo: p.logo }))
    : DEFAULT_PARTNERS
  return (
    <section className="bg-white py-20 lg:py-24" aria-labelledby="partners-heading">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.h2
          id="partners-heading"
          className="text-3xl lg:text-4xl font-extrabold text-text-primary mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Technology & Standards<br className="sm:hidden" /> We Work With
        </motion.h2>

        <motion.div
          className="flex flex-wrap gap-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {PARTNERS.map(({ name, abbr, href, logo }) => (
            <motion.a
              key={abbr}
              variants={itemVariants}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} — opens in new tab`}
              className="group flex items-center justify-center px-6 py-4 rounded-xl border border-border text-text-muted font-bold text-sm tracking-wide hover:text-primary hover:border-primary shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-28"
            >
              {logo ? (
                <img
                  src={getMediaUrl(logo.url)}
                  alt={name}
                  className="h-6 w-auto max-w-24 object-contain"
                />
              ) : (
                abbr
              )}
            </motion.a>
          ))}
        </motion.div>

        <motion.p
          className="mt-8 text-xs text-text-muted"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          We build on open standards — Modbus, IEC 61850, OPC-UA, DNP3 — so your infrastructure is never locked in.
        </motion.p>
      </div>
    </section>
  )
}
