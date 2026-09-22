import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'
import { formatRelativeTime } from '@/lib/utils'
import type { UserVideoPost } from '@/types/auth'
import { EmptyState } from './EmptyState'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { STATUS_BADGE_CLASS, STATUS_LABEL } from './types'
import Add from '@mui/icons-material/Add'

export function VideosTab() {
  const [videos, setVideos] = useState<UserVideoPost[] | null>(null)
  const [pendingDelete, setPendingDelete] = useState<UserVideoPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    apiFetch<UserVideoPost[]>('/api/snippets/video-submissions/mine/').then(setVideos).catch(() => setVideos([]))
  }, [])

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await apiFetch(`/api/snippets/video-submissions/${pendingDelete.id}/`, { method: 'DELETE' })
      setVideos(prev => (prev ?? []).filter(v => v.id !== pendingDelete.id))
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  if (videos === null) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-extrabold text-text-primary">My Videos</h1>
        <Link to="/submit-video">
          <Button variant="primary" size="md">
            <Add sx={{ fontSize: 18 }} />
            Submit a Video
          </Button>
        </Link>
      </div>

      {videos.length === 0 ? (
        <EmptyState
          icon={<VideocamOutlinedIcon sx={{ fontSize: 22 }} />}
          title="No videos yet"
          description="Field walkthroughs, demos, and training clips all belong here — submit your first one."
          action={
            <Link to="/submit-video">
              <Button variant="primary" size="md">
                <Add sx={{ fontSize: 18 }} />
                Submit a Video
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map(video => (
            <div key={video.id} className="relative border border-border rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setPendingDelete(video)}
                aria-label="Remove this video"
                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/90 border border-border text-text-muted flex items-center justify-center hover:border-red-500 hover:text-red-500 z-10 transition-colors"
              >
                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
              </button>
              <div className="h-32 bg-surface flex items-center justify-center">
                <VideocamOutlinedIcon sx={{ fontSize: 28 }} className="text-primary" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-text-primary text-sm">{video.title}</p>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_BADGE_CLASS}`}>
                    {STATUS_LABEL[video.status]}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1.5">
                  {video.topic || 'General'} · Updated {formatRelativeTime(video.submitted_at ?? video.created_at)}
                </p>
                {video.status === 'rejected' && video.rejection_reason && (
                  <div className="mt-2.5 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-800">
                    Reviewer note: {video.rejection_reason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDeleteDialog
          label={pendingDelete.title}
          confirming={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}
