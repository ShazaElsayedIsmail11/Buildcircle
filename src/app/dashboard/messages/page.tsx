import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { EmptyState } from '@/app/EmptyState'

export default async function Messages() {
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

  const { data: { user } } = await supabase.auth.getUser()

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, userA:users!conversations_user_a_fkey(full_name), userB:users!conversations_user_b_fkey(full_name)')
    .or(`user_a.eq.${user?.id},user_b.eq.${user?.id}`)
    .order('created_at', { ascending: false })

  const conversationsWithPreview = await Promise.all(
    (conversations || []).map(async (c) => {
      const { data: lastMessage } = await supabase
        .from('direct_messages')
        .select('content, sender_id, created_at')
        .eq('conversation_id', c.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { count: unreadCount } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', c.id)
        .eq('is_read', false)
        .neq('sender_id', user?.id)

      return { ...c, lastMessage, unreadCount: unreadCount || 0 }
    })
  )

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Messages</h1>

      {conversationsWithPreview.length === 0 && (
        <EmptyState icon="💬" title="No conversations yet" subtitle="Message a builder or hunter to get started." />
      )}

      <div className="space-y-2">
        {conversationsWithPreview.map((c) => {
          const otherPerson = c.user_a === user?.id ? c.userB : c.userA
          return (
            <Link
              key={c.id}
              href={`/dashboard/messages/${c.id}`}
              className="flex items-center justify-between bg-bg-surface border border-border rounded-xl p-4 hover:border-accent transition"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{otherPerson?.full_name}</p>
                <p className="text-text-muted text-xs truncate mt-0.5">
                  {c.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
              {c.unreadCount > 0 && (
                <span className="bg-accent text-bg-main text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-3">
                  {c.unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}