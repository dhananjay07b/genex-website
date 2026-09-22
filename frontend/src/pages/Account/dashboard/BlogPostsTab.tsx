import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'
import { formatRelativeTime } from '@/lib/utils'
import type { UserBlogPost } from '@/types/auth'
import { EmptyState } from './EmptyState'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { STATUS_BADGE_CLASS, STATUS_LABEL } from './types'

const BANNER_GRADIENTS = [
  'bg-gradient-to-br from-primary to-secondary',
  'bg-gradient-to-br from-amber-500 to-orange-500',
  'bg-gradient-to-br from-emerald-500 to-green-600',
  'bg-gradient-to-br from-rose-500 to-pink-600',
]

export function BlogPostsTab() {
  const [posts, setPosts] = useState<UserBlogPost[] | null>(null)
  const [pendingDelete, setPendingDelete] = useState<UserBlogPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    apiFetch<UserBlogPost[]>('/api/snippets/blog-submissions/mine/').then(setPosts).catch(() => setPosts([]))
  }, [])

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await apiFetch(`/api/snippets/blog-submissions/${pendingDelete.id}/`, { method: 'DELETE' })
      setPosts(prev => (prev ?? []).filter(p => p.id !== pendingDelete.id))
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  if (posts === null) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-extrabold text-text-primary">My Blog Posts</h1>
        <Link to="/submit-post">
          <Button variant="primary" size="md">+ Submit a Post</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={<ArticleOutlinedIcon sx={{ fontSize: 22 }} />}
          title="No blog posts yet"
          description="Share what you know with the GeLearn community — your first post is a click away."
          action={
            <Link to="/submit-post">
              <Button variant="primary" size="md">+ Submit a Post</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map((post, i) => (
            <div key={post.id} className="relative border border-border rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setPendingDelete(post)}
                aria-label="Remove this post"
                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/90 border border-border text-text-muted flex items-center justify-center hover:border-red-500 hover:text-red-500 z-10 transition-colors"
              >
                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
              </button>

              <div className={`h-32 flex items-center justify-center relative ${BANNER_GRADIENTS[i % BANNER_GRADIENTS.length]}`}>
                <ArticleOutlinedIcon sx={{ fontSize: 28 }} className="text-white/55" />
                <span className={`absolute top-3 left-3.5 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_BADGE_CLASS}`}>
                  {STATUS_LABEL[post.status]}
                </span>
              </div>

              <div className="p-4">
                <p className="font-bold text-text-primary text-sm leading-snug">{post.title}</p>
                <div className="flex items-center justify-between gap-2 mt-1.5">
                  <p className="text-xs text-text-muted">
                    {post.topic || 'General'} · Updated {formatRelativeTime(post.submitted_at ?? post.created_at)}
                  </p>
                  {post.status === 'rejected' && post.rejection_reason && (
                    <ErrorOutlineIcon
                      titleAccess={`Reviewer note: ${post.rejection_reason}`}
                      sx={{ fontSize: 16 }}
                      className="text-red-600 shrink-0 cursor-help"
                    />
                  )}
                </div>
                {post.status === 'draft' && (
                  <Link
                    to="/submit-post"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-primary"
                  >
                    Resume editing <ArrowForwardIcon sx={{ fontSize: 13 }} />
                  </Link>
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
