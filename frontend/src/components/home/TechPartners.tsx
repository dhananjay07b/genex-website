import { motion } from 'framer-motion'

interface Partner {
  name: string
  abbr: string
  href: string
}

const PARTNERS: Partner[] = [
  { name: 'Amazon Web Services', abbr: 'AWS',       href: 'https://aws.amazon.com' },
  { name: 'Microsoft Azure',     abbr: 'Azure',     href: 'https://azure.microsoft.com' },
  { name: 'Google Cloud',        abbr: 'GCP',       href: 'https://cloud.google.com' },
  { name: 'Modbus Organization', abbr: 'Modbus',    href: 'https://modbus.org' },
  { name: 'IEC 61850 Standard',  abbr: 'IEC 61850', href: 'https://www.iec.ch' },
  { name: 'OPC Foundation',      abbr: 'OPC-UA',    href: 'https://opcfoundation.org' },
  { name: 'MQTT.org',            abbr: 'MQTT',      href: 'https://mqtt.org' },
  { name: 'DNP Users Group',     abbr: 'DNP3',      href: 'https://www.dnp.org' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function TechPartners() {
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
          {PARTNERS.map(({ name, abbr, href }) => (
            <motion.a
              key={abbr}
              variants={itemVariants}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} — opens in new tab`}
              className="group flex items-center justify-center px-6 py-4 rounded-xl border border-border text-text-muted font-bold text-sm tracking-wide hover:text-primary hover:border-primary shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-28"
            >
              {abbr}
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
