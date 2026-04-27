import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, ExternalLink, MessageCircle } from 'lucide-react'

const footerSections = [
  {
    title: 'Portfolio',
    links: [
      { label: 'Solar Rooftop', href: '/portfolio/solar-rooftop' },
      { label: 'Solar Power Plants', href: '/portfolio/solar-power-plants' },
      { label: 'Remote Monitoring Systems', href: '/portfolio/rms' },
      { label: 'Wind Energy Solutions', href: '/portfolio/wind-energy' },
      { label: 'Industrial Energy Management', href: '/portfolio/industrial-energy' },
      { label: 'Smart Grid & Utilities', href: '/portfolio/smart-grid' },
    ],
  },
  {
    title: 'Innovations',
    links: [
      { label: 'SolarLive™', href: '/innovations/solarlive' },
      { label: 'EVMS', href: '/innovations/evms' },
      { label: 'Battery Management System', href: '/innovations/bms' },
      { label: 'SCADA Platform', href: '/innovations/scada' },
      { label: 'IoT Data Gateway', href: '/innovations/iot-gateway' },
    ],
  },
  {
    title: 'GenexLearn',
    links: [
      { label: 'How We Work', href: '/genex-learn/how-we-work' },
      { label: 'Case Studies', href: '/genex-learn/case-studies' },
      { label: 'Whitepapers & Reports', href: '/genex-learn/whitepapers' },
      { label: 'Video Library', href: '/genex-learn/videos' },
      { label: 'Blog & Insights', href: '/genex-learn/blog' },
      { label: 'FAQ', href: '/genex-learn/faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Story', href: '/about/story' },
      { label: 'Leadership', href: '/about/leadership' },
      { label: 'Partners & Alliances', href: '/about/partners' },
      { label: 'Certifications & Awards', href: '/about/certifications' },
      { label: 'Media & Press', href: '/about/media' },
      { label: 'Careers', href: '/careers' },
    ],
  },
]

const socialLinks = [
  { icon: ExternalLink, label: 'LinkedIn', href: 'https://linkedin.com' },
  { icon: ExternalLink, label: 'Twitter / X', href: 'https://twitter.com' },
  { icon: ExternalLink, label: 'YouTube', href: 'https://youtube.com' },
]

export function Footer() {
  return (
    <footer className="bg-dark-bg text-white" aria-label="Site footer">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              <span className="text-xl font-extrabold tracking-tight text-white">
                Genex
                <span className="bg-linear-to-r from-[#1AAEE8] to-[#00D97E] bg-clip-text text-transparent">.</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-60">
              Full-stack power and automation intelligence — from hardware in the field to insights on the dashboard.
            </p>

            {/* Contact */}
            <ul className="mt-6 space-y-2.5">
              <li>
                <a
                  href="tel:+910000000000"
                  className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Phone size={14} className="shrink-0 text-primary" />
                  +91 00000 00000
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/910000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-white/60 hover:text-[#25D366] transition-colors"
                >
                  <MessageCircle size={14} className="shrink-0 text-[#25D366]" />
                  WhatsApp Us
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@genextechnocrats.com"
                  className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Mail size={14} className="shrink-0 text-primary" />
                  info@genextechnocrats.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin size={14} className="shrink-0 text-primary mt-0.5" />
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
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:underline"
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
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 order-2 sm:order-1">
            © {new Date().getFullYear()} Genex Technocrats Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-5 order-1 sm:order-2">
            <Link to="/privacy-policy" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
