import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import MailOutlinedIcon from '@mui/icons-material/MailOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl } from '@/lib/utils'
import { marketingPath } from '@/lib/host'
import { useAuth } from '@/context/useAuth'
import type { User } from '@/types/auth'

export function SettingsTab() {
  const { user, refetch } = useAuth()
  const [displayName, setDisplayName] = useState(user?.display_name ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword1, setNewPassword1] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  if (!user) return null

  async function handleSaveProfile() {
    setSavingProfile(true)
    setProfileSaved(false)
    try {
      await apiFetch('/api/accounts/me/', { method: 'PATCH', body: { display_name: displayName, bio } })
      await refetch()
      setProfileSaved(true)
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleUpload(field: 'avatar' | 'cover-photo', file: File, setUploading: (v: boolean) => void) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await apiFetch<User>(`/api/accounts/me/${field}/`, { method: 'POST', body: formData })
      await refetch()
    } finally {
      setUploading(false)
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

  return (
    <div>
      <h1 className="text-xl font-extrabold text-text-primary mb-5">Edit Profile &amp; Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div className="flex flex-col gap-5 max-w-2xl flex-1 min-w-0">

      {/* Profile */}
      <section className="border border-border rounded-2xl p-5">
        <p className="text-sm font-bold text-text-primary mb-4">Profile</p>

        <div
          className="h-28 rounded-t-xl relative overflow-hidden -mb-7 bg-gradient-to-br from-primary to-secondary bg-cover bg-center"
          style={user.cover_photo_url ? { backgroundImage: `url(${getMediaUrl(user.cover_photo_url)})` } : undefined}
        >
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-dark-bg/40 border border-white/50 text-white text-xs font-bold px-3 py-1.5 rounded-full disabled:opacity-60"
          >
            <PhotoCameraOutlinedIcon sx={{ fontSize: 13 }} />
            {uploadingCover ? 'Uploading…' : 'Change Cover'}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) void handleUpload('cover-photo', file, setUploadingCover)
              e.target.value = ''
            }}
          />
        </div>

        <div className="mb-5 relative w-16">
          <div className="w-16 h-16 rounded-full border-4 border-white bg-primary text-white font-extrabold flex items-center justify-center text-lg shrink-0 shadow-sm overflow-hidden">
            {user.avatar_url ? (
              <img src={getMediaUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
            ) : (
              (user.display_name || user.username).slice(0, 2).toUpperCase()
            )}
          </div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            aria-label={uploadingAvatar ? 'Uploading photo…' : 'Change photo'}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-border text-text-muted flex items-center justify-center shadow-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
          >
            <PhotoCameraOutlinedIcon sx={{ fontSize: 12 }} />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) void handleUpload('avatar', file, setUploadingAvatar)
              e.target.value = ''
            }}
          />
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
      <div className="w-full lg:w-72 shrink-0 border border-border rounded-2xl p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-text-muted mb-4">How others see you</p>

        <div
          className="h-14 rounded-xl bg-gradient-to-br from-primary to-secondary bg-cover bg-center"
          style={user.cover_photo_url ? { backgroundImage: `url(${getMediaUrl(user.cover_photo_url)})` } : undefined}
        />
        <div className="w-11 h-11 rounded-full ring-4 ring-white bg-primary text-white font-extrabold flex items-center justify-center text-sm overflow-hidden -mt-5 ml-3 relative mb-3">
          {user.avatar_url ? (
            <img src={getMediaUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
          ) : (
            (user.display_name || user.username).slice(0, 2).toUpperCase()
          )}
        </div>
        <p className="font-bold text-sm text-text-primary">{user.display_name || user.username}</p>
        {user.bio && (
          <p className="text-xs text-text-muted leading-relaxed mt-1.5 line-clamp-3">{user.bio}</p>
        )}
        <Link to={`/u/${user.username}`} className="block mt-4">
          <Button variant="secondary" size="sm" className="w-full justify-center">View Full Public Profile</Button>
        </Link>
      </div>

      </div>
    </div>
  )
}
