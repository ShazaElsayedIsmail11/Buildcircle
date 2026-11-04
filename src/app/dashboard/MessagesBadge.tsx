'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function MessagesBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function loadCount() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)

      if (!conversations || conversations.length === 0) return

      const conversationIds = conversations.map((c) => c.id)

      const { count } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .eq('is_read', false)
        .neq('sender_id', user.id)

      setCount(count || 0)
    }
    loadCount()
  }, [])

  if (count === 0) return null

  return (
    <span className="bg-accent text-bg-main text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center ml-auto">
      {count}
    </span>
  )
}