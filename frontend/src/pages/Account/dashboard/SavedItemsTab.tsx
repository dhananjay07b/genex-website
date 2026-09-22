import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { apiFetch } from '@/lib/api/client'
import { formatRelativeTime, getMediaUrl } from '@/lib/utils'
import type { SavedItem } from '@/types/auth'
import { EmptyState } from './EmptyState'

const TYPE_LABEL: Record<string, string> = {
  blogpost: 'Blog',
  videoitem: 'Video',
  podcastepisode: 'Podcast',
  whitepaper: 'Whitepaper',
  tender: 'Tender',
  casestudy: 'Case Study',
}

const TYPE_ICON: Record<string, typeof ArticleOutlinedIcon> = {
  blogpost: ArticleOutlinedIcon,
  videoitem: VideocamOutlinedIcon,
  podcastepisode: MicNoneOutlinedIcon,
  whitepaper: DescriptionOutlinedIcon,
  tender: GavelOutlinedIcon,
  casestudy: FolderOutlinedIcon,
}

const TYPE_ROUTE: Record<string, (id: number) => string> = {
  blogpost: id => `/blog/${id}`,
}

export function SavedItemsTab() {
  const [items, setItems] = useState<SavedItem[] | null>(null)

  useEffect(() => {
    apiFetch<SavedItem[]>('/api/engagement/saved-items/').then(setItems).catch(() => setItems([]))
  }, [])

  async function handleRemove(id: number) {
    setItems(prev => (prev ?? []).filter(i => i.id !== id))
    try {
      await apiFetch(`/api/engagement/saved-items/${id}/`, { method: 'DELETE' })
    } catch {
      // best-effort — a stale local removal is preferable to blocking the UI on a retry
    }
  }

  if (items === null) return null

  return (
    <div>
      <h1 className="text-xl font-extrabold text-text-primary mb-5">Saved Items</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<BookmarkBorderIcon sx={{ fontSize: 22 }} />}
          title="Nothing saved yet"
          description="Bookmark blogs, videos, podcasts, whitepapers, and tenders as you browse GeLearn — they'll show up here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map(item => {
            const Icon = TYPE_ICON[item.content_type] ?? BookmarkBorderIcon
            const route = TYPE_ROUTE[item.content_type]?.(item.object_id)
            const title = item.title ?? `${TYPE_LABEL[item.content_type] ?? item.content_type} #${item.object_id}`
            return (
              <div key={item.id} className="flex items-start gap-3 border border-border rounded-2xl p-4">
                {item.image_url ? (
                  <img
                    src={getMediaUrl(item.image_url)}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-surface text-primary flex items-center justify-center shrink-0">
                    <Icon sx={{ fontSize: 18 }} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f3f4f6] text-[#374151] mb-1.5">
                    {TYPE_LABEL[item.content_type] ?? item.content_type}
                  </span>
                  {route ? (
                    <Link to={route} className="block font-bold text-sm text-text-primary hover:text-primary leading-snug">
                      {title}
                    </Link>
                  ) : (
                    <p className="font-bold text-sm text-text-primary leading-snug">{title}</p>
                  )}
                  <p className="text-xs text-text-muted mt-1">Saved {formatRelativeTime(item.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  aria-label="Remove from saved items"
                  className="text-text-muted hover:text-red-500 shrink-0 transition-colors"
                >
                  <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
