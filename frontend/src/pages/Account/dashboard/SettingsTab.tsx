import { useEffect, useRef, useState, type FormEvent, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import MailOutlinedIcon from '@mui/icons-material/MailOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button, buttonVariants } from '@/components/ui/Button'
import { GoogleGlyph } from '@/components/auth/GoogleLoginButton'
import { GOOGLE_CONFIGURED, requestGoogleCode, useGoogleReady } from '@/components/auth/googleCode'
import { apiFetch, ApiError } from '@/lib/api/client'
import { WorkEmailCard } from './WorkEmailCard'
import { UnverifiedCompanyNote } from '@/components/auth/UnverifiedCompanyNote'
import { cn, getMediaUrl, formatDisplayDate } from '@/lib/utils'
import { marketingPath } from '@/lib/host'
import { IMAGE_ACCEPT, imageProblem } from '@/lib/imageUpload'
import { useAuth } from '@/context/useAuth'
import { OTHER_COMPANY, companyOptions, useCompanies } from '@/hooks/useCompanies'
import type { AccountType, SocialAccount, User } from '@/types/auth'
import { CertificatePrivacy } from './CertificatePrivacy'
import { TopicPicker } from '@/components/gelearn/TopicPicker'
import type { CareerRole, Topic } from '@/types/api'

const PROVIDER_LABEL: Record<string, string> = { google: 'Google' }
const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = { learner: 'Learner', professional: 'Professional', company: 'Company' }
const PROVIDER_ICON: Record<string, () => ReactElement> = { google: GoogleGlyph }

/** Warns before the page is closed or reloaded while `when` is true. */
function WarnOnLeave({ when }: { when: boolean }) {
  useEffect(() => {
    if (!when) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [when])
  return null
}

export function SettingsTab() {
  const { user, refetch } = useAuth()
  const [displayName, setDisplayName] = useState(user?.display_name ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  // Fixed at registration — only Genex can change it.
  const accountType: AccountType = user?.account_type ?? 'learner'
  const [companyOther, setCompanyOther] = useState(user?.company_other ?? '')
  const isCompanyAccount = user?.account_type === 'company'
  // Experience and expertise describe a Professional; a career goal is a Learner's.
  const isProfessional = accountType === 'professional'
  const isLearner = accountType === 'learner'
  const linkedCompany = user?.company?.slug ? user.company : null
  const { companies } = useCompanies()
  // null = untouched: the choice then mirrors what's saved on the account.
  const [companyChoiceEdit, setCompanyChoiceEdit] = useState<string | null>(null)
  const savedCompanyChoice = linkedCompany
    ? String(companies.find(c => c.slug === linkedCompany.slug)?.id ?? '')
    : user?.company_other ? OTHER_COMPANY : ''
  const companyChoice = companyChoiceEdit ?? savedCompanyChoice
  const selectedCompany = companies.find(c => String(c.id) === companyChoice)
  const [profileError, setProfileError] = useState('')
  const [roleTitle, setRoleTitle] = useState(user?.role_title ?? '')
  const [yearsExperience, setYearsExperience] = useState(user?.years_experience?.toString() ?? '')
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url ?? '')
  const [expertise, setExpertise] = useState<number[]>(user?.expertise ?? [])
  const [topics, setTopics] = useState<Topic[]>([])
  const [careerGoal, setCareerGoal] = useState(user?.career_goal ? String(user.career_goal) : '')
  const [roles, setRoles] = useState<CareerRole[]>([])
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword1, setNewPassword1] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [passwordError, setPasswordError] = useState('')
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({})

  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
  const [disconnectingId, setDisconnectingId] = useState<number | null>(null)
  const [socialError, setSocialError] = useState('')
  const [connectingGoogle, setConnectingGoogle] = useState(false)
  const googleReady = useGoogleReady(setSocialError)

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
  // A picked file that can't be uploaded (wrong format, too big): shown at once, nothing staged.
  const [photoError, setPhotoError] = useState('')

  useEffect(() => {
    apiFetch<Topic[]>('/api/snippets/topics/').then(setTopics).catch(() => setTopics([]))
  }, [])

  useEffect(() => {
    apiFetch<SocialAccount[]>('/api/accounts/me/social-accounts/').then(setSocialAccounts).catch(() => setSocialAccounts([]))
    apiFetch<CareerRole[]>('/api/learning/roles/').then(setRoles).catch(() => setRoles([]))
  }, [])

  // "Set your goal" on the GeLearn home links to #career-goal: bring the field into view once it has options.
  useEffect(() => {
    if (roles.length && window.location.hash === '#career-goal') {
      document.getElementById('career-goal')?.scrollIntoView({ block: 'center' })
    }
  }, [roles.length])

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    if (coverPreview) URL.revokeObjectURL(coverPreview)
  }, [avatarPreview, coverPreview])

  async function handleDisconnect(id: number) {
    setDisconnectingId(id)
    setSocialError('')
    try {
      await apiFetch(`/api/accounts/me/social-accounts/${id}/`, { method: 'DELETE' })
      setSocialAccounts(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      setSocialError(err instanceof ApiError ? err.message : 'Could not disconnect this account.')
    } finally {
      setDisconnectingId(null)
    }
  }

  function handleConnectGoogle() {
    setSocialError('')
    requestGoogleCode(response => {
      if (!response.code) {
        if (response.error !== 'access_denied') setSocialError("Google didn't finish connecting. Please try again.")
        return
      }
      setConnectingGoogle(true)
      apiFetch<SocialAccount>('/api/accounts/me/social-accounts/google/', { method: 'POST', body: { code: response.code } })
        .then(account => setSocialAccounts(prev => [account, ...prev.filter(a => a.id !== account.id)]))
        .catch(err => setSocialError(err instanceof ApiError ? err.message : "Couldn't connect Google. Please try again."))
        .finally(() => setConnectingGoogle(false))
    }, setSocialError)
  }

  if (!user) return null

  function handleSelectAvatar(file: File) {
    const problem = imageProblem(file)
    setPhotoError(problem ?? '')
    if (problem) return
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
    const problem = imageProblem(file)
    setPhotoError(problem ?? '')
    if (problem) return
    setCoverFile(file)
    setCoverRemoved(false)
    setCoverPreview(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  function handleRemoveCover() {
    setCoverFile(null)
    setCoverPreview(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setCoverRemoved(true)
  }

  /** Sends a staged photo/cover change; returns why it failed, or '' when it worked (or nothing was staged). */
  async function saveImage(endpoint: 'avatar' | 'cover-photo', file: File | null, removed: boolean) {
    try {
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        await apiFetch<User>(`/api/accounts/me/${endpoint}/`, { method: 'POST', body: formData })
      } else if (removed) {
        await apiFetch<User>(`/api/accounts/me/${endpoint}/`, { method: 'DELETE' })
      }
      return ''
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Please try again.'
    }
  }

  async function handleSaveProfile() {
    setProfileError('')
    if (accountType === 'professional' && !isCompanyAccount) {
      if (!companyChoice) return setProfileError("Select your company, or choose 'Other'.")
      if (companyChoice === OTHER_COMPANY && !companyOther.trim()) return setProfileError('Enter your company name.')
      if (!roleTitle.trim()) return setProfileError('Role is required for a Professional profile.')
    }
    setSavingProfile(true)
    setProfileSaved(false)
    // The text first: if it's refused, nothing changes (photos included) and the form says why.
    try {
      await apiFetch('/api/accounts/me/', {
        method: 'PATCH',
        body: {
          display_name: displayName,
          bio,
          ...(accountType === 'professional' && !isCompanyAccount
            ? companyChoice === OTHER_COMPANY
              ? { company_id: null, company_other: companyOther }
              : { company_id: Number(companyChoice) }
            : {}),
          role_title: isLearner ? '' : roleTitle,
          linkedin_url: linkedinUrl,
          ...(isProfessional ? { years_experience: yearsExperience ? Number(yearsExperience) : null, expertise } : {}),
          ...(isLearner ? { career_goal: careerGoal ? Number(careerGoal) : null } : {}),
        },
      })
    } catch (err) {
      const fields = err instanceof ApiError ? err.fields : {}
      setProfileError(
        fields.company_id ?? fields.company_other ?? fields.role_title ?? fields.account_type
          ?? (fields.linkedin_url && `LinkedIn URL: ${fields.linkedin_url}`)
          ?? (fields.years_experience && `Years of experience: ${fields.years_experience}`)
          ?? (err instanceof ApiError ? err.message : "Couldn't save your profile. Please try again."),
      )
      setSavingProfile(false)
      return
    }

    const photoFailed = await saveImage('avatar', avatarFile, avatarRemoved)
    const coverFailed = await saveImage('cover-photo', coverFile, coverRemoved)
    await refetch().catch(() => {})
    // Cleared either way: a refused file can't be sent again as it is; the page shows what's saved.
    setAvatarFile(null)
    setAvatarPreview(null)
    setAvatarRemoved(false)
    setCoverFile(null)
    setCoverPreview(null)
    setCoverRemoved(false)
    setCompanyChoiceEdit(null)
    if (photoFailed || coverFailed) {
      const failures = [
        photoFailed && `Your photo wasn't saved: ${photoFailed}`,
        coverFailed && `Your cover photo wasn't saved: ${coverFailed}`,
      ]
      setProfileError(['Profile saved.', ...failures.filter(Boolean)].join(' '))
    } else {
      setProfileSaved(true)
    }
    setSavingProfile(false)
  }


  // A Google sign-up has no password yet: it sets one, without a current password.
  const hasPassword = user.has_password

  function editPassword(setter: (value: string) => void, value: string) {
    setter(value)
    if (passwordStatus !== 'saving') setPasswordStatus('idle')
    setPasswordFieldErrors({})
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setPasswordFieldErrors({})
    if (newPassword1 !== newPassword2) {
      setPasswordFieldErrors({ new_password2: "The two new passwords don't match." })
      return
    }
    setPasswordStatus('saving')
    try {
      await apiFetch('/api/auth/password/change/', {
        method: 'POST',
        body: { ...(hasPassword ? { old_password: oldPassword } : {}), new_password1: newPassword1, new_password2: newPassword2 },
      })
      setOldPassword('')
      setNewPassword1('')
      setNewPassword2('')
      await refetch()
      setPasswordStatus('saved')
    } catch (err) {
      const fields = err instanceof ApiError ? err.fields : {}
      const fieldErrors = Object.fromEntries(
        ['old_password', 'new_password1', 'new_password2'].filter(key => fields[key]).map(key => [key, fields[key]]),
      )
      setPasswordFieldErrors(fieldErrors)
      setPasswordError(
        Object.keys(fieldErrors).length ? '' : err instanceof ApiError ? err.message : "Couldn't update your password. Please try again.",
      )
      setPasswordStatus('error')
    }
  }

  const previewInitials = (displayName || user.username).slice(0, 2).toUpperCase()
  const previewExpertise = isProfessional ? topics.filter(t => expertise.includes(t.id)) : []
  const previewYears = isProfessional ? yearsExperience : ''
  const companyName = accountType === 'learner'
    ? ''
    : selectedCompany?.name ?? (companyChoice === OTHER_COMPANY ? companyOther : linkedCompany?.name ?? '')
  const roleAtCompany = roleTitle && companyName ? `${roleTitle} at ${companyName}` : (roleTitle || companyName)

  const avatarSrc = avatarFile ? avatarPreview : avatarRemoved ? null : (user.avatar_url ? getMediaUrl(user.avatar_url) : null)
  const coverSrc = coverFile ? coverPreview : coverRemoved ? null : (user.cover_photo_url ? getMediaUrl(user.cover_photo_url) : null)

  const hasUnsavedChanges =
    displayName !== (user.display_name ?? '') ||
    bio !== (user.bio ?? '') ||
    companyOther !== (user.company_other ?? '') ||
    companyChoice !== savedCompanyChoice ||
    roleTitle !== (user.role_title ?? '') ||
    yearsExperience !== (user.years_experience?.toString() ?? '') ||
    linkedinUrl !== (user.linkedin_url ?? '') ||
    expertise.length !== user.expertise.length ||
    expertise.some(id => !user.expertise.includes(id)) ||
    careerGoal !== (user.career_goal ? String(user.career_goal) : '') ||
    !!avatarFile || avatarRemoved || !!coverFile || coverRemoved

  return (
    <div>
      <WarnOnLeave when={hasUnsavedChanges} />
      <h2 className="text-xl font-extrabold text-text-primary mb-5">Edit Profile &amp; Settings</h2>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div className="flex flex-col gap-5 max-w-2xl flex-1 min-w-0">

      {/* Profile */}
      <section className="border border-border rounded-2xl p-5">
        <p className="text-sm font-bold text-text-primary mb-4">Profile</p>

        <div
          className="h-28 rounded-t-xl relative overflow-hidden -mb-7 bg-linear-to-br from-primary to-secondary bg-cover bg-center"
          style={coverSrc ? { backgroundImage: `url(${coverSrc})` } : undefined}
        >
          <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
            {coverSrc && (
              <button
                type="button"
                onClick={handleRemoveCover}
                disabled={savingProfile}
                className="flex items-center gap-1.5 bg-dark-bg/40 border border-white/50 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-dark-bg/60 transition-colors disabled:opacity-60"
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 13 }} />
                Remove Cover
              </button>
            )}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={savingProfile}
              className="flex items-center gap-1.5 bg-dark-bg/40 border border-white/50 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-dark-bg/60 transition-colors disabled:opacity-60"
            >
              <PhotoCameraOutlinedIcon sx={{ fontSize: 13 }} />
              Change Cover
            </button>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
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
              accept={IMAGE_ACCEPT}
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
          {photoError && <p role="alert" className="text-xs font-semibold text-red-600 mt-1.5">{photoError}</p>}
        </div>

        <div className="flex flex-col gap-4">
          <Input label="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-bio" className="text-sm font-semibold text-text-primary">Bio</label>
            <textarea
              id="settings-bio"
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="rounded-md border border-border bg-surface px-3.5 py-3" aria-disabled="true">
            <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <LockOutlinedIcon sx={{ fontSize: 16 }} className="text-text-muted" />
              Account type: {user.is_admin ? 'Admin' : ACCOUNT_TYPE_LABEL[accountType]}
              {isCompanyAccount && linkedCompany ? ` · ${linkedCompany.name}` : ''}
            </p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              {isCompanyAccount
                ? 'Account type and company are managed by Genex.'
                : 'Your account type is set when you sign up and can’t be changed here.'}{' '}
              <a href={marketingPath('/contact')} className="font-semibold text-primary hover:underline">Contact us</a> if you need it changed.
            </p>
          </div>

          {accountType !== 'learner' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isCompanyAccount ? (
                <Input label="Company" value={linkedCompany?.name ?? ''} disabled readOnly />
              ) : (
                <div className="flex flex-col gap-2">
                  <Select
                    label="Company"
                    placeholder="Select your company"
                    options={companyOptions(companies)}
                    value={companyChoice}
                    onChange={e => setCompanyChoiceEdit(e.target.value)}
                  />
                  {companyChoice === OTHER_COMPANY && (
                    <Input placeholder="Company name, e.g. Acme Energy" aria-label="Company name" value={companyOther} onChange={e => setCompanyOther(e.target.value)} />
                  )}
                  {selectedCompany && (selectedCompany.slug === linkedCompany?.slug && user.company_verified ? (
                    <p className="text-xs text-text-muted leading-relaxed">Verified {selectedCompany.name} expert.</p>
                  ) : (
                    <UnverifiedCompanyNote company={selectedCompany} where="settings" />
                  ))}
                </div>
              )}
              <Input label="Role" placeholder="e.g. Deputy GM, Grid Operations" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} />
            </div>
          )}
          {/* Signed up with a personal email? A confirmed work email gets them verified (hidden once verified by sign-in email). */}
          {accountType === 'professional' && !isCompanyAccount && <WorkEmailCard signInEmail={user.email} companyVerified={Boolean(user.company_verified)} />}
          <div className={cn('grid grid-cols-1 gap-4', isProfessional && 'sm:grid-cols-2')}>
            {isProfessional && (
              <Input
                label="Years of Experience"
                type="number"
                min={0}
                max={99}
                placeholder="e.g. 12"
                value={yearsExperience}
                onChange={e => setYearsExperience(e.target.value)}
              />
            )}
            <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/…" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
          </div>

          {isProfessional && <TopicPicker label="Areas of Expertise" value={expertise} onChange={setExpertise} max={3} />}

          {isLearner && (
            <div id="career-goal" className="scroll-mt-28">
              {/* The wrapper keeps id="career-goal" for the GeLearn home's link; the field needs its own. */}
              <Select
                id="career-goal-select"
                label="Career goal"
                options={[{ value: '', label: 'Not set' }, ...roles.map(r => ({ value: String(r.id), label: r.name }))]}
                value={careerGoal}
                onChange={e => setCareerGoal(e.target.value)}
              />
              <p className="text-xs text-text-muted mt-1.5">The role you're working toward. Your GeLearn home suggests courses for it.</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button variant="primary" size="md" disabled={savingProfile} onClick={handleSaveProfile}>
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </Button>
            {profileSaved && !hasUnsavedChanges && <span role="status" className="text-xs font-semibold text-secondary">Saved.</span>}
            {profileError && <span role="alert" className="text-xs font-semibold text-red-600">{profileError}</span>}
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

          <form onSubmit={handleChangePassword} noValidate className="border-t border-border pt-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-text-primary">{hasPassword ? 'Change Password' : 'Set a Password'}</p>
            {!hasPassword && (
              <p className="text-xs text-text-muted -mt-1.5 leading-relaxed">
                You sign in with Google. Set a password to also sign in with {user.email}.
              </p>
            )}
            {/* Lets password managers file the new password under this account. */}
            <input type="email" name="username" autoComplete="username" value={user.email} readOnly hidden />
            {hasPassword && (
              <Input
                label="Current Password"
                type="password"
                autoComplete="current-password"
                value={oldPassword}
                error={passwordFieldErrors.old_password}
                onChange={e => editPassword(setOldPassword, e.target.value)}
              />
            )}
            <Input
              label="New Password"
              type="password"
              autoComplete="new-password"
              value={newPassword1}
              error={passwordFieldErrors.new_password1}
              onChange={e => editPassword(setNewPassword1, e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              value={newPassword2}
              error={passwordFieldErrors.new_password2}
              onChange={e => editPassword(setNewPassword2, e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={passwordStatus === 'saving' || (hasPassword && !oldPassword) || !newPassword1 || !newPassword2}
              >
                {passwordStatus === 'saving' ? 'Saving…' : hasPassword ? 'Update Password' : 'Set Password'}
              </Button>
              {passwordStatus === 'saved' && <span role="status" className="text-xs font-semibold text-secondary">Password saved.</span>}
              {passwordStatus === 'error' && passwordError && <span role="alert" className="text-xs font-semibold text-red-600">{passwordError}</span>}
            </div>
          </form>
        </div>
      </section>

      {/* Connected Socials */}
      <section className="border border-border rounded-2xl p-5">
        <p className="text-sm font-bold text-text-primary mb-1.5">Connected Socials</p>
        <p className="text-xs text-text-muted leading-relaxed mb-4">
          Accounts you can sign in with, besides your password.
        </p>

        {socialAccounts.length === 0 ? (
          <p className="text-sm text-text-muted">No connected accounts yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {socialAccounts.map(account => {
              const Icon = PROVIDER_ICON[account.provider]
              return (
                <div key={account.id} className="flex items-center gap-3 border border-border rounded-xl px-4 py-3">
                  <span className="shrink-0">{Icon ? <Icon /> : null}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary">{PROVIDER_LABEL[account.provider] ?? account.provider}</p>
                    <p className="text-xs text-text-muted truncate">
                      {account.email} · connected {formatDisplayDate(account.date_joined)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disconnectingId === account.id}
                    onClick={() => handleDisconnect(account.id)}
                  >
                    <LinkOffIcon sx={{ fontSize: 15 }} className="mr-1.5" />
                    {disconnectingId === account.id ? 'Disconnecting…' : 'Disconnect'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
        {GOOGLE_CONFIGURED && !socialAccounts.some(a => a.provider === 'google') && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            disabled={!googleReady || connectingGoogle}
            onClick={handleConnectGoogle}
          >
            <span className="mr-2 flex"><GoogleGlyph /></span>
            {connectingGoogle ? 'Connecting…' : 'Connect Google'}
          </Button>
        )}
        {socialError && <p role="alert" className="text-xs font-semibold text-red-600 mt-3">{socialError}</p>}
      </section>

      <CertificatePrivacy />

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
            href="mailto:connect@genextechnocrats.com"
            className="flex items-center gap-2 text-xs font-semibold text-text-primary hover:text-primary transition-colors"
          >
            <MailOutlinedIcon sx={{ fontSize: 14 }} className="shrink-0 text-text-muted" />
            connect@genextechnocrats.com
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
          <Link to={`/u/${user.username}`} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'mt-4 flex w-full')}>
            View Full Public Profile
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
              {previewYears && <p className="text-[11px] text-text-muted mt-1">{previewYears} years of experience</p>}
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
              {previewYears && <p className="text-[11px] text-text-muted mt-0.5">{previewYears} years of experience</p>}
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
