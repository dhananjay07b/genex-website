import { useEffect, useState, useSyncExternalStore } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/api/client'
import { useAuth } from '@/context/useAuth'
import { returnState } from '@/lib/authRedirect'
import { isSaved, loadSavedKeys, savedKey, setSaved, subscribeSaved } from '@/lib/savedItems'

interface SaveButtonProps {
  contentType: string
  objectId: number
  className?: string
}

export function SaveButton({ contentType, objectId, className }: SaveButtonProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const key = savedKey(contentType, objectId)
  // Shared with every other Save button on the page (lib/savedItems): one request, not one per button.
  const saved = useSyncExternalStore(subscribeSaved, () => Boolean(user) && isSaved(key))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) void loadSavedKeys(user.id)
  }, [user])

  async function handleClick() {
    if (!user) {
      navigate('/login', { state: returnState(location) })
      return
    }
    setLoading(true)
    const previousSaved = saved
    setSaved(key, !previousSaved)
    try {
      const result = await apiFetch<{ saved: boolean }>('/api/engagement/saved-items/toggle/', {
        method: 'POST',
        body: { content_type: contentType, object_id: objectId },
      })
      setSaved(key, result.saved)
    } catch {
      setSaved(key, previousSaved)
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
