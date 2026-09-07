import { getMediaUrl } from '@/lib/utils'
import type { WagtailImage } from '@/types/api'

interface Client {
  name: string
  logo: WagtailImage | null
}

const DEFAULT_CLIENTS: Client[] = [
  'Tata Power', 'NTPC', 'Torrent Power', 'Adani Green', 'Azure Power',
  'ReNew Power', 'MSEDCL', 'GUVNL', 'SECI', 'Hero Future Energies',
].map(name => ({ name, logo: null }))

export function CredibilityStrip({ clients }: { clients?: Client[] }) {
  const CLIENTS = clients && clients.length > 0 ? clients : DEFAULT_CLIENTS
  const DOUBLED = [...CLIENTS, ...CLIENTS]
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

          <div className="animate-marquee flex items-center gap-16 w-max">
            {DOUBLED.map((client, i) =>
              client.logo ? (
                <img
                  key={i}
                  src={getMediaUrl(client.logo.url)}
                  alt={client.name}
                  className="shrink-0 h-6 w-auto max-w-24 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200 select-none"
                />
              ) : (
                <span
                  key={i}
                  className="shrink-0 text-sm font-semibold text-text-muted/60 hover:text-text-muted transition-colors whitespace-nowrap select-none"
                >
                  {client.name}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
