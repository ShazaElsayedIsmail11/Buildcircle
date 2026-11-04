import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import DashboardShell from './DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

 const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  
  if (profile?.role === 'admin') {
    console.log('REDIRECTING TO ADMIN')
    redirect('/admin')
  }
    if (profile?.role === 'admin') {
    redirect('/admin')
  }
  
const { data: userConversations } = await supabase
    .from('conversations')
    .select('id')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)

  const conversationIds = userConversations?.map((c) => c.id) || []

  const { count: unreadMessagesCount } =
    conversationIds.length > 0
      ? await supabase
          .from('direct_messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)
          .eq('is_read', false)
          .neq('sender_id', user.id)
      : { count: 0 }
      const { count: unreadNotificationsCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
 return (
<DashboardShell
      user={profile}
      unreadMessagesCount={unreadMessagesCount || 0}
      unreadNotificationsCount={unreadNotificationsCount || 0}
    >      {children}
    </DashboardShell>
  )
}