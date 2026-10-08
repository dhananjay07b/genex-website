import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import VerifiedIcon from '@mui/icons-material/Verified'
import BlockIcon from '@mui/icons-material/Block'
import LinkIcon from '@mui/icons-material/Link'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import CheckIcon from '@mui/icons-material/Check'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button, buttonVariants } from '@/components/ui/Button'
import { apiFetch, ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type { CertificateInfo } from '@/types/learning'
import { longDate } from '../course/format'
import { CertificateSheet } from './CertificateSheet'
import { certificateUrl, linkedInShareUrl } from './certificateLinks'

type Valid = Parameters<typeof CertificateSheet>[0]['certificate']

/** Share on LinkedIn (opens LinkedIn's share window with the certificate link) and Copy link. */
function ShareBox({ certificate }: { certificate: Valid }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(certificateUrl(certificate.code))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Box title="Share your achievement">
      <a href={linkedInShareUrl(certificate.code)} target="_blank" rel="noopener noreferrer"
        className={cn(buttonVariants({ size: 'md' }), 'w-full justify-center')}>
        <LinkedInIcon sx={{ fontSize: 20 }} /> Share on LinkedIn
      </a>
      <Button variant="secondary" size="md" className="w-full justify-center" onClick={copyLink}>
        {copied ? <><CheckIcon sx={{ fontSize: 18 }} /> Link copied</> : <><LinkIcon sx={{ fontSize: 18 }} /> Copy certificate link</>}
      </Button>
      <p className="text-xs text-text-muted">The link opens this certificate with a &ldquo;Verified by GeLearn&rdquo; banner. Paste it in a CV, an email or a job application so anyone can check it is real.</p>
    </Box>
  )
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-white p-4.5 flex flex-col gap-3">
      <h2 className="text-base font-extrabold text-text-primary">{title}</h2>
      {children}
    </section>
  )
}

