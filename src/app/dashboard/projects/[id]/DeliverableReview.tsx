'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { notify } from '@/lib/notify'

type ReviewDecision = 'approved' | 'changes_requested'

export default function DeliverableReview({
  deliverableId,
  projectId,
  builderId,
}: {
  deliverableId: string
  projectId: string
  builderId: string
}) {
  const router = useRouter()
  const [decision, setDecision] = useState<ReviewDecision | null>(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleReview() {
    if (!decision || loading) return

    if (decision === 'changes_requested' && !comment.trim()) {
      setErrorMessage('Please explain what needs to be changed.')
      return
    }

    setLoading(true)
    setErrorMessage('')

    const { error } = await supabase.rpc('review_deliverable', {
      p_deliverable_id: deliverableId,
      p_decision: decision,
      p_comment: comment.trim() || null,
    })

    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    // The review is already saved. A notification failure must not undo it.
    try {
      await notify(
        builderId,
        decision === 'approved'
          ? 'Your deliverable was approved'
          : 'Changes were requested on your deliverable',
        `/dashboard/projects/${projectId}`
      )
    } catch (notificationError) {
      console.error('Failed to send review notification:', notificationError)
    }

    setDecision(null)
    setComment('')
    router.refresh()
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setDecision('approved')
            setErrorMessage('')
          }}
          disabled={loading}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            decision === 'approved'
              ? 'border-accent bg-accent-bg text-accent-text'
              : 'border-border text-text-primary hover:border-accent'
          }`}
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => {
            setDecision('changes_requested')
            setErrorMessage('')
          }}
          disabled={loading}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            decision === 'changes_requested'
              ? 'border-accent bg-accent-bg text-accent-text'
              : 'border-border text-text-primary hover:border-accent'
          }`}
        >
          Request changes
        </button>
      </div>

      {decision && (
        <div className="mt-3 space-y-2">
          <label className="block text-xs text-text-muted">
            {decision === 'changes_requested'
              ? 'What needs to be changed? (required)'
              : 'Comment (optional)'}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            disabled={loading}
            placeholder={
              decision === 'changes_requested'
                ? 'Describe the requested changes...'
                : 'Leave a note for the builder...'
            }
            className="w-full resize-none rounded-lg border border-border bg-bg-main px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReview}
              disabled={loading}
              className="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-bg-main disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Confirm review'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setDecision(null)
                setComment('')
                setErrorMessage('')
              }}
              className="rounded-lg border border-border px-3 py-2 text-xs text-text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
