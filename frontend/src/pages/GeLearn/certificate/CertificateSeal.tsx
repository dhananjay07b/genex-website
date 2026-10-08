import { useId } from 'react'

/** The GeLearn completion seal. Ids are per instance: a page can show the sheet more than once. */
export function CertificateSeal({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  const grad = `seal-grad-${id}`
  const top = `seal-top-${id}`
  const bottom = `seal-bottom-${id}`
  return (
    <svg className={className} viewBox="0 0 200 200" role="img" aria-label="GeLearn verified completion seal, by Genex Technocrats">
      <defs>
        <linearGradient id={grad} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#1AAEE8" /><stop offset=".5" stopColor="#00C5B0" /><stop offset="1" stopColor="#00D97E" />
        </linearGradient>
        <path id={top} d="M 32 100 A 68 68 0 0 1 168 100" />
        <path id={bottom} d="M 20 100 A 80 80 0 0 0 180 100" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="#fff" />
      <circle cx="100" cy="100" r="94" fill="none" stroke={`url(#${grad})`} strokeWidth="5" />
      <circle cx="100" cy="100" r="86" fill="none" stroke="#0A1628" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="56" fill="none" stroke="#0A1628" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="51" fill="none" stroke={`url(#${grad})`} strokeWidth="1.5" strokeDasharray="2 3" />
      <text fontFamily="Raleway, sans-serif" fontSize="12.5" fontWeight="800" letterSpacing="2.6" fill="#0A1628">
        <textPath href={`#${top}`} startOffset="50%" textAnchor="middle">VERIFIED COMPLETION</textPath>
      </text>
      <text fontFamily="Raleway, sans-serif" fontSize="10.5" fontWeight="700" letterSpacing="2.2" fill="#0A1628">
        <textPath href={`#${bottom}`} startOffset="50%" textAnchor="middle">BY GENEX TECHNOCRATS</textPath>
      </text>
      <text x="22" y="104" fontSize="10" fill={`url(#${grad})`}>★</text>
      <text x="169" y="104" fontSize="10" fill={`url(#${grad})`}>★</text>
      <text x="100" y="98" textAnchor="middle" fontFamily="Raleway, sans-serif" fontSize="21" fontWeight="800" fill="#0A1628">
        <tspan fill={`url(#${grad})`}>Ge</tspan>Learn
      </text>
      <line x1="74" y1="106" x2="126" y2="106" stroke="#0A1628" strokeWidth="1" />
      <text x="100" y="121" textAnchor="middle" fontFamily="Raleway, sans-serif" fontSize="8.5" fontWeight="700" letterSpacing="2" fill="#5B6676">EST. 2026</text>
    </svg>
  )
}