function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-text-muted">
      {items.map((item, i) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRightIcon sx={{ fontSize: 16 }} aria-hidden="true" />}
          {item.to ? <Link to={item.to} className="font-semibold text-sky-700 hover:underline">{item.label}</Link> : <span aria-current="page">{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}

/** The learner's one name correction, inline in the details box. */
function NameCorrection({ certificate, onSaved }: { certificate: Valid; onSaved: (next: CertificateInfo) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(certificate.learner_name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setSaving(true)
    setError('')
    try {
      onSaved(await apiFetch<CertificateInfo>(`/api/learning/certificates/${certificate.code}/`, { method: 'PATCH', body: { learner_name: name } }))
      setOpen(false)
    } catch (err) {
      setError(err instanceof ApiError ? Object.values(err.fields)[0] ?? err.message : "Couldn't save the name. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <p className="text-xs text-text-muted">
        Name not right? <button type="button" onClick={() => setOpen(true)} className="font-bold text-sky-700 hover:underline">Correct it once</button> before you share it.
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-sky-200 bg-brand-tint p-3">
      <label htmlFor="cert-name" className="text-xs font-bold text-text-primary">Name on the certificate</label>
      <input id="cert-name" value={name} onChange={e => setName(e.target.value)} maxLength={80}
        className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      <p className="text-xs text-amber-800">You can change it only once. After that, ask Genex.</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving || name.trim().length < 2}>{saving ? 'Saving…' : 'Save name'}</Button>
        <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setName(certificate.learner_name); setError('') }}>Cancel</Button>
      </div>
      {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  )
}

/** /certificates/:code: the learner's own certificate (share it) or anyone's (verify it). */
export default function CertificatePage() {
  const { code = '' } = useParams<{ code: string }>()
  const [certificate, setCertificate] = useState<CertificateInfo | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    apiFetch<CertificateInfo>(`/api/learning/certificates/${encodeURIComponent(code)}/`)
      .then(c => { if (!cancelled) setCertificate(c) })
      .catch(() => { if (!cancelled) setCertificate(null) })
    return () => { cancelled = true }
  }, [code])

  const shell = (children: ReactNode) => <div className="mx-auto max-w-330 px-4 pt-20 pb-12 md:px-6">{children}</div>

  if (certificate === undefined) return shell(<div className="h-96 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />)
  if (certificate === null) {
    return shell(
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-white p-8 text-center">
        <PageMeta title="Certificate not found — GeLearn" description="No GeLearn certificate has this ID." canonical={`/certificates/${code}`} />
        <h1 className="text-xl font-extrabold text-text-primary">Certificate not found</h1>
        <p className="mt-2 text-sm text-text-muted">No GeLearn certificate has the ID <b className="text-text-primary">{code.toUpperCase()}</b>. Check the link or the ID printed on the certificate.</p>
      </div>,
    )
  }

  if (certificate.status === 'revoked') {
    return shell(
      <div className="mx-auto max-w-2xl">
        <PageMeta title="Revoked certificate — GeLearn" description="This GeLearn certificate has been revoked." canonical={`/certificates/${certificate.code}`} />
        <div role="status" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
          <BlockIcon sx={{ fontSize: 26 }} className="shrink-0 text-red-700" />
          <div>
            <h1 className="text-lg font-extrabold">This certificate has been revoked</h1>
            <p className="mt-1 text-sm">Certificate {certificate.code} for &ldquo;{certificate.course.title}&rdquo; is no longer valid.</p>
            {certificate.is_mine && certificate.revoked_reason && <p className="mt-2 text-sm"><b>Reason:</b> {certificate.revoked_reason} Contact Genex if you think this is a mistake.</p>}
          </div>
        </div>
      </div>,
    )
  }

  const valid = certificate as Valid
  const mine = valid.is_mine
  const details = (
    <Box title="Certificate details">
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
        <dt className="text-text-muted">Learner</dt><dd className="text-right font-bold text-text-primary">{valid.learner_name}</dd>
        <dt className="text-text-muted">Course</dt>
        <dd className="text-right font-bold">
          {valid.course.path ? <Link to={valid.course.path} className="text-sky-700 hover:underline">{valid.course.title}</Link> : valid.course.title}
        </dd>
        {valid.publisher && <><dt className="text-text-muted">Offered by</dt><dd className="text-right font-bold text-text-primary">{valid.publisher.name}</dd></>}
        <dt className="text-text-muted">Completed</dt><dd className="text-right font-bold text-text-primary">{longDate(valid.issued_at)}</dd>
        <dt className="text-text-muted">Certificate ID</dt><dd className="text-right font-bold text-text-primary tabular-nums">{valid.code}</dd>
      </dl>
      {mine && valid.can_correct_name && <NameCorrection certificate={valid} onSaved={setCertificate} />}
    </Box>
  )

  return shell(
    <>
      <PageMeta
        title={`${valid.learner_name}: ${valid.course.title} certificate — GeLearn`}
        description={`GeLearn certificate of completion for ${valid.course.title}, issued ${longDate(valid.issued_at)}.`}
        canonical={`/certificates/${valid.code}`}
      />
      {mine
        ? <Crumbs items={[{ label: 'My Learning', to: '/account?tab=learning' }, { label: 'Certificates', to: '/account?tab=learning' }, { label: valid.course.title }]} />
        : <Crumbs items={[{ label: 'GeLearn', to: '/' }, { label: `Certificate ${valid.code}` }]} />}

      {mine ? (
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold text-text-primary">Your certificate</h1>
          <p className="mt-1 text-sm text-text-muted">You completed every lesson on {longDate(valid.issued_at)}. Share it on LinkedIn, or copy the link for your CV.</p>
        </div>
      ) : (
        <div role="status" className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <VerifiedIcon sx={{ fontSize: 28 }} className="shrink-0 text-emerald-700" />
          <div>
            <h1 className="text-base font-extrabold text-text-primary">Verified certificate</h1>
            <p className="text-sm text-slate-700">
              GeLearn confirms that <b>{valid.learner_name}</b> completed every lesson of <b>{valid.course.title}</b> on {longDate(valid.issued_at)}. Certificate ID {valid.code}.
            </p>
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2"><CertificateSheet certificate={valid} /></div>
        <aside className="flex flex-col gap-4">
          {mine && <ShareBox certificate={valid} />}
          {details}
          {!mine && valid.course.path && (
            <Box title="Learn this too">
              <p className="text-sm text-text-muted">{valid.course.title}{valid.publisher ? `, from ${valid.publisher.name}` : ''}, on GeLearn.</p>
              <Link to={valid.course.path} className={cn(buttonVariants({ variant: 'secondary', size: 'md' }), 'justify-center')}>View the course</Link>
            </Box>
          )}
        </aside>
      </div>
    </>,
  )
}
