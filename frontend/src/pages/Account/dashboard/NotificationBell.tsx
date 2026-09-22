import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import { apiFetch } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/auth'
import type { SnippetListResponse } from '@/types/api'

const KIND_ICON: Record<Notification['kind'], typeof ArticleOutlinedIcon> = {
  blog_status: ArticleOutlinedIcon,
  video_status: VideocamOutlinedIcon,
  comment_reply: ChatBubbleOutlineOutlinedIcon,
}

export function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    apiFetch<SnippetListResponse<Notification>>('/api/engagement/notifications/?limit=20')
      .then(res => setNotifications(res.results))
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  async function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    try {
      await apiFetch('/api/engagement/notifications/mark-read/', { method: 'POST', body: {} })
    } catch {
      // best-effort — local state already reflects the intent
    }
  }

  const KIND_TAB: Record<Notification['kind'], string> = {
    blog_status: 'blogposts',
    video_status: 'videos',
    comment_reply: 'comments',
  }

  function goToNotification(kind: Notification['kind']) {
    setOpen(false)
    navigate(`/account?tab=${KIND_TAB[kind]}`)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        className="relative w-10 h-10 rounded-full border border-border bg-white/75 flex items-center justify-center text-text-primary hover:border-primary hover:text-primary transition-colors"
      >
        <NotificationsNoneOutlinedIcon sx={{ fontSize: 19 }} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
        )}
      </button>

      {open && (
        <div className="absolute top-12 right-0 w-80 bg-white border border-border rounded-2xl shadow-lg p-2 z-20">
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <span className="text-sm font-bold text-text-primary">Notifications</span>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-bold text-primary">
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-text-muted px-2 py-4 text-center">No notifications yet.</p>
          ) : (
            notifications.map(n => {
              const Icon = KIND_ICON[n.kind]
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => goToNotification(n.kind)}
                  className={cn(
                    'w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-surface transition-colors',
                    !n.is_read && 'bg-primary/5'
                  )}
                >
                  <span className="w-7 h-7 rounded-lg bg-surface text-primary flex items-center justify-center shrink-0">
                    <Icon sx={{ fontSize: 14 }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-text-primary leading-snug">{n.text}</span>
                    <span className="block text-[11px] text-text-muted mt-0.5">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </span>
                </button>
              )
            })
          )}

          <div className="mt-1 pt-2 border-t border-border text-[11px] text-text-muted text-center">
            Email notifications for these are coming later.
          </div>
        </div>
      )}
    </div>
  )
}
