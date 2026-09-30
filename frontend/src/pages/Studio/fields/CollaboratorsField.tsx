import { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import { CompanyBadge } from '@/components/gelearn/CompanyBadge'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl } from '@/lib/utils'
import type { StudioPerson } from '@/types/studio'

interface CollaboratorsFieldProps {
  label: string
  value: StudioPerson[]
  onChange: (people: StudioPerson[]) => void
  maxItems?: number
  help?: string
  error?: string
}

function Avatar({ person }: { person: StudioPerson }) {
  return (
    <span className="size-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center overflow-hidden shrink-0">
      {person.avatar_url
        ? <img src={getMediaUrl(person.avatar_url)} alt="" className="w-full h-full object-cover" />
        : (person.display_name || person.username).slice(0, 2).toUpperCase()}
    </span>
  )
}

/** Search GeLearn Professionals by name and add them to the episode. */
export function CollaboratorsField({ label, value, onChange, maxItems = 12, help, error }: CollaboratorsFieldProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StudioPerson[]>([])
  const [searching, setSearching] = useState(false)
  const trimmed = query.trim()

  useEffect(() => {
    if (trimmed.length < 2) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      setSearching(true)
      apiFetch<StudioPerson[]>(`/api/studio/professionals/?q=${encodeURIComponent(trimmed)}`)
        .then(rows => { if (!cancelled) setResults(rows) })
        .catch(() => { if (!cancelled) setResults([]) })
        .finally(() => { if (!cancelled) setSearching(false) })
    }, 250)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [trimmed])

  const chosen = new Set(value.map(p => p.username))
  const suggestions = trimmed.length < 2 ? [] : results.filter(p => !chosen.has(p.username))
  const full = value.length >= maxItems

  return (
    <div>
      <label className="flex items-center justify-between text-sm font-semibold text-text-primary mb-1.5">
        {label}
        <span className="text-xs font-normal text-text-muted">{value.length}/{maxItems}</span>
      </label>

      {value.length > 0 && (
        <ul className="flex flex-col gap-2 mb-3">
          {value.map(person => (
            <li key={person.username} className="flex items-center gap-3 border border-border rounded-xl px-3 py-2">
              <Avatar person={person} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-text-primary truncate">{person.display_name || person.username}</span>
                {person.company && <span className="flex text-xs text-text-muted"><CompanyBadge company={person.company} /></span>}
              </span>
              <button type="button" onClick={() => onChange(value.filter(p => p.username !== person.username))}
                aria-label={`Remove ${person.display_name || person.username}`}
                className="size-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-red-50 hover:text-red-600">
                <CloseIcon sx={{ fontSize: 16 }} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <SearchIcon sx={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          value={query}
          disabled={full}
          onChange={e => setQuery(e.target.value)}
          placeholder={full ? `Limit of ${maxItems} reached` : 'Search professionals by name…'}
          aria-label={`Search ${label.toLowerCase()}`}
          className="h-11 w-full rounded-md border border-border bg-white pl-9 pr-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
        {trimmed.length >= 2 && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden">
            {searching && suggestions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-text-muted">Searching…</p>
            ) : suggestions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-text-muted">No professionals match &ldquo;{trimmed}&rdquo;.</p>
            ) : (
              <ul>
                {suggestions.map(person => (
                  <li key={person.username}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange([...value, person])
                        setQuery('')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface"
                    >
                      <Avatar person={person} />
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-text-primary truncate">{person.display_name || person.username}</span>
                        <span className="flex items-center gap-1.5 text-xs text-text-muted">
                          {person.role_title && <span className="truncate">{person.role_title}</span>}
                          {person.company && <CompanyBadge company={person.company} />}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {help && <p className="text-xs text-text-muted mt-1.5">{help}</p>}
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  )
}
