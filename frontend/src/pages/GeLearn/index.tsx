import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageMeta } from '@/components/seo/PageMeta'
import { apiFetch } from '@/lib/api/client'
import type { PublicHomeData } from '@/types/discovery'
import { HomeLayout } from './home/HomeLayout'

/** Grey placeholders in the shape of the first sections while the home data loads. */
function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-330 animate-pulse px-4 py-5 md:px-6" aria-hidden="true">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-60 rounded-2xl bg-slate-100" />
        <div className="hidden h-60 rounded-2xl bg-slate-100 lg:block" />
      </div>
      <div className="mt-10 h-7 w-56 rounded bg-slate-100" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map(i => <div key={i} className="h-80 rounded-xl bg-slate-100" />)}
      </div>
    </div>
  )
}

/**
 * GeLearn's home page. Every section, and its order, is set in the CMS
 * (GeLearn page → "Home page for visitors"); the content inside each section
 * comes live from /api/discovery/home/.
 */
export default function GeLearn() {
  const [data, setData] = useState<PublicHomeData | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiFetch<PublicHomeData>('/api/discovery/home/')
      .then(home => { if (!cancelled) setData(home) })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="bg-white pt-16 pb-6">
      <PageMeta
        title="GeLearn: Power & Energy Learning by Genex"
        description="Courses, research, policy and tender summaries, videos and podcasts from verified engineers at Genex and partner companies, covering solar, storage, SCADA and the grid."
        canonical="/"
      />
      <h1 className="sr-only">GeLearn: learn the power sector from the engineers who run it</h1>
      {data ? (
        <HomeLayout data={data} />
      ) : failed ? (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <p className="text-lg font-bold text-text-primary">GeLearn couldn't load right now.</p>
          <p className="mt-2 text-sm text-text-muted">Check your connection and refresh the page, or browse the library directly.</p>
          <Link to="/geacademy" className="mt-5 inline-block text-sm font-bold text-sky-700 hover:text-sky-800">Go to GeAcademy</Link>
        </div>
      ) : (
        <HomeSkeleton />
      )}
    </div>
  )
}
