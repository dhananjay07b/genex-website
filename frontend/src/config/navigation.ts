import type { NavConfig } from '@/types/navigation'

export const navConfig: NavConfig = {
  items: [
    {
      label: 'Portfolio',
      dropdown: {
        sections: [
          {
            title: 'Our Delivery Portfolio',
            items: [
              {
                label: 'Solar Rooftop',
                description: 'End-to-end design and deployment for commercial & industrial rooftop solar',
                href: '/portfolio/solar-rooftop',
                icon: 'sun',
              },
              {
                label: 'Solar Power Plants',
                description: 'Utility-scale ground-mount solar EPC and monitoring',
                href: '/portfolio/solar-power-plants',
                icon: 'zap',
              },
              {
                label: 'Remote Monitoring Systems',
                description: 'Real-time remote monitoring systems for distributed energy assets',
                href: '/portfolio/rms',
                icon: 'activity',
              },
              {
                label: 'Wind Energy Solutions',
                description: 'Performance tracking and fault detection for wind farm operations',
                href: '/portfolio/wind-energy',
                icon: 'wind',
              },
              {
                label: 'Industrial Energy Management',
                description: 'Energy optimisation and power quality for manufacturing facilities',
                href: '/portfolio/industrial-energy',
                icon: 'factory',
              },
              {
                label: 'Smart Grid & Utilities',
                description: 'Grid monitoring, load management, and analytics for utilities',
                href: '/portfolio/smart-grid',
                icon: 'network',
              },
            ],
          },
        ],
      },
    },
    {
      label: 'Innovations',
      dropdown: {
        sections: [
          {
            title: 'Our Products',
            items: [
              {
                label: 'SolarLive™',
                description: 'Flagship real-time solar plant monitoring and analytics platform',
                href: '/innovations/solarlive',
                icon: 'monitor',
                badge: 'Flagship',
              },
              {
                label: 'EVMS',
                description: 'Electric Vehicle Management System — charging infrastructure management',
                href: '/innovations/evms',
                icon: 'plug',
              },
              {
                label: 'Battery Management System',
                description: 'Intelligent BMS for energy storage assets',
                href: '/innovations/bms',
                icon: 'battery-charging',
              },
              {
                label: 'SCADA Platform',
                description: 'Industrial supervisory control and data acquisition',
                href: '/innovations/scada',
                icon: 'cpu',
              },
              {
                label: 'IoT Data Gateway',
                description: 'Edge connectivity hub for field sensors and devices',
                href: '/innovations/iot-gateway',
                icon: 'radio',
              },
            ],
          },
        ],
      },
    },
    {
      label: 'GenexLearn',
      dropdown: {
        sections: [
          {
            title: 'Learn & Explore',
            items: [
              {
                label: 'How We Work',
                description: 'Our end-to-end process from site survey to go-live',
                href: '/genex-learn/how-we-work',
                icon: 'workflow',
              },
              {
                label: 'Technology Deep Dives',
                description: 'Technical explainers on our hardware and software stack',
                href: '/genex-learn/technology',
                icon: 'microscope',
              },
              {
                label: 'Case Studies',
                description: 'Real project outcomes with measurable results',
                href: '/genex-learn/case-studies',
                icon: 'file-bar-chart',
              },
              {
                label: 'Whitepapers & Reports',
                description: 'In-depth industry research and technical papers',
                href: '/genex-learn/whitepapers',
                icon: 'book-open',
              },
              {
                label: 'Video Library',
                description: 'Product demos, installation walkthroughs, webinars',
                href: '/genex-learn/videos',
                icon: 'play-circle',
              },
              {
                label: 'Blog & Insights',
                description: 'Articles, news, and thought leadership',
                href: '/genex-learn/blog',
                icon: 'newspaper',
              },
              {
                label: 'FAQ',
                description: 'Answers to the most common technical and commercial questions',
                href: '/genex-learn/faq',
                icon: 'help-circle',
              },
            ],
          },
        ],
      },
    },
    {
      label: 'About Us',
      dropdown: {
        sections: [
          {
            title: 'The Company',
            items: [
              {
                label: 'Our Story',
                description: 'How Genex was founded and where we have come from',
                href: '/about/story',
                icon: 'landmark',
              },
              {
                label: 'Leadership',
                description: 'Meet the founding team and senior leadership',
                href: '/about/leadership',
                icon: 'users',
              },
              {
                label: 'Vision & Mission',
                description: 'Where we are headed and why it matters',
                href: '/about/vision',
                icon: 'target',
              },
              {
                label: 'Partners & Alliances',
                description: 'Technology partners, channel partners, and integrators',
                href: '/about/partners',
                icon: 'handshake',
              },
              {
                label: 'Certifications & Awards',
                description: 'Industry recognitions and quality standards',
                href: '/about/certifications',
                icon: 'award',
              },
              {
                label: 'CSR Initiatives',
                description: 'Our commitment to sustainable and responsible business',
                href: '/about/csr',
                icon: 'leaf',
              },
              {
                label: 'Media & Press',
                description: 'News coverage, press releases, and announcements',
                href: '/about/media',
                icon: 'megaphone',
              },
            ],
          },
        ],
      },
    },
    {
      label: 'Contact',
      href: '/contact',
    },
    {
      label: 'Careers',
      href: '/careers',
    },
  ],
  cta: {
    label: 'Request Demo',
    href: '/contact#demo',
  },
  contact: {
    phone: '+91 00000 00000',
    whatsapp: 'https://wa.me/910000000000',
  },
}
