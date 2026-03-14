'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { MapPin, Shield, Star, Search, Filter, Megaphone, Tag, Navigation, X, Calendar, Clock, Zap } from 'lucide-react'
import api, { Gym, DiscoverGym, isPremiumPlan } from '@/lib/api'
import type { AppEvent } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { GymCardSkeleton } from '@/components/skeleton'
import { useToast } from '@/components/toast'
import { AdBanner } from '@/components/ad-banner'

const SPORTS = ['BJJ', 'MMA', 'Wrestling', 'Muay Thai', 'Boxing', 'Judo', 'Karate', 'Taekwondo', 'Kickboxing']

export default function GymsPage() {
  const { subscription } = useAuth()
  const toast = useToast()
  const toastRef = useRef(toast)
  toastRef.current = toast
  const [gyms, setGyms] = useState<DiscoverGym[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sportFilter, setSportFilter] = useState('')
  const [showPromotions, setShowPromotions] = useState(false)
  const [showOpenMats, setShowOpenMats] = useState(false)
  const [useLocation, setUseLocation] = useState(false)
  const [userLat, setUserLat] = useState(0)
  const [userLng, setUserLng] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const isPremium = isPremiumPlan(subscription?.plan)
  const [headlineEvents, setHeadlineEvents] = useState<AppEvent[]>([])

  // Fetch headline promoted events for the banner
  useEffect(() => {
    async function loadHeadlineEvents() {
      try {
        const res = await api.getPromotedEvents()
        const headlines = (res.events || []).filter((e: AppEvent) => e.promotion_tier === 'headline').slice(0, 2)
        setHeadlineEvents(headlines)
        // Track impressions
        for (const ev of headlines) {
          api.trackEventImpression(ev.id)
        }
      } catch {
        // silently fail
      }
    }
    loadHeadlineEvents()
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        if (search) {
          // Use regular search endpoint for text search
          const data = await api.getGyms({ search, sport: sportFilter || undefined })
          setGyms((data.gyms || []) as DiscoverGym[])
        } else {
          // Use discover endpoint for filter-based browsing
          const data = await api.discoverGyms({
            lat: useLocation ? userLat : undefined,
            lng: useLocation ? userLng : undefined,
            sport: sportFilter || undefined,
            promotions: showPromotions || undefined,
            open_mats: showOpenMats || undefined,
          })
          setGyms(data.gyms || [])
        }
      } catch {
        toastRef.current.error('Failed to load gyms')
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sportFilter, showPromotions, showOpenMats, useLocation, userLat, userLng])

  const handleUseLocation = () => {
    if (useLocation) {
      setUseLocation(false)
      return
    }
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude)
          setUserLng(pos.coords.longitude)
          setUseLocation(true)
          toast.success('Using your location to find nearby gyms')
        },
        () => toast.error('Could not get your location. Check browser permissions.'),
        { timeout: 10000 }
      )
    } else {
      toast.error('Geolocation is not supported by your browser')
    }
  }

  const hasActiveFilters = sportFilter || showPromotions || showOpenMats || useLocation

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl text-white mb-2">DISCOVER GYMS</h1>
          <p className="text-text-secondary">
            {gyms.length} gyms found {useLocation ? 'near you' : ''} {sportFilter ? `for ${sportFilter}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isPremium && (
            <Link href="/app/settings" className="bg-primary/20 border border-primary/50 px-4 py-2 rounded-lg text-sm hover:bg-primary/30 transition-colors">
              <span className="text-white">Upgrade </span>
              <span className="text-text-secondary">for all features</span>
            </Link>
          )}
        </div>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search gyms by name, city, or sport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search gyms"
            className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-primary/10 border-primary/50 text-primary'
              : 'bg-surface border-border text-text-secondary hover:text-white'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-4 animate-slide-up">
          {/* Location */}
          <div>
            <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">Location</label>
            <button
              onClick={handleUseLocation}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                useLocation
                  ? 'bg-accent/10 border-accent/50 text-accent'
                  : 'border-border text-text-secondary hover:text-white hover:border-primary/30'
              }`}
            >
              <Navigation className="w-4 h-4" />
              {useLocation ? 'Using Your Location' : 'Use My Location'}
              {useLocation && <X className="w-3 h-3 ml-1" onClick={(e) => { e.stopPropagation(); setUseLocation(false) }} />}
            </button>
          </div>

          {/* Sport filter */}
          <div>
            <label className="block text-text-secondary text-xs mb-2 uppercase tracking-wider">Sport</label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map(sport => (
                <button
                  key={sport}
                  onClick={() => setSportFilter(sportFilter === sport ? '' : sport)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    sportFilter === sport
                      ? 'bg-primary/10 border-primary/50 text-primary'
                      : 'border-border text-text-secondary hover:text-white hover:border-primary/30'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowPromotions(!showPromotions)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showPromotions
                  ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
                  : 'border-border text-text-secondary hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              Has Promotions
            </button>
            <button
              onClick={() => setShowOpenMats(!showOpenMats)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showOpenMats
                  ? 'bg-accent/10 border-accent/50 text-accent'
                  : 'border-border text-text-secondary hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              Open Mats
            </button>
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={() => { setSportFilter(''); setShowPromotions(false); setShowOpenMats(false); setUseLocation(false) }}
              className="text-sm text-text-secondary hover:text-white transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Ad Banner */}
      <AdBanner slot="discover_banner" className="my-4" />

      {/* Headline Promoted Events Banner */}
      {headlineEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading text-lg text-yellow-400 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            UPCOMING EVENTS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {headlineEvents.map(event => (
              <Link
                key={event.id}
                href="/app/events"
                onClick={() => api.trackEventClick(event.id)}
                className="bg-surface border border-yellow-500/50 bg-yellow-500/5 rounded-xl p-4 card-hover block"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-white text-sm truncate">{event.title}</h3>
                  <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-medium rounded-full">
                    <Zap className="w-2.5 h-2.5" />
                    Promoted
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {event.sport && (
                    <span className="px-1.5 py-0.5 bg-primary/15 text-primary rounded-full">{event.sport}</span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {event.location}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Gyms Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <GymCardSkeleton key={i} />)}
        </div>
      ) : gyms.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="font-heading text-xl text-white mb-2">No gyms found</h3>
          <p className="text-text-secondary">
            {hasActiveFilters ? 'Try adjusting your filters' : 'Try adjusting your search'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => { setSportFilter(''); setShowPromotions(false); setShowOpenMats(false); setUseLocation(false); setSearch('') }}
              className="mt-4 text-primary hover:text-primary/80 transition-colors text-sm"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {gyms.map((gym) => (
            <Link
              key={gym.id}
              href={`/app/gyms/${gym.id}`}
              className={`bg-surface border rounded-xl p-5 card-hover cursor-pointer block ${
                gym.premium && !isPremium ? 'border-accent/50' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-14 h-14 bg-accent/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-accent" />
                </div>
                <div className="flex items-center gap-2">
                  {gym.verified && (
                    <span className="bg-accent/20 text-accent text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {gym.premium && (
                    <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                      Premium
                    </span>
                  )}
                  {(gym as DiscoverGym).active_promotions && (gym as DiscoverGym).active_promotions! > 0 && (
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Promos
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-heading text-xl text-white mb-1">{gym.name}</h3>
              <p className="text-text-secondary text-sm mb-3">
                {gym.city}, {gym.state}
                {gym.distance_km != null && (
                  <span className="ml-2 text-accent">
                    {gym.distance_km < 1 ? `${Math.round(gym.distance_km * 1000)}m` : `${Math.round(gym.distance_km)}km`} away
                  </span>
                )}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {gym.sports?.map(sport => (
                  <span key={sport} className="text-xs px-2 py-1 bg-background rounded-full text-text-secondary">
                    {sport}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {gym.rating}
                </span>
                <span>{gym.review_count} reviews</span>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-white font-medium">{gym.price}</span>
                <span className="text-primary text-sm">View Details</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
