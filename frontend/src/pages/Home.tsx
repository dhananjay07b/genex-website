import { useEffect, useState } from 'react'
import { PageMeta }            from '@/components/seo/PageMeta'
import { HeroSlideshow }        from '@/components/home/HeroSlideshow'
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
import type { HomePageData, WagtailListResponse } from '@/types/api'

export default function Home() {
  const [data, setData] = useState<HomePageData | null>(null)

  useEffect(() => {
    apiFetch<WagtailListResponse<HomePageData>>(
      '/api/v2/pages/?type=pages.HomePage&fields=event_banner,hero_slides,credibility_strip,impact_stats,what_we_build,edge_section,projects_showcase,innovations_teaser,world_map,gelearn_teaser,tech_partners,testimonials,cta_section&limit=1'
    )
      .then(res => setData(res.items[0] ?? null))
      .catch(() => setData(null))
  }, [])

  const events    = data?.event_banner?.map(b => b.value) ?? []
  const slides    = data?.hero_slides?.map(b => b.value) ?? []
  const clients   = data?.credibility_strip?.map(b => b.value) ?? []
  const stats     = data?.impact_stats?.map(b => b.value) ?? []
  const tabs      = data?.what_we_build?.map(b => b.value) ?? []
  const edgeVal   = data?.edge_section?.[0]?.value
  const projects  = data?.projects_showcase?.map(b => b.value) ?? []
  const innoItems = data?.innovations_teaser?.map(b => b.value) ?? []
  const worldMap  = data?.world_map?.[0]?.value
  const gelearnCards = data?.gelearn_teaser?.map(b => b.value) ?? []
  const partners  = data?.tech_partners?.map(b => b.value) ?? []
  const testi     = data?.testimonials?.map(b => b.value) ?? []

  return (
    <main>
      <PageMeta
        title="Energy Monitoring & SCADA Software for India"
        description="Genex Technocrats builds software and systems that run India's renewable energy infrastructure — solar monitoring, SCADA, RMS, EMS, and AI platforms."
        canonical="/"
      />

      <HeroSlideshow    slides={slides.length ? slides : undefined} />

      {/* Event banner slider — only rendered when CMS has events */}
      {events.length > 0 && <EventBanner events={events} />}

      <CredibilityStrip clients={clients.length ? clients : undefined} />
      <ImpactNumbers    stats={stats.length ? stats : undefined} />
      <WhatWeBuild      tabs={tabs.length ? tabs : undefined} />
      <ProjectsAtScale  projects={projects.length ? projects : undefined} />
      <GenexEdge        edge={edgeVal} />
      <IndiaOperationsMap map={worldMap} />
      <InnovationsTeaser products={innoItems.length ? innoItems : undefined} />
      <Testimonials      testimonials={testi.length ? testi : undefined} />
      <GeLearnTeaser     cards={gelearnCards.length ? gelearnCards : undefined} />
      <TechPartners      partners={partners.length ? partners : undefined} />
      <FinalCTA />
    </main>
  )
}
