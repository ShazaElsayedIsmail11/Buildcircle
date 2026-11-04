'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ReplyForm({
  postId,
  parentCommentId,
}: {
  postId: string
  parentCommentId: string
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content,
      parent_comment_id: parentCommentId,
    })

    setContent('')
    setLoading(false)
    setShowForm(false)
    router.refresh()
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-xs text-text-muted hover:text-text-primary"
      >
        Reply
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <input
        type="text"
        required
        placeholder="Write a reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 bg-bg-main border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-accent text-bg-main rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
      >
        {loading ? '...' : 'Reply'}
      </button>
    </form>
  )
}