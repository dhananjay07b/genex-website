import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { apiFetch } from '@/lib/api/client'
import { formatRelativeTime } from '@/lib/utils'
import type { Comment } from '@/types/auth'
import type { SnippetListResponse } from '@/types/api'
import { EmptyState } from './EmptyState'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'

const CONTENT_TYPE_LABEL: Record<string, string> = {
  blogpost: 'Blog',
  podcastepisode: 'Podcast',
  whitepaper: 'Whitepaper',
  tender: 'Tender',
  videoitem: 'Video',
  casestudy: 'Case Study',
}

// Only content types with a real detail route get a link — others show as plain text.
const CONTENT_TYPE_ROUTE: Record<string, (id: number) => string> = {
  blogpost: id => `/blog/${id}`,
}

export function CommentsTab() {
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Comment | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    apiFetch<SnippetListResponse<Comment>>('/api/accounts/me/comments/?limit=100')
      .then(res => setComments(res.results))
      .catch(() => setComments([]))
  }, [])

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await apiFetch(`/api/comments/${pendingDelete.id}/`, { method: 'DELETE' })
      setComments(prev => (prev ?? []).filter(c => c.id !== pendingDelete.id))
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  if (comments === null) return null

  return (
    <div>
      <h1 className="text-xl font-extrabold text-text-primary mb-5">My Comments</h1>

      {comments.length === 0 ? (
        <EmptyState
          icon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 22 }} />}
          title="No comments yet"
          description="Join the conversation on any blog, whitepaper, or tender — your comments will show up here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map(c => {
            const typeLabel = CONTENT_TYPE_LABEL[c.content_type] ?? c.content_type
            const route = CONTENT_TYPE_ROUTE[c.content_type]?.(c.object_id)
            return (
              <div key={c.id} className="relative border border-border rounded-2xl p-4 pr-12">
                <button
                  type="button"
                  onClick={() => setPendingDelete(c)}
                  aria-label="Delete this comment"
                  className="absolute top-3.5 right-4 w-7 h-7 rounded-lg border border-border text-text-muted flex items-center justify-center hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#f3f4f6] text-[#374151]">
                    {typeLabel}
                  </span>
                  <span className="text-xs text-text-muted">on</span>
                  {route ? (
                    <Link to={route} className="text-xs font-bold text-text-primary hover:text-primary">
                      #{c.object_id}
                    </Link>
                  ) : (
                    <span className="text-xs font-bold text-text-primary">#{c.object_id}</span>
                  )}
                  <span className="ml-auto text-xs text-text-muted shrink-0">{formatRelativeTime(c.created_at)}</span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed">{c.body}</p>
              </div>
            )
          })}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDeleteDialog
          label={pendingDelete.body.slice(0, 60)}
          confirming={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}
