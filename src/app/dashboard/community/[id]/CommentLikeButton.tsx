'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CommentLikeButton({
  commentId,
  initialCount,
  initiallyLiked,
}: {
  commentId: string
  initialCount: number
  initiallyLiked: boolean
}) {
  const router = useRouter()
  const [liked, setLiked] = useState(initiallyLiked)
  const [count, setCount] = useState(initialCount)

  async function toggleLike() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (liked) {
      await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id)
      setCount((c) => c - 1)
    } else {
      await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id })
      setCount((c) => c + 1)
    }

    setLiked(!liked)
    router.refresh()
  }

  return (
    <button onClick={toggleLike} className="flex items-center gap-1 text-xs">
      <span>{liked ? '❤️' : '🤍'}</span>
      <span className={liked ? 'text-accent-text' : 'text-text-muted'}>{count}</span>
    </button>
  )
}