'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MessageCircle, MapPin, Trophy, Clock, Shield, Star,
  Dumbbell, Target, Calendar, Ban, Loader2, UserCheck, ThumbsUp, ThumbsDown
} from 'lucide-react'
import { AlertTriangle, Instagram } from 'lucide-react'
import ShareButton from '@/components/share-button'
import api, { PartnerDetail } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'
import { ProfileSkeleton } from '@/components/skeleton'
import ReportDialog from '@/components/report-dialog'
import MatchCompatibilityChart from '@/components/match-compatibility-chart'
import VerifiedBadge from '@/components/verified-badge'
import TrustScoreComponent from '@/components/trust-score'

export default function PartnerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToast()
  const [partner, setPartner] = useState<PartnerDetail | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [loading, setLoading] = useState(true)
  const [blocking, setBlocking] = useState(false)
  const [canRateUser, setCanRateUser] = useState(false)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [activity, setActivity] = useState<{ total_sessions: number; total_hours: number; sports_trained: number; gyms_visited: number; total_checkins: number; total_points: number; top_sports: { sport: string; sessions: number }[] } | null>(null)

  const partnerId = Number(params.id)

  useEffect(() => {
    async function load() {
      try {
        const [data, rateRes, activityRes] = await Promise.all([
          api.getPartnerDetail(partnerId),
          api.canRate(partnerId).catch(() => ({ can_rate: false, reason: '' })),
          api.getUserActivity(partnerId).catch(() => null),
        ])
        setPartner(data.partner)
        setCanRateUser(rateRes.can_rate)
        if (activityRes?.activity) setActivity(activityRes.activity)
      } catch {
        toast.error('Failed to load partner profile')
      } finally {
        setLoading(false)
      }
    }
    if (partnerId) load()
  }, [partnerId, toast])

  const handleMessage = () => {
    router.push(`/app/messages?user=${partnerId}`)
  }

  const handleBlock = async () => {
    if (!confirm('Are you sure you want to block this user? They will no longer appear in your matches.')) return
    setBlocking(true)
    try {
      await api.blockUser(partnerId)
      toast.success('User blocked')
      router.push('/app/partners')
    } catch {
      toast.error('Failed to block user')
    } finally {
      setBlocking(false)
    }
  }

  const handleRate = async (rating: number) => {
    setSubmittingRating(true)
    try {
      await api.submitRating({ rated_id: partnerId, rating })
      setRatingSubmitted(true)
      setCanRateUser(false)
      toast.success('Rating submitted, thanks!')
    } catch {
      toast.error('Failed to submit rating')
    } finally {
      setSubmittingRating(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <ProfileSkeleton />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="text-center py-16">
        <h2 className="font-heading text-2xl text-white mb-2">Partner not found</h2>
        <p className="text-text-secondary mb-6">This profile may have been removed or doesn&apos;t exist.</p>
        <Link href="/app/partners" className="text-primary hover:underline">
          ← Back to Partners
        </Link>
      </div>
    )
  }

  const matchPercent = partner.match > 0 ? Math.round(partner.match * 100) : null

  // Derive compatibility data from API explanation or overall match
  const explanation = partner.explanation as Record<string, Record<string, unknown>> | null
  const compatibilityData = explanation ? Object.entries(explanation).slice(0, 5).map(([key, val]) => ({
    category: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    score: typeof val?.score === 'number' ? Math.min(Math.round(val.score * 10), 100) : (matchPercent || 75),
  })) : [
    { category: 'Overall Match', score: matchPercent || 0 },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/app/partners"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Partners
        </Link>
      </motion.div>

      {/* Hero card */}
      <div className="bg-surface border border-border rounded-xl p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-3xl flex-shrink-0">
            {partner.avatar_url ? (
              <img src={partner.avatar_url} alt={partner.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              partner.name?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-3xl text-white">{partner.name}</h1>
                  {partner.is_verified && <VerifiedBadge size="md" />}
                </div>
                <p className="text-text-secondary">
                  {partner.sport || partner.sports?.[0] || 'Combat Sports'}
                  {partner.skill ? ` • ${partner.skill}` : ''}
                </p>
              </div>
              {matchPercent && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-2 text-center flex-shrink-0">
                  <div className="text-accent font-mono text-2xl font-bold">{matchPercent}%</div>
                  <div className="text-text-secondary text-xs">match</div>
                </div>
              )}
            </div>

            {/* Location */}
            {(partner.city || partner.location) && (
              <div className="flex items-center gap-2 text-text-secondary mb-4">
                <MapPin className="w-4 h-4" />
                <span>{partner.city || partner.location}</span>
              </div>
            )}

            {/* Instagram + Share */}
            <div className="flex items-center gap-4 mb-4">
              {partner.instagram_username && (
                <a
                  href={`https://instagram.com/${encodeURIComponent(partner.instagram_username || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-pink-400 hover:text-pink-300 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  @{partner.instagram_username}
                </a>
              )}
              <ShareButton
                title={`${partner.name} — Training Partner`}
                text={`Check out ${partner.name} on Training Partner — find combat sports training partners near you!`}
                variant="button"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleMessage}
                className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <MessageCircle className="w-5 h-5" />
                Send Message
              </button>
              <button
                onClick={handleBlock}
                disabled={blocking}
                className="bg-surface border border-border text-text-secondary px-4 py-2.5 rounded-lg hover:text-red-400 hover:border-red-500/50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Ban className="w-4 h-4" />
                {blocking ? 'Blocking...' : 'Block'}
              </button>
              <button
                onClick={() => setShowReport(true)}
                className="bg-surface border border-border text-text-secondary px-4 py-2.5 rounded-lg hover:text-yellow-400 hover:border-yellow-500/50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <AlertTriangle className="w-4 h-4" />
                Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Score */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-text-secondary text-sm font-medium mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          TRUST SCORE
        </h3>
        <TrustScoreComponent userId={partnerId} />
      </div>

      {/* Training Activity */}
      {activity && activity.total_sessions > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-text-secondary text-sm font-medium mb-3 flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            TRAINING ACTIVITY
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-white font-heading text-xl">{activity.total_sessions}</div>
              <div className="text-text-secondary text-xs">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-primary font-heading text-xl">{activity.total_hours}h</div>
              <div className="text-text-secondary text-xs">Trained</div>
            </div>
            <div className="text-center">
              <div className="text-accent font-heading text-xl">{activity.total_checkins}</div>
              <div className="text-text-secondary text-xs">Check-ins</div>
            </div>
            <div className="text-center">
              <div className="text-white font-heading text-xl">{activity.total_points}</div>
              <div className="text-text-secondary text-xs">Points</div>
            </div>
          </div>
          {activity.top_sports.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
              {activity.top_sports.map(s => (
                <span key={s.sport} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {s.sport} ({s.sessions})
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Match Compatibility Chart */}
      {matchPercent && (
        <MatchCompatibilityChart
          data={compatibilityData}
          overallMatch={matchPercent}
        />
      )}

      {/* Details grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Stats */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-text-secondary text-sm font-medium mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            TRAINING STATS
          </h3>
          <div className="space-y-3">
            {partner.weight && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Weight Class</span>
                <span className="text-white font-medium">{partner.weight}</span>
              </div>
            )}
            {partner.experience > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Experience</span>
                <span className="text-white font-medium">{partner.experience} years</span>
              </div>
            )}
            {partner.sports && partner.sports.length > 0 && (
              <div className="flex justify-between items-start">
                <span className="text-text-secondary">Sports</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {partner.sports.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {partner.skill && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Skill Level</span>
                <span className="text-white font-medium">{partner.skill}</span>
              </div>
            )}
          </div>
        </div>

        {/* Goals */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-text-secondary text-sm font-medium mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" />
            TRAINING GOALS
          </h3>
          {partner.goals && partner.goals.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {partner.goals.map(goal => (
                <span key={goal} className="px-3 py-1.5 bg-background border border-border text-text-secondary rounded-lg text-sm">
                  {goal}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">No training goals listed</p>
          )}
        </div>
      </div>

      {/* Bio */}
      {partner.bio && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-text-secondary text-sm font-medium mb-3">ABOUT</h3>
          <p className="text-white leading-relaxed">{partner.bio}</p>
        </div>
      )}

      {/* Availability */}
      {partner.availability && partner.availability.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-text-secondary text-sm font-medium mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            AVAILABILITY
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {partner.availability.map((slot, i) => (
              <div key={i} className="flex items-center gap-3 bg-background rounded-lg p-3">
                <Clock className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-white text-sm">{slot.day}</span>
                <span className="text-text-secondary text-sm">{slot.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match explanation (if present) */}
      {partner.explanation && Object.keys(partner.explanation).length > 0 && (
        <div className="bg-surface border border-accent/30 rounded-xl p-5">
          <h3 className="text-accent text-sm font-medium mb-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            WHY YOU MATCH
          </h3>
          <div className="space-y-2">
            {Object.entries(partner.explanation).map(([key, value]) => {
              const v = value as Record<string, unknown>
              let display = ''
              if (v.common && Array.isArray(v.common)) {
                display = v.common.join(', ')
              } else if (v.levelA && v.levelB) {
                display = `${v.levelA} vs ${v.levelB}`
              } else if (typeof v.score === 'number') {
                display = `${v.score} pts`
              } else {
                display = String(value)
              }
              return (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-text-secondary capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-white">{display}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rating Section */}
      {canRateUser && !ratingSubmitted && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-text-secondary text-sm font-medium mb-3">RATE THIS PARTNER</h3>
          <p className="text-text-secondary text-sm mb-4">
            How was your training experience with {partner.name}?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleRate(1)}
              disabled={submittingRating}
              className="flex items-center gap-2 bg-accent/20 text-accent px-5 py-2.5 rounded-lg hover:bg-accent/30 transition-colors disabled:opacity-50"
            >
              {submittingRating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-5 h-5" />}
              Positive
            </button>
            <button
              onClick={() => handleRate(0)}
              disabled={submittingRating}
              className="flex items-center gap-2 bg-red-500/20 text-red-400 px-5 py-2.5 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              {submittingRating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-5 h-5" />}
              Negative
            </button>
          </div>
        </div>
      )}
      {ratingSubmitted && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 text-center">
          <ThumbsUp className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-white font-medium">Rating Submitted</div>
          <div className="text-text-secondary text-sm">Thanks for helping build trust in the community</div>
        </div>
      )}

      {/* Member since */}
      {partner.created_at && (
        <div className="text-center text-text-secondary text-sm pb-4">
          Member since {new Date(partner.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      )}

      {showReport && partner && (
        <ReportDialog
          userId={partner.id}
          userName={partner.name}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}
