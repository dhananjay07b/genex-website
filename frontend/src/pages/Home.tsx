import { useEffect, useState } from 'react'
import { PageMeta }            from '@/components/seo/PageMeta'
import { HeroPlaceholder, HeroSlideshow } from '@/components/home/HeroSlideshow'
import { CredibilityStrip }     from '@/components/home/CredibilityStrip'
import { ImpactNumbers }        from '@/components/home/ImpactNumbers'
import { WhatWeBuild }          from '@/components/home/WhatWeBuild'
import { ProjectsAtScale }      from '@/components/home/ProjectsAtScale'
import { GenexEdge }            from '@/components/home/GenexEdge'
import { IndiaOperationsMap }   from '@/components/home/IndiaOperationsMap'
import { InnovationsTeaser }    from '@/components/home/InnovationsTeaser'
import { Testimonials }         from '@/components/home/Testimonials'
import { GeLearnTeaser }        from '@/components/home/GeLearnTeaser'
import { TechPartners }         from '@/components/home/TechPartners'
import { FinalCTA }             from '@/components/home/FinalCTA'
import { EventBanner }          from '@/components/home/EventBanner'
import { apiFetch }             from '@/lib/api/client'
import type { CTABandValue, HomePageData, WagtailListResponse } from '@/types/api'

const HOME_URL =
  '/api/v2/pages/?type=pages.HomePage&fields=event_banner,hero_slides,credibility_strip,impact_stats,what_we_build,edge_section,projects_showcase,innovations_teaser,world_map,gelearn_teaser,tech_partners,testimonials,cta_section&limit=1'

// The last homepage the CMS sent, so returning to the homepage shows it at once
// (it's refreshed in the background).
let lastHome: HomePageData | null = null

/**
 * Three states, so the built-in section content never flashes before the CMS content:
 * - loading: only a placeholder hero;
 * - CMS reached: its content, and a section left empty in the CMS is hidden;
 * - CMS unreachable (or no homepage in it): every section shows its built-in content.
 */
export default function Home() {
  const [data, setData] = useState<HomePageData | null>(lastHome)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    apiFetch<WagtailListResponse<HomePageData>>(HOME_URL)
      .then(res => {
        const page = res.items[0]
        if (!page) return setFailed(true)
        lastHome = page
        setData(page)
      })
      .catch(() => setFailed(true))
  }, [])

  /** A section's CMS items: null hides it (left empty in the CMS); undefined means built-in content. */
  function items<T>(blocks: { value: T }[] | undefined): T[] | null | undefined {
    if (!data) return undefined
    return blocks?.length ? blocks.map(b => b.value) : null
  }
  /** Same, for a section that is a single block. */
  function block<T>(blocks: { value: T }[] | undefined): T | null | undefined {
    if (!data) return undefined
    return blocks?.[0]?.value ?? null
  }

  const loading = !data && !failed
  const slides    = items(data?.hero_slides)
  const events    = items(data?.event_banner)
  const clients   = items(data?.credibility_strip)
  const stats     = items(data?.impact_stats)
  const tabs      = items(data?.what_we_build)
  const projects  = items(data?.projects_showcase)
  const edge      = block(data?.edge_section)
  const worldMap  = block(data?.world_map)
  const innoItems = items(data?.innovations_teaser)
  const testi     = items(data?.testimonials)
  const gelearnCards = items(data?.gelearn_teaser)
  const partners  = items(data?.tech_partners)
  const finalCta  = block(data?.cta_section) as CTABandValue | null | undefined

  return (
    <main>
      <PageMeta
        title="Energy Monitoring & SCADA Software for India"
        description="Genex Technocrats builds software and systems that run India's renewable energy infrastructure — solar monitoring, SCADA, RMS, EMS, and AI platforms."
        canonical="/"
      />

      {loading ? <HeroPlaceholder /> : (
        <>
          {slides !== null && <HeroSlideshow slides={slides} />}

          {/* Event banner slider — only rendered when CMS has events */}
          {events && <EventBanner events={events} />}

          {clients !== null      && <CredibilityStrip clients={clients} />}
          {stats !== null        && <ImpactNumbers    stats={stats} />}
          {tabs !== null         && <WhatWeBuild      tabs={tabs} />}
          {projects !== null     && <ProjectsAtScale  projects={projects} />}
          {edge !== null         && <GenexEdge        edge={edge} />}
          {worldMap !== null     && <IndiaOperationsMap map={worldMap} />}
          {innoItems !== null    && <InnovationsTeaser products={innoItems} />}
          {testi !== null        && <Testimonials      testimonials={testi} />}
          {gelearnCards !== null && <GeLearnTeaser     cards={gelearnCards} />}
          {partners !== null     && <TechPartners      partners={partners} />}
          {finalCta !== null     && <FinalCTA cta={finalCta} />}
        </>
      )}
    </main>
  )
}
