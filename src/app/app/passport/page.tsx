'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Trophy, MapPin, Star, CheckCircle, Lock,
  Footprints, Flame, Zap, Shield, Crown,
  Compass, Map, Globe, ChevronDown, Loader2, Calendar, Dumbbell,
} from 'lucide-react'
import api, { PassportGym, Badge, Checkin, GymMembership } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'

const ALL_BADGES = [
  { id: 'first_step', name: 'First Step', description: '1 check-in', icon: Footprints },
  { id: 'regular', name: 'Regular', description: '10 check-ins', icon: Flame },
  { id: 'dedicated', name: 'Dedicated', description: '50 check-ins', icon: Zap },
  { id: 'iron_will', name: 'Iron Will', description: '100 check-ins', icon: Shield },
  { id: 'legend', name: 'Legend', description: '500 check-ins', icon: Crown },
  { id: 'explorer', name: 'Explorer', description: '3 unique gyms', icon: Compass },
  { id: 'nomad', name: 'Nomad', description: '10 unique gyms', icon: Map },
  { id: 'globetrotter', name: 'Globetrotter', description: '25 unique gyms', icon: Globe },
] as const

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelative(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateStr)
}

export default function PassportPage() {
  const { user } = useAuth()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [gyms, setGyms] = useState<PassportGym[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [totalCheckins, setTotalCheckins] = useState(0)
  const [uniqueGyms, setUniqueGyms] = useState(0)
  const [badges, setBadges] = useState<Badge[]>([])

  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [checkinsLoading, setCheckinsLoading] = useState(true)

  const [memberships, setMemberships] = useState<GymMembership[]>([])
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [lastCheckinGym, setLastCheckinGym] = useState<{ id: number; name: string } | null>(null)

  const loadPassport = useCallback(async () => {
    try {
      const data = await api.getTrainingPassport()
      setGyms(data.gyms || [])
      setTotalPoints(data.total_points || 0)
      setTotalCheckins(data.total_checkins || 0)
      setUniqueGyms(data.unique_gyms || 0)
      setBadges(data.badges || [])
    } catch {
      toast.error('Failed to load training passport')
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadCheckins = useCallback(async () => {
    try {
      const data = await api.getCheckins({ limit: 20 })
      setCheckins(data.checkins || [])
    } catch {
      // silently fail, passport data is primary
    } finally {
      setCheckinsLoading(false)
    }
  }, [])

  const loadMemberships = useCallback(async () => {
    try {
      const data = await api.getMyGymMemberships()
      const active = (data.memberships || []).filter((m) => m.status === 'active')
      setMemberships(active)
      if (active.length > 0) setSelectedGymId(active[0].gym_id)
    } catch {
      // non-critical
    }
  }, [])

  useEffect(() => {
    loadPassport()
    loadCheckins()
    loadMemberships()
  }, [loadPassport, loadCheckins, loadMemberships])

  const earnedBadgeIds = new Set(badges.map((b) => b.id))

  async function handleCheckin() {
    if (!selectedGymId) return
    setCheckinLoading(true)
    try {
      const result = await api.checkin(selectedGymId)
      toast.success(`Checked in at ${result.gym_name}! +${result.points_earned} pts`)
      setTotalPoints(result.total_points)
      setLastCheckinGym({ id: selectedGymId, name: result.gym_name })
      loadPassport()
      loadCheckins()
    } catch {
      toast.error('Check-in failed. Are you close enough to the gym?')
    } finally {
      setCheckinLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl text-white">TRAINING PASSPORT</h1>
          <p className="text-text-secondary text-sm">Your journey across the mats</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="font-heading text-2xl lg:text-3xl text-primary">{totalPoints.toLocaleString()}</p>
          <p className="text-text-secondary text-xs mt-1">Total Points</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="font-heading text-2xl lg:text-3xl text-accent">{totalCheckins.toLocaleString()}</p>
          <p className="text-text-secondary text-xs mt-1">Check-ins</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="font-heading text-2xl lg:text-3xl text-white">{uniqueGyms}</p>
          <p className="text-text-secondary text-xs mt-1">Unique Gyms</p>
        </div>
      </div>

      {/* Badges */}
      <section>
        <h2 className="font-heading text-xl text-white mb-4">BADGES</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ALL_BADGES.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id)
            const Icon = badge.icon
            return (
              <div
                key={badge.id}
                className={`relative rounded-xl border p-4 flex flex-col items-center text-center transition-all ${
                  earned
                    ? 'bg-accent/10 border-accent/40 shadow-[0_0_20px_rgba(0,255,136,0.15)]'
                    : 'bg-surface border-border opacity-40'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    earned ? 'bg-accent/20' : 'bg-white/5'
                  }`}
                >
                  {earned ? (
                    <Icon className="w-5 h-5 text-accent" />
                  ) : (
                    <Lock className="w-4 h-4 text-text-secondary" />
                  )}
                </div>
                <p className={`text-sm font-medium ${earned ? 'text-white' : 'text-text-secondary'}`}>
                  {badge.name}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">{badge.description}</p>
                {earned && (
                  <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-accent" />
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Quick Check-In */}
      {memberships.length > 0 && (
        <section className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-heading text-xl text-white mb-3">QUICK CHECK-IN</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <select
                value={selectedGymId ?? ''}
                onChange={(e) => setSelectedGymId(Number(e.target.value))}
                className="w-full appearance-none bg-background border border-border rounded-lg py-3 px-4 pr-10 text-white focus:border-primary transition-colors"
              >
                {memberships.map((m) => (
                  <option key={m.gym_id} value={m.gym_id}>
                    {m.gym_name} — {m.gym_city}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            </div>
            <button
              onClick={handleCheckin}
              disabled={checkinLoading || !selectedGymId}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-heading text-lg px-8 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {checkinLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              CHECK IN
            </button>
          </div>
        </section>
      )}

      {/* Log Training Prompt (appears after check-in) */}
      {lastCheckinGym && (
        <section className="bg-accent/10 border border-accent/30 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">Log your training at {lastCheckinGym.name}?</p>
            <p className="text-text-secondary text-sm">Track what you trained to build your stats</p>
          </div>
          <Link
            href={`/app/training-log?gym_id=${lastCheckinGym.id}`}
            className="bg-accent text-background px-4 py-2 rounded-lg font-heading text-sm hover:bg-accent/90 transition-colors flex-shrink-0"
          >
            LOG SESSION
          </Link>
          <button
            onClick={() => setLastCheckinGym(null)}
            className="text-text-secondary hover:text-white p-1"
            aria-label="Dismiss"
          >
            ×
          </button>
        </section>
      )}

      {/* Gyms Visited */}
      <section>
        <h2 className="font-heading text-xl text-white mb-4">GYMS VISITED</h2>
        {gyms.length === 0 ? (
          <div className="text-center py-10 bg-surface border border-border rounded-xl">
            <MapPin className="w-12 h-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">No gyms visited yet. Check in at a gym to start your passport!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {gyms.map((gym) => (
              <Link
                key={gym.id}
                href={`/app/gyms/${gym.id}`}
                className="bg-surface border border-border rounded-xl p-4 hover:border-primary/50 transition-colors block"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-medium">{gym.name}</h3>
                    <p className="text-text-secondary text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {gym.city}, {gym.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-heading text-lg">{gym.total_points}</p>
                    <p className="text-text-secondary text-xs">pts</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-text-secondary mt-3">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {gym.visit_count} {gym.visit_count === 1 ? 'visit' : 'visits'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    First: {formatDate(gym.first_visit)}
                  </span>
                  <span>Last: {formatDate(gym.last_visit)}</span>
                </div>

                {gym.sports.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {gym.sports.map((sport) => (
                      <span
                        key={sport}
                        className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"
                      >
                        {sport}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Check-ins */}
      <section>
        <h2 className="font-heading text-xl text-white mb-4">RECENT CHECK-INS</h2>
        {checkinsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : checkins.length === 0 ? (
          <div className="text-center py-10 bg-surface border border-border rounded-xl">
            <Star className="w-12 h-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">No check-ins yet. Visit a gym to earn points!</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl divide-y divide-border max-h-[400px] overflow-y-auto">
            {checkins.map((checkin) => (
              <div key={checkin.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{checkin.gym_name}</p>
                    <p className="text-text-secondary text-xs">
                      {checkin.gym_city} &middot; {formatRelative(checkin.created_at)}
                    </p>
                  </div>
                </div>
                <span className="text-accent font-heading text-lg">+{checkin.points}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
