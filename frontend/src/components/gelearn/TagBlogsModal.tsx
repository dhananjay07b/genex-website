import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import CloseIcon from '@mui/icons-material/Close'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl, formatDisplayDate } from '@/lib/utils'
import type { BlogPostItem, SnippetListResponse, Topic } from '@/types/api'

const FALLBACK_IMAGE = '/images/blog/blog-1.jpg'

interface TagBlogsModalProps {
  topic: Topic | null
  onClose: () => void
}

export function TagBlogsModal({ topic, onClose }: TagBlogsModalProps) {
  const [postsState, setPostsState] = useState<{ forSlug: string; posts: BlogPostItem[] } | null>(null)

  useEffect(() => {
    if (!topic) return
    apiFetch<SnippetListResponse<BlogPostItem>>(`/api/snippets/blog-posts/?topic=${topic.slug}&limit=50`)
      .then(res => setPostsState({ forSlug: topic.slug, posts: res.results }))
      .catch(() => setPostsState({ forSlug: topic.slug, posts: [] }))
  }, [topic])

  const posts = postsState && postsState.forSlug === topic?.slug ? postsState.posts : null

  return (
    <AnimatePresence>
      {topic && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-dark-bg/55 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-4 top-[8%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 max-w-4xl w-[calc(100%-2rem)] sm:w-full max-h-[80vh] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f5f9] shrink-0">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Topic</p>
                <h3 className="text-xl font-bold text-[#0f172a]">More blogs from {topic.name}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="size-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shrink-0"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {posts === null ? (
                <p className="text-sm text-text-muted text-center py-10">Loading…</p>
              ) : posts.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-10">No posts tagged {topic.name} yet.</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto sm:overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 sm:overflow-visible">
                  {posts.map(post => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.id}`}
                      onClick={onClose}
                      className="shrink-0 w-64 sm:w-auto rounded-2xl border border-[#f1f5f9] overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-36 relative">
                        <img
                          src={post.image_url ? getMediaUrl(post.image_url) : FALLBACK_IMAGE}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-bold text-[#0f172a] leading-snug line-clamp-2">{post.title}</p>
                        <p className="text-xs text-[#90a1b9] mt-2">{formatDisplayDate(post.date)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
