'use client'

import { useState, useEffect } from 'react'
import { MessageSquarePlus, X, Star, Loader2, Bug, Lightbulb, MessageCircle, Send, ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import api from '@/lib/api'
import { useToast } from './toast'

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  { value: 'general', label: 'General Feedback', icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
]

export default function FeedbackWidget() {
  const toast = useToast()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [type, setType] = useState('general')
  const [rating, setRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setType('general')
      setRating(null)
      setTitle('')
      setBody('')
      setSubmitted(false)
    }
  }, [open])

  const handleSubmit = async () => {
    if (!body.trim()) return
    setSubmitting(true)
    try {
      await api.submitFeedback({
        type,
        rating: rating ?? undefined,
        title: title.trim() || undefined,
        body: body.trim(),
        page: pathname,
      })
      setSubmitted(true)
      toast.success('Thanks for your feedback!')
      setTimeout(() => setOpen(false), 1500)
    } catch {
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Don't show on auth pages
  if (pathname.startsWith('/auth')) return null

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary/90 text-white rounded-full p-3.5 shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 group"
          aria-label="Send feedback"
        >
          <MessageSquarePlus className="w-5 h-5" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-surface border border-border text-sm text-white px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Send Feedback
          </span>
        </button>
      )}

      {/* Feedback panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[360px] max-h-[80vh] overflow-hidden">
          <div className={`bg-surface border border-border rounded-xl shadow-2xl transition-all ${minimized ? '' : 'animate-slide-up'}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4 text-primary" />
                <span className="font-heading text-sm text-white">FEEDBACK</span>
                <span className="text-xs text-text-secondary bg-primary/10 px-2 py-0.5 rounded-full">Alpha</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized(!minimized)}
                  className="p-1 text-text-secondary hover:text-white transition-colors"
                  aria-label={minimized ? 'Expand' : 'Minimize'}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${minimized ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-text-secondary hover:text-white transition-colors"
                  aria-label="Close feedback"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            {!minimized && (
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {submitted ? (
                  <div className="py-8 text-center">
                    <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Send className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-heading text-lg text-white mb-1">THANK YOU!</h3>
                    <p className="text-text-secondary text-sm">Your feedback helps us improve Training Partner.</p>
                  </div>
                ) : (
                  <>
                    {/* Type selector */}
                    <div>
                      <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {FEEDBACK_TYPES.map((ft) => (
                          <button
                            key={ft.value}
                            onClick={() => setType(ft.value)}
                            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all text-xs ${
                              type === ft.value
                                ? ft.bg + ' ' + ft.color
                                : 'border-border text-text-secondary hover:border-primary/30'
                            }`}
                          >
                            <ft.icon className="w-4 h-4" />
                            <span>{ft.label.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">
                        How&apos;s your experience? <span className="text-text-secondary/50">(optional)</span>
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(rating === star ? null : star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-0.5 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                (hoverRating ?? rating ?? 0) >= star
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-border'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">
                        Title <span className="text-text-secondary/50">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={type === 'bug' ? 'What went wrong?' : type === 'feature' ? 'What would you like?' : 'Summary'}
                        className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm text-white placeholder-text-secondary focus:border-primary transition-colors"
                      />
                    </div>

                    {/* Body */}
                    <div>
                      <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">
                        Details *
                      </label>
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder={
                          type === 'bug'
                            ? 'Steps to reproduce, what happened vs expected...'
                            : type === 'feature'
                            ? 'Describe the feature and why it would help...'
                            : 'Share your thoughts...'
                        }
                        rows={3}
                        className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm text-white placeholder-text-secondary focus:border-primary transition-colors resize-none"
                      />
                    </div>

                    {/* Page context */}
                    <div className="text-xs text-text-secondary/50">
                      Page: {pathname}
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      disabled={!body.trim() || submitting}
                      className="w-full bg-primary text-white py-2.5 rounded-lg font-heading text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {submitting ? 'Sending...' : 'SEND FEEDBACK'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
