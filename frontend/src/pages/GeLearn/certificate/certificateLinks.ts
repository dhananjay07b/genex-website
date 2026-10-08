import { API_BASE } from '@/lib/api/client'
import { gelearnPath } from '@/lib/host'

/** The certificate's public address (what the QR code, Copy link and LinkedIn share use). */
export const certificateUrl = (code: string) => gelearnPath(`/certificates/${code}`)

/** The address as printed: no scheme, no dev-only query string. */
export function printedUrl(code: string): string {
  const url = new URL(certificateUrl(code))
  return `${url.host}${url.pathname}`
}

/**
 * LinkedIn's share dialog. It shares the server's share page for the certificate, which
 * carries the preview tags (title and certificate picture) and sends people on to the page.
 */
export const linkedInShareUrl = (code: string) =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${API_BASE}/api/learning/certificates/${code}/share/`)}`
