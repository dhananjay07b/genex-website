import { Link } from 'react-router-dom'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ChatIcon from '@mui/icons-material/Chat'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import TwitterIcon from '@mui/icons-material/Twitter'
import YouTubeIcon from '@mui/icons-material/YouTube'

const footerSections = [
  {
    title: 'Portfolio',
    links: [
      { label: 'SolarLive™',                      href: '/portfolio/solarlive' },
      { label: 'EMS - BESS Storage',              href: '/portfolio/energy-storage' },
      { label: 'Wind Network System',             href: '/portfolio/wind-network' },
      { label: 'SCADA Platform',                  href: '/portfolio/scada' },
      { label: 'RMS - PM Kusum Projects',         href: '/portfolio/rms' },
      { label: 'EV - Software Management',        href: '/portfolio/ev-infrastructure' },
    ],
  },
  {
    title: 'Innovations',
    links: [
      { label: 'Advanced SCADA',                    href: '/innovations/solar-rooftop' },
      { label: 'Re-NMS',                            href: '/innovations/solar-power-plants' },
      { label: 'AI-based Remote Monitoring',        href: '/innovations/rms' },
      { label: 'EMS - BESS',                        href: '/innovations/energy-storage' },
      { label: 'AI-Plant Health Checkup',           href: '/innovations/ai-health-checkup' },
    ],
  },
  {
    title: 'GeLearn',
    links: [
      { label: 'How We Work',          href: '/gelearn/how-we-work' },
      { label: 'Case Studies',         href: '/gelearn/case-studies' },
      { label: 'Whitepapers & Reports', href: '/gelearn/whitepapers' },
      { label: 'Video Library',        href: '/gelearn/videos' },
      { label: 'Blog & Insights',      href: '/gelearn/blog' },
      { label: 'FAQ',                  href: '/gelearn/faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Story',               href: '/about/story' },
      { label: 'Leadership',              href: '/about/leadership' },
      { label: 'Partners & Alliances',    href: '/about/partners' },
      { label: 'Certifications & Awards', href: '/about/certifications' },
      { label: 'Media & Press',           href: '/about/media' },
      { label: 'Careers',                 href: '/careers' },
    ],
  },
]

const socialLinks = [
  { icon: WhatsAppIcon, label: 'WhatsApp',    href: 'https://wa.me/910000000000' },
  { icon: TwitterIcon,  label: 'Twitter / X', href: 'https://twitter.com' },
  { icon: YouTubeIcon,  label: 'YouTube',     href: 'https://youtube.com' },
]

export function Footer() {
  return (
    <footer className="bg-white border-t border-border" aria-label="Site footer">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              <img
                src="/images/logo/logo-on-light.svg"
                alt="Genex Technocrats"
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-60">
              Full-stack power and automation intelligence — from hardware in the field to insights on the dashboard.
            </p>

            {/* Contact */}
            <ul className="mt-6 space-y-2.5">
              <li>
                <a
                  href="tel:+910000000000"
                  className="flex items-center gap-2.5 text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  <PhoneIcon sx={{ fontSize: 14 }} className="shrink-0 text-primary" />
                  +91 00000 00000
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/910000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-text-muted hover:text-[#25D366] transition-colors"
                >
                  <ChatIcon sx={{ fontSize: 14 }} className="shrink-0 text-[#25D366]" />
                  WhatsApp Us
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@genextechnocrats.com"
                  className="flex items-center gap-2.5 text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  <EmailIcon sx={{ fontSize: 14 }} className="shrink-0 text-primary" />
                  info@genextechnocrats.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-text-muted">
                <LocationOnIcon sx={{ fontSize: 14 }} className="shrink-0 text-primary mt-0.5" />
                <span>India</span>
              </li>
            </ul>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-surface text-text-muted hover:bg-surface-alt hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Icon sx={{ fontSize: 16 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted order-2 sm:order-1">
            © {new Date().getFullYear()} Genex Technocrats Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-5 order-1 sm:order-2">
            <Link to="/privacy-policy" className="text-xs text-text-muted hover:text-text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-text-muted hover:text-text-primary transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
