import { HeroSlideshow }     from '@/components/home/HeroSlideshow'
import { CredibilityStrip }  from '@/components/home/CredibilityStrip'
import { ImpactNumbers }     from '@/components/home/ImpactNumbers'
import { WhatWeBuild }       from '@/components/home/WhatWeBuild'
import { ProjectsAtScale }   from '@/components/home/ProjectsAtScale'
import { GenexEdge }         from '@/components/home/GenexEdge'
import { FeaturedCaseStudy }   from '@/components/home/FeaturedCaseStudy'
import { InnovationsTeaser }   from '@/components/home/InnovationsTeaser'
import { TechPartners }        from '@/components/home/TechPartners'
import { FinalCTA }          from '@/components/home/FinalCTA'

export default function Home() {
  return (
    <main>
      <HeroSlideshow />
      <CredibilityStrip />
      <ImpactNumbers />
      <WhatWeBuild />
      <ProjectsAtScale />
      <GenexEdge />
      <FeaturedCaseStudy />
      <InnovationsTeaser />
      <TechPartners />
      <FinalCTA />
    </main>
  )
}
