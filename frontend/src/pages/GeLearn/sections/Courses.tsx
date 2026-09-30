import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import PlaylistPlayOutlinedIcon from '@mui/icons-material/PlaylistPlayOutlined'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { AccessBadge } from '@/components/gelearn/AccessBadge'
import { CompanyBadge } from '@/components/gelearn/CompanyBadge'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl } from '@/lib/utils'
import type { SnippetListResponse } from '@/types/api'
import type { CourseCard } from '@/types/learning'

function CourseTile({ course, index }: { course: CourseCard; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' as const }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' as const }}
    >
      <Link
        to={`/courses/${course.slug}`}
        className="group flex flex-col h-full bg-white border border-border rounded-3xl overflow-hidden shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
      >
        <div className="relative aspect-video bg-brand-tint flex items-center justify-center">
          {course.cover_url
            ? <img src={getMediaUrl(course.cover_url)} alt="" className="w-full h-full object-cover" />
            : <SchoolOutlinedIcon sx={{ fontSize: 40 }} className="text-primary/40" />}
          <AccessBadge access={course.access} price={course.price} currency={course.currency} className="absolute top-4 right-4" />
        </div>
        <div className="p-6 flex flex-col flex-1 gap-3">
          <h3 className="text-lg font-bold text-text-primary leading-snug group-hover:text-primary transition-colors">{course.title}</h3>
          {course.description && <p className="text-sm text-text-muted leading-relaxed line-clamp-3">{course.description}</p>}
          <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="truncate font-semibold text-text-primary">{course.owner.display_name}</span>
              {course.owner.company?.verified && <CompanyBadge company={course.owner.company} />}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <PlaylistPlayOutlinedIcon sx={{ fontSize: 15 }} /> {course.item_count} {course.item_count === 1 ? 'lesson' : 'lessons'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Courses() {
  const [courses, setCourses] = useState<CourseCard[] | null>(null)

  useEffect(() => {
    apiFetch<SnippetListResponse<CourseCard>>('/api/learning/courses/?limit=200')
      .then(res => setCourses(res.results))
      .catch(() => setCourses([]))
  }, [])

  return (
    <main>
      <PageMeta
        title="Courses — Genex GeLearn"
        description="Structured courses from energy-sector professionals: SCADA, grid operations, renewables and more, built from field-tested videos and articles."
        canonical="/courses"
      />
      <PageHero
        label="Courses"
        headline="Learn From People Who Run the Grid"
        subline="Structured courses built by verified industry professionals, from fundamentals to field practice."
      />

      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {courses === null ? (
            <div className="min-h-60" />
          ) : courses.length === 0 ? (
            <p className="text-center text-text-muted py-16">No courses are published yet. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => <CourseTile key={course.slug} course={course} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
