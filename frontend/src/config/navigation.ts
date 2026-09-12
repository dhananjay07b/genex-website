import type { NavConfig } from '@/types/navigation'
import { GELEARN_URL } from '@/lib/host'

export const navConfig: NavConfig = {
  items: [
    {
      label: 'Portfolio',
      dropdown: {
        sections: [
          {
            title: 'Our Delivery Portfolio',
            items: [
              { label: 'SolarLive™',                      href: '/portfolio/solarlive',        badge: 'Flagship' },
              { label: 'EMS - BESS Storage',              href: '/portfolio/energy-storage' },
              { label: 'Wind Network System',             href: '/portfolio/wind-network' },
              { label: 'BMS - Battery Management System', href: '/portfolio/bms' },
              { label: 'RMS - PM Kusum Projects',         href: '/portfolio/rms' },
              { label: 'SCADA Platform',                  href: '/portfolio/scada' },
              { label: 'EV - Software Management',        href: '/portfolio/ev-infrastructure' },
              { label: 'Power Billing Tool (GNM & VNM)',  href: '/portfolio/power-billing' },
              { label: 'Zero Export Tools',               href: '/portfolio/zero-export' },
              { label: 'Carbon Credit Tools',             href: '/portfolio/carbon-credit' },
              { label: 'Data Loggers',                    href: '/portfolio/iot-gateway' },
              { label: 'Power Cloud System',              href: '/portfolio/power-cloud' },
              { label: 'RTC - Power Tools',               href: '/portfolio/rtc-power-tools' },
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
              { label: 'Advanced SCADA',                   href: '/innovations/solar-rooftop' },
              { label: 'Re-NMS',                           href: '/innovations/solar-power-plants' },
              { label: 'AI-based Remote Monitoring Systems', href: '/innovations/rms' },
              { label: 'EMS - BESS',                       href: '/innovations/energy-storage' },
              { label: 'Drone Monitoring',                  href: '/innovations/wind-energy' },
              { label: 'Power Management Tools',            href: '/innovations/industrial-energy' },
              { label: 'AI-Plant Health Checkup',           href: '/innovations/ai-health-checkup' },
              { label: 'Smart Grid & Utilities',            href: '/innovations/smart-grid' },
              { label: 'EV - Software Management',          href: '/innovations/ev-infrastructure' },
              { label: 'Power Trading',                     href: '/innovations/power-trading' },
              { label: 'Power Billing System',              href: '/innovations/power-billing' },
            ],
          },
        ],
      },
    },
    {
      label: 'GeLearn',
      dropdown: {
        sections: [
          {
            title: 'Learn & Explore',
            items: [
              { label: 'Technology Deep Dives',  href: `${GELEARN_URL}/technology` },
              { label: 'Case Studies',           href: `${GELEARN_URL}/case-studies` },
              { label: 'Tenders & Opportunities', href: `${GELEARN_URL}/tenders` },
              { label: 'Whitepapers & Reports',  href: `${GELEARN_URL}/whitepapers` },
              { label: 'Video Library',          href: `${GELEARN_URL}/videos` },
              { label: 'Blog & Insights',        href: `${GELEARN_URL}/blog` },
              { label: 'Podcasts & Interviews',  href: `${GELEARN_URL}/podcasts` },
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
              { label: 'How We Work',          href: '/about/how-we-work' },
              { label: 'Media & Achievements', href: '/about/media' },
              { label: 'Our Teams',            href: '/about/teams' },
              { label: 'CSR Initiatives',      href: '/about/csr' },
              { label: 'FAQ',                  href: '/about/faq' },
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
