import { CoursesTab } from '@/pages/Account/dashboard/CoursesTab'

/** Company Studio → Courses: the company's courses, written as lessons or built from its published content. */
export default function StudioCourses() {
  return (
    <CoursesTab
      basePath="/studio/courses"
      heading="Company courses"
      emptyTitle="Turn your company's content into a course"
      emptyDescription="Write lessons for a course, reuse your published GeAcademy articles, research, whitepapers and podcasts, or mix both. Genex reviews it before it goes live."
    />
  )
}
