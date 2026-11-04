'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getOrCreateConversation } from '@/lib/getOrCreateConversation'

export default function MessageButton({ builderId }: { builderId: string }) {
  const router = useRouter()

  async function handleClick() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    const conversationId = await getOrCreateConversation(user.id, builderId)
    router.push(`/dashboard/messages/${conversationId}`)
  }

  return (
    <button
      onClick={handleClick}
      className="border border-border text-text-primary rounded-lg px-4 py-2 text-sm font-medium hover:bg-bg-surface transition"
    >
      Message
    </button>
  )
}