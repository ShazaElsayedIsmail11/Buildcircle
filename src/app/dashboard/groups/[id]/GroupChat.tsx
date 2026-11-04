'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Message = {
  id: string
  content: string
  sender_id: string
  reply_to_id: string | null
  created_at: string
  users: { full_name: string } | null
}

export default function GroupChat({
  groupId,
  messages,
  currentUserId,
}: {
  groupId: string
  messages: Message[]
  currentUserId: string
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  function findMessage(id: string | null) {
    if (!id) return null
    return messages.find((m) => m.id === id) || null
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)

    await supabase.from('group_messages').insert({
      group_id: groupId,
      sender_id: currentUserId,
      content,
      reply_to_id: replyingTo?.id || null,
    })

    setContent('')
    setReplyingTo(null)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4 flex flex-col h-96">
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          const repliedMessage = findMessage(msg.reply_to_id)

          return (
            <div key={msg.id} className={`flex flex-col mb-3 ${isMe ? 'items-end' : 'items-start'}`}>
              <p className="text-xs text-text-muted mb-1">
                {isMe ? 'You' : msg.users?.full_name}
              </p>

              <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {repliedMessage && (
                  <div className="bg-bg-main border-l-2 border-accent rounded px-2 py-1 mb-1 max-w-full">
                    <p className="text-text-muted text-[10px] truncate">
                      {repliedMessage.users?.full_name}: {repliedMessage.content}
                    </p>
                  </div>
                )}

                <div className="flex items-end gap-1">
                  {isMe && (
                    <button
                      onClick={() => setReplyingTo(msg)}
                      className="text-text-muted text-[10px] hover:text-text-primary"
                    >
                      ↩
                    </button>
                  )}
                  <p
                    className={`text-sm rounded-xl px-3.5 py-2 ${
                      isMe ? 'bg-accent text-bg-main' : 'bg-bg-main text-text-primary'
                    }`}
                  >
                    {msg.content}
                  </p>
                  {!isMe && (
                    <button
                      onClick={() => setReplyingTo(msg)}
                      className="text-text-muted text-[10px] hover:text-text-primary"
                    >
                      ↩
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {replyingTo && (
        <div className="bg-bg-main border-l-2 border-accent rounded px-3 py-2 mb-2 flex items-center justify-between">
          <p className="text-text-muted text-xs truncate">
            Replying to <span className="text-accent-text">{replyingTo.users?.full_name}</span>: {replyingTo.content}
          </p>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-text-muted text-xs ml-2 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

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