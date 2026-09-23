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
import { SaveButton } from '@/components/engagement/SaveButton'
import { apiFetch } from '@/lib/api/client'
import { marketingPath } from '@/lib/host'
import { getMediaUrl, embedVideoUrl } from '@/lib/utils'
import type { VideoItem, SnippetListResponse } from '@/types/api'

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const [video, setVideo] = useState<VideoItem | null | undefined>(undefined)
  const [allVideos, setAllVideos] = useState<VideoItem[]>([])

  useEffect(() => {
    if (!id) { setVideo(null); return }
    apiFetch<VideoItem>(`/api/snippets/videos/${id}/`)
      .then(v => setVideo(v))
      .catch(() => setVideo(null))
    apiFetch<SnippetListResponse<VideoItem>>('/api/snippets/videos/?limit=50')
      .then(res => setAllVideos(res.results))
      .catch(() => {})
  }, [id])

  if (video === undefined) return null
  if (video === null) return <Navigate to="/videos" replace />

  const embed = !video.is_locked && video.video_url ? embedVideoUrl(video.video_url) : null
  const directUrl = !video.is_locked && video.video_url && !embed ? video.video_url : null
  const recentVideos = allVideos.filter(v => v.id !== video.id).slice(0, 3)

  return (
    <main>
      <PageMeta
        title={`${video.title} — Genex GeLearn`}
        description={video.excerpt}
        canonical={`/videos/${video.id}`}
      />

      <div className="bg-white border-b border-[#e2e8f0] py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#62748e]">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRightIcon style={{ fontSize: 14 }} />
          <Link to="/videos" className="hover:text-primary transition-colors">Video Library</Link>
          <ChevronRightIcon style={{ fontSize: 14 }} />
          <span className="text-[#1d293d] truncate max-w-xs">{video.title}</span>
        </div>
      </div>

      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex gap-14 items-start">

          <article className="flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' as const }}
              className="text-5xl font-bold text-[#0f172a] leading-tight mb-8"
            >
              {video.title}
            </motion.h1>

            <div className="flex items-center gap-6 border-b border-[#f1f5f9] pb-4 mb-8">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: video.category_color, color: video.category_text_color }}
              >
                {video.category}
              </span>
              <span className="text-sm text-[#62748e]">{video.date}</span>
              {video.duration && (
                <span className="flex items-center gap-1.5 text-sm text-[#62748e]">
                  <AccessTimeOutlinedIcon style={{ fontSize: 14 }} />
                  {video.duration}
                </span>
              )}
            </div>

            <div
              className="relative rounded-3xl overflow-hidden aspect-video mb-8 shadow-sm bg-[#0f2930]"
              style={!video.image_url ? { background: `linear-gradient(135deg, ${video.category_color}, #0f2930)` } : undefined}
            >
              {video.is_locked ? (
                <>
                  {video.image_url && (
                    <img src={getMediaUrl(video.image_url)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <LockedOverlay />
                </>
              ) : directUrl ? (
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src={directUrl}
                  poster={video.image_url ? getMediaUrl(video.image_url) : undefined}
                  controls
                  playsInline
                />
              ) : embed ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={embed}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {video.image_url && (
                    <img src={getMediaUrl(video.image_url)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <span className="relative size-16 gradient-brand rounded-full flex items-center justify-center">
                    <PlayArrowIcon style={{ fontSize: 30, color: '#fff', marginLeft: 3 }} />
                  </span>
                </div>
              )}
            </div>

            <p className="text-[17px] text-[#45556c] leading-[1.63] mb-8">{video.excerpt}</p>

            <div className="border-t border-b border-[#e2e8f0] py-6 flex items-center justify-between gap-6">
              <SaveButton contentType="videoitem" objectId={video.id} />
            </div>

            <CommentSection contentType="videoitem" objectId={video.id} />
          </article>

          <aside className="hidden lg:flex flex-col gap-12 w-85 shrink-0 sticky top-24">
            <div className="bg-[#fcfcfc] border border-[#f1f5f9] rounded-2xl p-8">
              <h3 className="text-xl font-bold text-[#0f172a] mb-6">More Videos</h3>
              <div className="space-y-6">
                {recentVideos.map(v => (
                  <Link key={v.id} to={`/videos/${v.id}`} className="flex items-center gap-4 group">
                    <div
                      className="size-18 rounded-3xl overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${v.category_color}, #f3f4f6)` }}
                    >
                      {v.image_url ? (
                        <img src={getMediaUrl(v.image_url)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <PlayArrowIcon style={{ fontSize: 20, color: '#fff' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0f172a] leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {v.title}
                      </p>
                      <p className="text-xs text-[#90a1b9] mt-1">{v.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="gradient-brand rounded-3xl p-8 shadow-lg relative overflow-hidden">
              <h3 className="text-xl font-bold text-white mb-6">
                Don&apos;t Hesitate To Contact Us
              </h3>
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
    </main>
  )
}
