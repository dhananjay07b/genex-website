import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { BrowseHero } from '@/components/gelearn/discovery/BrowseHero'
import { BUTTON } from '@/components/gelearn/discovery/meta'
import { SectionHeading } from '@/components/gelearn/discovery/SectionHeading'
import { SmartLink } from '@/components/ui/SmartLink'
import { useAuth } from '@/context/useAuth'
import { useApi } from '@/hooks/useApi'
import type { LandingData, LayoutSection, PlatformStatKey } from '@/types/discovery'
import { FaqSection, PromoPairSection, Section } from '../home/sections'
import type { FaqValue, PromoPairValue } from '../home/types'

const STAT_LABELS: Record<PlatformStatKey, string> = {
  verified_professionals: 'Verified Professionals',
  professionals: 'Professionals',
  courses: 'Courses published',
  companies: 'Verified companies',
  research_and_whitepapers: 'Research and whitepapers',
  learners: 'Learners',
}

interface HeroValue {
  kicker: string; heading: string; body: string
  primary_label: string; primary_link: string; secondary_label: string; secondary_link: string
  stats_heading: string; stats: PlatformStatKey[]
}
interface StepsValue { heading: string; subheading: string; steps: { title: string; text: string }[] }
interface PanelsValue { panels: { heading: string; items: { title: string; text: string; planned: boolean }[] }[] }

const PAGES = {
  professionals: { path: '/for-professionals', crumb: 'For Professionals', meta: 'Publish posts, videos and courses on GeLearn as a verified Professional.' },
  companies: { path: '/for-companies', crumb: 'For Companies', meta: 'Publish courses, research and whitepapers on GeLearn from Company Studio.' },
}

function LandingSection({ section, data, crumb, viewer }: { section: LayoutSection; data: LandingData; crumb: string; viewer: string }) {
  const v = section.value
  switch (section.type) {
    case 'landing_hero': {
      const hero = v as unknown as HeroValue
      return (
        <BrowseHero
          crumbs={[{ label: 'Home', to: '/' }, { label: crumb }]}
          kicker={hero.kicker}
          title={hero.heading}
          lead={hero.body}
          actions={<>
            {hero.primary_label && hero.primary_link && <SmartLink to={hero.primary_link} className={BUTTON.primary}>{hero.primary_label}</SmartLink>}
            {hero.secondary_label && hero.secondary_link && <SmartLink to={hero.secondary_link} className={BUTTON.outline}>{hero.secondary_label}</SmartLink>}
          </>}
          factsHeading={hero.stats_heading}
          facts={(hero.stats ?? []).map(key => ({ label: STAT_LABELS[key], value: data.stats[key] }))}
        />
      )
    }
    case 'steps': {
      const steps = v as unknown as StepsValue
      return (
        <Section label={steps.heading}>
          <SectionHeading title={steps.heading} subtitle={steps.subheading} />
          <ol className="grid gap-3 lg:grid-cols-5">
            {steps.steps.map((step, i) => (
              <li key={i} className="grid content-start gap-1.5 rounded-xl border border-border bg-white p-4">
                <span className="flex size-7 items-center justify-center rounded-full bg-surface text-sm font-extrabold text-sky-700" aria-hidden="true">{i + 1}</span>
                <b className="text-sm text-text-primary">{step.title}</b>
                <span className="text-sm text-slate-700">{step.text}</span>
              </li>
            ))}
          </ol>
        </Section>
      )
    }
    case 'list_panels': {
      const panels = (v as unknown as PanelsValue).panels
      return (
        <Section label="Details">
          <div className="grid gap-4 md:grid-cols-2">
            {panels.map((panel, i) => (
              <div key={i} className="rounded-xl border border-border bg-white p-5">
                <h2 className="mb-3 text-base font-extrabold text-text-primary">{panel.heading}</h2>
                <ul className="grid gap-2.5">
                  {panel.items.map((item, k) => (
                    <li key={k} className="flex gap-2 text-sm text-slate-700">
                      <CheckCircleOutlinedIcon sx={{ fontSize: 20 }} className="shrink-0 text-emerald-700" />
                      <span>
                        <b className="text-text-primary">{item.title}</b>{item.text && <>: {item.text}</>}
                        {item.planned && <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 align-middle text-xs font-extrabold uppercase tracking-wide text-amber-800">Planned</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )
    }
    case 'promo_pair': return <PromoPairSection value={v as unknown as PromoPairValue} viewer={viewer as 'visitor'} />
    case 'faq': return <FaqSection value={v as unknown as FaqValue} />
    default: return null
  }
}

/** /for-professionals and /for-companies: sections and wording set in the CMS (GeLearn page). */
export default function LandingPage({ audience }: { audience: keyof typeof PAGES }) {
  const page = PAGES[audience]
  const { user } = useAuth()
  const { data } = useApi<LandingData>(`/api/discovery/landing/${audience}/`)
  const heading = data?.layout.find(s => s.type === 'landing_hero')?.value.heading as string | undefined

  return (
    <div className="bg-white pt-16 pb-8">
      <PageMeta title={`${heading ?? page.crumb}: GeLearn`} description={page.meta} canonical={page.path} />
      {data
        ? data.layout.map(section => (
            <LandingSection key={section.id} section={section} data={data} crumb={page.crumb} viewer={user?.account_type ?? 'visitor'} />
          ))
        : <div className="mx-auto h-96 max-w-330 animate-pulse px-4 pt-8 md:px-6" aria-hidden="true"><div className="h-full rounded-2xl bg-slate-100" /></div>}
    </div>
  )
}
