'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function FeatureToggle({
  missionId,
  initiallyFeatured,
}: {
  missionId: string
  initiallyFeatured: boolean
}) {
  const router = useRouter()
  const [featured, setFeatured] = useState(initiallyFeatured)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await supabase
      .from('missions')
      .update({ is_featured: !featured })
      .eq('id', missionId)
    setFeatured(!featured)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
        featured
          ? 'bg-accent-bg text-accent-text'
          : 'bg-bg-main border border-border text-text-muted'
      }`}
    >
      {featured ? '⭐ Featured' : 'Feature'}
    </button>
  )
}