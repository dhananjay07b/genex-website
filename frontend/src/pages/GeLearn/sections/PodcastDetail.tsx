import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import MailOutlinedIcon from '@mui/icons-material/MailOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { LockedOverlay } from '@/components/gelearn/LockedOverlay'
import { CommentSection } from '@/components/gelearn/CommentSection'
import { AuthorPanel } from '@/components/gelearn/AuthorPanel'
import { SaveButton } from '@/components/engagement/SaveButton'
import { apiFetch } from '@/lib/api/client'
import { marketingPath } from '@/lib/host'
import { getMediaUrl, formatDisplayDate } from '@/lib/utils'
import type { PodcastItem, SnippetListResponse } from '@/types/api'

const PLACEHOLDER_GRADIENT = 'linear-gradient(135deg, #1AAEE8, #0f2930)'

export default function PodcastDetail() {
  const { id } = useParams<{ id: string }>()
  const [episode, setEpisode] = useState<PodcastItem | null | undefined>(undefined)
  const [allEpisodes, setAllEpisodes] = useState<PodcastItem[]>([])
  const [authorPanelUser, setAuthorPanelUser] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setEpisode(null); return }
    apiFetch<PodcastItem>(`/api/snippets/podcasts/${id}/`)
      .then(ep => setEpisode(ep))
      .catch(() => setEpisode(null))
    apiFetch<SnippetListResponse<PodcastItem>>('/api/snippets/podcasts/?limit=50')
      .then(res => setAllEpisodes(res.results))
      .catch(() => {})
  }, [id])

  if (episode === undefined) return null
  if (episode === null) return <Navigate to="/podcasts" replace />

  const recentEpisodes = allEpisodes.filter(e => e.id !== episode.id).slice(0, 3)

  return (
    <main>
      <PageMeta
        title={`${episode.title} — Genex GeLearn`}
        description={episode.description}
        canonical={`/podcasts/${episode.id}`}
      />

      <div className="bg-white border-b border-[#e2e8f0] py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#62748e]">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRightIcon style={{ fontSize: 14 }} />
          <Link to="/podcasts" className="hover:text-primary transition-colors">Podcasts &amp; Interviews</Link>
          <ChevronRightIcon style={{ fontSize: 14 }} />
          <span className="text-[#1d293d] truncate max-w-xs">{episode.title}</span>
        </div>
      </div>

      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex gap-14 items-start">

          <article className="flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' as const }}
              className="text-5xl font-bold text-[#0f172a] leading-tight mb-6"
            >
              {episode.title}
            </motion.h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white">{episode.category}</span>
            </div>

            <div className="flex items-center gap-6 border-b border-[#f1f5f9] pb-4 mb-8 flex-wrap">
              {episode.guest_account ? (
                <button type="button" onClick={() => setAuthorPanelUser(episode.guest_account!.username)} className="flex items-center gap-3 group">
                  <span className="size-10 rounded-full bg-primary text-white text-sm font-bold shrink-0 flex items-center justify-center overflow-hidden">
                    {episode.guest_account.avatar_url ? (
                      <img src={getMediaUrl(episode.guest_account.avatar_url)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      episode.guest_account.display_name.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <span className="text-sm text-[#62748e] text-left">
                    Hosted with <span className="font-bold text-[#0f172a] group-hover:text-primary transition-colors">{episode.guest_account.display_name}</span>
                    <span className="block text-xs text-[#90a1b9]">{episode.guest_role}</span>
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="size-10 rounded-full bg-[#e2e8f0] text-[#62748e] text-sm font-bold shrink-0 flex items-center justify-center">
                    {episode.guest.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-sm text-[#62748e]">
                    Hosted with <span className="font-bold text-[#0f172a]">{episode.guest}</span>
                    <span className="block text-xs text-[#90a1b9]">{episode.guest_role}</span>
                  </span>
                </div>
              )}
              <div className="w-px h-8 bg-[#cad5e2] hidden sm:block" />
              <span className="text-sm text-[#62748e]">{formatDisplayDate(episode.date)}</span>
              {episode.duration && (
                <span className="flex items-center gap-1.5 text-sm text-[#62748e]">
                  <AccessTimeOutlinedIcon style={{ fontSize: 14 }} />
                  {episode.duration}
                </span>
              )}
            </div>

            {episode.is_locked ? (
              <div
                className="relative rounded-3xl overflow-hidden mb-8 shadow-sm aspect-video"
                style={{ background: episode.image_url ? undefined : PLACEHOLDER_GRADIENT }}
              >
                {episode.image_url && (
                  <img src={getMediaUrl(episode.image_url)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <LockedOverlay />
              </div>
            ) : episode.audio_url ? (
              <div className="rounded-3xl overflow-hidden mb-8 shadow-sm gradient-brand p-8">
                <div className="flex items-center gap-5">
                  <span className="size-16 rounded-full bg-white/20 border border-white/40 flex items-center justify-center shrink-0">
                    <PlayArrowIcon style={{ fontSize: 24, color: '#fff', marginLeft: 2 }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm mb-3 truncate">{episode.title}</p>
                    <audio controls className="w-full" src={episode.audio_url} />
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="relative rounded-3xl overflow-hidden aspect-video mb-8 shadow-sm"
                style={{ background: episode.image_url ? undefined : PLACEHOLDER_GRADIENT }}
              >
                {episode.image_url && (
                  <img src={getMediaUrl(episode.image_url)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
              </div>
            )}

            <p className="text-[17px] text-[#45556c] leading-[1.63] mb-8">{episode.description}</p>

            <div className="border-t border-b border-[#e2e8f0] py-6 flex items-center justify-between gap-6">
              <SaveButton contentType="podcastepisode" objectId={episode.id} />
            </div>

            <CommentSection contentType="podcastepisode" objectId={episode.id} />
          </article>

          <aside className="hidden lg:flex flex-col gap-12 w-85 shrink-0 sticky top-24">
            <div className="bg-[#fcfcfc] border border-[#f1f5f9] rounded-2xl p-8">
              <h3 className="text-xl font-bold text-[#0f172a] mb-6">More Episodes</h3>
              <div className="space-y-6">
                {recentEpisodes.map(ep => (
                  <Link key={ep.id} to={`/podcasts/${ep.id}`} className="flex items-center gap-4 group">
                    <div
                      className="size-18 rounded-3xl overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: PLACEHOLDER_GRADIENT }}
                    >
                      {ep.image_url ? (
                        <img src={getMediaUrl(ep.image_url)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <PlayArrowIcon style={{ fontSize: 20, color: '#fff' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0f172a] leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {ep.title}
                      </p>
                      <p className="text-xs text-[#90a1b9] mt-1">{formatDisplayDate(ep.date)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="gradient-brand rounded-3xl p-8 shadow-lg relative overflow-hidden">
              <h3 className="text-xl font-bold text-white mb-6">Want to be a guest?</h3>
              <div className="space-y-6 mb-8">
                {[
                  { Icon: PhoneOutlinedIcon, label: 'Call Us', value: '+91 98765 43210' },
                  { Icon: MailOutlinedIcon, label: 'Email Us', value: 'info@genextechnocrats.com' },
                  { Icon: AccessTimeOutlinedIcon, label: 'Office Hours', value: 'Mon – Sat: 9:00 am – 6:00 pm' },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Icon style={{ fontSize: 18 }} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{label}</p>
                      <p className="text-sm text-white/90 mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href={marketingPath('/contact')}
                className="block w-full bg-white text-[#0b1b22] text-base font-bold text-center py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
              >
                Get In Touch
              </a>
            </div>
          </aside>
        </div>
      </section>

      <AuthorPanel username={authorPanelUser} onClose={() => setAuthorPanelUser(null)} />
    </main>
  )
}
