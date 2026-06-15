import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface Project {
  name: string
  location: string
  metric: string
  href: string
  gradient: string
  image: string
}

const PROJECTS: Project[] = [
  {
    name: '50 MW Solar Power Plant',
    location: 'Rajasthan',
    metric: '50 MW',
    href: '/portfolio/solar-power-plants',
    gradient: 'linear-gradient(160deg, #1a2d0a 0%, #2a4a15 100%)',
    image: '/images/projects/solar-rajasthan.png',
  },
  {
    name: 'Industrial SCADA Deployment',
    location: 'Pune, Maharashtra',
    metric: 'SCADA',
    href: '/portfolio/rms',
    gradient: 'linear-gradient(160deg, #0a1628 0%, #0d2d50 100%)',
    image: '/images/projects/scada-pune.png',
  },
  {
    name: 'Wind Farm Monitoring',
    location: 'Gujarat',
    metric: 'Wind RMS',
    href: '/portfolio/wind-energy',
    gradient: 'linear-gradient(160deg, #0a1a28 0%, #0d3040 100%)',
    image: '/images/projects/wind-gujrat.jpg',
  },
]

const FLEX_DEFAULT = [5, 3, 2]

function ProjectCard({
  project,
  index,
  onEnter,
  onLeave,
}: {
  project: Project
  index: number
  onEnter: () => void
  onLeave: () => void
}) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-xl group min-h-80 lg:h-full lg:min-h-0"
      style={{ willChange: 'opacity, transform' }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.0, 0.0, 0.2, 1] as const }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Link
        to={project.href}
        className="block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        aria-label={`View project: ${project.name}`}
      >
        {/* Background */}
        <img
          src={project.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width="960" height="540"
        />
        <div className="absolute inset-0" style={{ background: project.gradient, opacity: 0.45 }} />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 bg-black/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-hidden="true"
        >
          <span className="text-white text-sm font-semibold border border-white rounded-full px-5 py-2 backdrop-blur-sm">
            View Project →
          </span>
        </div>

        {/* Info bar */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-[linear-gradient(to_top,rgba(0,0,0,0.75),transparent)]">
          <p className="text-white font-bold text-base leading-snug">{project.name}</p>
          <p className="text-white/60 text-xs mt-0.5">
            {project.location} · <span className="text-primary font-semibold">{project.metric}</span>
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

export function ProjectsAtScale() {
  const [hovered, setHovered] = useState<number | null>(null)

  function getFlexGrow(i: number): number {
    if (hovered === null) return FLEX_DEFAULT[i]
    if (i === hovered) return 5
    // Shrink the default-large card when it's not the hovered one
    if (i === 0) return 2
    return FLEX_DEFAULT[i]
  }

  return (
    <section className="py-20 lg:py-28 bg-white" aria-labelledby="projects-heading">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <motion.h2
            id="projects-heading"
            className="text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Built. Deployed.<br className="hidden sm:block" /> Running.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Link
              to="/portfolio"
              className="text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:underline hidden sm:block"
            >
              View All Projects →
            </Link>
          </motion.div>
        </div>

        {/* Accordion flex row on desktop, stacked on mobile */}
        <div className="flex flex-col lg:flex-row lg:h-96 gap-4">
          {PROJECTS.map((project, i) => (
            <div
              key={project.href}
              style={{
                flexGrow: getFlexGrow(i),
                flexShrink: 1,
                flexBasis: 0,
                transition: 'flex-grow 500ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <ProjectCard
                project={project}
                index={i}
                onEnter={() => setHovered(i)}
                onLeave={() => setHovered(null)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link to="/portfolio" className="text-sm font-semibold text-primary hover:underline">
            View All Projects →
          </Link>
        </div>
      </div>
    </section>
  )
}
