import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import { isExternalHref } from '@/lib/utils'

type SmartLinkProps = Omit<ComponentProps<typeof Link>, 'to'> & { to: string }

/**
 * A link for addresses that come from the CMS: an in-site route uses
 * react-router's <Link>; a full address (another site, or the other shell,
 * GeLearn ↔ marketing) uses a plain <a>, which <Link> would otherwise break.
 */
export function SmartLink({ to, ...rest }: SmartLinkProps) {
  return isExternalHref(to) ? <a href={to} {...rest} /> : <Link to={to} {...rest} />
}
