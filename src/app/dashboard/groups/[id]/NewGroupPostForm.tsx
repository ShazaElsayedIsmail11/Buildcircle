'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NewGroupPostForm({ groupId }: { groupId: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    await supabase.from('posts').insert({
      author_id: user.id,
      group_id: groupId,
      title,
      content,
    })

    setTitle('')
    setContent('')
    setLoading(false)
    setShowForm(false)
    router.refresh()
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium"
      >
        + New post
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-surface border border-border rounded-xl p-5">
      <input
        type="text"
        required
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent mb-3"
      />
      <textarea
        required
        rows={4}
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none mb-3"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="border border-border text-text-muted rounded-lg px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}