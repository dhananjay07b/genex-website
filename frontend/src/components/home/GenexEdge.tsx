import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface Statement {
  title: string
  body: string
}

const STATEMENTS: Statement[] = [
  {
    title: 'Full-stack.',
    body: 'Hardware to cloud, in one team. No integration headaches.',
  },
  {
    title: 'Indian engineering.',
    body: 'Built to global standards. Priced for Indian realities.',
  },
  {
    title: 'Deployed at scale.',
    body: 'Not pilot projects. 500 MW under active monitoring.',
  },
  {
    title: 'Responsive support.',
    body: 'Real engineers on call. Not a support ticket number.',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const statementVariants = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] as const } },
}

export function GenexEdge() {
  return (
    <section className="bg-dark-bg overflow-hidden" aria-labelledby="genex-edge-heading">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-[45fr_55fr] gap-12 lg:gap-20 items-center">

          {/* Left: visual placeholder — swap with real photo/video */}
          <motion.div
            className="relative rounded-2xl overflow-hidden h-72 lg:h-120"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <img
              src="/images/edge/control-room.png"
              alt="Genex control room with SCADA screens"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(13,37,69,0.35)_0%,rgba(10,32,64,0.2)_100%)]" />
          </motion.div>

          {/* Right: statements */}
          <div>
            <motion.h2
              id="genex-edge-heading"
              className="text-4xl lg:text-5xl font-extrabold text-white mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Why Genex.
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              className="divide-y divide-white/10"
            >
              {STATEMENTS.map(({ title, body }) => (
                <motion.div
                  key={title}
                  variants={statementVariants}
                  className="py-6 first:pt-0 last:pb-0"
                >
                  <p className="text-xl font-bold text-white leading-snug">{title}</p>
                  <p className="mt-1.5 text-base text-white/55 leading-relaxed">{body}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10"
            >
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:underline"
              >
                Learn About Us
                <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
