'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LikeButton({
  postId,
  initialCount,
  initiallyLiked,
}: {
  postId: string
  initialCount: number
  initiallyLiked: boolean
}) {
  const router = useRouter()
  const [liked, setLiked] = useState(initiallyLiked)
  const [count, setCount] = useState(initialCount)
  const [animating, setAnimating] = useState(false)

  async function toggleLike() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
      setCount((c) => c - 1)
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
      setCount((c) => c + 1)
      setAnimating(true)
      setTimeout(() => setAnimating(false), 400)
    }

    setLiked(!liked)
    router.refresh()
  }

  return (
    <button
      onClick={toggleLike}
      className="flex items-center gap-1.5 text-sm"
    >
      <span
        className={`inline-block transition-transform ${
          animating ? 'scale-150' : 'scale-100'
        }`}
      >
        {liked ? '❤️' : '🤍'}
      </span>
      <span className={liked ? 'text-accent-text' : 'text-text-muted'}>{count}</span>
    </button>
  )
}