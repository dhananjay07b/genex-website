import { gelearnPath } from '@/lib/host'

/** The certificate's public address (what the QR code, Copy link and LinkedIn share use). */
export const certificateUrl = (code: string) => gelearnPath(`/certificates/${code}`)

/** The address as printed: no scheme, no dev-only query string. */
export function printedUrl(code: string): string {
  const url = new URL(certificateUrl(code))
  return `${url.host}${url.pathname}`
}

/** LinkedIn's share dialog for the certificate link (its preview comes from the server's page tags). */
export const linkedInShareUrl = (code: string) =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl(code))}`
