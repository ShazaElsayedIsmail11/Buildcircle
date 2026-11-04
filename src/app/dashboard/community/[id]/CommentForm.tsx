'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CommentForm({
  postId,
  parentCommentId,
  compact,
}: {
  postId: string
  parentCommentId?: string
  compact?: boolean
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content,
      parent_comment_id: parentCommentId || null,
    })

    setContent('')
    setLoading(false)
    setShowReplyForm(false)
    router.refresh()
  }

  if (compact && !showReplyForm) {
    return (
      <button
        onClick={() => setShowReplyForm(true)}
        className="text-xs text-text-muted hover:text-text-primary"
      >
        Reply
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        required
        placeholder={parentCommentId ? 'Write a reply...' : 'Write a comment...'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? '...' : parentCommentId ? 'Reply' : 'Comment'}
      </button>
    </form>
  )
}