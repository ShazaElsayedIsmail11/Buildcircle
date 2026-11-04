import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import CommentForm from './CommentForm'
import LikeButton from './LikeButton'
import CommentLikeButton from './CommentLikeButton'
import RepliesList from './RepliesList'
import ReplyForm from './ReplyForm'
import PostActions from './PostActions'
import CommentActions from './CommentActions'
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
        getAll() { return cookieStore.getAll() },
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

  const { data: allComments } = await supabase
    .from('comments')
    .select('*, users(full_name)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  const { data: postLikes } = await supabase
    .from('post_likes')
    .select('user_id')
    .eq('post_id', id)

  const { data: commentLikes } = await supabase
    .from('comment_likes')
    .select('comment_id, user_id')

 const topLevelComments = (allComments || []).filter((c) => !c.parent_comment_id)

  function getCommentLikeCount(commentId: string) {
    return (commentLikes || []).filter((l) => l.comment_id === commentId).length
  }

  function isCommentLiked(commentId: string) {
    return (commentLikes || []).some((l) => l.comment_id === commentId && l.user_id === user?.id)
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs text-text-muted mb-1">{post.users?.full_name}</p>
    <h1 className="text-2xl font-semibold mb-3">{post.title}</h1>
      <p className="text-text-primary text-sm leading-relaxed mb-3">{post.content}</p>

      <PostActions
        postId={post.id}
        isOwner={user?.id === post.author_id}
        initialTitle={post.title}
        initialContent={post.content}
      />

      <LikeButton
        postId={post.id}
        initialCount={postLikes?.length || 0}
        initiallyLiked={(postLikes || []).some((l) => l.user_id === user?.id)}
      />

      <h2 className="text-lg font-semibold mb-3 mt-8">
        Comments ({allComments?.length || 0})
      </h2>

      <CommentForm postId={post.id} />

      <div className="space-y-4 mt-4">
      {topLevelComments.map((comment: any) => (
          <div key={comment.id}>
           <div className="bg-bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-text-muted mb-1">{comment.users?.full_name}</p>
              <p className="text-sm text-text-primary mb-2">{comment.content}</p>
              <div className="flex items-center gap-4">
                <CommentLikeButton
                  commentId={comment.id}
                  initialCount={getCommentLikeCount(comment.id)}
                  initiallyLiked={isCommentLiked(comment.id)}
                />
                <ReplyForm postId={post.id} parentCommentId={comment.id} />
               <CommentActions
                  commentId={comment.id}
                  isOwner={user?.id === comment.author_id}
                  canDelete={user?.id === post.author_id}
                  initialContent={comment.content}
                />
              </div>
            </div>
<RepliesList
              parentId={comment.id}
              parentAuthorName={comment.users?.full_name}
              allComments={allComments || []}
              postId={post.id}
              postAuthorId={post.author_id}
              commentLikes={commentLikes || []}
              currentUserId={user?.id || ''}
            />
          </div>
        ))}
      </div>
    </div>
  )
}