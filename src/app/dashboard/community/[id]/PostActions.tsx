'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PostActions({
  postId,
  isOwner,
  initialTitle,
  initialContent,
}: {
  postId: string
  isOwner: boolean
  initialTitle: string
  initialContent: string
}) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    await supabase.from('posts').update({ title, content }).eq('id', postId)
    setLoading(false)
    setIsEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    await supabase.from('posts').delete().eq('id', postId)
    router.push('/dashboard/community')
  }

  if (!isOwner) return null

  if (isEditing) {
    return (
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent mb-2"
        />
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none mb-2"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-accent text-bg-main rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="border border-border text-text-muted rounded-lg px-3 py-1.5 text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-4">
      <button
        onClick={() => setIsEditing(true)}
        className="text-xs text-text-muted hover:text-text-primary"
      >
        Edit
      </button>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs text-red-400 hover:text-red-300"
      >
        Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-surface border border-border rounded-2xl p-6 max-w-sm w-[90%]">
            <p className="text-text-primary text-base font-medium mb-2">Delete this post?</p>
            <p className="text-text-muted text-sm mb-5">This can&apos;t be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
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