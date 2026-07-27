import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import NewPostForm from './NewPostForm'
import Link from 'next/link'

export default async function Community() {
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

  const { data: posts } = await supabase
    .from('posts')
    .select('*, users(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Community</h1>
      <p className="text-text-muted mb-6 text-sm">
        Discuss ideas, ask questions, share updates.
      </p>

      <NewPostForm />

      <div className="space-y-3 mt-6">
        {posts?.map((post) => (
          <Link
            key={post.id}
            href={`/dashboard/community/${post.id}`}
className="bg-bg-surface border border-border rounded-xl p-5 hover:border-accent hover:-translate-y-0.5 transition block"          >
            <p className="text-xs text-text-muted mb-1">{post.users?.full_name}</p>
            <h2 className="text-base font-medium mb-1">{post.title}</h2>
            <p className="text-text-muted text-sm line-clamp-2">{post.content}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}