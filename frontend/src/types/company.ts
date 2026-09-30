import type { ContentAccess } from './api'
import type { CompanyDisplay } from './auth'

export interface CompanyContentCard {
  id: number
  title: string
  path: string
  image_url: string | null
  date: string | null
  meta: string
}

export interface CompanyPageData {
  name: string
  slug: string
  logo_url: string | null
  website: string
  description: string
  content: { key: string; label: string; count: number; items: CompanyContentCard[] }[]
  experts: {
    username: string
    display_name: string
    avatar_url: string | null
    role_title: string
    company: CompanyDisplay | null
  }[]
  courses: {
    slug: string
    title: string
    cover_url: string | null
    owner_name: string
    access: ContentAccess
    price: string | null
    currency: string
  }[]
}
