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
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import { PageMeta } from '@/components/seo/PageMeta'
import { POSTS, BLOG_IMAGES } from '@/config/blogPosts'
import { CommentSection } from '@/components/gelearn/CommentSection'

// ── Placeholder lorem ipsum body paragraphs ──────────────────────────────────
const LOREM_P1 = 'At Genex, we build monitoring and control platforms that integrate across every facet of power infrastructure. Our goal is straightforward: to enable plant operators, utilities, and developers to deploy advanced software with confidence — enhancing visibility, decision-making, and operational resilience across India\'s energy sector.'

const LOREM_P2 = 'Nisl eget tellus ultrices velit at elit. Ipsum fermentum fusce platea neque blandit. Ultrices volutpat mi in vitae viverra et ullamcorper lorem. Malesuada malesuada lorem eget in nec pellentesque pellentesque enim. Sapien sed pulvinar nulla lobortis. At vulputate suspendisse quam sit ut dui ac. Sed scelerisque eget vitae morbi a feugiat eleifend aliquam commodo. Viverra dolor tortor vestibulum sed orci quam. Non placerat laoreet sed lacinia leo. Enim amet nulla sed elementum et quis consectetur consequat risus. Facilisi enim dui quis ut vitae elit.'

const LOREM_P3 = 'Nisl eget tellus ultrices velit at elit. Ipsum fermentum fusce platea neque blandit. Ultrices volutpat mi in vitae viverra et ullamcorper lorem. Malesuada malesuada lorem eget in nec pellentesque pellentesque enim. Sapien sed pulvinar nulla lobortis. At vulputate suspendisse quam sit ut dui ac. Sed scelerisque eget vitae morbi a feugiat eleifend aliquam commodo. Viverra dolor tortor vestibulum sed orci quam.'

const LOREM_P4 = 'Sit ut non scelerisque magna cras etiam suspendisse. Eget leo nunc purus in vitae ut vestibulum tristique. Tortor nascetur morbi tincidunt ornare dignissim. Massa amet tellus mauris pharetra egestas. Lorem netus tincidunt commodo ac condimentum eget dui mauris sit.'

const BLOCKQUOTE = '"Our monitoring platform revealed performance gaps we had never quantified before. We corrected a systemic soiling loss, improved energy yield by 8%, and reduced O&M response time by over 60%."'

// ── Tags ─────────────────────────────────────────────────────────────────────
const TAGS = ['SCADA', 'Solar', 'Wind', 'EMS', 'Grid', 'Monitoring', 'IoT', 'Renewables', 'Automation', 'BESS', 'EV', 'Protocols']

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BlogPost() {
  const { id } = useParams<{ id: string }>()
  const postId = Number(id)
  const post = POSTS.find(p => p.id === postId)

  if (!post) return <Navigate to="/gelearn/blog" replace />

  const heroImg   = BLOG_IMAGES[(post.id - 1) % BLOG_IMAGES.length]
  const inlineImg1 = BLOG_IMAGES[(post.id) % BLOG_IMAGES.length]
  const inlineImg2 = BLOG_IMAGES[(post.id + 1) % BLOG_IMAGES.length]

  const prevPost = POSTS.find(p => p.id === post.id - 1)
  const nextPost = POSTS.find(p => p.id === post.id + 1)

  return (
    <main>
      <PageMeta
        title={`${post.title} — Genex Blog`}
        description={post.excerpt}
        canonical={`/gelearn/blog/${post.id}`}
      />

      {/* ── BREADCRUMB ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e2e8f0] py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#62748e]">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRightIcon style={{ fontSize: 14 }} />
          <Link to="/gelearn/blog" className="hover:text-primary transition-colors">Blog</Link>
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

            {/* Body paragraphs */}
            <div className="space-y-5 mb-8">
              <p className="text-[17px] text-[#45556c] leading-[1.63]">{LOREM_P1}</p>
              <p className="text-[17px] text-[#45556c] leading-[1.63]">{LOREM_P2}</p>
            </div>

            {/* 2-col inline images */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="rounded-2xl overflow-hidden aspect-4/3 shadow-sm">
                <img src={inlineImg1} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-4/3 shadow-sm">
                <img src={inlineImg2} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* More body */}
            <div className="space-y-5 mb-8">
              <p className="text-[17px] text-[#45556c] leading-[1.63]">{LOREM_P3}</p>
              <p className="text-[17px] text-[#45556c] leading-[1.63]">{LOREM_P4}</p>
            </div>

            {/* Blockquote */}
            <div className="bg-[#f8fafc] rounded-3xl p-12 mb-8 relative">
              <FormatQuoteIcon
                style={{ fontSize: 64 }}
                className="absolute top-8 left-8 text-[#0f172a] opacity-10"
              />
              <div className="border-l-4 border-[#0f172a] pl-10">
                <p className="text-xl font-bold text-[#0f172a] leading-[1.6] mb-8">{BLOCKQUOTE}</p>
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-[#e2e8f0] flex items-center justify-center text-sm font-bold text-[#62748e] shrink-0">
                    R
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#0f172a]">Rakesh Tiwari</p>
                    <p className="text-sm text-[#62748e]">Plant Manager, 50 MW Solar Asset</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Final paragraphs */}
            <div className="space-y-5 mb-10">
              <p className="text-[17px] text-[#45556c] leading-[1.63]">{LOREM_P4}</p>
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
              </div>

              <div className="flex items-center gap-8">
                {prevPost && (
                  <Link
                    to={`/gelearn/blog/${prevPost.id}`}
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
                    to={`/gelearn/blog/${nextPost.id}`}
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
                {POSTS.slice(0, 3).map(p => (
                  <Link
                    key={p.id}
                    to={`/gelearn/blog/${p.id}`}
                    className="flex items-center gap-4 group"
                  >
                    <div className="size-18 rounded-3xl overflow-hidden shrink-0">
                      <img
                        src={BLOG_IMAGES[(p.id - 1) % BLOG_IMAGES.length]}
                        alt={p.title}
                        className="w-full h-full object-cover opacity-80"
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
                {TAGS.map(tag => (
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
              <Link
                to="/contact"
                className="block w-full bg-white text-[#0b1b22] text-base font-bold text-center py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
              >
                Get In Touch
              </Link>
            </div>

          </aside>
        </div>
      </section>
    </main>
  )
}
