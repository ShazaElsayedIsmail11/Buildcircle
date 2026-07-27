'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CommentForm({ postId }: { postId: string }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content,
    })

    setContent('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        required
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={loading}
className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition"      >
        {loading ? '...' : 'Reply'}
      </button>
    </form>
  )
}