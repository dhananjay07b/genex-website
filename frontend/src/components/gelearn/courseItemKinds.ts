import type { ComponentType } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import PodcastsOutlinedIcon from '@mui/icons-material/PodcastsOutlined'
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined'
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined'
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined'
import type { CourseItemKind, CourseLessonType, CourseTarget } from '@/types/learning'

type KindDisplay = { label: string; icon: ComponentType<SvgIconProps> }

/** What each kind of course lesson is called and how it's shown (mirrors backend learning.models.ITEM_KINDS). */
export const COURSE_ITEM_KINDS: Record<CourseItemKind, KindDisplay> = {
  video: { label: 'Video', icon: PlayCircleOutlinedIcon },
  post: { label: 'Article', icon: ArticleOutlinedIcon },
  article: { label: 'GeAcademy', icon: MenuBookOutlinedIcon },
  research: { label: 'Research', icon: ScienceOutlinedIcon },
  whitepaper: { label: 'Whitepaper', icon: DescriptionOutlinedIcon },
  podcast: { label: 'Podcast', icon: PodcastsOutlinedIcon },
  lesson: { label: 'Course lesson', icon: NotesOutlinedIcon },
}

/** A course's own lessons, by type. */
export const COURSE_LESSON_TYPES: Record<CourseLessonType, KindDisplay> = {
  text: { label: 'Text lesson', icon: NotesOutlinedIcon },
  video: { label: 'Video lesson', icon: OndemandVideoOutlinedIcon },
  quiz: { label: 'Quiz', icon: QuizOutlinedIcon },
}

/** How one course item is labelled: by its kind, or its lesson type for a course's own lesson. */
export function courseItemDisplay(item: Pick<CourseTarget, 'kind' | 'lesson_type'>): KindDisplay {
  return item.kind === 'lesson' && item.lesson_type ? COURSE_LESSON_TYPES[item.lesson_type] : COURSE_ITEM_KINDS[item.kind]
}

/** Lessons whose stored detail isn't a time (blog posts, whitepapers, text lessons) show an estimate instead. */
export function timeIsEstimated(item: Pick<CourseTarget, 'kind' | 'lesson_type'>): boolean {
  return item.kind === 'post' || item.kind === 'whitepaper' || (item.kind === 'lesson' && item.lesson_type !== 'video')
}
