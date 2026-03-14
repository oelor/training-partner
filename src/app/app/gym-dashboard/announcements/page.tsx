'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Pin, Trash2, Loader2, Megaphone, Send } from 'lucide-react'
import api, { GymAnnouncement } from '@/lib/api'
import { useToast } from '@/components/toast'
import { useAuth } from '@/lib/auth-context'

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function AnnouncementsPage() {
  const toast = useToast()
  const { user } = useAuth()
  const [gymId, setGymId] = useState<number | null>(null)
  const [announcements, setAnnouncements] = useState<GymAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const dashData = await api.getGymDashboardStats()
        const id = dashData.gym.id
        setGymId(id)
        const annData = await api.getGymAnnouncements(id)
        setAnnouncements(annData.announcements || [])
      } catch {
        toast.error('Failed to load announcements')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gymId || !title.trim() || !body.trim()) return

    setSubmitting(true)
    try {
      const result = await api.createAnnouncement({
        gym_id: gymId,
        title: title.trim(),
        body: body.trim(),
        pinned,
      })
      const refreshed = await api.getGymAnnouncements(gymId)
      setAnnouncements(refreshed.announcements || [])
      setTitle('')
      setBody('')
      setPinned(false)
      toast.success('Announcement sent to all gym members')
    } catch {
      toast.error('Failed to create announcement')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (announcementId: number) => {
    setDeletingId(announcementId)
    try {
      await api.deleteAnnouncement(announcementId)
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId))
      toast.success('Announcement deleted')
    } catch {
      toast.error('Failed to delete announcement')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/app/gym-dashboard"
          className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-background transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <div>
          <h1 className="font-heading text-3xl text-white">ANNOUNCEMENTS</h1>
          <p className="text-text-secondary text-sm">
            Send updates to all gym members
          </p>
        </div>
      </div>

      {/* Create Announcement Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-xl p-5 space-y-4"
      >
        <h2 className="font-heading text-lg text-white">New Announcement</h2>

        <div>
          <label htmlFor="ann-title" className="block text-sm text-text-secondary mb-1 font-body">
            Title
          </label>
          <input
            id="ann-title"
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Holiday Schedule Change"
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-body text-sm"
          />
        </div>

        <div>
          <label htmlFor="ann-body" className="block text-sm text-text-secondary mb-1 font-body">
            Message
          </label>
          <textarea
            id="ann-body"
            required
            rows={4}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your announcement..."
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-body text-sm resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={pinned}
              onChange={e => setPinned(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary/50 accent-primary"
            />
            <Pin className="w-4 h-4 text-text-secondary" />
            <span className="text-sm text-text-secondary font-body">Pin this announcement</span>
          </label>

          <button
            type="submit"
            disabled={submitting || !title.trim() || !body.trim()}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-body font-medium text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Announcement
          </button>
        </div>
      </form>

      {/* Announcements Feed */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-background rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-background rounded w-1/3" />
                  <div className="h-4 bg-background rounded w-full" />
                  <div className="h-4 bg-background rounded w-2/3" />
                  <div className="h-3 bg-background rounded w-1/4 mt-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedAnnouncements.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-xl">
          <Megaphone className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="font-heading text-xl text-white mb-2">No Announcements Yet</h3>
          <p className="text-text-secondary font-body text-sm">
            Create your first announcement to notify all gym members.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAnnouncements.map(announcement => (
            <div
              key={announcement.id}
              className={`bg-surface border rounded-xl p-5 ${
                announcement.pinned ? 'border-primary/30' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Author Avatar */}
                {announcement.author_avatar ? (
                  <img
                    src={announcement.author_avatar}
                    alt={announcement.author_name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-heading text-sm">
                      {announcement.author_name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {announcement.pinned ? (
                        <Pin className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : null}
                      <h3 className="font-heading text-lg text-white truncate">
                        {announcement.title}
                      </h3>
                    </div>
                    {(user?.id === announcement.author_id) && (
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        disabled={deletingId === announcement.id}
                        className="text-text-secondary hover:text-red-400 transition-colors flex-shrink-0 p-1"
                        title="Delete announcement"
                      >
                        {deletingId === announcement.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <p className="text-text-secondary font-body text-sm mt-1 whitespace-pre-wrap">
                    {announcement.body}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-text-secondary/70 text-xs font-body">
                      {announcement.author_name}
                    </span>
                    <span className="text-text-secondary/40 text-xs">
                      &middot;
                    </span>
                    <span className="text-text-secondary/70 text-xs font-body">
                      {timeAgo(announcement.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
