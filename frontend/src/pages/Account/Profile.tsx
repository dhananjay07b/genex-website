import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'
import { useAuth } from '@/context/useAuth'
import type { UserBlogPost } from '@/types/auth'

const STATUS_LABEL: Record<UserBlogPost['status'], string> = {
  draft: 'Draft',
  pending: 'Pending Review',
  published: 'Published',
  rejected: 'Rejected',
}

const STATUS_COLOR: Record<UserBlogPost['status'], string> = {
  draft: 'bg-[#f1f5f9] text-[#62748e]',
  pending: 'bg-[#fffbeb] text-[#b45309]',
  published: 'bg-[#ecfdf5] text-[#047857]',
  rejected: 'bg-[#fef2f2] text-[#b91c1c]',
}

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<UserBlogPost[]>([])

  useEffect(() => {
    apiFetch<UserBlogPost[]>('/api/snippets/blog-submissions/mine/').then(setSubmissions).catch(() => setSubmissions([]))
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <main>
      <PageMeta title="My Account — Genex GeLearn" description="Manage your Genex GeLearn account." canonical="/account" />
      <PageHero label="Account" headline={`Welcome, ${user.display_name || user.username}`} subline={`Membership tier: ${user.membership_tier.name}`} />

      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div>
              <p className="text-sm text-text-muted">Signed in as</p>
              <p className="text-lg font-bold text-text-primary">{user.email}</p>
            </div>
            <div className="flex gap-3">
              <Link to="/gelearn/submit-post" className="inline-flex">
                <Button variant="primary" size="md">Submit a Post</Button>
              </Link>
              <Button variant="secondary" size="md" onClick={handleLogout}>Log Out</Button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-4">My Blog Submissions</h2>
            {submissions.length === 0 ? (
              <p className="text-sm text-text-muted">You haven&apos;t submitted any posts yet.</p>
            ) : (
              <div className="space-y-4">
                {submissions.map(s => (
                  <div key={s.id} className="flex items-center justify-between gap-4 border border-border rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-text-primary">{s.title}</p>
                      <p className="text-xs text-text-muted mt-1">{s.excerpt}</p>
                      {s.status === 'rejected' && s.rejection_reason && (
                        <p className="text-xs text-red-500 mt-1">Reason: {s.rejection_reason}</p>
                      )}
                    </div>
                    <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[s.status]}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
