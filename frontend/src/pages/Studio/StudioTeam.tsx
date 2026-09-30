import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import VerifiedIcon from '@mui/icons-material/Verified'
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl } from '@/lib/utils'
import type { StudioPerson, StudioTeam as Team } from '@/types/studio'

function PersonRow({ person, showStatus }: { person: StudioPerson; showStatus: boolean }) {
  const name = person.display_name || person.username
  return (
    <li className="flex items-center gap-3 px-5 py-3.5">
      <span className="size-10 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center overflow-hidden shrink-0">
        {person.avatar_url ? <img src={getMediaUrl(person.avatar_url)} alt="" className="w-full h-full object-cover" /> : name.slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        {person.account_type === 'professional' ? (
          <Link to={`/u/${person.username}`} className="block text-sm font-bold text-text-primary truncate hover:text-primary">{name}</Link>
        ) : (
          <p className="text-sm font-bold text-text-primary truncate">{name}</p>
        )}
        <p className="text-xs text-text-muted truncate">{person.role_title || `@${person.username}`}</p>
      </div>
      {showStatus && (person.verified ? (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary shrink-0">
          <VerifiedIcon sx={{ fontSize: 15 }} /> Verified
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted shrink-0" title="Hasn't confirmed their company email yet">
          <HourglassEmptyOutlinedIcon sx={{ fontSize: 15 }} /> Pending
        </span>
      ))}
    </li>
  )
}

export default function StudioTeam() {
  const [team, setTeam] = useState<Team | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    apiFetch<Team>('/api/studio/team/').then(setTeam).catch(() => setFailed(true))
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <PageMeta title="Team — Company Studio" description="People publishing on GeLearn for your company." canonical="/studio/team" />

      <section>
        <h2 className="text-xl font-extrabold text-text-primary">Staff logins</h2>
        <p className="text-sm text-text-muted mt-1 mb-4">
          Accounts that can publish from this Studio. They&apos;re created and managed by Genex. Contact us to add or remove one.
        </p>
        {failed && <p className="text-sm text-red-600">Couldn&apos;t load your team. Refresh to try again.</p>}
        {team && (
          <ul className="border border-border rounded-2xl divide-y divide-border">
            {team.staff.map(p => <PersonRow key={p.username} person={p} showStatus={false} />)}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-text-primary">Professionals</h2>
        <p className="text-sm text-text-muted mt-1 mb-4">
          Experts who joined GeLearn under your company. Their content shows your logo once they confirm an email on your company&apos;s domain.
        </p>
        {team && (team.professionals.length === 0 ? (
          <p className="text-sm text-text-muted border border-dashed border-border rounded-2xl px-5 py-6 text-center">
            No professionals have joined under your company yet.
          </p>
        ) : (
          <ul className="border border-border rounded-2xl divide-y divide-border">
            {team.professionals.map(p => <PersonRow key={p.username} person={p} showStatus />)}
          </ul>
        ))}
      </section>
    </div>
  )
}
