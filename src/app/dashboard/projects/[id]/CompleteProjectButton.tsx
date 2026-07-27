'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { logActivity } from '@/lib/logActivity'
export default function CompleteProjectButton({
  projectId,
  missionId,
}: {
  projectId: string
  missionId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

 async function handleComplete() {
    setLoading(true)

  await supabase
      .from('projects')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', projectId)
const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await logActivity(projectId, user.id, 'project_completed', 'marked the project as completed')
    }
    await supabase
      .from('missions')
      .update({ status: 'closed' })
      .eq('id', missionId)

    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="bg-bg-surface border border-accent text-accent-text rounded-lg px-4 py-2 text-sm font-medium mb-6"
    >
      {loading ? 'Completing...' : 'Mark project as completed'}
    </button>
  )
}