import type { ComponentType } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import { formatDisplayDate } from '@/lib/utils'
import type { StudioCompany, StudioItem, StudioTypeKey } from '@/types/studio'

export type StudioFieldKind =
  | 'title' | 'text' | 'textarea' | 'date' | 'url' | 'select'
  | 'richtext' | 'sections' | 'list' | 'access' | 'collaborators' | 'topics'

export interface StudioField {
  name: string
  label: string
  kind: StudioFieldKind
  column: 'main' | 'side'
  required?: boolean
  placeholder?: string
  help?: string
  options?: { value: string; label: string }[]
  maxItems?: number
}

export interface StudioTypeConfig {
  key: StudioTypeKey
  label: string
  singular: string
  description: string
  icon: ComponentType<SvgIconProps>
  /** Key into StudioCompany.counts. */
  countKey: keyof StudioCompany['counts']
  /** Where the published item lives on GeLearn. */
  publicPath: (item: StudioItem) => string
  /** One line of context in the list view. */
  listMeta: (item: StudioItem) => string
  image?: boolean
  document?: boolean
  fields: StudioField[]
}

const dateMeta = (item: StudioItem) => (typeof item.date === 'string' ? formatDisplayDate(item.date) : '')

export const STUDIO_TYPES: StudioTypeConfig[] = [
  {
    key: 'geacademy',
    label: 'GeAcademy',
    singular: 'GeAcademy article',
    description: 'In-depth technical articles on protocols, platforms and architectures.',
    icon: SchoolOutlinedIcon,
    countKey: 'geacademy',
    publicPath: item => `/geacademy/${item.id}`,
    listMeta: item => [item.topic, item.difficulty, dateMeta(item)].filter(Boolean).join(' · '),
    image: true,
    fields: [
      { name: 'title', label: 'Title', kind: 'title', column: 'main', required: true, placeholder: 'Article title' },
      { name: 'intro', label: 'Introduction', kind: 'richtext', column: 'main' },
      { name: 'sections', label: 'Sections', kind: 'sections', column: 'main', maxItems: 30 },
      { name: 'callout_label', label: 'Callout heading', kind: 'text', column: 'main', placeholder: 'e.g. Key insight' },
      { name: 'callout_content', label: 'Callout text', kind: 'textarea', column: 'main' },
      { name: 'takeaways', label: 'Key takeaways', kind: 'list', column: 'main', maxItems: 12, placeholder: 'Add a takeaway and press Enter' },
      { name: 'excerpt', label: 'Excerpt', kind: 'textarea', column: 'side', required: true, help: 'Shown on cards and in search results.' },
      { name: 'topics', label: 'Topics', kind: 'topics', column: 'side', maxItems: 5, help: 'Used for topic pages, the Explore menu and recommendations on GeLearn.' },
      {
        name: 'difficulty', label: 'Level', kind: 'select', column: 'side', required: true,
        options: [
          { value: 'Beginner', label: 'Beginner' },
          { value: 'Intermediate', label: 'Intermediate' },
          { value: 'Advanced', label: 'Advanced' },
        ],
      },
      { name: 'read_time', label: 'Read time', kind: 'text', column: 'side', required: true, placeholder: 'e.g. 8 min read' },
      { name: 'date', label: 'Publish date', kind: 'date', column: 'side', required: true },
      { name: 'tags', label: 'Tags', kind: 'list', column: 'side', maxItems: 12, placeholder: 'Add a tag and press Enter' },
    ],
  },
  {
    key: 'research',
    label: 'Research',
    singular: 'research item',
    description: 'Field deployments, verified outcomes and the engineering behind them.',
    icon: ScienceOutlinedIcon,
    countKey: 'research',
    publicPath: item => `/research/${item.id}`,
    listMeta: item => [item.read_time, dateMeta(item)].filter(Boolean).join(' · '),
    image: true,
    fields: [
      { name: 'title', label: 'Title', kind: 'title', column: 'main', required: true, placeholder: 'Research title' },
      { name: 'intro', label: 'Introduction', kind: 'richtext', column: 'main' },
      { name: 'sections', label: 'Sections', kind: 'sections', column: 'main', maxItems: 30 },
      { name: 'excerpt', label: 'Excerpt', kind: 'textarea', column: 'side', required: true, help: 'Shown on cards and in search results.' },
      { name: 'topics', label: 'Topics', kind: 'topics', column: 'side', maxItems: 5, help: 'Used for topic pages, the Explore menu and recommendations on GeLearn.' },
      { name: 'read_time', label: 'Read time', kind: 'text', column: 'side', required: true, placeholder: 'e.g. 4 min read' },
      { name: 'date', label: 'Date', kind: 'date', column: 'side', required: true },
    ],
  },
  {
    key: 'policies-tenders',
    label: 'Policies & Tenders',
    singular: 'policy or tender',
    description: 'Policy updates, tenders, RFPs and partnership opportunities.',
    icon: GavelOutlinedIcon,
    countKey: 'policies_tenders',
    publicPath: () => '/policies-tenders',
    listMeta: item => [item.status, item.authority, typeof item.deadline === 'string' ? `Deadline ${formatDisplayDate(item.deadline)}` : ''].filter(Boolean).join(' · '),
    fields: [
      { name: 'title', label: 'Title', kind: 'title', column: 'main', required: true, placeholder: 'Policy or tender title' },
      { name: 'description', label: 'Description', kind: 'textarea', column: 'main', required: true },
      { name: 'authority', label: 'Issuing authority', kind: 'text', column: 'side', required: true, placeholder: 'e.g. SECI' },
      { name: 'sector', label: 'Sector', kind: 'text', column: 'side', required: true, placeholder: 'e.g. Grid' },
      {
        name: 'status', label: 'Status', kind: 'select', column: 'side', required: true,
        options: [
          { value: 'Open', label: 'Open' },
          { value: 'Upcoming', label: 'Upcoming' },
          { value: 'Closed', label: 'Closed' },
        ],
      },
      { name: 'deadline', label: 'Deadline', kind: 'date', column: 'side', required: true },
      { name: 'value', label: 'Value', kind: 'text', column: 'side', required: true, placeholder: 'e.g. ₹1.2 Cr – ₹2.5 Cr' },
    ],
  },
  {
    key: 'whitepapers',
    label: 'Whitepapers',
    singular: 'whitepaper',
    description: 'Reports and whitepapers, downloadable as PDF.',
    icon: DescriptionOutlinedIcon,
    countKey: 'whitepapers',
    publicPath: () => '/whitepapers',
    listMeta: item => [item.pages, dateMeta(item)].filter(Boolean).join(' · '),
    document: true,
    fields: [
      { name: 'title', label: 'Title', kind: 'title', column: 'main', required: true, placeholder: 'Whitepaper title' },
      { name: 'description', label: 'Description', kind: 'textarea', column: 'main', required: true },
      { name: 'topics', label: 'Topics', kind: 'topics', column: 'side', maxItems: 5, help: 'Used for topic pages, the Explore menu and recommendations on GeLearn.' },
      { name: 'pages', label: 'Length', kind: 'text', column: 'side', required: true, placeholder: 'e.g. 38 pages' },
      { name: 'date', label: 'Date', kind: 'date', column: 'side', required: true },
    ],
  },
  {
    key: 'podcasts',
    label: 'Podcasts',
    singular: 'podcast episode',
    description: 'Episodes and interviews, with the professionals who took part.',
    icon: MicNoneOutlinedIcon,
    countKey: 'podcasts',
    publicPath: item => `/podcasts/${item.id}`,
    listMeta: item => [item.duration, dateMeta(item)].filter(Boolean).join(' · '),
    image: true,
    fields: [
      { name: 'title', label: 'Title', kind: 'title', column: 'main', required: true, placeholder: 'Episode title' },
      { name: 'description', label: 'Description', kind: 'textarea', column: 'main', required: true },
      {
        name: 'collaborators', label: 'Collaborators', kind: 'collaborators', column: 'main', maxItems: 12,
        help: 'Professionals featured in this episode. It appears on their GeLearn profiles.',
      },
      { name: 'guest', label: 'Guest name', kind: 'text', column: 'side', required: true, help: 'As it should appear if the guest has no GeLearn account.' },
      { name: 'guest_role', label: 'Guest role', kind: 'text', column: 'side', required: true, placeholder: 'e.g. Head of Grid Operations, SECI' },
      { name: 'topics', label: 'Topics', kind: 'topics', column: 'side', maxItems: 5, help: 'Used for topic pages, the Explore menu and recommendations on GeLearn.' },
      { name: 'duration', label: 'Duration', kind: 'text', column: 'side', required: true, placeholder: 'e.g. 48 min' },
      { name: 'date', label: 'Date', kind: 'date', column: 'side', required: true },
      { name: 'audio_url', label: 'Audio URL', kind: 'url', column: 'side', placeholder: 'https://…' },
      { name: 'access', label: 'Access', kind: 'access', column: 'side', required: true },
    ],
  },
]

export function getStudioType(key: string | undefined): StudioTypeConfig | undefined {
  return STUDIO_TYPES.find(t => t.key === key)
}
