'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Heart, MessageCircle, Filter, Loader2, Trash2 } from 'lucide-react'
import api, { Post } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'
import ShareButton from '@/components/share-button'
import CommentSection from '@/components/comment-section'

const postTypes = [
  { value: '', label: 'All' },
  { value: 'article', label: 'Articles' },
  { value: 'tip', label: 'Tips' },
  { value: 'question', label: 'Questions' },
  { value: 'event', label: 'Events' },
]

const sports = [
  { value: '', label: 'All Sports' },
  { value: 'wrestling', label: 'Wrestling' },
  { value: 'mma', label: 'MMA' },
  { value: 'bjj', label: 'BJJ' },
  { value: 'boxing', label: 'Boxing' },
  { value: 'kickboxing', label: 'Kickboxing' },
  { value: 'muay-thai', label: 'Muay Thai' },
  { value: 'judo', label: 'Judo' },
  { value: 'karate', label: 'Karate' },
  { value: 'sambo', label: 'Sambo' },
]

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const typeColors: Record<string, string> = {
  article: 'bg-blue-500/20 text-blue-400',
  tip: 'bg-accent/20 text-accent',
  question: 'bg-yellow-500/20 text-yellow-400',
  event: 'bg-primary/20 text-primary',
}

export default function CommunityPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [filterSport, setFilterSport] = useState('')
  const [offset, setOffset] = useState(0)
  const likingRef = useRef<Set<number>>(new Set()) // debounce guard

    const fetchPosts = useCallback(async (reset = false, customOffset?: number) => {
    setLoading(true)
    try {
      const effectiveOffset = customOffset ?? (reset ? 0 : offset)
      const res = await api.getPosts({ type: filterType || undefined, sport: filterSport || undefined, limit: 20, offset: effectiveOffset })
      if (reset) {
        setPosts(res.posts)
        setOffset(0)
      } else {
        setPosts(prev => [...prev, ...res.posts])
      }
      setTotal(res.total)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.error('Failed to load posts:', e)
      toast.error('Failed to load posts. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [filterType, filterSport, offset, toast])

  useEffect(() => {
    fetchPosts(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterSport])

  const handleLike = async (postId: number) => {
    // Prevent concurrent likes on the same post
    if (likingRef.current.has(postId)) return
    likingRef.current.add(postId)
    try {
      const res = await api.toggleLike(postId)
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, liked: res.liked, likes_count: res.likes_count ?? (res.liked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1)) }
          : p
      ))
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.error('Like failed:', e)
    } finally {
      likingRef.current.delete(postId)
    }
  }

  const handleDelete = async (postId: number) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.deletePost(postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
      setTotal(prev => prev - 1)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.error('Delete failed:', e)
    }
  }

  const loadMore = () => {
    const newOffset = offset + 20
    setOffset(newOffset)
    fetchPosts(false, newOffset)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl text-white">COMMUNITY</h1>
          <p className="text-text-secondary text-sm mt-1">
            Tips, articles, questions &amp; events from the combat sports community
          </p>
        </div>
        <Link
          href="/app/community/create"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 text-text-secondary text-sm">
          <Filter className="w-4 h-4" />
        </div>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by type">
          {postTypes.map(t => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              aria-pressed={filterType === t.value}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterType === t.value
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-text-secondary hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          value={filterSport}
          onChange={e => setFilterSport(e.target.value)}
          aria-label="Filter by sport"
          className="bg-surface border border-border text-text-secondary text-xs rounded-lg px-3 py-1"
        >
          {sports.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Posts */}
      {loading && posts.length === 0 ? (
        <div className="flex items-center justify-center py-20" role="status">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="sr-only">Loading posts...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-xl">
          <MessageCircle className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <h2 className="font-heading text-xl text-white mb-2">No posts yet</h2>
          <p className="text-text-secondary text-sm mb-6">Be the first to share something with the community</p>
          <Link
            href="/app/community/create"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <article key={post.id} className="bg-surface border border-border rounded-xl p-6 hover:border-border/80 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden">
                    {post.author_avatar ? (
                      <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary font-bold text-sm">{post.author_name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{post.author_name}</p>
                    <p className="text-text-secondary text-xs">{timeAgo(post.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[post.type] || 'bg-surface text-text-secondary'}`}>
                    {post.type}
                  </span>
                  {post.sport && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-surface border border-border text-text-secondary">
                      {post.sport}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-white font-medium text-lg mb-2">{post.title}</h3>
              <p className="text-text-secondary text-sm line-clamp-3 mb-4">{post.body}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    aria-label={post.liked ? `Unlike post (${post.likes_count} likes)` : `Like post (${post.likes_count} likes)`}
                    aria-pressed={post.liked}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      post.liked ? 'text-primary' : 'text-text-secondary hover:text-primary'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.liked ? 'fill-primary' : ''}`} />
                    {post.likes_count}
                  </button>
                  <ShareButton
                    title={post.title}
                    text={`${post.title} — Training Partner Community`}
                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}/app/community`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {user && (post.user_id === user.id || user.role === 'admin') && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      aria-label="Delete post"
                      className="text-text-secondary hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <CommentSection postId={post.id} commentCount={post.comment_count || 0} />
            </article>
          ))}

          {posts.length < total && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full py-3 bg-surface border border-border rounded-xl text-text-secondary hover:text-white hover:border-primary transition-colors text-sm font-medium"
            >
              {loading ? 'Loading...' : `Load More (${posts.length} of ${total})`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
