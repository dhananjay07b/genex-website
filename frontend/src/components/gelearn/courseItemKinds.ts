import type { ComponentType } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import PodcastsOutlinedIcon from '@mui/icons-material/PodcastsOutlined'
import type { CourseItemKind } from '@/types/learning'

/** What each kind of course lesson is called and how it's shown (mirrors backend learning.models.ITEM_KINDS). */
export const COURSE_ITEM_KINDS: Record<CourseItemKind, { label: string; icon: ComponentType<SvgIconProps> }> = {
  video: { label: 'Video', icon: PlayCircleOutlinedIcon },
  post: { label: 'Article', icon: ArticleOutlinedIcon },
  article: { label: 'GeAcademy', icon: MenuBookOutlinedIcon },
  research: { label: 'Research', icon: ScienceOutlinedIcon },
  whitepaper: { label: 'Whitepaper', icon: DescriptionOutlinedIcon },
  podcast: { label: 'Podcast', icon: PodcastsOutlinedIcon },
}
