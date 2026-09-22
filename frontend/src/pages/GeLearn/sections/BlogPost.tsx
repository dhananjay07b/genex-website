import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import TwitterIcon from '@mui/icons-material/Twitter'
import FacebookIcon from '@mui/icons-material/Facebook'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import SearchIcon from '@mui/icons-material/Search'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import MailOutlinedIcon from '@mui/icons-material/MailOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { RichText } from '@/components/ui/RichText'
import { apiFetch } from '@/lib/api/client'
import { marketingPath } from '@/lib/host'
import { renderStreamField, type BlockComponentMap } from '@/lib/streamfield/renderStreamField'
import type { BlogPostBodyImageValue, BlogPostItem, SnippetListResponse } from '@/types/api'
import { CommentSection } from '@/components/gelearn/CommentSection'
import { SaveButton } from '@/components/engagement/SaveButton'

const FALLBACK_IMAGE = '/images/blog/blog-1.jpg'

function RichTextParagraph({ value }: { value: unknown }) {
  return (
    <RichText
      html={value as string}
      className="text-[17px] text-[#45556c] leading-[1.63] mb-8 [&_h2]:text-[#0f172a] [&_h3]:text-[#0f172a] [&_h4]:text-[#0f172a] [&_strong]:text-[#0f172a] [&_b]:text-[#0f172a]"
    />
  )
}

function InlineImage({ value }: { value: unknown }) {
  const img = value as BlogPostBodyImageValue
  return (
    <figure className="mb-8">
      <div className="rounded-2xl overflow-hidden aspect-video shadow-sm">
        <img src={img.image} alt={img.caption ?? ''} className="w-full h-full object-cover" />
      </div>
      {img.caption && (
        <figcaption className="text-sm text-[#90a1b9] mt-2 text-center">{img.caption}</figcaption>
      )}
    </figure>
  )
}

