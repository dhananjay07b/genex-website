import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReplyIcon from '@mui/icons-material/Reply'
import { apiFetch } from '@/lib/api/client'
import { useAuth } from '@/context/useAuth'
import type { Comment } from '@/types/auth'

interface CommentSectionProps {
  contentType: string
  objectId: number
}

export function CommentSection({ contentType, objectId }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () =>
    apiFetch<Comment[]>(`/api/comments/?content_type=${contentType}&object_id=${objectId}`)
      .then(setComments)
      .catch(() => setComments([]))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, objectId])

  const topLevelComments = comments.filter(c => c.parent === null)
  const replies = (parentId: number) => comments.filter(c => c.parent === parentId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      await apiFetch('/api/comments/', {
        method: 'POST',
        body: { content_type: contentType, object_id: objectId, body, parent: replyTo },
      })
      setBody('')
      setReplyTo(null)
      await load()
    } finally {
      setSubmitting(false)
    }
  }

  function renderComment(c: Comment, isReply = false) {
    return (
      <div
        key={c.id}
        className={`flex gap-6 border-b border-[#f1f5f9] pb-8 ${isReply ? 'pl-20 mt-8' : ''}`}
      >
        <div className={`${isReply ? 'size-12' : 'size-16'} rounded-full bg-[#e2e8f0] shrink-0 flex items-center justify-center font-bold text-[#62748e]`}>
          {(c.author_name || 'U')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[17px] font-bold text-[#0f172a]">{c.author_name || 'Genex Member'}</p>
              <p className="text-xs text-[#62748e] mt-0.5">
                {new Date(c.created_at).toLocaleString()}
              </p>
            </div>
            {!isReply && user && (
              <button
                onClick={() => setReplyTo(c.id)}
                className="flex items-center gap-1.5 text-sm font-bold text-[#62748e] hover:text-primary transition-colors"
              >
                <ReplyIcon style={{ fontSize: 14 }} /> Reply
              </button>
            )}
          </div>
          <p className="text-[15px] text-[#45556c] leading-6">{c.body}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-[#0f172a] mb-10">{comments.length} Comments</h2>

      <div className="space-y-8">
        {topLevelComments.map(c => (
          <div key={c.id}>
            {renderComment(c)}
            {replies(c.id).map(r => renderComment(r, true))}
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold text-[#0f172a] mb-2">Leave A Comment</h2>

        {user ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {replyTo !== null && (
              <p className="text-sm text-[#62748e]">
                Replying to comment #{replyTo}{' '}
                <button type="button" onClick={() => setReplyTo(null)} className="text-primary font-bold">
                  Cancel
                </button>
              </p>
            )}
            <textarea
              placeholder="Write a comment..."
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              className="w-full bg-[#fcfcfc] border border-[#e2e8f0] rounded-3xl px-5 py-4 text-sm text-[#1d293d] placeholder-[#90a1b9] outline-none focus:border-primary transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="gradient-brand text-white text-base font-bold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Posting…' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <p className="text-[15px] text-[#62748e] bg-[#f8fafc] rounded-2xl p-6">
            <Link to="/login" className="text-primary font-bold">Log in</Link> to join the discussion and leave a comment.
          </p>
        )}
      </div>
    </div>
  )
}
