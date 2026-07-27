import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import CommentForm from './CommentForm'

export default async function PostPage({
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
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: post } = await supabase
    .from('posts')
    .select('*, users(full_name)')
    .eq('id', id)
    .single()

  if (!post) notFound()

  const { data: comments } = await supabase
    .from('comments')
    .select('*, users(full_name)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-2xl">
      <p className="text-xs text-text-muted mb-1">{post.users?.full_name}</p>
      <h1 className="text-2xl font-semibold mb-3">{post.title}</h1>
      <p className="text-text-primary text-sm leading-relaxed mb-8">{post.content}</p>

      <h2 className="text-lg font-semibold mb-3">
        Comments ({comments?.length || 0})
      </h2>

      <CommentForm postId={post.id} />

      <div className="space-y-3 mt-4">
        {comments?.map((comment) => (
          <div
            key={comment.id}
            className="bg-bg-surface border border-border rounded-xl p-4"
          >
            <p className="text-xs text-text-muted mb-1">{comment.users?.full_name}</p>
            <p className="text-sm text-text-primary">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}