const blogBlockMap: BlockComponentMap = {
  rich_text: RichTextParagraph,
  image: InlineImage,
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BlogPost() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<BlogPostItem | null | undefined>(undefined)
  const [allPosts, setAllPosts] = useState<BlogPostItem[]>([])

  useEffect(() => {
    if (!id) { setPost(null); return }
    apiFetch<BlogPostItem>(`/api/snippets/blog-posts/${id}/`)
      .then(p => setPost(p))
      .catch(() => setPost(null))
    apiFetch<SnippetListResponse<BlogPostItem>>('/api/snippets/blog-posts/?limit=50')
      .then(res => setAllPosts(res.results))
      .catch(() => {})
  }, [id])

  if (post === undefined) return null
  if (post === null) return <Navigate to="/blog" replace />

  const postIdx = allPosts.findIndex(p => p.id === post.id)
  const heroImg = post.image_url ?? FALLBACK_IMAGE

  const prevPost = postIdx > 0 ? allPosts[postIdx - 1] : undefined
  const nextPost = postIdx >= 0 && postIdx < allPosts.length - 1 ? allPosts[postIdx + 1] : undefined
  const recentPosts = allPosts.filter(p => p.id !== post.id).slice(0, 3)
  const tags = Array.from(new Set(allPosts.map(p => p.topic).filter(Boolean)))

  return (
    <main>
      <PageMeta
        title={`${post.title} — Genex Blog`}
        description={post.excerpt}
        canonical={`/blog/${post.id}`}
      />

      {/* ── BREADCRUMB ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e2e8f0] py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#62748e]">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRightIcon style={{ fontSize: 14 }} />
          <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <ChevronRightIcon style={{ fontSize: 14 }} />
          <span className="text-[#1d293d] truncate max-w-xs">{post.title}</span>
        </div>
      </div>

      {/* ── MAIN LAYOUT ──────────────────────────────────────────────────── */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex gap-14 items-start">

          {/* ── LEFT: ARTICLE ────────────────────────────────────────────── */}
          <article className="flex-1 min-w-0">

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' as const }}
              className="text-5xl font-bold text-[#0f172a] leading-tight mb-8"
            >
              {post.title}
            </motion.h1>

            {/* Author / date meta */}
            <div className="flex items-center gap-6 border-b border-[#f1f5f9] pb-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-[#e2e8f0] shrink-0 flex items-center justify-center text-sm font-bold text-[#62748e]">
                  G
                </div>
                <span className="text-sm text-[#62748e]">
                  Post by <span className="font-bold text-[#0f172a]">Genex Engineering</span>
                </span>
              </div>
              <div className="w-px h-4 bg-[#cad5e2]" />
              <span className="text-sm text-[#62748e]">{post.date}</span>
              <span className="ml-auto px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full">{post.topic}</span>
            </div>

            {/* Hero image */}
            <div className="rounded-3xl overflow-hidden aspect-video mb-8 shadow-sm">
              <img src={heroImg} alt={post.title} className="w-full h-full object-cover" />
            </div>

            {/* Body */}
            <div className="mb-2">
              {renderStreamField(post.body, blogBlockMap)}
            </div>

            {/* ── SHARE + PREV/NEXT ───────────────────────────────────────── */}
            <div className="border-t border-b border-[#e2e8f0] py-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-[#0f172a]">Share post:</span>
                <div className="flex items-center gap-2">
                  {[
                    { Icon: TwitterIcon,  label: 'Twitter' },
                    { Icon: LinkedInIcon, label: 'LinkedIn' },
                    { Icon: FacebookIcon, label: 'Facebook' },
                    { Icon: WhatsAppIcon, label: 'WhatsApp' },
                  ].map(({ Icon, label }) => (
                    <button
                      key={label}
                      title={label}
                      className="size-10 rounded-full bg-[#f1f5f9] flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors duration-150"
                    >
                      <Icon style={{ fontSize: 16 }} />
                    </button>
                  ))}
                </div>
                <SaveButton contentType="blogpost" objectId={post.id} />
              </div>

              <div className="flex items-center gap-8">
                {prevPost && (
                  <Link
                    to={`/blog/${prevPost.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="size-10 rounded-full border border-[#e2e8f0] flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                      <ChevronLeftIcon style={{ fontSize: 18 }} />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#62748e]">Older Post</p>
                      <p className="text-sm font-bold text-[#0f172a] max-w-45 truncate">{prevPost.title}</p>
                    </div>
                  </Link>
                )}
                {nextPost && (
                  <Link
                    to={`/blog/${nextPost.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#62748e]">Newer Post</p>
                      <p className="text-sm font-bold text-[#0f172a] max-w-45 truncate">{nextPost.title}</p>
                    </div>
                    <div className="size-10 rounded-full border border-[#e2e8f0] flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                      <ChevronRightIcon style={{ fontSize: 18 }} />
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* ── COMMENTS ───────────────────────────────────────────────── */}
            <CommentSection contentType="blogpost" objectId={post.id} />
          </article>

          {/* ── RIGHT: SIDEBAR ───────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col gap-12 w-85 shrink-0 sticky top-24">

            {/* Search */}
            <div className="flex items-center bg-[#fcfcfc] border border-[#e2e8f0] rounded-xl overflow-hidden">
              <input
                type="text"
                placeholder="Search post..."
                className="flex-1 px-4 py-3 text-sm text-[#1d293d] placeholder-[#90a1b9] bg-transparent outline-none"
              />
              <button className="bg-[#c1c1c1] hover:bg-primary transition-colors px-5 py-3.5">
                <SearchIcon style={{ fontSize: 18 }} className="text-white" />
              </button>
            </div>

            {/* Recent Posts */}
            <div className="bg-[#fcfcfc] border border-[#f1f5f9] rounded-2xl p-8">
              <h3 className="text-xl font-bold text-[#0f172a] mb-6">Recent Posts</h3>
              <div className="space-y-6">
                {recentPosts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/blog/${p.id}`}
                    className="flex items-center gap-4 group"
                  >
                    <div className="size-18 rounded-3xl overflow-hidden shrink-0">
                      <img
                        src={p.image_url ?? FALLBACK_IMAGE}
                        alt={p.title}
                        className="w-full h-full object-cover opacity-80"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0f172a] leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {p.title}
                      </p>
                      <p className="text-xs text-[#90a1b9] mt-1">{p.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-[#fcfcfc] border border-[#f1f5f9] rounded-2xl p-8">
              <h3 className="text-xl font-bold text-[#0f172a] mb-6">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-white border border-[#e2e8f0] rounded-full px-4 py-2 text-xs font-medium text-[#62748e]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact card */}
            <div className="gradient-brand rounded-3xl p-8 shadow-lg relative overflow-hidden">
              <h3 className="text-xl font-bold text-white mb-6">
                Don&apos;t Hesitate To Contact Us
              </h3>
              <div className="space-y-6 mb-8">
                {[
                  { Icon: PhoneOutlinedIcon, label: 'Call Us', value: '+91 98765 43210' },
                  { Icon: MailOutlinedIcon,   label: 'Email Us', value: 'info@genextechnocrats.in' },
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
