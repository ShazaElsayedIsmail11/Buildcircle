'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type SquadMember = {
  builder_id: string
  users: { full_name: string } | null
}

export default function ReviewForm({
  projectId,
  squadMembers,
  missionTitle,
  startupName,
}: {
  projectId: string
  squadMembers: SquadMember[]
  missionTitle: string
  startupName: string
}) {
  const router = useRouter()
  const [selectedBuilderId, setSelectedBuilderId] = useState(
    squadMembers[0]?.builder_id || ''
  )
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
async function handleSubmit() {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

await supabase.from('reviews').insert({
      project_id: projectId,
      builder_id: selectedBuilderId,
      hunter_id: user.id,
      rating,
      comment,
    })

    await supabase.from('proof_of_work').insert({
      builder_id: selectedBuilderId,
      project_id: projectId,
      mission_title: missionTitle,
      startup_name: startupName,
      review_summary: comment,
    })
   setComment('')
    setRating(5)
    setLoading(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
    router.refresh()
  }
  
  return (
    <div className="bg-bg-surface border border-border rounded-xl p-5">
        {showSuccess && (
        <div className="bg-accent-bg border border-accent text-accent-text text-sm rounded-lg px-3 py-2 mb-4">
          ✓ Review submitted successfully
        </div>
      )}

    <h3 className="text-sm font-medium mb-3">Leave a review</h3>

      <label className="block text-sm text-text-muted mb-1">Builder</label>
      <select
        value={selectedBuilderId}
        onChange={(e) => setSelectedBuilderId(e.target.value)}
        className="bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent mb-4 w-full"
      >
        {squadMembers.map((member) => (
          <option key={member.builder_id} value={member.builder_id}>
            {member.users?.full_name}
          </option>
        ))}
      </select>

      <label className="block text-sm text-text-muted mb-1">Rating</label>
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent mb-4"
      >
        <option value={5}>5 - Excellent</option>
        <option value={4}>4 - Good</option>
        <option value={3}>3 - Average</option>
        <option value={2}>2 - Below average</option>
        <option value={1}>1 - Poor</option>
      </select>

      <label className="block text-sm text-text-muted mb-1">Comment</label>
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none mb-4"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition"      >
        {loading ? 'Submitting...' : 'Submit review'}
      </button>
    </div>
  )
}