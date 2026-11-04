'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function NotificationBell() {
  const [count, setCount] = useState(0)

 useEffect(() => {
  let channel: ReturnType<typeof supabase.channel> | null = null

  async function setupNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user){
      return;} 
const userId = user.id
    async function loadCount() {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id',userId)
        .eq('is_read', false)

      setCount(count ?? 0)
    }

    await loadCount()

    channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadCount()
        }
      )
      .subscribe()
  }

  setupNotifications()

  return () => {
    if (channel) {
      supabase.removeChannel(channel)
    }
  }
}, [])

  return (
    <Link href="/dashboard/notifications" className="relative inline-block">
      <span className="text-lg">🔔</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent text-bg-main text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  )
}