'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'

const SPORTS = ['BJJ', 'MMA', 'Wrestling', 'Boxing', 'Judo', 'Muay Thai', 'Kickboxing']
const SESSION_TYPES = [
  { value: 'private', label: 'Private (1-on-1)' },
  { value: 'semi_private', label: 'Semi-Private (2-3 students)' },
  { value: 'group', label: 'Group (4+ students)' },
  { value: 'online', label: 'Online / Remote' },
]

export default function CreateCoachingListingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    sport: '',
    title: '',
    description: '',
    session_type: 'private',
    duration_minutes: 60,
    price_dollars: '',
    location: '',
    max_students: 1,
    experience_years: '',
    payment_methods: 'Contact coach directly',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/auth/login'); return; }

    const priceCents = Math.round(parseFloat(form.price_dollars) * 100)
    if (isNaN(priceCents) || priceCents <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    setSubmitting(true)
    try {
      await api.createCoachingListing({
        sport: form.sport,
        title: form.title,
        description: form.description,
        session_type: form.session_type as 'private' | 'semi_private' | 'group' | 'online',
        duration_minutes: form.duration_minutes,
        price_cents: priceCents,
        location: form.location || undefined,
        max_students: form.max_students,
        experience_years: form.experience_years ? parseInt(form.experience_years) : undefined,
        payment_methods: form.payment_methods,
      })
      toast.success('Coaching listing created!')
      router.push('/app/coaching/mine')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create listing'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/app/coaching"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Coaching
      </Link>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h1 className="font-heading text-2xl text-white mb-2">CREATE COACHING LISTING</h1>
        <p className="text-text-secondary text-sm mb-6">
          List your coaching services for the Training Partner community.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sport */}
          <div>
            <label className="block text-sm text-white mb-1.5">Sport *</label>
            <select
              required
              value={form.sport}
              onChange={(e) => setForm(f => ({ ...f, sport: e.target.value }))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Select a sport</option>
              {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-white mb-1.5">Title *</label>
            <input
              required
              type="text"
              minLength={5}
              maxLength={100}
              placeholder="e.g. Fundamentals Private BJJ Coaching"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder-text-secondary/50 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-white mb-1.5">Description *</label>
            <textarea
              required
              minLength={20}
              maxLength={1000}
              rows={4}
              placeholder="Describe your coaching approach, what students will learn, your background..."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder-text-secondary/50 focus:outline-none focus:border-primary resize-none"
            />
            <p className="text-text-secondary text-xs mt-1">{form.description.length}/1000</p>
          </div>

          {/* Session type & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white mb-1.5">Session Type *</label>
              <select
                value={form.session_type}
                onChange={(e) => setForm(f => ({ ...f, session_type: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              >
                {SESSION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white mb-1.5">Duration (minutes)</label>
              <input
                type="number"
                min={15}
                max={480}
                value={form.duration_minutes}
                onChange={(e) => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 60 }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Price & Max students */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white mb-1.5">Price (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">$</span>
                <input
                  required
                  type="number"
                  min={1}
                  step={0.01}
                  placeholder="50"
                  value={form.price_dollars}
                  onChange={(e) => setForm(f => ({ ...f, price_dollars: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white mb-1.5">Max Students</label>
              <input
                type="number"
                min={1}
                max={50}
                value={form.max_students}
                onChange={(e) => setForm(f => ({ ...f, max_students: parseInt(e.target.value) || 1 }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm text-white mb-1.5">Location</label>
            <input
              type="text"
              placeholder="e.g. Downtown BJJ Academy, San Francisco"
              value={form.location}
              onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder-text-secondary/50 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm text-white mb-1.5">Years of Experience</label>
            <input
              type="number"
              min={0}
              max={50}
              placeholder="5"
              value={form.experience_years}
              onChange={(e) => setForm(f => ({ ...f, experience_years: e.target.value }))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder-text-secondary/50 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Payment methods */}
          <div>
            <label className="block text-sm text-white mb-1.5">Accepted Payment Methods</label>
            <input
              type="text"
              placeholder="e.g. Venmo, Cash, Zelle"
              value={form.payment_methods}
              onChange={(e) => setForm(f => ({ ...f, payment_methods: e.target.value }))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder-text-secondary/50 focus:outline-none focus:border-primary"
            />
            <p className="text-text-secondary text-xs mt-1">How students should pay you (arranged off-platform)</p>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-300">
            By creating a listing, you acknowledge that Training Partner does not process payments or mediate disputes. All transactions are arranged directly between you and your students.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-heading hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {submitting ? 'Creating...' : 'CREATE LISTING'}
          </button>
        </form>
      </div>
    </div>
  )
}
