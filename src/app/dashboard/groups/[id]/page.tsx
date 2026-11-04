import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import GroupTabs from './GroupTabs'
import NewGroupPostForm from './NewGroupPostForm'
import GroupChat from './GroupChat'
import Link from 'next/link'

export default async function GroupPage({
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

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single()

  if (!group) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, users(full_name)')
    .eq('group_id', id)
    .order('created_at', { ascending: false })

  const { data: messages } = await supabase
    .from('group_messages')
    .select('*, users(full_name)')
    .eq('group_id', id)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{group.icon}</span>
        <h1 className="text-2xl font-semibold">{group.name}</h1>
      </div>
      <p className="text-text-muted mb-6 text-sm">{group.description}</p>

      <GroupTabs
        children={{
          posts: (
            <>
              <NewGroupPostForm groupId={id} />
              <div className="space-y-3 mt-6">
                {posts?.map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/dashboard/community/${post.id}`}
                    className="bg-bg-surface border border-border rounded-xl p-5 hover:border-accent transition block"
                  >
                    <p className="text-xs text-text-muted mb-1">{post.users?.full_name}</p>
                    <h2 className="text-base font-medium mb-1">{post.title}</h2>
                    <p className="text-text-muted text-sm line-clamp-2">{post.content}</p>
                  </Link>
                ))}
              </div>
            </>
          ),
          chat: (
            <GroupChat
              groupId={id}
              messages={messages || []}
              currentUserId={user?.id || ''}
            />
          ),
        }}
      />
    </div>
  )
}