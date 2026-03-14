'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { trackFeedbackSubmitted } from '@/lib/analytics'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

const MOODS = [
  { emoji: '\u{1F62B}', rating: 1 },
  { emoji: '\u{1F615}', rating: 2 },
  { emoji: '\u{1F610}', rating: 3 },
  { emoji: '\u{1F642}', rating: 4 },
  { emoji: '\u{1F60D}', rating: 5 },
]

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'frustration', label: 'Frustration' },
  { value: 'praise', label: 'Praise' },
]

export default function FeedbackWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('suggestion')
  const [rating, setRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setType('suggestion')
      setRating(null)
      setMessage('')
      setSubmitted(false)
    }
  }, [open])

  // Auto-close after submission
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setOpen(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [submitted])

  const handleSubmit = async () => {
    const trimmed = message.trim()
    if (!trimmed || trimmed.length > 2000) return

    setSubmitting(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('tp_token') : null
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          page: pathname,
          type,
          rating: rating ?? undefined,
          message: trimmed,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('Feedback submit failed:', data)
      }

      // Link feedback to PostHog session for cross-referencing
      trackFeedbackSubmitted(type, rating, pathname || '/')
      setSubmitted(true)
    } catch (err) {
      console.error('Feedback submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Don't render on auth pages
  if (pathname?.startsWith('/auth')) return null

  return (
    <>
      {/* Floating trigger — bottom-left, above mobile nav */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 lg:bottom-6 left-4 z-40 bg-surface hover:bg-surface/90 border border-border text-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
          aria-label="Send feedback"
        >
          <span className="text-lg" role="img" aria-label="feedback">
            {'\u{1F4AC}'}
          </span>
        </button>
      )}

      {/* Feedback card */}
      {open && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 z-40 w-[340px] max-w-[calc(100vw-2rem)]">
          <div className="bg-surface border border-border rounded-xl shadow-2xl animate-slide-up">
            {submitted ? (
              /* Thank-you state */
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">{'\u{1F64F}'}</p>
                <p className="font-heading text-white text-sm">THANKS!</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="font-heading text-sm text-white tracking-wide">FEEDBACK</span>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1 text-text-secondary hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Mood selector */}
                  <div>
                    <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">
                      How do you feel?
                    </label>
                    <div className="flex gap-2 justify-between">
                      {MOODS.map((mood) => (
                        <button
                          key={mood.rating}
                          onClick={() => setRating(rating === mood.rating ? null : mood.rating)}
                          className={`text-2xl p-1.5 rounded-lg transition-all ${
                            rating === mood.rating
                              ? 'bg-primary/20 scale-110 ring-1 ring-primary/50'
                              : 'opacity-60 hover:opacity-100 hover:scale-105'
                          }`}
                          aria-label={`Rate ${mood.rating} out of 5`}
                        >
                          {mood.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type chips */}
                  <div>
                    <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">
                      Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FEEDBACK_TYPES.map((ft) => (
                        <button
                          key={ft.value}
                          onClick={() => setType(ft.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                            type === ft.value
                              ? 'bg-primary/20 border-primary/50 text-primary'
                              : 'border-border text-text-secondary hover:border-primary/30 hover:text-white'
                          }`}
                        >
                          {ft.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What's on your mind? Bug reports, suggestions, frustrations — all welcome!"
                      rows={3}
                      maxLength={2000}
                      className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm text-white placeholder-text-secondary focus:border-primary focus:outline-none transition-colors resize-none"
                    />
                    {message.length > 1800 && (
                      <p className="text-xs text-text-secondary mt-1 text-right">
                        {message.length}/2000
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || submitting}
                    className="w-full bg-primary text-white py-2.5 rounded-lg font-heading text-sm hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'SEND'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
