'use client'

import { Suspense } from 'react'
import { NewMissionForm } from '../../new/page'

export default function EditMissionForm({ mission }: { mission: any }) {
  return (
    <Suspense fallback={<p className="text-text-muted text-sm">Loading...</p>}>
      <NewMissionForm existingMission={mission} />
    </Suspense>
  )
}