import type { ComponentType } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined'
import PodcastsOutlinedIcon from '@mui/icons-material/PodcastsOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import type { DiscoveryCard, DiscoveryType } from '@/types/discovery'

export const TYPE_ICONS: Record<DiscoveryType, ComponentType<SvgIconProps>> = {
  course: SchoolOutlinedIcon,
  geacademy: MenuBookOutlinedIcon,
  research: ScienceOutlinedIcon,
  whitepaper: DescriptionOutlinedIcon,
  tender: GavelOutlinedIcon,
  video: PlayCircleOutlinedIcon,
  podcast: PodcastsOutlinedIcon,
  blog: ArticleOutlinedIcon,
}

export const TYPE_LABELS: Record<DiscoveryType, string> = {
  course: 'Course',
  geacademy: 'GeAcademy',
  research: 'Research',
  whitepaper: 'Whitepaper',
  tender: 'Policy & Tender',
  video: 'Video',
  podcast: 'Podcast',
  blog: 'Blog',
}

/** "Course · 14 lessons", "GeAcademy · 8 min read", "Video · 14:32 min"… */
export function cardMeta(card: DiscoveryCard): string {
  return [TYPE_LABELS[card.type], card.meta].filter(Boolean).join(' · ')
}
