import { CoursesTab } from '@/pages/Account/dashboard/CoursesTab'

/** Company Studio → Courses: the company's courses, built from its published content. */
export default function StudioCourses() {
  return (
    <CoursesTab
      basePath="/studio/courses"
      heading="Company courses"
      emptyTitle="Turn your company's content into a course"
      emptyDescription="Arrange your published GeAcademy articles, research, whitepapers and podcasts into an ordered course. Genex reviews it before it goes live."
    />
  )
}
