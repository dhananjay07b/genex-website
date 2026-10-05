import { Link, useParams } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageMeta } from '@/components/seo/PageMeta'
import { BrowseHero } from '@/components/gelearn/discovery/BrowseHero'
import { BUTTON } from '@/components/gelearn/discovery/meta'
import { LiveSessionCard } from '@/components/gelearn/discovery/LiveSessionCard'
import { ProfessionalCard } from '@/components/gelearn/discovery/DirectoryCards'
import { SectionHeading } from '@/components/gelearn/discovery/SectionHeading'
import { useApi } from '@/hooks/useApi'
import type { TopicDetail, TopicGroupRef } from '@/types/discovery'
import NotFound from '@/pages/NotFound'
import { CardGrid, Section } from '../home/sections'

const CHIP = 'inline-flex items-center rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-text-primary'

function PageSkeleton() {
  return <div className="mx-auto h-96 max-w-330 animate-pulse px-4 pt-24 md:px-6" aria-hidden="true"><div className="h-full rounded-2xl bg-slate-100" /></div>
}

/** /topics: every topic, under its Explore-menu group. */
export function TopicsIndexPage() {
  const { data } = useApi<{ groups: TopicGroupRef[] }>('/api/discovery/topics/')
  return (
    <div className="bg-white pt-16 pb-8">
      <PageMeta title="All topics: GeLearn" description="Browse GeLearn by topic: solar, storage, grid, SCADA, automation, safety and policy." canonical="/topics" />
      <BrowseHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Topics' }]}
        kicker="Explore"
        title="All topics"
        lead="Courses, articles, research, videos and experts, organised by the subjects engineers work on."
      />
      {data?.groups.map(group => (
        <Section key={group.name} label={group.name}>
          <SectionHeading title={group.name} />
          <div className="flex flex-wrap gap-2">
            {group.topics.map(topic => <Link key={topic.id} to={`/topics/${topic.slug}`} className={CHIP}>{topic.name}</Link>)}
          </div>
        </Section>
      ))}
    </div>
  )
}

const ANCHORS = [
  ['courses', 'Courses'], ['start', 'Start here'], ['reading', 'Articles & research'], ['media', 'Videos & podcasts'],
  ['live', 'Live sessions'], ['experts', 'Experts'], ['related', 'Related topics'],
] as const

/** /topics/:slug: one topic, Coursera-style, with in-page tabs. */
export function TopicPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: topic, failed } = useApi<TopicDetail>(`/api/discovery/topics/${slug}/`)
  if (failed) return <NotFound />
  if (!topic) return <PageSkeleton />

  const present: Record<(typeof ANCHORS)[number][0], boolean> = {
    courses: topic.popular_courses.length > 0,
    start: topic.beginner_courses.length > 0,
    reading: topic.reading.length > 0,
    media: topic.media.length > 0,
    live: topic.live_sessions.length > 0,
    experts: topic.experts.length > 0,
    related: topic.related.length > 0,
  }
  const searchTopic = `/search?topic=${topic.slug}`

  return (
    <div className="bg-white pt-16 pb-8">
      <PageMeta title={`${topic.name}: GeLearn`} description={topic.description || `Learn ${topic.name} on GeLearn.`} canonical={`/topics/${topic.slug}`} />
      <BrowseHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Topics', to: '/topics' }, { label: topic.name }]}
        kicker={topic.group}
        title={topic.name}
        lead={topic.description}
        actions={<>
          <Link to={`${searchTopic}&type=course`} className={BUTTON.primary}>Browse {topic.name} courses <ArrowForwardIcon sx={{ fontSize: 16 }} /></Link>
          {present.start && <a href="#start" className={BUTTON.outline}>Start with a beginner course</a>}
        </>}
        factsHeading="On GeLearn"
        facts={[
          { label: 'Courses', value: topic.counts.courses },
          { label: 'Articles & research', value: topic.counts.reading },
          { label: 'Videos & podcasts', value: topic.counts.media },
          { label: 'Experts', value: topic.counts.experts },
        ]}
      />
      <nav aria-label="On this page" className="sticky top-24 z-20 border-b border-border bg-white">
        <div className="scrollbar-hidden mx-auto flex max-w-330 gap-1 overflow-x-auto px-4 md:px-6">
          {ANCHORS.filter(([id]) => present[id]).map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap px-3 py-3 text-sm font-bold text-slate-700 hover:text-text-primary">{label}</a>
          ))}
        </div>
      </nav>

      {present.courses && (
        <Section label="Courses">
          <div id="courses" className="scroll-mt-40" />
          <SectionHeading title={`Most popular ${topic.name} courses`} seeAllLabel={`All ${topic.name} courses`} seeAllUrl={`${searchTopic}&type=course`} />
          <CardGrid cards={topic.popular_courses} />
        </Section>
      )}
      {present.start && (
        <Section label="Start here">
          <div id="start" className="scroll-mt-40" />
          <SectionHeading title={`New to ${topic.name}? Start here`} subtitle="Beginner courses, no experience needed." />
          <CardGrid cards={topic.beginner_courses} />
        </Section>
      )}
      {present.reading && (
        <Section label="Articles and research">
          <div id="reading" className="scroll-mt-40" />
          <SectionHeading title="Articles & research" seeAllUrl={searchTopic} />
          <CardGrid cards={topic.reading} />
        </Section>
      )}
      {present.media && (
        <Section label="Videos and podcasts">
          <div id="media" className="scroll-mt-40" />
          <SectionHeading title="Videos & podcasts" seeAllUrl={searchTopic} />
          <CardGrid cards={topic.media} />
        </Section>
      )}
      {present.live && (
        <Section label="Live sessions">
          <div id="live" className="scroll-mt-40" />
          <SectionHeading title={`Upcoming live sessions on ${topic.name}`} seeAllLabel="All sessions" seeAllUrl="/live-sessions" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topic.live_sessions.map(s => <LiveSessionCard key={s.id} session={s} />)}
          </div>
        </Section>
      )}
      {present.experts && (
        <Section label="Experts">
          <div id="experts" className="scroll-mt-40" />
          <SectionHeading title={`Experts in ${topic.name}`} subtitle={`Professionals who list ${topic.name} as an area of expertise.`}
            seeAllLabel="All Professionals" seeAllUrl={`/professionals?topic=${topic.slug}`} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topic.experts.map(p => <ProfessionalCard key={p.username ?? p.display_name} person={p} />)}
          </div>
        </Section>
      )}
      {present.related && (
        <Section label="Related topics">
          <div id="related" className="scroll-mt-40" />
          <SectionHeading title="Related topics" seeAllLabel="All topics" seeAllUrl="/topics" />
          <div className="flex flex-wrap gap-2">
            {topic.related.map(t => <Link key={t.id} to={`/topics/${t.slug}`} className={CHIP}>{t.name}</Link>)}
          </div>
        </Section>
      )}
      {!Object.values(present).some(Boolean) && (
        <Section label="Coming soon">
          <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-text-muted">
            Nothing is tagged with {topic.name} yet. <Link to="/topics" className="font-bold text-sky-700">Browse other topics</Link>
          </p>
        </Section>
      )}
    </div>
  )
}
