'use client'

import { useState } from 'react'
import CommentLikeButton from './CommentLikeButton'
import ReplyForm from './ReplyForm'
import CommentActions from './CommentActions'

type Comment = {
  id: string
  content: string
  parent_comment_id: string | null
  author_id: string
  users: { full_name: string } | null
} 

type LikeRow = { comment_id: string; user_id: string }

export default function RepliesList({
  parentId,
  parentAuthorName,
  allComments,
  postId,
  postAuthorId,
  commentLikes,
  currentUserId,
  depth = 0,
}: {
  parentId: string
  parentAuthorName?: string
  allComments: Comment[]
  postId: string
  postAuthorId: string
  commentLikes: LikeRow[]
  currentUserId: string
  depth?: number
}) {
  const [expanded, setExpanded] = useState(false)

  const replies = allComments.filter((c) => c.parent_comment_id === parentId)

  if (replies.length === 0) return null

  function getLikeCount(commentId: string) {
    return commentLikes.filter((l) => l.comment_id === commentId).length
  }

  function isLiked(commentId: string) {
    return commentLikes.some((l) => l.comment_id === commentId && l.user_id === currentUserId)
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs text-accent-text mt-1"
      >
        View {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
      </button>
    )
  }

  return (
    <div className="mt-2 space-y-2 border-l border-border pl-4 ml-6">
      <button
        onClick={() => setExpanded(false)}
        className="text-xs text-text-muted mb-1"
      >
        Hide replies
      </button>

      {replies.map((reply) => (
        <div key={reply.id}>
          <div className="bg-bg-surface border border-border rounded-xl p-3">
            <p className="text-xs mb-1">
              <span className="text-text-primary font-medium">{reply.users?.full_name}</span>
              {parentAuthorName && (
                <span className="text-text-muted">
                  {' '}↪ replying to <span className="text-accent-text">{parentAuthorName}</span>
                </span>
              )}
            </p>
            <p className="text-sm text-text-primary mb-2">{reply.content}</p>
            <div className="flex items-center gap-4">
              <CommentLikeButton
                commentId={reply.id}
                initialCount={getLikeCount(reply.id)}
                initiallyLiked={isLiked(reply.id)}
              />
              <ReplyForm postId={postId} parentCommentId={reply.id} />
              <CommentActions
                commentId={reply.id}
                isOwner={reply.author_id === currentUserId}
                canDelete={postAuthorId === currentUserId}
                initialContent={reply.content}
              />
            </div>
          </div>

        <RepliesList
            parentId={reply.id}
            parentAuthorName={reply.users?.full_name}
            allComments={allComments}
            postId={postId}
            postAuthorId={postAuthorId}
            commentLikes={commentLikes}
            currentUserId={currentUserId}
            depth={depth + 1}
          />
        </div>
      ))}
    </div>
  )
}