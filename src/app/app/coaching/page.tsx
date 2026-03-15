'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, Users, Clock, DollarSign, MapPin, Filter,
  Loader2, Plus, User, Monitor, UserCheck, ChevronDown
} from 'lucide-react'
import api, { CoachingListing } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'
import { getSportColor } from '@/lib/sport-colors'
import { NoBookings } from '@/components/empty-states'

const SPORTS = ['All', 'BJJ', 'MMA', 'Wrestling', 'Boxing', 'Judo', 'Muay Thai', 'Kickboxing']
const SESSION_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'private', label: 'Private' },
  { value: 'semi_private', label: 'Semi-Private' },
  { value: 'group', label: 'Group' },
  { value: 'online', label: 'Online' },
]

const SESSION_TYPE_ICONS: Record<string, typeof User> = {
  private: User,
  semi_private: UserCheck,
  group: Users,
  online: Monitor,
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  private: 'Private',
  semi_private: 'Semi-Private',
  group: 'Group',
  online: 'Online',
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

export default function CoachingMarketplacePage() {
  const { user } = useAuth()
  const toast = useToast()
  const [listings, setListings] = useState<CoachingListing[]>([])
  const [loading, setLoading] = useState(true)
  const [sport, setSport] = useState('All')
  const [sessionType, setSessionType] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params: Record<string, string | number> = { page }
        if (sport !== 'All') params.sport = sport
        if (sessionType) params.session_type = sessionType
        const data = await api.getCoachingListings(params as Parameters<typeof api.getCoachingListings>[0])
        setListings(data.listings)
      } catch {
        toast.error('Failed to load coaching listings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sport, sessionType, page, toast])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-white">FIND A COACH</h1>
          <p className="text-text-secondary mt-1">
            Connect with experienced coaches in your area or online
          </p>
        </div>
        {user && (
          <Link
            href="/app/coaching/create"
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-heading hover:bg-primary/90 transition-colors self-start"
          >
            <Plus className="w-4 h-4" />
            LIST YOUR SERVICES
          </Link>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-300">
        <strong>Note:</strong> Payment is arranged directly between you and the coach. Training Partner does not process payments or mediate disputes.
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Sport filter tabs */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              {SPORTS.map(s => (
                <button
                  key={s}
                  onClick={() => { setSport(s); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    sport === s
                      ? 'bg-primary text-white'
                      : 'bg-background border border-border text-text-secondary hover:text-white hover:border-primary/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Session type dropdown */}
          <div className="relative min-w-[160px]">
            <select
              value={sessionType}
              onChange={(e) => { setSessionType(e.target.value); setPage(1); }}
              className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary pr-8"
            >
              {SESSION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <NoBookings
          ctaHref={user ? '/app/coaching/create' : undefined}
          ctaText={user ? 'CREATE LISTING' : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map(listing => {
            const Icon = SESSION_TYPE_ICONS[listing.session_type] || User
            return (
              <Link
                key={listing.id}
                href={`/app/coaching/${listing.id}`}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:-translate-y-1 group"
              >
                {/* Coach info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {listing.coach_avatar ? (
                      <img src={listing.coach_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{listing.coach_name}</p>
                    <p className="text-text-secondary text-xs">{listing.sport}</p>
                  </div>
                </div>

                {/* Title & description */}
                <h3 className="font-heading text-lg text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
                  {listing.title}
                </h3>
                <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                  {listing.description}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${getSportColor(listing.sport).bg} ${getSportColor(listing.sport).text}`}>
                    <Icon className="w-3 h-3" />
                    {SESSION_TYPE_LABELS[listing.session_type] || listing.session_type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {listing.duration_minutes} min
                  </span>
                  {listing.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{listing.location}</span>
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-white font-heading text-lg">
                    {formatPrice(listing.price_cents)}
                    <span className="text-text-secondary text-xs font-normal"> /session</span>
                  </span>
                  {listing.experience_years && (
                    <span className="text-text-secondary text-xs">
                      {listing.experience_years}+ yrs exp
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
