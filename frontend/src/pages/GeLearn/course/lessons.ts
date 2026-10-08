import { apiFetch } from '@/lib/api/client'

/**
 * Proof of learning: records that an enrolled learner opened a lesson from inside the
 * course (the course page, or Continue in My Learning). Fired as the link navigates;
 * opening the last lesson issues the certificate on the server.
 */
export function recordLessonOpen(slug: string, itemId: number) {
  apiFetch(`/api/learning/courses/${slug}/items/${itemId}/open/`, { method: 'POST' }).catch(() => {})
}
