'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Calendar, Plus, ChevronUp, MapPin, Clock, Users, Trash2, Loader2, Zap, X, Megaphone } from 'lucide-react'
import api from '@/lib/api'
import type { AppEvent } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'
import { AdBanner } from '@/components/ad-banner'

const SPORTS = ['BJJ', 'Wrestling', 'MMA', 'Boxing', 'Muay Thai', 'Judo', 'Kickboxing', 'Other']
const TABS = ['Upcoming', 'My Events', 'Past'] as const
const PAGE_SIZE = 20

const PROMOTION_TIERS = [
  { id: 'featured' as const, name: 'Featured', price: '$50', description: 'Gold badge in the events feed' },
  { id: 'spotlight' as const, name: 'Spotlight', price: '$100', description: 'Featured + pinned to top of feed' },
  { id: 'headline' as const, name: 'Headline', price: '$200', description: 'Spotlight + shown on Discover page' },
]

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatEndTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function EventsPage() {
  const { user } = useAuth()
  const toast = useToast()

  const [events, setEvents] = useState<AppEvent[]>([])
  const [promotedEvents, setPromotedEvents] = useState<AppEvent[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)

  const [tab, setTab] = useState<typeof TABS[number]>('Upcoming')
  const [sportFilter, setSportFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Promote modal state
  const [promoteEventId, setPromoteEventId] = useState<number | null>(null)
  const [promoting, setPromoting] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sport, setSport] = useState('')
  const [location, setLocation] = useState('')
  const [maxAttendees, setMaxAttendees] = useState(0)
  const [description, setDescription] = useState('')

  // RSVP loading tracker
  const [rsvpLoading, setRsvpLoading] = useState<Record<number, boolean>>({})

  // Track impressions for promoted events
  const impressionTracked = useRef<Set<number>>(new Set())

  const fetchEvents = useCallback(async (reset = false) => {
    const newOffset = reset ? 0 : offset
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const params: { sport?: string; status?: string; mine?: boolean; limit: number; offset: number } = {
        limit: PAGE_SIZE,
        offset: newOffset,
      }
      if (sportFilter) params.sport = sportFilter
      if (tab === 'Upcoming') params.status = 'upcoming'
      if (tab === 'Past') params.status = 'past'
      if (tab === 'My Events') params.mine = true

      const res = await api.getEvents(params)
      if (reset) {
        setEvents(res.events)
        setOffset(PAGE_SIZE)
      } else {
        setEvents(prev => [...prev, ...res.events])
        setOffset(prev => prev + PAGE_SIZE)
      }
      setTotal(res.total)
    } catch {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [offset, sportFilter, tab, toast])

  // Fetch promoted events on mount
  useEffect(() => {
    async function loadPromoted() {
      try {
        const res = await api.getPromotedEvents()
        setPromotedEvents(res.events || [])
        // Track impressions for promoted events
        for (const ev of (res.events || [])) {
          if (!impressionTracked.current.has(ev.id)) {
            impressionTracked.current.add(ev.id)
            api.trackEventImpression(ev.id)
          }
        }
      } catch {
        // silently fail - promoted events are non-critical
      }
    }
    loadPromoted()
  }, [])

  useEffect(() => {
    fetchEvents(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, sportFilter])

  // Check for promoted=success query param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('promoted') === 'success') {
        toast.success('Event promoted successfully! It will appear as promoted shortly.')
        window.history.replaceState({}, '', window.location.pathname)
      } else if (params.get('promoted') === 'cancelled') {
        toast.error('Promotion cancelled')
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !eventDate) {
      toast.error('Title and date are required')
      return
    }
    setSubmitting(true)
    try {
      await api.createEvent({
        title: title.trim(),
        event_date: new Date(eventDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : undefined,
        sport: sport || undefined,
        location: location.trim() || undefined,
        max_attendees: maxAttendees || undefined,
        description: description.trim() || undefined,
      })
      toast.success('Event created!')
      setTitle('')
      setEventDate('')
      setEndDate('')
      setSport('')
      setLocation('')
      setMaxAttendees(0)
      setDescription('')
      setShowForm(false)
      fetchEvents(true)
    } catch {
      toast.error('Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRsvp = async (eventId: number, status: 'going' | 'interested' | 'not_going') => {
    setRsvpLoading(prev => ({ ...prev, [eventId]: true }))
    try {
      const res = await api.rsvpEvent(eventId, status)
      setEvents(prev =>
        prev.map(ev =>
          ev.id === eventId
            ? { ...ev, my_rsvp: res.status === 'not_going' ? null : res.status, attendee_count: res.attendee_count }
            : ev
        )
      )
    } catch {
      toast.error('Failed to update RSVP')
    } finally {
      setRsvpLoading(prev => ({ ...prev, [eventId]: false }))
    }
  }

  const handleDelete = async (eventId: number) => {
    if (!confirm('Delete this event?')) return
    try {
      await api.deleteEvent(eventId)
      setEvents(prev => prev.filter(ev => ev.id !== eventId))
      toast.success('Event deleted')
    } catch {
      toast.error('Failed to delete event')
    }
  }

  const handlePromote = async (tier: 'featured' | 'spotlight' | 'headline') => {
    if (!promoteEventId) return
    setPromoting(true)
    try {
      const res = await api.promoteEvent(promoteEventId, tier)
      if (res.url) {
        window.location.href = res.url
      }
    } catch {
      toast.error('Failed to start promotion checkout')
      setPromoting(false)
    }
  }

  const handlePromotedEventClick = (eventId: number) => {
    api.trackEventClick(eventId)
  }

  const renderEventCard = (event: AppEvent, isPromoted = false) => {
    const isCreator = user?.id === event.creator_id
    const isRsvpLoading = rsvpLoading[event.id]

    return (
      <div
        key={event.id}
        className={`bg-surface border rounded-xl p-5 space-y-3 ${
          isPromoted || event.is_promoted
            ? 'border-yellow-500/50 bg-yellow-500/5 shadow-lg border-l-4 border-l-yellow-500'
            : 'border-border'
        }`}
        onClick={() => (isPromoted || event.is_promoted) ? handlePromotedEventClick(event.id) : undefined}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white truncate">{event.title}</h3>
              {(isPromoted || event.is_promoted) ? (
                <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                  <Zap className="w-3 h-3" />
                  Promoted
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatEventDate(event.event_date)}
                {event.end_date && ` - ${formatEndTime(event.end_date)}`}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.location}
                </span>
              )}
            </div>
          </div>

          {event.sport && (
            <span className="flex-shrink-0 px-2.5 py-1 bg-primary/15 text-primary text-xs font-medium rounded-full">
              {event.sport}
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-text-secondary line-clamp-2">{event.description}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            {/* Creator */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold">
                {event.creator_avatar
                  ? <img src={event.creator_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                  : event.creator_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span className="text-xs text-text-secondary">{event.creator_name}</span>
            </div>

            {/* Attendee count */}
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <Users className="w-3.5 h-3.5" />
              {event.max_attendees > 0
                ? `${event.attendee_count}/${event.max_attendees} going`
                : `${event.attendee_count} going`}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isCreator ? (
              <>
                {!event.is_promoted && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setPromoteEventId(event.id) }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    Promote
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(event.id) }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRsvp(event.id, event.my_rsvp === 'going' ? 'not_going' : 'going') }}
                  disabled={isRsvpLoading}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    event.my_rsvp === 'going'
                      ? 'bg-accent/20 text-accent hover:bg-accent/10'
                      : 'bg-white/5 text-text-secondary hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isRsvpLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : event.my_rsvp === 'going' ? (
                    'Going'
                  ) : (
                    'RSVP'
                  )}
                </button>
                {event.my_rsvp !== 'going' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRsvp(event.id, event.my_rsvp === 'interested' ? 'not_going' : 'interested') }}
                    disabled={isRsvpLoading}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      event.my_rsvp === 'interested'
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10'
                        : 'bg-white/5 text-text-secondary hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {event.my_rsvp === 'interested' ? 'Interested' : 'Interested'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-white flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          EVENTS
        </h1>
        <p className="text-text-secondary mt-1">Training events and open mats near you</p>
      </div>

      {/* Create Event Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
      >
        {showForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        Create Event
      </button>

      {/* Create Event Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-heading text-lg text-white">New Event</h2>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Saturday Open Mat"
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white placeholder-text-secondary/50 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">End Date/Time</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Sport</label>
              <select
                value={sport}
                onChange={e => setSport(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
              >
                <option value="">Select sport</option>
                {SPORTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Max Attendees</label>
              <input
                type="number"
                value={maxAttendees || ''}
                onChange={e => setMaxAttendees(Number(e.target.value))}
                placeholder="0 = unlimited"
                min={0}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white placeholder-text-secondary/50 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Iron Temple MMA - Main Floor"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white placeholder-text-secondary/50 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Details about the event..."
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white placeholder-text-secondary/50 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Event
          </button>
        </form>
      )}

      {/* Promoted Events Section */}
      {promotedEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading text-lg text-yellow-400 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            PROMOTED EVENTS
          </h2>
          <div className="space-y-3">
            {promotedEvents.map(event => renderEventCard(event, true))}
          </div>
        </div>
      )}

      {/* Tab Row */}
      <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-primary/20 text-primary'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Sport Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-text-secondary">Filter by sport:</label>
        <select
          value={sportFilter}
          onChange={e => setSportFilter(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary"
        >
          <option value="">All Sports</option>
          {SPORTS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <Calendar className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No upcoming events. Be the first to create one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id}>
              {renderEventCard(event)}
              {(index + 1) % 5 === 0 && (
                <AdBanner slot="events_feed" className="my-4" />
              )}
            </div>
          ))}

          {/* Load More */}
          {events.length < total && (
            <div className="text-center pt-2">
              <button
                onClick={() => fetchEvents(false)}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-surface border border-border hover:border-primary/50 text-text-secondary hover:text-white rounded-lg text-sm transition-colors flex items-center gap-2 mx-auto"
              >
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                Load More
              </button>
            </div>
          )}
        </div>
      )}

      {/* Promote Event Modal */}
      {promoteEventId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => !promoting && setPromoteEventId(null)}>
          <div className="bg-surface border border-border rounded-xl p-6 max-w-md w-full space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-yellow-400" />
                Promote Event
              </h2>
              <button onClick={() => !promoting && setPromoteEventId(null)} className="text-text-secondary hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-text-secondary">
              Promote your event to reach more people. Promoted events run for 30 days.
            </p>

            <div className="space-y-3">
              {PROMOTION_TIERS.map(tier => (
                <button
                  key={tier.id}
                  onClick={() => handlePromote(tier.id)}
                  disabled={promoting}
                  className="w-full text-left bg-background border border-border hover:border-yellow-500/50 rounded-lg p-4 transition-colors group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white group-hover:text-yellow-400 transition-colors">{tier.name}</span>
                    <span className="text-yellow-400 font-bold">{tier.price}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{tier.description}</p>
                </button>
              ))}
            </div>

            {promoting && (
              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to checkout...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
