import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'

const TOPICS = [
  'IEC 61850', 'SCADA', 'Modbus', 'MQTT', 'OPC-UA', 'Grid Management', 'IoT', 'Edge Computing',
  'Energy Storage', 'Solar Analytics', 'EV Infrastructure', 'Cloud Architecture',
]

const DIFFICULTY_STYLE: Record<string, string> = {
  Beginner:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  Advanced:     'bg-rose-50 text-rose-700 border-rose-200',
}

const ARTICLES = [
  {
    id: 1,
    title: 'How IEC 61850 Changed Substation Automation — And Why It Matters for Indian Utilities',
    topic: 'IEC 61850',
    difficulty: 'Intermediate',
    readTime: '12 min read',
    excerpt: "IEC 61850 is more than a communication protocol — it's a complete engineering philosophy for interoperable, vendor-agnostic substation automation. This deep dive covers GOOSE, SV messaging, and practical deployment lessons from Genex SCADA installations.",
    tags: ['IEC 61850', 'SCADA', 'Substation'],
    featured: true,
  },
  {
    id: 2,
    title: 'Edge vs Cloud: Choosing the Right Data Architecture for Solar Monitoring at Scale',
    topic: 'Edge Computing',
    difficulty: 'Intermediate',
    readTime: '9 min read',
    excerpt: "When you're managing 500+ solar sites, the decision between edge processing and cloud aggregation isn't theoretical — it affects data latency, cost, and reliability in measurable ways.",
    tags: ['Solar Analytics', 'Edge Computing', 'Cloud Architecture'],
    featured: false,
  },
  {
    id: 3,
    title: 'OCPP 2.0.1 vs OCPP 1.6: What Fleet Operators Need to Know Before Upgrading',
    topic: 'EV Infrastructure',
    difficulty: 'Beginner',
    readTime: '7 min read',
    excerpt: "The jump from OCPP 1.6 to 2.0.1 introduces device management, improved security, and ISO 15118 readiness. Here's a practical comparison for charging network operators planning infrastructure upgrades.",
    tags: ['EV Infrastructure', 'OCPP', 'Standards'],
    featured: false,
  },
  {
    id: 4,
    title: 'Designing a Reliable MQTT Architecture for Industrial IoT at 10,000 Endpoints',
    topic: 'MQTT',
    difficulty: 'Advanced',
    readTime: '15 min read',
    excerpt: "MQTT is lightweight by design — but scaling it reliably across thousands of field devices requires careful broker configuration, QoS selection, and failover planning. Lessons from Genex's Data Logger fleet.",
    tags: ['IoT', 'MQTT', 'Edge Computing'],
    featured: false,
  },
  {
    id: 5,
    title: 'Battery State-of-Health Estimation: Methods, Tradeoffs, and What Actually Works in the Field',
    topic: 'Energy Storage',
    difficulty: 'Advanced',
    readTime: '11 min read',
    excerpt: 'SOH estimation algorithms range from simple coulomb counting to machine learning models. We break down the methods Genex uses in its BMS platform and why accuracy requirements differ by application.',
    tags: ['Energy Storage', 'BMS', 'AI Analytics'],
    featured: false,
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
  transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

export default function Technology() {
  return (
    <main>
      <PageMeta
        title="Technology Deep Dives — Genex GeLearn"
        description="IEC 61850, OPC-UA, MQTT, Modbus, AI/ML for energy — technical articles from Genex engineers on the protocols and architectures powering the energy transition."
        canonical="/gelearn/technology"
      />
      <PageHero
        label="Technology Deep Dives"
        headline="Under the Hood"
        subline="In-depth technical articles from engineers who build, commission, and operate these systems in the field."
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-text-muted">
          <Link to="/gelearn" className="hover:text-primary transition-colors">GeLearn</Link>
          <span>/</span>
          <span className="font-semibold text-text-primary">Technology Deep Dives</span>
        </div>
      </div>

      <section className="bg-surface py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_240px] gap-12 items-start">

            {/* Article list */}
            <div className="space-y-4">
              {ARTICLES.map((article, i) => (
                <motion.div key={article.id} {...fadeUp(i * 0.07)}>
                  <div className={`bg-white border rounded-2xl p-7 hover:border-primary hover:shadow-sm transition-all duration-200 ${article.featured ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border'}`}>
                    {article.featured && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/30 bg-primary/5 rounded-full px-2.5 py-0.5 mb-4">
                        Featured
                      </span>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${DIFFICULTY_STYLE[article.difficulty]}`}>
                        {article.difficulty}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted border border-border rounded-full px-2.5 py-0.5">
                        {article.topic}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-muted ml-auto">
                        <AccessTimeOutlinedIcon style={{ fontSize: 13 }} />{article.readTime}
                      </span>
                    </div>
                    <h3 className={`font-extrabold text-text-primary leading-snug mb-3 ${article.featured ? 'text-xl' : 'text-base'}`}>
                      {article.title}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed mb-4">{article.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map(t => (
                        <span key={t} className="px-3 py-1 bg-surface border border-border rounded-full text-xs font-medium text-text-primary">{t}</span>
                      ))}
                    </div>
                    <Link to="/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                      Read Article <ArrowForwardIcon style={{ fontSize: 15 }} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sticky topic sidebar */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-white border border-border rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-4">Topics</p>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map(t => (
                    <span key={t} className="px-3 py-1.5 bg-surface border border-border rounded-full text-xs font-medium text-text-primary hover:border-primary hover:text-primary cursor-pointer transition-colors duration-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Contribute</p>
            <h2 className="text-xl font-extrabold text-text-primary">Have content to contribute?</h2>
            <p className="mt-1 text-sm text-text-muted">We publish technical articles from engineers and researchers across the energy sector.</p>
          </div>
          <Link to="/contact" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-semibold text-text-primary hover:border-primary hover:text-primary transition-all duration-200">
            Get in Touch <ArrowForwardIcon style={{ fontSize: 16 }} />
          </Link>
        </div>
      </section>
    </main>
  )
}
