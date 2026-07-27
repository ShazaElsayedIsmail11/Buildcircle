'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Message = {
  id: string
  content: string
  sender_id: string
  users: { full_name: string; role: string } | null
}

export default function ProjectChat({
  projectId,
  messages,
  currentUserId,
}: {
  projectId: string
  messages: Message[]
  currentUserId: string
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)

    await supabase.from('messages').insert({
      project_id: projectId,
      sender_id: currentUserId,
      content,
    })

    setContent('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4 flex flex-col h-96">
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
       {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          const isHunter = msg.users?.role === 'hunter'

          return (
            <div
              key={msg.id}
              className={`flex flex-col mb-3 ${
                isMe ? 'items-end' : 'items-start'
              }`}
            >
              <p className="text-xs text-text-muted mb-1 flex items-center gap-1">
                {isHunter && <span aria-label="Hunter">👑</span>}
                <span>{msg.users?.full_name ?? 'Unknown user'}</span>
              </p>

              <p
                className={`text-sm rounded-xl px-3.5 py-2 max-w-[80%] ${
                  isMe
                    ? 'bg-accent text-bg-main'
                    : 'bg-bg-main text-text-primary'
                }`}
              >
                {msg.content}
              </p>
            </div>
          )
        })}
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
className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition"        >
          Send
        </button>
      </form>
    </div>
  )
}