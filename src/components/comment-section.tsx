'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Send, Trash2, Loader2, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react'
import api, { Comment } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from './toast'

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

interface CommentSectionProps {
  postId: number
  commentCount?: number
}

export default function CommentSection({ postId, commentCount = 0 }: CommentSectionProps) {
  const { user } = useAuth()
  const toast = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [count, setCount] = useState(commentCount)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getPostComments(postId)
      setComments(data.comments || [])
      setCount(data.total || 0)
    } catch {
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }, [postId, toast])

  useEffect(() => {
    if (expanded) fetchComments()
  }, [expanded, fetchComments])

  const handleSubmit = async (parentId?: number) => {
    const text = parentId ? replyText.trim() : newComment.trim()
    if (!text) return
    setSubmitting(true)
    try {
      const data = await api.createPostComment(postId, text, parentId || undefined)
      setComments(prev => [...prev, data.comment])
      setCount(prev => prev + 1)
      if (parentId) {
        setReplyTo(null)
        setReplyText('')
      } else {
        setNewComment('')
      }
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    try {
      await api.deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      setCount(prev => Math.max(0, prev - 1))
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  // Organize into top-level and replies
  const topLevel = comments.filter(c => !c.parent_id)
  const replies = comments.filter(c => c.parent_id)

  return (
    <div className="border-t border-border mt-4 pt-3">
      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{count} {count === 1 ? 'comment' : 'comments'}</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* New comment input */}
          {user && (
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-primary text-xs font-bold">{user.display_name?.charAt(0) || '?'}</span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                  placeholder="Write a comment..."
                  className="flex-1 bg-background border border-border rounded-lg py-2 px-3 text-sm text-white placeholder-text-secondary focus:border-primary transition-colors"
                />
                <button
                  onClick={() => handleSubmit()}
                  disabled={!newComment.trim() || submitting}
                  className="bg-primary text-white p-2 rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          )}

          {/* Comments list */}
          {!loading && topLevel.length === 0 && (
            <p className="text-text-secondary text-sm text-center py-4">No comments yet. Be the first!</p>
          )}

          {topLevel.map((comment) => {
            const commentReplies = replies.filter(r => r.parent_id === comment.id)
            return (
              <div key={comment.id} className="space-y-2">
                {/* Top-level comment */}
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    {comment.author_avatar ? (
                      <img src={comment.author_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-primary text-xs font-bold">{comment.author_name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-background rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white text-xs font-medium">{comment.author_name}</span>
                        <span className="text-text-secondary/50 text-xs">{timeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-text-secondary text-sm">{comment.body}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 ml-1">
                      <button
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className="text-text-secondary hover:text-primary text-xs transition-colors"
                      >
                        Reply
                      </button>
                      {user && (comment.user_id === user.id || user.role === 'admin') && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-text-secondary hover:text-red-400 text-xs transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {commentReplies.map((reply) => (
                  <div key={reply.id} className="flex gap-2 ml-9">
                    <CornerDownRight className="w-3 h-3 text-border shrink-0 mt-2" />
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {reply.author_avatar ? (
                        <img src={reply.author_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-primary text-[10px] font-bold">{reply.author_name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-background rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-white text-xs font-medium">{reply.author_name}</span>
                          <span className="text-text-secondary/50 text-xs">{timeAgo(reply.created_at)}</span>
                        </div>
                        <p className="text-text-secondary text-sm">{reply.body}</p>
                      </div>
                      {user && (reply.user_id === user.id || user.role === 'admin') && (
                        <button
                          onClick={() => handleDelete(reply.id)}
                          className="text-text-secondary hover:text-red-400 text-xs ml-1 mt-1 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Reply input */}
                {replyTo === comment.id && user && (
                  <div className="flex gap-2 ml-9">
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(comment.id)}
                        placeholder={`Reply to ${comment.author_name}...`}
                        className="flex-1 bg-background border border-border rounded-lg py-1.5 px-3 text-sm text-white placeholder-text-secondary focus:border-primary transition-colors"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSubmit(comment.id)}
                        disabled={!replyText.trim() || submitting}
                        className="bg-primary/80 text-white p-1.5 rounded-lg disabled:opacity-50 hover:bg-primary transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
