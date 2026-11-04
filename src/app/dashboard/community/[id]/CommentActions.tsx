'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CommentActions({
  commentId,
  isOwner,
  canDelete,
  initialContent,
}: {
  commentId: string
  isOwner: boolean
  canDelete: boolean
  initialContent: string
}) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(initialContent)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    await supabase.from('comments').update({ content }).eq('id', commentId)
    setLoading(false)
    setIsEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    await supabase.from('comments').delete().eq('id', commentId)
    router.refresh()
  }

 if (!isOwner && !canDelete) return null

  if (isEditing) {
    return (
      <div className="mt-1">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-bg-main border border-border rounded-lg px-2 py-1 text-xs outline-none focus:border-accent mb-1"
        />
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={loading} className="text-xs text-accent-text">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="text-xs text-text-muted">
            Cancel
          </button>
        </div>
      </div>
    )
  }

 return (
    <>
      {isOwner && (
        <button onClick={() => setIsEditing(true)} className="text-xs text-text-muted hover:text-text-primary">
          Edit
        </button>
      )}
      <button onClick={() => setShowConfirm(true)} className="text-xs text-red-400 hover:text-red-300">
        Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-surface border border-border rounded-2xl p-6 max-w-sm w-[90%]">
            <p className="text-text-primary text-base font-medium mb-2">Delete this comment?</p>
            <p className="text-text-muted text-sm mb-5">Replies to this comment will also be deleted.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowConfirm(false)} className="border border-border text-text-muted text-sm px-4 py-2 rounded-lg">
                Cancel
              </button>
              <button onClick={handleDelete} className="bg-accent text-bg-main text-sm font-medium px-4 py-2 rounded-lg">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}