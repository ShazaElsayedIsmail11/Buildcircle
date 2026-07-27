'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ApplyButton({
  missionId,
  existingApplication,
}: {
  missionId: string
  existingApplication: { id: string; status: string } | null
}) {
  const [applied, setApplied] = useState(!!existingApplication)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleApply() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to apply.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('applications').insert({
      mission_id: missionId,
      builder_id: user.id,
      cover_message: message,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setApplied(true)
  }

  if (applied) {
    return (
      <div className="bg-accent-bg border border-accent rounded-xl p-4 text-accent-text text-sm">
        ✓ You&apos;ve applied to this mission
        {existingApplication && (
          <span className="capitalize"> · Status: {existingApplication.status}</span>
        )}
      </div>
    )
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition"      >
        Apply to this mission
      </button>
    )
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-5">
      <label className="block text-sm text-text-muted mb-1">
        Why are you a good fit? (optional)
      </label>
      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none mb-3"
      />
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <button
        onClick={handleApply}
        disabled={loading}
className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition"      >
        {loading ? 'Submitting...' : 'Submit application'}
      </button>
    </div>
  )
}