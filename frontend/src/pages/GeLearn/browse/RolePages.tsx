import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import CheckIcon from '@mui/icons-material/Check'
import { PageMeta } from '@/components/seo/PageMeta'
import { BrowseHero } from '@/components/gelearn/discovery/BrowseHero'
import { BUTTON } from '@/components/gelearn/discovery/meta'
import { ListRow } from '@/components/gelearn/discovery/ListBox'
import { ProfessionalCard, RoleCard } from '@/components/gelearn/discovery/DirectoryCards'
import { SectionHeading } from '@/components/gelearn/discovery/SectionHeading'
import { useAuth } from '@/context/useAuth'
import { useApi } from '@/hooks/useApi'
import { apiFetch } from '@/lib/api/client'
import type { RoleCardData, RoleDetail } from '@/types/discovery'
import NotFound from '@/pages/NotFound'
import { Section } from '../home/sections'
import { returnState } from '@/lib/authRedirect'

const LEVEL_TEXT: Record<string, { title: string; note: string }> = {
  beginner: { title: 'Beginner', note: 'Foundations, no experience needed.' },
  intermediate: { title: 'Intermediate', note: 'For engineers already working on site.' },
  advanced: { title: 'Advanced', note: 'Specialist depth for experienced engineers.' },
  '': { title: 'Any level', note: 'Courses without a set level.' },
}
const CHIP = 'inline-flex items-center rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-text-primary'

/** /roles: every career role. */
export function RolesIndexPage() {
  const { data } = useApi<RoleCardData[]>('/api/discovery/roles/')
  return (
    <div className="bg-white pt-16 pb-8">
      <PageMeta title="Career roles: GeLearn" description="Courses for the jobs that run solar, storage, SCADA and grid assets." canonical="/roles" />
      <BrowseHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Career roles' }]}
        kicker="Explore careers in power & energy"
        title="Learn for a role"
        lead="What each role does, the skills it needs, and the courses that prepare you for it."
      />
      <Section label="Career roles">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map(role => <RoleCard key={role.slug} role={role} />)}
        </div>
      </Section>
    </div>
  )
}

/** "Set as my career goal": saves the goal on the account; signed-out visitors are sent to log in first. */
function GoalButton({ role }: { role: RoleDetail }) {
  const { user, refetch } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [saving, setSaving] = useState(false)
  const isGoal = user?.career_goal === role.id

  async function setGoal() {
    if (!user) {
      navigate('/login', { state: returnState(location) })
      return
    }
    setSaving(true)
    try {
      await apiFetch('/api/accounts/me/', { method: 'PATCH', body: { career_goal: role.id } })
      await refetch()
    } finally {
      setSaving(false)
    }
  }

  if (isGoal) {
    return <span className={BUTTON.outline}><CheckIcon sx={{ fontSize: 18 }} /> Your career goal</span>
  }
  return (
    <button type="button" onClick={setGoal} disabled={saving} className={`${BUTTON.primary} disabled:opacity-60`}>
      <FlagOutlinedIcon sx={{ fontSize: 18 }} /> {saving ? 'Saving…' : 'Set as my career goal'}
    </button>
  )
}

/** /roles/:slug: one career role, with courses ordered Beginner → Advanced. */
export function RolePage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: role, failed } = useApi<RoleDetail>(`/api/discovery/roles/${slug}/`)
  if (failed) return <NotFound />
  if (!role) return <div className="mx-auto h-96 max-w-330 animate-pulse px-4 pt-24 md:px-6" aria-hidden="true"><div className="h-full rounded-2xl bg-slate-100" /></div>

  const levels = role.courses_by_level.filter(group => group.courses.length > 0)
  // Only meaningful once the role has levelled courses.
  const starting = role.starting_level ? LEVEL_TEXT[role.starting_level]?.title : undefined

  return (
    <div className="bg-white pt-16 pb-8">
      <PageMeta title={`${role.name}: GeLearn`} description={role.summary || `Courses to become a ${role.name}.`} canonical={`/roles/${role.slug}`} />
      <BrowseHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Career roles', to: '/roles' }, { label: role.name }]}
        kicker="Career role"
        title={role.name}
        lead={role.summary}
        actions={<>
          <GoalButton role={role} />
          {levels.length > 0 && <a href="#path" className={BUTTON.outline}>See the learning path</a>}
        </>}
        factsHeading="At a glance"
        facts={[
          { label: 'Courses on GeLearn', value: role.course_count ?? 0 },
          { label: 'Professionals in this field', value: role.professional_count },
          ...(starting ? [{ label: 'Typical starting point', value: starting }] : []),
        ]}
      />

      {(role.duties.length > 0 || role.skills.length > 0) && (
        <Section label="About the role">
          <div className="grid gap-4 md:grid-cols-2">
            {role.duties.length > 0 && (
              <div className="rounded-xl border border-border p-5">
                <h2 className="mb-2.5 text-base font-extrabold text-text-primary">What a {role.name} does</h2>
                <ul className="grid list-disc gap-1.5 pl-5 text-sm text-slate-700">
                  {role.duties.map(duty => <li key={duty}>{duty}</li>)}
                </ul>
              </div>
            )}
            {role.skills.length > 0 && (
              <div className="rounded-xl border border-border p-5">
                <h2 className="mb-2.5 text-base font-extrabold text-text-primary">Skills you'll build</h2>
                <div className="flex flex-wrap gap-2">
                  {role.skills.map(t => <Link key={t.id} to={`/topics/${t.slug}`} className={CHIP}>{t.name}</Link>)}
                </div>
                <p className="mt-2.5 text-xs text-text-muted">The topics this role draws on. Open one to see everything on it.</p>
              </div>
            )}
          </div>
        </Section>
      )}

      <Section label="Learning path">
        <div id="path" className="scroll-mt-28" />
        <SectionHeading title={`Courses to become a ${role.name}`} subtitle="Ordered from beginner to advanced. Take them in any order; each stands on its own." />
        {levels.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {levels.map((group, i) => (
              <div key={group.level || 'any'} className="grid content-start gap-2.5 rounded-xl border border-border bg-slate-50 p-3.5">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-text-primary">
                  <span className="flex size-6 items-center justify-center rounded-full border border-sky-100 bg-white text-xs text-sky-700">{i + 1}</span>
                  {LEVEL_TEXT[group.level].title}
                </h3>
                <p className="text-xs text-text-muted">{LEVEL_TEXT[group.level].note}</p>
                {group.courses.map(card => <ListRow key={card.id} card={card} />)}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-text-muted">
            No courses are linked to this role yet. <Link to="/courses" className="font-bold text-sky-700">Browse all courses</Link>
          </p>
        )}
      </Section>

      {role.professionals.length > 0 && (
        <Section label="Professionals">
          <SectionHeading title={`Learn from people in ${role.name} work`} subtitle="Professionals whose expertise matches this role's skills." seeAllLabel="All Professionals" seeAllUrl="/professionals" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {role.professionals.map(p => <ProfessionalCard key={p.username ?? p.display_name} person={p} />)}
          </div>
        </Section>
      )}

      {role.other_roles.length > 0 && (
        <Section label="Other roles">
          <SectionHeading title="Other career roles" seeAllLabel="All roles" seeAllUrl="/roles" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {role.other_roles.map(r => <RoleCard key={r.slug} role={r} />)}
          </div>
        </Section>
      )}
    </div>
  )
}
