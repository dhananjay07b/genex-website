import { PageMeta }       from '@/components/seo/PageMeta'
import { HeroSlideshow }  from '@/components/home/HeroSlideshow'
// import { ImpactNumbers }  from '@/components/home/ImpactNumbers'
import { WhatWeBuild }    from '@/components/home/WhatWeBuild'
import { OperationsMap }  from '@/components/home/OperationsMap'
import { EventBanner }    from '@/components/home/EventBanner'

// Commented out until content is confirmed and ready for launch:
// import { CredibilityStrip }   from '@/components/home/CredibilityStrip'   // client logos — placeholder
// import { ProjectsAtScale }    from '@/components/home/ProjectsAtScale'    // needs real project photos
// import { GenexEdge }          from '@/components/home/GenexEdge'           // needs real content
// import { InnovationsTeaser }  from '@/components/home/InnovationsTeaser'  // links to coming-soon pages
// import { Testimonials }       from '@/components/home/Testimonials'        // placeholder quotes
// import { GeLearnTeaser }      from '@/components/home/GeLearnTeaser'       // links to coming-soon page
// import { TechPartners }       from '@/components/home/TechPartners'        // needs partner confirmation
// import { FinalCTA }           from '@/components/home/FinalCTA'

export default function Home() {
  return (
    <main>
      <PageMeta
        title="Genex Technocrats | AI, Renewable Energy & Industrial IoT Solutions"
        description="Genex Technocrats develops AI-powered renewable energy, Battery Energy Storage Systems (BESS), EV charging, Industrial IoT, energy management, and smart digital solutions for a sustainable future."
        canonical="/"
      />
      <HeroSlideshow />
      <EventBanner />
      <WhatWeBuild />
      <OperationsMap />
    </main>
  )
}
