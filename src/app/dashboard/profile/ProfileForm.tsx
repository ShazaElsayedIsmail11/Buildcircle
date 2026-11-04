'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { calculateCompletion } from '@/lib/profileCompletion'
import { useToast } from '@/app/Toast'

type Profile = {
  id: string
  full_name: string
  bio: string | null
  avatar_url: string | null
}

type BuilderProfile = {
  skills: string[] | null
  github_url: string | null
  portfolio_links: string[] | null
} | null

type ProfileValues = {
  bio: string
  avatarUrl: string
  skills: string
  githubUrl: string
  portfolio: string
}

export default function ProfileForm({
  profile,
  builderProfile,
}: {
  profile: Profile
  builderProfile: BuilderProfile
}) {
  const showToast = useToast()

  const initialValues: ProfileValues = {
    bio: profile.bio || '',
    avatarUrl: profile.avatar_url || '',
    skills: builderProfile?.skills?.join(', ') || '',
    githubUrl: builderProfile?.github_url || '',
    portfolio: builderProfile?.portfolio_links?.join(', ') || '',
  }

  // saved: last successfully saved values; draft: current form inputs
  const [saved, setSaved] = useState<ProfileValues>(initialValues)
  const [draft, setDraft] = useState<ProfileValues>(initialValues)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const splitList = (text: string) =>
    text.split(',').map((item) => item.trim()).filter(Boolean)

  const completion = calculateCompletion({
    bio: saved.bio,
    avatar_url: saved.avatarUrl,
    skills: splitList(saved.skills),
    github_url: saved.githubUrl,
    portfolio_links: splitList(saved.portfolio),
  })

  function handleCancel() {
    setDraft({ ...saved })
    setAvatarFile(null)
    setError('')
    setIsEditing(false)
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setError('')

    try {
      let avatarUrl = draft.avatarUrl

      // The selected photo is uploaded only when the user clicks Save.
      if (avatarFile) {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData.user || authData.user.id !== profile.id) {
          throw new Error('Please sign in again to upload a photo.')
        }

        const extensionByType: Record<string, string> = {
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/webp': 'webp',
        }
        const extension = extensionByType[avatarFile.type]
        if (!extension || avatarFile.size > 2 * 1024 * 1024) {
          throw new Error('Choose a JPG, PNG or WebP image up to 2 MB.')
        }

        // One folder per user. New filenames avoid replacing cached images.
        const path = `${authData.user.id}/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { contentType: avatarFile.type, upsert: false })
        if (uploadError) throw uploadError

        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = publicData.publicUrl
      }

      const { error: userError } = await supabase
        .from('users')
        .update({ bio: draft.bio, avatar_url: avatarUrl })
        .eq('id', profile.id)

      if (userError) throw userError

      const { error: builderError } = await supabase
        .from('builder_profiles')
        .upsert({
          user_id: profile.id,
          skills: splitList(draft.skills),
          github_url: draft.githubUrl,
          portfolio_links: splitList(draft.portfolio),
        },  { onConflict: 'user_id' })

      if (builderError) throw builderError

      const newValues = { ...draft, avatarUrl }
      setSaved(newValues)
      setDraft(newValues)
      setAvatarFile(null)
      setIsEditing(false)
      showToast('Profile updated')
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isEditing) {
    const skills = splitList(saved.skills)
    const portfolios = splitList(saved.portfolio)
    const missing = [
      !saved.bio.trim() && 'Add a bio',
      !saved.avatarUrl.trim() && 'Add a profile picture',
      skills.length === 0 && 'Add your skills',
      !saved.githubUrl.trim() && 'Add your GitHub',
      portfolios.length === 0 && 'Add portfolio links',
    ].filter(Boolean) as string[]

    return (
      <div className="space-y-6">
        <section className="bg-bg-surface border border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {saved.avatarUrl ? (
              <img
                src={saved.avatarUrl}
                alt="Profile avatar"
                className="w-20 h-20 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-20 h-20 shrink-0 rounded-full bg-bg-main border border-border flex items-center justify-center text-2xl font-semibold">
                {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold break-words">{profile.full_name || 'Builder'}</h2>
              <p className="text-sm text-text-muted">Builder</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium"
            >
              Edit profile
            </button>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Profile completion</p>
              <p className="text-sm text-accent-text font-medium">{completion}%</p>
            </div>
            <div className="h-2 rounded-full bg-bg-main overflow-hidden">
              <div className="h-full bg-accent transition-all" style={{ width: `${completion}%` }} />
            </div>
            {missing.length > 0 && (
              <p className="text-xs text-text-muted mt-3">Next step: {missing[0]}</p>
            )}
          </div>
        </section>

        <section className="bg-bg-surface border border-border rounded-xl p-6 space-y-3">
          <h3 className="font-semibold">About me</h3>
          <p className="text-sm text-text-muted whitespace-pre-wrap break-words">
            {saved.bio.trim() || 'No bio added yet.'}
          </p>
        </section>

        <section className="bg-bg-surface border border-border rounded-xl p-6 space-y-3">
          <h3 className="font-semibold">Skills</h3>
          {skills.length ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span key={`${skill}-${index}`} className="text-sm rounded-full border border-border px-3 py-1">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No skills added yet.</p>
          )}
        </section>

        <section className="bg-bg-surface border border-border rounded-xl p-6 space-y-3">
          <h3 className="font-semibold">Work & links</h3>
          {saved.githubUrl.trim() ? (
            <a href={saved.githubUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-accent-text underline break-all">
              GitHub profile
            </a>
          ) : (
            <p className="text-sm text-text-muted">No GitHub link added yet.</p>
          )}
          {portfolios.length > 0 ? (
            portfolios.map((url, index) => (
              <a key={`${url}-${index}`} href={url} target="_blank" rel="noopener noreferrer" className="block text-sm text-accent-text underline break-all">
                Portfolio {index + 1}
              </a>
            ))
          ) : (
            <p className="text-sm text-text-muted">No portfolio links added yet.</p>
          )}
        </section>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Edit profile</h2>
        <button type="button" onClick={handleCancel} disabled={loading} className="text-sm text-text-muted hover:text-text-primary disabled:opacity-50">
          Cancel
        </button>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl p-6 space-y-4">
        <div>
          <label htmlFor="profile-bio" className="block text-sm text-text-muted mb-1">Bio</label>
          <textarea id="profile-bio" rows={3} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none" />
        </div>
        <div>
          <label htmlFor="profile-avatar" className="block text-sm text-text-muted mb-1">Profile photo</label>
          <input
            id="profile-avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null
              if (file && (file.size > 2 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
                setError('Choose a JPG, PNG or WebP image up to 2 MB.')
                e.target.value = ''
                setAvatarFile(null)
                return
              }
              setError('')
              setAvatarFile(file)
            }}
            className="block w-full text-sm text-text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:font-medium file:text-bg-main"
          />
          <p className="mt-2 text-xs text-text-muted">JPG, PNG or WebP · Max 2 MB. Photo uploads when you save.</p>
          {avatarFile && <p className="mt-1 text-xs text-accent-text">Selected: {avatarFile.name}</p>}
        </div>
        <div>
          <label htmlFor="profile-skills" className="block text-sm text-text-muted mb-1">Skills (comma separated)</label>
          <input id="profile-skills" type="text" value={draft.skills} onChange={(e) => setDraft({ ...draft, skills: e.target.value })} className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
        </div>
        <div>
          <label htmlFor="profile-github" className="block text-sm text-text-muted mb-1">GitHub URL</label>
          <input id="profile-github" type="url" value={draft.githubUrl} onChange={(e) => setDraft({ ...draft, githubUrl: e.target.value })} className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
        </div>
        <div>
          <label htmlFor="profile-portfolio" className="block text-sm text-text-muted mb-1">Portfolio links (comma separated)</label>
          <input id="profile-portfolio" type="text" value={draft.portfolio} onChange={(e) => setDraft({ ...draft, portfolio: e.target.value })} className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
        </div>
        {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="bg-accent text-bg-main rounded-lg px-5 py-2.5 font-medium text-sm disabled:opacity-50">
          {loading ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}
