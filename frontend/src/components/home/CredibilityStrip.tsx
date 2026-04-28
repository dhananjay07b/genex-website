// Replace CLIENT_NAMES with actual client logo <img> tags once brand assets are provided.
const CLIENT_NAMES = [
  'Tata Power', 'NTPC', 'Torrent Power', 'Adani Green', 'Azure Power',
  'ReNew Power', 'MSEDCL', 'GUVNL', 'SECI', 'Hero Future Energies',
]

// Duplicate for seamless CSS marquee loop
const DOUBLED = [...CLIENT_NAMES, ...CLIENT_NAMES]

export function CredibilityStrip() {
  return (
    <div
      className="border-y border-border bg-white py-5 overflow-hidden"
      aria-label="Trusted by leading organisations"
    >
      <div className="flex items-center gap-10 max-w-7xl mx-auto px-6 lg:px-8 mb-0">
        {/* Static label */}
        <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-text-muted">
          Trusted by
        </span>

        {/* Scrolling track */}
        <div className="overflow-hidden flex-1 relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-[linear-gradient(to_right,white,transparent)] z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-[linear-gradient(to_left,white,transparent)] z-10 pointer-events-none" />

          <div className="animate-marquee flex gap-16 w-max">
            {DOUBLED.map((name, i) => (
              <span
                key={i}
                className="shrink-0 text-sm font-semibold text-text-muted/60 hover:text-text-muted transition-colors whitespace-nowrap select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
