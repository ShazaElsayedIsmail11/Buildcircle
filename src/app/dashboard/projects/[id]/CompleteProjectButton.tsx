'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { logActivity } from '@/lib/logActivity'
import { notify } from '@/lib/notify'

export default function CompleteProjectButton({
  projectId,
  missionId: _missionId,
  memberIds,
}: {
  projectId: string
  missionId: string
  memberIds: string[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleComplete() {
    if (loading) return

    setLoading(true)
    setErrorMessage(null)
    setNotice(null)

    try {
      const { error } = await supabase.rpc('complete_project', {
        p_project_id: projectId,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      // Completion has succeeded in the database. Activity and notifications
      // are secondary operations and should not cause a retry of completion.
      const sideEffectErrors: string[] = []

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (user) {
          await logActivity(projectId, user.id, 'project_completed', 'marked the project as completed')
        }
      } catch (activityError) {
        console.error('Failed to log project completion:', activityError)
        sideEffectErrors.push('activity log')
      }

      for (const memberId of memberIds) {
        try {
          await notify(memberId, 'The project was marked as completed', `/dashboard/projects/${projectId}`)
        } catch (notificationError) {
          console.error('Failed to notify project member:', memberId, notificationError)
          sideEffectErrors.push('a notification')
        }
      }

      if (sideEffectErrors.length > 0) {
        setNotice('Project completed, but some activity or notification updates may not have been delivered.')
      }

      router.refresh()
    } catch (unexpectedError) {
      console.error('Unexpected project completion error:', unexpectedError)
      setErrorMessage('An unexpected error occurred. Refresh the page to check the project status before retrying.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={handleComplete}
        disabled={loading}
        className="bg-bg-surface border border-accent text-accent-text rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Completing...' : 'Mark project as completed'}
      </button>

      {errorMessage && (
        <p role="alert" className="mt-2 text-sm text-red-500">
          {errorMessage}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-2 text-sm text-text-muted">
          {notice}
        </p>
      )}
    </div>
  )
}
