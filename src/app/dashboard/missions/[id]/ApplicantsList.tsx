'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { EmptyState } from '@/app/EmptyState'
import { notify } from '@/lib/notify'
type Application = {
  id: string
  cover_message: string | null
  status: string
  builder_id: string
  users: {
    full_name: string
    email: string
  } | null
}

export default function ApplicantsList({
  missionId,
  applications,
}: {
  missionId: string
  applications: Application[]
}) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleAccept(application: Application) {
    setLoadingId(application.id)

    try {
      // 1. تحديث حالة التقديم إلى accepted
      await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', application.id)

      // 2. التأكد من وجود Squad للمهمة أو إنشاء واحد جديد
      let { data: squad } = await supabase
        .from('squads')
        .select('*')
        .eq('mission_id', missionId)
        .maybeSingle()

      if (!squad) {
        const { data: newSquad } = await supabase
          .from('squads')
          .insert({ mission_id: missionId })
          .select()
          .single()

        squad = newSquad
      }

      // 3. إضافة الـ Builder إلى أعضاء الـ Squad
      if (squad) {
        await supabase.from('squad_members').insert({
          squad_id: squad.id,
          builder_id: application.builder_id,
        })
      }

      // 4. التأكد من وجود Project لنفس المهمة أو إنشاء واحد جديد
      if (squad) {
        const { data: existingProject } = await supabase
          .from('projects')
          .select('id')
          .eq('mission_id', missionId)
          .maybeSingle()

        if (!existingProject) {
          await supabase.from('projects').insert({
            mission_id: missionId,
            squad_id: squad.id,
          })
        }
      }

      router.refresh()
    } finally {
       await notify(
      application.builder_id,
      'You were accepted to a squad!',
      '/dashboard/applications'
    )
      setLoadingId(null)
      router.refresh()
    }
  
}

 async function handleReject(application: Application) {
    setLoadingId(application.id)
    await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', application.id)

    await notify(
      application.builder_id,
      'Your application was not accepted this time',
      '/dashboard/applications'
    )

    setLoadingId(null)
    router.refresh()
  }

  if (applications.length === 0) {
    return (
      <EmptyState
      icon="📋"
        title="No applications yet"
        subtitle="Builders who apply to this mission will show up here."
      />
    )
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <div
          key={app.id}
          className="bg-bg-surface border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <a
                href={`/builder/${app.builder_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-accent-text"
              >
                {app.users?.full_name || 'Unknown builder'}
              </a>

              <p className="text-text-muted text-xs">
                {app.users?.email || 'No email'}
              </p>
            </div>

            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
                app.status === 'accepted'
                  ? 'bg-accent-bg text-accent-text'
                  : app.status === 'rejected'
                    ? 'bg-red-950 text-red-400'
                    : 'bg-bg-main border border-border text-text-muted'
              }`}
            >
              {app.status}
            </span>
          </div>

          {app.cover_message && (
            <p className="text-text-primary text-sm mb-3">
              {app.cover_message}
            </p>
          )}

          {app.status === 'pending' && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAccept(app)}
                disabled={loadingId === app.id}
className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition"              >
                {loadingId === app.id ? 'Loading...' : 'Accept'}
              </button>

              <button
                type="button"
               onClick={() => handleReject(app)}
                disabled={loadingId === app.id}
                className="border border-border text-text-muted rounded-lg px-4 py-1.5 text-xs font-medium disabled:opacity-50"
              >
                {loadingId === app.id ? 'Loading...' : 'Reject'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}