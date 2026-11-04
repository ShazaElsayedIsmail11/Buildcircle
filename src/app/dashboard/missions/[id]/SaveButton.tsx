'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SaveButton({
  missionId,
  initiallySaved,
}: {
  missionId: string
  initiallySaved: boolean
}) {
  const router = useRouter()
  const [saved, setSaved] = useState(initiallySaved)
  const [loading, setLoading] = useState(false)

  async function toggleSave() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    if (saved) {
      await supabase
        .from('saved_missions')
        .delete()
        .eq('builder_id', user.id)
        .eq('mission_id', missionId)
    } else {
      await supabase.from('saved_missions').insert({
        builder_id: user.id,
        mission_id: missionId,
      })
    }

    setSaved(!saved)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className="border border-border text-text-primary rounded-lg px-4 py-2 text-sm font-medium hover:bg-bg-surface transition"
    >
      {saved ? '🔖 Saved' : '🔖 Save'}
    </button>
  )
}