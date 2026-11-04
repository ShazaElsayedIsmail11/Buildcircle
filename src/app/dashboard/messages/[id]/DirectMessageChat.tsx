'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { notify } from '@/lib/notify'
type Message = {
  id: string
  content: string
  sender_id: string
  created_at: string
  is_read: boolean
  users: { full_name: string } | null
}

export default function DirectMessageChat({
  conversationId,
  messages,
  currentUserId,
  otherUserId,
}: {
  conversationId: string
  messages: Message[]
  currentUserId: string
  otherUserId: string
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

useEffect(() => {
    async function markAsRead() {
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId)
        .eq('is_read', false)

      router.refresh()
    }
    markAsRead()
  }, [conversationId, currentUserId,router])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)

    await supabase.from('direct_messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content,
    })

    await notify(otherUserId, 'You have a new message', `/dashboard/messages/${conversationId}`)

    setContent('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4 flex flex-col h-96">
<div className="flex-1 overflow-y-auto space-y-3 mb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex flex-col mb-3 ${isMe ? 'items-end' : 'items-start'}`}>
              <p className="text-xs text-text-muted mb-1">
                {isMe ? 'You' : msg.users?.full_name}
              </p>
              <p className={`text-sm rounded-xl px-3.5 py-2 max-w-[80%] ${
                isMe ? 'bg-accent text-bg-main' : 'bg-bg-main text-text-primary'
              }`}>
                {msg.content}
              </p>
              <p className="text-text-muted text-[10px] mt-0.5">
                {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                {isMe && (msg.is_read ? ' · Read' : ' · Sent')}
              </p>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}