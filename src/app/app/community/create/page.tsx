'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import api from '@/lib/api'

const postTypes = [
  { value: 'article', label: 'Article', description: 'Share knowledge or stories' },
  { value: 'tip', label: 'Training Tip', description: 'Quick technique or training advice' },
  { value: 'question', label: 'Question', description: 'Ask the community for help' },
  { value: 'event', label: 'Event', description: 'Announce a tournament, seminar, or clinic' },
]

const sports = [
  { value: '', label: 'General (no specific sport)' },
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

export default function CreatePostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState('article')
  const [sport, setSport] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.createPost({
        title: title.trim(),
        body: body.trim(),
        type,
        sport: sport || undefined,
      })
      router.push('/app/community')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create post'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/app/community"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </Link>

      <h1 className="font-heading text-3xl text-white mb-6">CREATE POST</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Type */}
        <div>
          <label className="block text-white text-sm font-medium mb-3">Post Type</label>
          <div className="grid grid-cols-2 gap-3">
            {postTypes.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  type === t.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-surface hover:border-border/80'
                }`}
              >
                <p className={`text-sm font-medium ${type === t.value ? 'text-primary' : 'text-white'}`}>
                  {t.label}
                </p>
                <p className="text-text-secondary text-xs mt-0.5">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Sport */}
        <div>
          <label htmlFor="sport" className="block text-white text-sm font-medium mb-2">Sport (optional)</label>
          <select
            id="sport"
            value={sport}
            onChange={e => setSport(e.target.value)}
            className="w-full bg-surface border border-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
          >
            {sports.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-white text-sm font-medium mb-2">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Give your post a title..."
            maxLength={200}
            className="w-full bg-surface border border-border text-white rounded-xl px-4 py-3 text-sm placeholder-text-secondary focus:outline-none focus:border-primary"
          />
        </div>

        {/* Body */}
        <div>
          <label htmlFor="content" className="block text-white text-sm font-medium mb-2">Content</label>
          <textarea
            id="content"
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share your thoughts, tips, questions, or event details..."
            rows={8}
            maxLength={5000}
            className="w-full bg-surface border border-border text-white rounded-xl px-4 py-3 text-sm placeholder-text-secondary focus:outline-none focus:border-primary resize-none"
          />
          <p className="text-text-secondary text-xs mt-1">{body.length}/5000 characters</p>
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !title.trim() || !body.trim()}
            className="flex-1 bg-primary text-white py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Post'
            )}
          </button>
          <Link
            href="/app/community"
            className="px-6 py-3 bg-surface border border-border text-text-secondary rounded-xl text-sm font-medium hover:text-white transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
