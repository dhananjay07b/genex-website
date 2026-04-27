export interface NavSubItem {
  label: string
  description: string
  href: string
  icon?: string
  badge?: string
}

export interface NavDropdown {
  sections: NavSection[]
}

export interface NavSection {
  title?: string
  items: NavSubItem[]
}

export interface NavItem {
  label: string
  href?: string
  dropdown?: NavDropdown
}

export interface NavConfig {
  items: NavItem[]
  cta: {
    label: string
    href: string
  }
  contact: {
    phone: string
    whatsapp: string
  }
}
