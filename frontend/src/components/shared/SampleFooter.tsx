import { Link } from 'react-router-dom'
import SvgIcon from '@mui/material/SvgIcon'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import YouTubeIcon from '@mui/icons-material/YouTube'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import TwitterIcon from '@mui/icons-material/Twitter'

// Medium — not available in @mui/icons-material
function MediumIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75S24 8.83 24 12z" />
    </SvgIcon>
  )
}

// Threads — not available in @mui/icons-material
function ThreadsIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.298-.883-2.332-.886h-.012c-.813 0-1.895.199-2.547 1.176l-1.832-1.161c.86-1.307 2.347-2.089 4.36-2.145 1.45.017 2.68.404 3.66 1.152 1.084.823 1.752 2.01 1.97 3.505.365.21.726.44 1.078.692 1.526 1.113 2.436 2.618 2.57 4.222.136 1.642-.434 3.318-1.616 4.642C17.978 23.08 15.644 24 12.186 24z" />
    </SvgIcon>
  )
}

const SOCIAL_LINKS = [
  { label: 'LinkedIn',   href: 'https://www.linkedin.com/company/genextechnocrats/', Icon: LinkedInIcon  },
  { label: 'YouTube',    href: 'https://www.youtube.com/@GenexTechnocrats',           Icon: YouTubeIcon   },
  { label: 'Facebook',   href: 'https://www.facebook.com/profile.php?id=61590874175828', Icon: FacebookIcon },
  { label: 'Medium',     href: 'https://medium.com/@genextechnocrats',                Icon: MediumIcon    },
  { label: 'X (Twitter)',href: 'https://x.com/genextechnocrat',                       Icon: TwitterIcon   },
  { label: 'Instagram',  href: 'https://www.instagram.com/genex.technocrats/',        Icon: InstagramIcon },
  { label: 'Threads',    href: 'https://www.threads.com/@genex.technocrats',          Icon: ThreadsIcon   },
] as const

export function SampleFooter() {
  return (
    <footer
      className="relative z-10 border-t border-white/10 bg-dark-bg"
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-4xl px-6 py-8 flex flex-col items-center gap-6 sm:py-10">

        {/* Logo */}
        <Link
          to="/"
          aria-label="Genex Technocrats — go to homepage"
          className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <img
            src="/images/logo/logo-on-dark.svg"
            alt="Genex Technocrats"
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        {/* Social icons */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          aria-label="Social media links"
        >
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="group relative flex h-9 w-9 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-10 sm:w-10"
            >
              <Icon sx={{ fontSize: 18 }} />
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                {label}
              </span>
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-white/25">
          © {new Date().getFullYear()} Genex Technocrats Pvt. Ltd. All rights reserved.
        </p>

      </div>
    </footer>
  )
}
