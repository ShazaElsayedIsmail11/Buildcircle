'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Startup = { id: string; name: string }

export function NewMissionForm({
  existingMission,
}: {
  existingMission?: {
    id: string
    title: string
    description: string
    required_skills: string[]
    duration: string
    is_paid: boolean
    budget: number | null
    deadline: string | null
    startup_id: string
  }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const startupParam = searchParams.get('startup')
  const startupId = existingMission?.startup_id || startupParam

  const [startups, setStartups] = useState<Startup[]>([])
  const [selectedStartupId, setSelectedStartupId] = useState(startupId || '')

  const [title, setTitle] = useState(existingMission?.title || '')
   const [description, setDescription] = useState(existingMission?.description || '')
  const [skills, setSkills] = useState(existingMission?.required_skills?.join(', ') || '')
  const [duration, setDuration] = useState(existingMission?.duration || '')
  const [isPaid, setIsPaid] = useState(existingMission?.is_paid || false)
  const [budget, setBudget] = useState(existingMission?.budget?.toString() || '')
  const [deadline, setDeadline] = useState(existingMission?.deadline || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStartups() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data } = await supabase
        .from('startups')
        .select('id, name')
        .eq('hunter_id', user?.id)

      setStartups(data || [])
    }
    loadStartups()
  }, [])

async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedStartupId) {
      setError('Missing startup reference. Please go back and try again.')
      return
    }

    setLoading(true)
    setError('')

    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const missionData = {
      title,
      description,
      required_skills: skillsArray,
      duration,
      is_paid: isPaid,
      budget: isPaid ? Number(budget) : null,
      deadline: deadline || null,
    }

    const { error } = existingMission
      ? await supabase.from('missions').update(missionData).eq('id', existingMission.id)
      : await supabase.from('missions').insert({ ...missionData, startup_id: selectedStartupId })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push(
      existingMission ? `/dashboard/missions/${existingMission.id}` : '/dashboard/missions'
    )
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-1">
        {existingMission ? 'Edit mission' : 'Post a mission'}
      </h1>
      <p className="text-text-muted mb-6 text-sm">
        {existingMission
          ? 'Update the details of your mission.'
          : "Describe the task and the skills you're looking for."}
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-bg-surface border border-border rounded-xl p-6"
      >
        {startups.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm text-text-muted mb-1">Startup</label>
            <select
              required
              value={selectedStartupId}
              onChange={(e) => setSelectedStartupId(e.target.value)}
              className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">Select a startup...</option>
              {startups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-text-muted mb-1">Mission title</label>
      
          <input
            type="text"
            required
            placeholder="e.g. Design a mobile app UI"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-text-muted mb-1">Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-text-muted mb-1">
            Required skills <span className="text-xs">(comma separated)</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Figma, React, SEO"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-text-muted mb-1">Duration</label>
          <input
            type="text"
            required
            placeholder="e.g. 2 weeks, 1 month"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            This mission is paid
          </label>
        </div>

        {isPaid && (
          <div className="mb-4">
            <label className="block text-sm text-text-muted mb-1">Budget ($)</label>
            <input
              type="number"
              min="0"
              required={isPaid}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm text-text-muted mb-1">Application deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-bg-main rounded-lg px-5 py-2.5 font-medium text-sm disabled:opacity-50"
        >
          {loading
            ? existingMission
              ? 'Saving...'
              : 'Posting...'
            : existingMission
            ? 'Update mission'
            : 'Post mission'}
        </button>
      </form>
    </div>
  )
}

export default function NewMission() {
  return (
    <Suspense fallback={<p className="text-text-muted text-sm">Loading...</p>}>
      <NewMissionForm />
    </Suspense>
  )
}