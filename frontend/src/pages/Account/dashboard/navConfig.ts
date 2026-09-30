import type { ComponentType } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import type { AccountType } from '@/types/auth'
import type { TabKey } from './types'

interface NavItem {
  key: TabKey
  icon: ComponentType<SvgIconProps>
  /** Account types that get this tab; omitted = everyone. */
  roles?: AccountType[]
}

/**
 * The dashboard sidebar, per role:
 *   Learner      — learning, saved, comments
 *   Professional — everything a Learner has + publishing (posts, videos, courses, podcast features)
 *   Company      — the essentials; publishing happens in the Company Studio
 */
const NAV_ITEMS: NavItem[] = [
  { key: 'overview', icon: DashboardOutlinedIcon },
  { key: 'learning', icon: AutoStoriesOutlinedIcon, roles: ['learner', 'professional'] },
  { key: 'blogposts', icon: ArticleOutlinedIcon, roles: ['professional'] },
  { key: 'videos', icon: VideocamOutlinedIcon, roles: ['professional'] },
  { key: 'courses', icon: SchoolOutlinedIcon, roles: ['professional'] },
  { key: 'podcasts', icon: MicNoneOutlinedIcon, roles: ['professional'] },
  { key: 'comments', icon: ChatBubbleOutlineOutlinedIcon },
  { key: 'saved', icon: BookmarkBorderIcon },
  { key: 'settings', icon: SettingsOutlinedIcon },
]

export function navItemsFor(accountType: AccountType | undefined): NavItem[] {
  return NAV_ITEMS.filter(item => !item.roles || (accountType !== undefined && item.roles.includes(accountType)))
}
