import { useMemo } from 'react'
import QRCode from 'qrcode'
import { getMediaUrl } from '@/lib/utils'
import type { CertificateInfo } from '@/types/learning'
import { LEVEL_LABEL, aboutTime, initials, longDate, plural } from '../course/format'
import { CertificateSeal } from './CertificateSeal'
import { certificateUrl, printedUrl } from './certificateLinks'
import './certificate.css'

/** A real, scannable QR code for the verify address, drawn as SVG squares. */
function VerifyQr({ url }: { url: string }) {
  const { size, cells } = useMemo(() => {
    const { modules } = QRCode.create(url, { errorCorrectionLevel: 'M' })
    const on: [number, number][] = []
    for (let y = 0; y < modules.size; y++) for (let x = 0; x < modules.size; x++) if (modules.get(x, y)) on.push([x, y])
    return { size: modules.size, cells: on }
  }, [url])
  return (
    <svg className="cert-qr" viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" role="img" aria-label="QR code: opens this certificate's verify page">
      <path d={cells.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('')} fill="#0F172B" />
    </svg>
  )
}

function Mark({ logoUrl, name, className }: { logoUrl: string | null; name: string; className: string }) {
  return logoUrl
    ? <span className={className}><img src={getMediaUrl(logoUrl)} alt="" /></span>
    : <span className={`${className} initials`}>{initials(name)}</span>
}

type Valid = Required<Pick<CertificateInfo, 'learner_name' | 'instructors' | 'publisher'>> & CertificateInfo

/** The certificate itself (final design, mockup v42), filled from the certificate's frozen snapshot. */
export function CertificateSheet({ certificate }: { certificate: Valid }) {
  const { course, instructors, publisher } = certificate
  const lead = instructors[0]
  const meta = [
    course.level ? LEVEL_LABEL[course.level] : '',
    course.lessons ? plural(course.lessons, 'lesson') : '',
    course.minutes ? aboutTime(course.minutes) : '',
    `Completed ${longDate(certificate.issued_at)}`,
  ].filter(Boolean)

  return (
    <div className="cert-wrap">
      <div className="cert-sheet">
        <div className="cert-frame" aria-hidden="true" />
        <div className="cert-in">
          <div className="cert-top">
            {publisher ? (
              <div className="cert-pub">
                <Mark logoUrl={publisher.logo_url} name={publisher.name} className="cert-logo" />
                <div><small>Offered by</small><b>{publisher.name}</b></div>
              </div>
            ) : lead ? (
              <div className="cert-pub">
                <Mark logoUrl={null} name={lead.name} className="cert-logo" />
                <div><small>Course by</small><b>{lead.name}</b></div>
              </div>
            ) : <span />}
            <div className="cert-brand">
              <img className="cert-brand-logo" src="/brand/gelearn-logo.svg" alt="GeLearn" />
              <small>by Genex Technocrats</small>
            </div>
          </div>

          <div className="cert-body">
            <div className="cert-kicker">Certificate of completion</div>
            <div className="cert-lead">This certifies that</div>
            <div className="cert-name cert-serif">{certificate.learner_name}</div>
            <div className="cert-lead">has successfully completed every lesson of the course</div>
            <div className="cert-course">{course.title}</div>
            <div className="cert-meta">{meta.map((part, i) => <span key={part}>{i > 0 && <i>·</i>}{part}</span>)}</div>
          </div>

          <div className="cert-foot">
            <div className={`cert-people n${Math.max(instructors.length, 1)}`}>
              {instructors.length > 0 ? instructors.map(person => (
                <div key={person.username} className="cert-person">
                  <span className="nm cert-serif">{person.name}</span>
                  {person.role_title && <span className="role">{person.role_title}</span>}
                  {person.company && (
                    <span className="co"><Mark logoUrl={person.company.logo_url} name={person.company.name} className="mk" />{person.company.name}</span>
                  )}
                  <span className="lbl">Instructor</span>
                </div>
              )) : publisher && (
                // A company course with no instructors listed: the publisher takes the slot.
                <div className="cert-person">
                  <span className="nm cert-serif">{publisher.name}</span>
                  <span className="role">Course publisher</span>
                  <span className="co"><Mark logoUrl={publisher.logo_url} name={publisher.name} className="mk" />Verified company</span>
                  <span className="lbl">Offered by</span>
                </div>
              )}
            </div>
            <CertificateSeal className="cert-seal" />
            <div className="cert-verify">
              <VerifyQr url={certificateUrl(certificate.code)} />
              <span className="id">ID {certificate.code}</span>
              <span className="url">Verify at {printedUrl(certificate.code)}</span>
            </div>
          </div>

          <div className="cert-legal">
            <span><b>GeLearn</b> is the learning platform of <b>Genex Technocrats Pvt. Ltd.</b></span>
            <span>GeLearn confirms the learner completed every lesson. This is not an accredited or academic qualification.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
