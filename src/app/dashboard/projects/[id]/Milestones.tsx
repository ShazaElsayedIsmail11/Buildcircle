'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Milestone = {
  id: string
  title: string
  due_date: string | null
  status: string
}

export default function Milestones({
  projectId,
  milestones,
  isHunter,
}: {
  projectId: string
  milestones: Milestone[]
  isHunter: boolean
}) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await supabase.from('milestones').insert({
      project_id: projectId,
      title,
      due_date: dueDate || null,
    })

    setTitle('')
    setDueDate('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3">Milestones</h2>

      {isHunter && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="text"
            required
            placeholder="Milestone title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={loading}
className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition"          >
            Add
          </button>
        </form>
      )}

      <div className="space-y-2">
        {milestones.map((m) => (
          <div
            key={m.id}
            className="bg-bg-surface border border-border rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <p
                className={`text-sm font-medium ${
                  m.status === 'completed' ? 'line-through text-text-muted' : ''
                }`}
              >
                {m.title}
              </p>
              {m.due_date && (
                <p className="text-xs text-text-muted mt-0.5">Due: {m.due_date}</p>
              )}
            </div>

            {isHunter && m.status !== 'completed' && (
              <button
                onClick={async () => {
                  await supabase
                    .from('milestones')
                    .update({ status: 'completed' })
                    .eq('id', m.id)
                  router.refresh()
                }}
                className="text-xs text-accent-text"
              >
                Mark complete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )

}