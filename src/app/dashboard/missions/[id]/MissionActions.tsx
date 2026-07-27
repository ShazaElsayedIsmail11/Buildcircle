'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Mission = {
  id: string
  title: string
  description: string
  status: string
}

export default function MissionActions({ mission }: { mission: Mission }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(mission.title)
 const [editedDescription, setEditedDescription] = useState(mission.description)

  async function handleClose() {
    setLoading(true)
    await supabase.from('missions').update({ status: 'closed' }).eq('id', mission.id)
    setLoading(false)
    router.refresh()
  }

  async function handleReopen() {
    setLoading(true)
    await supabase.from('missions').update({ status: 'open' }).eq('id', mission.id)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    setLoading(true)
    await supabase.from('missions').delete().eq('id', mission.id)
    router.push('/dashboard/missions')
  }

  async function handleEdit() {
    setLoading(true)
    await supabase
      .from('missions')
      .update({ title: editedTitle, description: editedDescription })
      .eq('id', mission.id)
    setLoading(false)
    setIsEditing(false)
    router.refresh()
  }

 return (
    <div className="bg-bg-surface border border-border rounded-xl p-5 mb-6">
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent mb-2"
          />
          <textarea
            rows={3}
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              disabled={loading}
              className="bg-accent text-bg-main rounded-lg px-4 py-2 text-xs font-medium"
            >
              Save changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="border border-border text-text-muted rounded-lg px-4 py-2 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <a href={`/dashboard/missions/${mission.id}/edit`}
            className="border border-border text-text-primary rounded-lg px-4 py-2 text-xs font-medium hover:bg-bg-main transition inline-block"
          >
            Edit mission
          </a>

          {mission.status === 'closed' ? (
            <button
              onClick={handleReopen}
              disabled={loading}
              className="border border-accent text-accent-text rounded-lg px-4 py-2 text-xs font-medium"
            >
              Reopen mission
            </button>
          ) : (
            <button
              onClick={handleClose}
              disabled={loading}
              className="border border-border text-text-muted rounded-lg px-4 py-2 text-xs font-medium hover:bg-bg-main transition"
            >
              Close mission
            </button>
          )}

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="border border-red-900 text-red-400 rounded-lg px-4 py-2 text-xs font-medium"
          >
            Delete mission
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-surface border border-border rounded-2xl p-6 max-w-sm w-[90%]">
            <p className="text-text-primary text-base font-medium mb-2">
              Delete this mission?
            </p>
            <p className="text-text-muted text-sm mb-5 leading-relaxed">
              This can&apos;t be undone. All related applications will be permanently removed.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="border border-border text-text-muted text-sm px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-accent text-bg-main text-sm font-medium px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}