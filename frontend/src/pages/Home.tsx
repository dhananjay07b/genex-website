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

export default function Home() {
  return (
    <main>
      <PageMeta
        title="Energy Monitoring & SCADA Software for India"
        description="Genex Technocrats builds software and systems that run India's renewable energy infrastructure — solar monitoring, SCADA, RMS, EMS, and AI platforms."
        canonical="/"
      />
      <HeroSlideshow />
      <CredibilityStrip />
      <ImpactNumbers />
      <WhatWeBuild />
      <ProjectsAtScale />
      <GenexEdge />
      <IndiaOperationsMap />
      <InnovationsTeaser />
      <Testimonials />
      <GeLearnTeaser />
      <TechPartners />
      <FinalCTA />
    </main>
  )
}
