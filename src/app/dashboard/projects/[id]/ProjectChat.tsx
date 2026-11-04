'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Paperclip, Reply, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { notify } from '@/lib/notify'

type Message = {
  id: string
  content: string
  sender_id: string
  image_path: string | null
  reply_to_id: string | null
  users: { full_name: string; role: string } | null
}

function renderMessageContent(content: string) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi

  return content.split(urlRegex).map((part, index) => {
    if (!/^(https?:\/\/|www\.)/i.test(part)) return part

    const url = /^www\./i.test(part) ? `https://${part}` : part

    return (
      <a
        key={index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 break-all"
      >
        {part}
      </a>
    )
  })
}

export default function ProjectChat({
  projectId,
  messages,
  currentUserId,
  otherMemberIds,
}: {
  projectId: string
  messages: Message[]
  currentUserId: string
  otherMemberIds: string[]
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [replyTo, setReplyTo] = useState<Message | null>(null)

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(selectedImage)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [selectedImage])

  useEffect(() => {
    let cancelled = false

    async function loadImages() {
      const urls: Record<string, string> = {}

      for (const msg of messages) {
        if (!msg.image_path) continue

        const { data, error } = await supabase.storage
          .from('project-chat')
          .createSignedUrl(msg.image_path, 3600)

        if (!error && data) urls[msg.id] = data.signedUrl
      }

      if (!cancelled) setImageUrls(urls)
    }

    void loadImages()
    const interval = window.setInterval(() => void loadImages(), 50 * 60 * 1000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [messages])

  function removeSelectedImage() {
    setSelectedImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function startReply(message: Message) {
    setReplyTo(message)
    messageInputRef.current?.focus()
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (loading || (!content.trim() && !selectedImage)) return

    setLoading(true)
    let uploadedPath: string | null = null

    try {
      if (selectedImage) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (
          !allowedTypes.includes(selectedImage.type) ||
          selectedImage.size > 5 * 1024 * 1024
        ) {
          throw new Error('Choose a JPG, PNG or WebP image under 5MB')
        }

        const extension = selectedImage.type === 'image/jpeg'
          ? 'jpg'
          : selectedImage.type.split('/')[1]
        const fileName = `${crypto.randomUUID()}.${extension}`
        uploadedPath = `${projectId}/${currentUserId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('project-chat')
          .upload(uploadedPath, selectedImage, {
            contentType: selectedImage.type,
            upsert: false,
          })

        if (uploadError) throw uploadError
      }

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          project_id: projectId,
          sender_id: currentUserId,
          content: content.trim(),
          image_path: uploadedPath,
          reply_to_id: replyTo?.id ?? null,
        })

      if (messageError) throw messageError

      setContent('')
      setReplyTo(null)
      removeSelectedImage()
      router.refresh()

      for (const memberId of otherMemberIds) {
        try {
          await notify(
            memberId,
            'New message in project chat',
            `/dashboard/projects/${projectId}`
          )
        } catch (error) {
          console.error('Notification failed:', error)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4 flex flex-col h-96">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-3 mb-3">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          const isHunter = msg.users?.role === 'hunter'
          const originalMessage = msg.reply_to_id
            ? messages.find((item) => item.id === msg.reply_to_id)
            : null

          return (
            <div
              key={msg.id}
              className={`flex flex-col mb-3 min-w-0 ${isMe ? 'items-end' : 'items-start'}`}
            >
              <p className="text-xs text-text-muted mb-1 flex items-center gap-1">
                {isHunter && <span aria-label="Hunter">👑</span>}
                <span>{msg.users?.full_name ?? 'Unknown user'}</span>
              </p>

              <div
                className={`text-sm rounded-xl px-3.5 py-2 max-w-[80%] min-w-0 ${
                  isMe ? 'bg-accent text-bg-main' : 'bg-bg-main text-text-primary'
                }`}
              >
                {msg.reply_to_id && (
                  <div className="mb-2 rounded-md border-l-2 border-current bg-black/10 px-2 py-1 text-xs min-w-0">
                    <p className="font-semibold opacity-80">
                      {originalMessage?.users?.full_name ?? 'Original message'}
                    </p>
                    <p className="opacity-80 line-clamp-2 break-words [overflow-wrap:anywhere]">
                      {originalMessage
                        ? originalMessage.content || (originalMessage.image_path ? '📷 Image' : 'Message')
                        : 'Message unavailable'}
                    </p>
                  </div>
                )}

                {msg.content && (
                  <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                    {renderMessageContent(msg.content)}
                  </p>
                )}

                {msg.image_path && imageUrls[msg.id] && (
                  <a
                    href={imageUrls[msg.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={imageUrls[msg.id]}
                      alt="Chat attachment"
                      className={`${msg.content ? 'mt-2' : ''} max-h-60 max-w-full rounded-lg object-contain`}
                    />
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => startReply(msg)}
                className="mt-1 flex items-center gap-1 text-xs text-text-muted hover:text-accent"
                aria-label={`Reply to ${msg.users?.full_name ?? 'message'}`}
              >
                <Reply size={13} /> Reply
              </button>
            </div>
          )
        })}
      </div>

      {replyTo && (
        <div className="mb-2 flex min-w-0 items-center gap-2 rounded-lg border-l-2 border-accent bg-bg-main px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-accent-text">
              Replying to {replyTo.users?.full_name ?? 'Unknown user'}
            </p>
            <p className="truncate text-xs text-text-muted">
              {replyTo.content || (replyTo.image_path ? '📷 Image' : 'Message')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            disabled={loading}
            aria-label="Cancel reply"
            className="shrink-0 text-text-muted hover:text-red-400"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {selectedImage && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-bg-main p-2 min-w-0">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Selected image preview"
              className="h-14 w-14 shrink-0 rounded-md object-cover"
            />
          )}
          <span className="min-w-0 flex-1 truncate text-xs text-text-muted">
            {selectedImage.name}
          </span>
          <button
            type="button"
            onClick={removeSelectedImage}
            disabled={loading}
            aria-label="Remove selected image"
            className="shrink-0 text-text-muted hover:text-red-400"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2 min-w-0">
        <input
          ref={messageInputRef}
          type="text"
          placeholder={replyTo ? 'Write a reply...' : 'Type a message...'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          className="min-w-0 flex-1 bg-bg-main border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        />

        <label
          title="Attach image"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-main text-text-muted transition hover:border-accent hover:text-accent ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Paperclip size={19} strokeWidth={1.8} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={loading}
            onChange={(e) => setSelectedImage(e.target.files?.[0] ?? null)}
          />
        </label>

        <button
          type="submit"
          disabled={loading || (!content.trim() && !selectedImage)}
          className="bg-accent text-bg-main rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
