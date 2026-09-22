import { useEffect, useState } from 'react'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import { apiFetch } from '@/lib/api/client'
import type { PodcastItem, SnippetListResponse } from '@/types/api'
import { EmptyState } from './EmptyState'

export function PodcastsTab() {
  const [episodes, setEpisodes] = useState<PodcastItem[] | null>(null)

  useEffect(() => {
    apiFetch<SnippetListResponse<PodcastItem>>('/api/accounts/me/podcast-appearances/?limit=100')
      .then(res => setEpisodes(res.results))
      .catch(() => setEpisodes([]))
  }, [])

  if (episodes === null) return null

  return (
    <div>
      <h1 className="text-xl font-extrabold text-text-primary mb-5">My Podcasts</h1>

      {episodes.length === 0 ? (
        <EmptyState
          icon={<MicNoneOutlinedIcon sx={{ fontSize: 22 }} />}
          title="No podcast features yet"
          description="When our editorial team invites you as a guest, that episode will show up here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {episodes.map(ep => (
            <div key={ep.id} className="flex items-center gap-4 border border-border rounded-2xl p-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-white"
                style={{ background: `linear-gradient(135deg, ${ep.category_bg}, ${ep.category_text})` }}
              >
                <MicNoneOutlinedIcon sx={{ fontSize: 20 }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-text-primary text-sm">{ep.title}</p>
                <p className="text-xs text-text-muted mt-1">Guest · {ep.guest_role} · {ep.date}</p>
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ecfdf5] text-[#047857]">
                Published
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
