import type { CompanyDisplay } from './auth'

export type StudioTypeKey = 'geacademy' | 'research' | 'policies-tenders' | 'whitepapers' | 'podcasts'

export interface StudioSection {
  heading: string
  body: string
}

/** A person as the Studio shows them — team members and podcast collaborators. */
export interface StudioPerson {
  username: string
  display_name: string
  avatar_url: string | null
  company: CompanyDisplay | null
  role_title?: string
  account_type?: string
  verified?: boolean
}

export type StudioValue = string | string[] | number[] | StudioSection[] | StudioPerson[] | null

/** Any Studio item — the per-type fields are described by the StudioTypeConfig. */
export interface StudioItem {
  id: number
  title: string
  image_url?: string | null
  document_url?: string | null
  owner: { username: string; display_name: string } | null
  [field: string]: unknown
}

export interface StudioCompany {
  id: number
  name: string
  slug: string
  logo_url: string | null
  website: string
  description: string
  counts: Record<'geacademy' | 'research' | 'policies_tenders' | 'whitepapers' | 'podcasts', number>
}

export interface StudioTeam {
  staff: StudioPerson[]
  professionals: StudioPerson[]
}
