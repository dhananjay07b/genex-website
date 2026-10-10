import { createElement } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import { getMuiIcon } from '@/lib/muiIconRegistry'

/**
 * An MUI icon chosen by name in the CMS. Looks the icon up and renders it in one
 * step, so components don't hold a looked-up component in a variable during render.
 */
export function MuiIcon({ name, ...props }: Omit<SvgIconProps, 'name'> & { name: string | null | undefined }) {
  return createElement(getMuiIcon(name), props)
}
