import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import MailOutlinedIcon from '@mui/icons-material/MailOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl } from '@/lib/utils'
import { marketingPath } from '@/lib/host'
import { useAuth } from '@/context/useAuth'
import type { User } from '@/types/auth'
import type { Topic } from '@/types/api'

export function SettingsTab() {
  const { user, refetch } = useAuth()
  const [displayName, setDisplayName] = useState(user?.display_name ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [company, setCompany] = useState(user?.company ?? '')
  const [roleTitle, setRoleTitle] = useState(user?.role_title ?? '')
  const [yearsExperience, setYearsExperience] = useState(user?.years_experience?.toString() ?? '')
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url ?? '')
  const [expertise, setExpertise] = useState<number[]>(user?.expertise ?? [])
  const [topics, setTopics] = useState<Topic[]>([])
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword1, setNewPassword1] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Photo/cover changes are staged locally (file + object-URL preview, or a
  // "remove" flag) and only sent to the server when Save Changes is clicked,
  // alongside the text fields — one save action for the whole form.
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverRemoved, setCoverRemoved] = useState(false)

  useEffect(() => {
    apiFetch<Topic[]>('/api/snippets/topics/').then(setTopics).catch(() => setTopics([]))
  }, [])

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    if (coverPreview) URL.revokeObjectURL(coverPreview)
  }, [avatarPreview, coverPreview])

  if (!user) return null

  function toggleExpertise(topicId: number) {
    setExpertise(prev => {
      if (prev.includes(topicId)) return prev.filter(id => id !== topicId)
      if (prev.length >= 3) return prev
      return [...prev, topicId]
    })
  }

  function handleSelectAvatar(file: File) {
    setAvatarFile(file)
    setAvatarRemoved(false)
    setAvatarPreview(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  function handleRemoveAvatar() {
    setAvatarFile(null)
    setAvatarPreview(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setAvatarRemoved(true)
  }

  function handleSelectCover(file: File) {
    setCoverFile(file)
    setCoverRemoved(false)
    setCoverPreview(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  async function handleSaveProfile() {
    setSavingProfile(true)
    setProfileSaved(false)
    try {
      if (avatarFile) {
        const formData = new FormData()
        formData.append('file', avatarFile)
        await apiFetch<User>('/api/accounts/me/avatar/', { method: 'POST', body: formData })
      } else if (avatarRemoved) {
        await apiFetch<User>('/api/accounts/me/avatar/', { method: 'DELETE' })
      }

      if (coverFile) {
        const formData = new FormData()
        formData.append('file', coverFile)
        await apiFetch<User>('/api/accounts/me/cover-photo/', { method: 'POST', body: formData })
      } else if (coverRemoved) {
        await apiFetch<User>('/api/accounts/me/cover-photo/', { method: 'DELETE' })
      }

      await apiFetch('/api/accounts/me/', {
        method: 'PATCH',
        body: {
          display_name: displayName,
          bio,
          company,
          role_title: roleTitle,
          years_experience: yearsExperience ? Number(yearsExperience) : null,
          linkedin_url: linkedinUrl,
          expertise,
        },
      })

      await refetch()
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      if (coverPreview) URL.revokeObjectURL(coverPreview)
      setAvatarFile(null)
      setAvatarPreview(null)
      setAvatarRemoved(false)
      setCoverFile(null)
      setCoverPreview(null)
      setCoverRemoved(false)
      setProfileSaved(true)
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword() {
    setPasswordStatus('saving')
    try {
      await apiFetch('/api/auth/password/change/', {
        method: 'POST',
        body: { old_password: oldPassword, new_password1: newPassword1, new_password2: newPassword2 },
      })
      setPasswordStatus('saved')
      setOldPassword('')
      setNewPassword1('')
      setNewPassword2('')
    } catch {
      setPasswordStatus('error')
    }
  }

  const previewInitials = (displayName || user.username).slice(0, 2).toUpperCase()
  const previewExpertise = topics.filter(t => expertise.includes(t.id))
  const roleAtCompany = roleTitle && company ? `${roleTitle} at ${company}` : (roleTitle || company)

  const avatarSrc = avatarFile ? avatarPreview : avatarRemoved ? null : (user.avatar_url ? getMediaUrl(user.avatar_url) : null)
  const coverSrc = coverFile ? coverPreview : coverRemoved ? null : (user.cover_photo_url ? getMediaUrl(user.cover_photo_url) : null)

  const hasUnsavedChanges =
    displayName !== (user.display_name ?? '') ||
    bio !== (user.bio ?? '') ||
    company !== (user.company ?? '') ||
    roleTitle !== (user.role_title ?? '') ||
    yearsExperience !== (user.years_experience?.toString() ?? '') ||
    linkedinUrl !== (user.linkedin_url ?? '') ||
    expertise.length !== user.expertise.length ||
    expertise.some(id => !user.expertise.includes(id)) ||
    !!avatarFile || avatarRemoved || !!coverFile || coverRemoved

  return (
    <div>
      <h1 className="text-xl font-extrabold text-text-primary mb-5">Edit Profile &amp; Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div className="flex flex-col gap-5 max-w-2xl flex-1 min-w-0">

      {/* Profile */}
      <section className="border border-border rounded-2xl p-5">
        <p className="text-sm font-bold text-text-primary mb-4">Profile</p>

        <div
          className="h-28 rounded-t-xl relative overflow-hidden -mb-7 bg-linear-to-br from-primary to-secondary bg-cover bg-center"
          style={coverSrc ? { backgroundImage: `url(${coverSrc})` } : undefined}
        >
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={savingProfile}
            className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-dark-bg/40 border border-white/50 text-white text-xs font-bold px-3 py-1.5 rounded-full disabled:opacity-60"
          >
            <PhotoCameraOutlinedIcon sx={{ fontSize: 13 }} />
            Change Cover
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleSelectCover(file)
              e.target.value = ''
            }}
          />
        </div>

        <div className="mb-5 flex flex-col items-center">
          <div className="relative w-28 h-28">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-primary text-white font-extrabold flex items-center justify-center text-3xl shrink-0 shadow-sm overflow-hidden">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              ) : (
                (user.display_name || user.username).slice(0, 2).toUpperCase()
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={savingProfile}
              aria-label="Change photo"
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border border-border text-text-muted flex items-center justify-center shadow-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
            >
              <PhotoCameraOutlinedIcon sx={{ fontSize: 15 }} />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleSelectAvatar(file)
                e.target.value = ''
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleRemoveAvatar}
            disabled={!avatarSrc || savingProfile}
            className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-text-muted disabled:opacity-40 disabled:pointer-events-none hover:text-red-600 transition-colors"
          >
            <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
            Remove Photo
          </button>
          <p className="text-[11px] text-text-muted mt-2">Photo and cover changes apply when you click Save Changes below.</p>
        </div>

        <div className="flex flex-col gap-4">
          <Input label="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Company" placeholder="e.g. Genex Technocrats" value={company} onChange={e => setCompany(e.target.value)} />
            <Input label="Role" placeholder="e.g. Deputy GM, Grid Operations" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Years of Experience"
              type="number"
              min={0}
              max={99}
              placeholder="e.g. 12"
              value={yearsExperience}
              onChange={e => setYearsExperience(e.target.value)}
            />
            <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/…" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-semibold text-text-primary block mb-1.5">Areas of Expertise (up to 3)</label>
            <div className="flex flex-wrap gap-2">
              {topics.map(topic => {
                const active = expertise.includes(topic.id)
                const disabled = !active && expertise.length >= 3
                return (
                  <button
                    key={topic.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleExpertise(topic.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      active
                        ? 'bg-primary text-white border-primary'
                        : disabled
                          ? 'bg-surface text-text-muted/50 border-border cursor-not-allowed'
                          : 'bg-white text-text-primary border-border hover:border-primary'
                    }`}
                  >
                    {topic.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" size="md" disabled={savingProfile} onClick={handleSaveProfile}>
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </Button>
            {profileSaved && <span className="text-xs font-semibold text-secondary">Saved.</span>}
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="border border-border rounded-2xl p-5">
        <p className="text-sm font-bold text-text-primary mb-4">Account</p>
        <div className="flex flex-col gap-4">
          <Input label="Username" value={user.username} disabled />
          <Input label="Email" value={user.email} disabled />
          <p className="text-xs text-text-muted -mt-2">
            Email changes aren&apos;t available from here yet — contact support if you need to update it.
          </p>

          <div className="border-t border-border pt-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-text-primary">Change Password</p>
            <Input
              label="Current Password"
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword1}
              onChange={e => setNewPassword1(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={newPassword2}
              onChange={e => setNewPassword2(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                disabled={passwordStatus === 'saving' || !oldPassword || !newPassword1 || !newPassword2}
                onClick={handleChangePassword}
              >
                {passwordStatus === 'saving' ? 'Updating…' : 'Update Password'}
              </Button>
              {passwordStatus === 'saved' && <span className="text-xs font-semibold text-secondary">Password updated.</span>}
              {passwordStatus === 'error' && <span className="text-xs font-semibold text-red-600">Couldn&apos;t update password.</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="border border-border rounded-2xl p-5">
        <p className="text-sm font-bold text-text-primary mb-1.5">Notifications</p>
        <p className="text-xs text-text-muted leading-relaxed">
          Blog status updates and replies to your comments show up in the bell icon at the top of your dashboard.
          Email notifications for these — and the GeLearn newsletter — aren&apos;t available yet; this panel will
          grow email preferences once that&apos;s built.
        </p>
      </section>

      {/* Need help */}
      <section className="border border-border rounded-2xl p-5 bg-surface">
        <div className="flex items-center gap-2 mb-2.5">
          <HelpOutlineOutlinedIcon sx={{ fontSize: 16 }} className="text-primary" />
          <p className="text-sm font-bold text-text-primary">Need help?</p>
        </div>
        <p className="text-xs text-text-muted leading-relaxed mb-3">
          Questions about your account, a submission, or anything else — reach out any time.
        </p>
        <div className="flex flex-col gap-1.5">
          <a
            href="mailto:info@genextechnocrats.com"
            className="flex items-center gap-2 text-xs font-semibold text-text-primary hover:text-primary transition-colors"
          >
            <MailOutlinedIcon sx={{ fontSize: 14 }} className="shrink-0 text-text-muted" />
            info@genextechnocrats.com
          </a>
          <a
            href={marketingPath('/contact')}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary transition-colors"
          >
            Contact Us <ArrowForwardIcon sx={{ fontSize: 12 }} />
          </a>
        </div>
      </section>

      </div>

      {/* How others see you */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
        <div className="border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">How others see you</p>
            {hasUnsavedChanges && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 shrink-0">Unsaved</span>
            )}
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed mb-3">
            This preview updates as you type below — it only becomes real for other people once you click Save Changes.
          </p>

          <div
            className="h-14 rounded-xl bg-linear-to-br from-primary to-secondary bg-cover bg-center"
            style={coverSrc ? { backgroundImage: `url(${coverSrc})` } : undefined}
          />
          <div className="w-11 h-11 rounded-full ring-4 ring-white bg-primary text-white font-extrabold flex items-center justify-center text-sm overflow-hidden -mt-5 ml-3 relative mb-3">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
            ) : (
              previewInitials
            )}
          </div>
          <p className="font-bold text-sm text-text-primary">{displayName || user.username}</p>
          {roleAtCompany && <p className="text-xs text-text-primary font-semibold mt-0.5">{roleAtCompany}</p>}
          {bio && (
            <p className="text-xs text-text-muted leading-relaxed mt-1.5 line-clamp-3">{bio}</p>
          )}
          <Link to={`/u/${user.username}`} className="block mt-4">
            <Button variant="secondary" size="sm" className="w-full justify-center">View Full Public Profile</Button>
          </Link>
        </div>

        {/* Mini Profile preview */}
        <div className="border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Mini Profile preview</p>
            {hasUnsavedChanges && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 shrink-0">Unsaved</span>
            )}
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed mb-3">
            Shown when someone hovers your name on a post you&apos;ve published — not visible to them until you save.
          </p>
          <div className="bg-white border border-border rounded-2xl shadow-sm p-4 flex items-start gap-3">
            <span className="size-14 rounded-full bg-primary text-white text-lg font-extrabold flex items-center justify-center overflow-hidden shrink-0">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              ) : (
                previewInitials
              )}
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-bold text-text-primary truncate">{displayName || user.username}</p>
              {roleAtCompany && (
                <p className="flex items-center justify-start gap-1.5 text-xs text-text-muted mt-1 truncate">
                  <WorkOutlineOutlinedIcon sx={{ fontSize: 13 }} className="shrink-0 text-primary" />
                  {roleAtCompany}
                </p>
              )}
              {yearsExperience && <p className="text-[11px] text-text-muted mt-1">{yearsExperience} years of experience</p>}
              {bio && <p className="text-xs text-text-muted leading-relaxed mt-2 line-clamp-2">{bio}</p>}
              {previewExpertise.length > 0 && (
                <div className="flex flex-wrap justify-start gap-1.5 mt-2">
                  {previewExpertise.map(topic => (
                    <span key={topic.id} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary">
                      {topic.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel preview */}
        <div className="border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Side Panel preview</p>
            {hasUnsavedChanges && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 shrink-0">Unsaved</span>
            )}
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed mb-3">
            Shown when someone clicks your name to view your details in the slide-over panel — not visible to them until you save.
          </p>
          <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
            <div
              className="h-16 bg-linear-to-br from-primary to-secondary bg-cover bg-center"
              style={coverSrc ? { backgroundImage: `url(${coverSrc})` } : undefined}
            />
            <div className="px-4 -mt-7">
              <span className="size-14 rounded-full bg-primary text-white text-lg font-extrabold flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                ) : (
                  previewInitials
                )}
              </span>
            </div>
            <div className="px-4 pt-2 pb-4">
              <p className="text-sm font-extrabold text-text-primary">{displayName || user.username}</p>
              {roleAtCompany && <p className="text-xs text-text-primary font-semibold mt-1">{roleAtCompany}</p>}
              {yearsExperience && <p className="text-[11px] text-text-muted mt-0.5">{yearsExperience} years of experience</p>}
              {previewExpertise.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {previewExpertise.map(topic => (
                    <span key={topic.id} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary">
                      {topic.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      </div>
    </div>
  )
}
