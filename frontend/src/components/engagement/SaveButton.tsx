import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/api/client'
import { useAuth } from '@/context/useAuth'

interface SaveButtonProps {
  contentType: string
  objectId: number
  className?: string
}

export function SaveButton({ contentType, objectId, className }: SaveButtonProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    apiFetch<{ results: { content_type: string; object_id: number }[] }>(
      `/api/engagement/saved-items/?limit=200`
    )
      .then(data => {
        if (cancelled) return
        setSaved(data.results.some(item => item.content_type === contentType && item.object_id === objectId))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user, contentType, objectId])

  async function handleClick() {
    if (!user) {
      navigate('/login')
      return
    }
    setLoading(true)
    const previousSaved = saved
    setSaved(!previousSaved)
    try {
      const result = await apiFetch<{ saved: boolean }>('/api/engagement/saved-items/toggle/', {
        method: 'POST',
        body: { content_type: contentType, object_id: objectId },
      })
      setSaved(result.saved)
    } catch {
      setSaved(previousSaved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved items' : 'Save for later'}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border text-sm font-semibold transition-colors',
        saved
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-white text-text-muted hover:border-primary hover:text-primary',
        loading && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      {saved ? <BookmarkIcon sx={{ fontSize: 16 }} /> : <BookmarkBorderIcon sx={{ fontSize: 16 }} />}
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
