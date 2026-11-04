import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import DirectMessageChat from './DirectMessageChat'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single()

  if (!conversation) notFound()

  const { data: messages } = await supabase
    .from('direct_messages')
    .select('*, users(full_name)')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  const otherUserId = conversation.user_a === user?.id ? conversation.user_b : conversation.user_a

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Conversation</h1>
      <DirectMessageChat
        conversationId={id}
        messages={messages || []}
        currentUserId={user?.id || ''}
        otherUserId={otherUserId}
      />
    </div>
  )
}