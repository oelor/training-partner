'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Clock, Shield, Phone, Mail, Calendar, Star,
  Lock, Loader2, CheckCircle, Dumbbell, Globe, ChevronDown, ChevronUp,
  UserPlus, LogIn, Tag, Megaphone, Heart, Crown, Award, ExternalLink
} from 'lucide-react'
import api, { GymDetail, GymSession, GymMembership, GymPromotion, isPremiumPlan } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'
import { AdBanner } from '@/components/ad-banner'
import ReportButton from '@/components/report-button'

export default function GymDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, subscription } = useAuth()
  const toast = useToast()
  const [gym, setGym] = useState<GymDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingSession, setBookingSession] = useState<number | null>(null)
  const [bookedSessions, setBookedSessions] = useState<Set<number>>(new Set())
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null)
  const [joiningGym, setJoiningGym] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [promotions, setPromotions] = useState<GymPromotion[]>([])
  const [isFavorited, setIsFavorited] = useState(false)
  const [claimingGym, setClaimingGym] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  const gymId = Number(params.id)
  const isPremium = isPremiumPlan(subscription?.plan)

  useEffect(() => {
    async function load() {
      try {
        const [gymData, membershipsData, promosData, favData] = await Promise.all([
          api.getGymDetail(gymId),
          api.getMyGymMemberships().catch(() => ({ memberships: [] })),
          api.getGymPromotions(gymId).catch(() => ({ promotions: [] })),
          api.checkFavoriteGym(gymId).catch(() => ({ favorited: false })),
        ])
        setGym(gymData.gym)
        setPromotions(promosData.promotions || [])
        setIsFavorited(favData.favorited)
        // Check if user is already a member of this gym
        const membership = (membershipsData.memberships || []).find((m: GymMembership) => m.gym_id === gymId)
        if (membership) setMembershipStatus(membership.status)
      } catch {
        toast.error('Failed to load gym details')
      } finally {
        setLoading(false)
      }
    }
    if (gymId) load()
  }, [gymId, toast])

  const handleJoinGym = async () => {
    setJoiningGym(true)
    try {
      await api.requestGymMembership(gymId)
      setMembershipStatus('pending')
      toast.success('Membership requested! The gym will review your request.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to request membership'
      toast.error(message)
    } finally {
      setJoiningGym(false)
    }
  }

  const handleCheckin = async () => {
    setCheckingIn(true)
    try {
      const result = await api.checkin(gymId)
      toast.success(`Checked in at ${result.gym_name}! +${result.points_earned} points (Total: ${result.total_points})`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Check-in failed'
      toast.error(message)
    } finally {
      setCheckingIn(false)
    }
  }

  const handleBookSession = async (sessionId: number) => {
    setBookingSession(sessionId)
    try {
      await api.createBooking(sessionId)
      setBookedSessions(prev => new Set(prev).add(sessionId))
      toast.success('Session booked! Check your bookings page for details.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Booking failed'
      toast.error(message)
    } finally {
      setBookingSession(null)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reviewForm.rating === 0) {
      toast.error('Please select a rating')
      return
    }
    setSubmittingReview(true)
    try {
      await api.createReview(gymId, reviewForm.rating, reviewForm.comment || undefined)
      toast.success('Review submitted!')
      setReviewForm({ rating: 0, comment: '' })
      // Refresh gym data to show new review
      const data = await api.getGymDetail(gymId)
      setGym(data.gym)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review'
      toast.error(message)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!gym) {
    return (
      <div className="text-center py-16">
        <h2 className="font-heading text-2xl text-white mb-2">Gym not found</h2>
        <p className="text-text-secondary mb-6">This gym may have been removed or doesn&apos;t exist.</p>
        <Link href="/app/gyms" className="text-primary hover:underline">
          ← Back to Gyms
        </Link>
      </div>
    )
  }

  const visibleReviews = showAllReviews ? gym.reviews : gym.reviews?.slice(0, 3)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/app/gyms"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Gyms
      </Link>

      {/* Hero card */}
      <div className="bg-surface border border-border rounded-xl p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-10 h-10 text-accent" />
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
              <div>
                <h1 className="font-heading text-3xl text-white">{gym.name}</h1>
                <p className="text-text-secondary">{gym.address}, {gym.city}, {gym.state}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={async () => {
                    try {
                      const res = await api.toggleFavoriteGym(gymId);
                      setIsFavorited(res.favorited);
                    } catch {}
                  }}
                  className={`p-2 rounded-lg transition-colors ${isFavorited ? 'text-red-500 bg-red-500/10' : 'text-text-secondary hover:text-red-400'}`}
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                {gym.partnership_tier === 'partner' && (
                  <span className="bg-purple-500/20 text-purple-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Partner
                  </span>
                )}
                {gym.partnership_tier === 'featured' && (
                  <span className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Featured
                  </span>
                )}
                {gym.partnership_tier === 'verified' && (
                  <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
                {gym.verified && !gym.partnership_tier?.match(/verified|featured|partner/) && (
                  <span className="bg-accent/20 text-accent text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
                {gym.premium && (
                  <span className="bg-primary/20 text-primary text-xs px-3 py-1.5 rounded-lg">
                    Premium
                  </span>
                )}
              </div>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(gym.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-border'}`} />
                ))}
              </div>
              <span className="text-white font-medium">{gym.rating}</span>
              <span className="text-text-secondary">({gym.review_count} reviews)</span>
            </div>

            {/* Sports & amenities */}
            <div className="flex flex-wrap gap-2">
              {gym.sports?.map(sport => (
                <span key={sport} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                  {sport}
                </span>
              ))}
              {gym.amenities?.map(amenity => (
                <span key={amenity} className="px-3 py-1 bg-background border border-border text-text-secondary rounded-full text-sm">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons: Join Gym / Check In */}
      <div className="flex flex-wrap gap-3">
        {membershipStatus === 'approved' ? (
          <>
            <span className="flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent px-4 py-2.5 rounded-lg text-sm">
              <CheckCircle className="w-4 h-4" /> Member
            </span>
            <button
              onClick={handleCheckin}
              disabled={checkingIn}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-heading hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {checkingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {checkingIn ? 'Checking in...' : 'CHECK IN'}
            </button>
          </>
        ) : membershipStatus === 'pending' ? (
          <span className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-2.5 rounded-lg text-sm">
            <Clock className="w-4 h-4" /> Membership Pending
          </span>
        ) : (
          <button
            onClick={handleJoinGym}
            disabled={joiningGym}
            className="flex items-center gap-2 bg-accent text-background px-6 py-2.5 rounded-lg text-sm font-heading hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {joiningGym ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {joiningGym ? 'Requesting...' : 'JOIN GYM'}
          </button>
        )}
        <Link
          href="/app/passport"
          className="flex items-center gap-2 bg-surface border border-border text-text-secondary px-4 py-2.5 rounded-lg text-sm hover:text-white hover:border-primary/30 transition-colors"
        >
          <Globe className="w-4 h-4" /> Training Passport
        </Link>
        <Link
          href={`/app/events?gym_id=${gymId}`}
          className="flex items-center gap-2 bg-surface border border-border text-text-secondary px-4 py-2.5 rounded-lg text-sm hover:text-white hover:border-primary/30 transition-colors"
        >
          <Calendar className="w-4 h-4" /> Events
        </Link>
        <Link
          href="/app/training-log"
          className="flex items-center gap-2 bg-surface border border-border text-text-secondary px-4 py-2.5 rounded-lg text-sm hover:text-white hover:border-primary/30 transition-colors"
        >
          <Dumbbell className="w-4 h-4" /> Log Training
        </Link>
      </div>

      {/* Gym Partnership - Claim / Upgrade */}
      {user && !gym.claimed_by && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-heading text-lg text-white mb-2">Own this gym?</h3>
          <p className="text-text-secondary text-sm mb-4">
            Claim this listing to update information, respond to reviews, and access partnership features.
          </p>
          <button
            onClick={async () => {
              setClaimingGym(true)
              try {
                await api.claimGym(gymId)
                toast.success('Gym claimed! You can now manage this listing.')
                const data = await api.getGymDetail(gymId)
                setGym(data.gym)
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to claim gym'
                toast.error(message)
              } finally {
                setClaimingGym(false)
              }
            }}
            disabled={claimingGym}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-heading hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {claimingGym ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
            {claimingGym ? 'Claiming...' : 'CLAIM THIS GYM'}
          </button>
        </div>
      )}

      {user && gym.claimed_by === user.id && gym.partnership_tier !== 'partner' && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-heading text-lg text-white mb-2">UPGRADE YOUR GYM</h3>
          <p className="text-text-secondary text-sm mb-4">
            Boost visibility and attract more members with a partnership tier.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {gym.partnership_tier !== 'verified' && gym.partnership_tier !== 'featured' && (
              <button
                onClick={async () => {
                  setUpgrading(true)
                  try {
                    const data = await api.upgradeGym(gymId, 'verified')
                    if (data.url) window.location.href = data.url
                  } catch (err: unknown) {
                    toast.error(err instanceof Error ? err.message : 'Failed')
                  } finally { setUpgrading(false) }
                }}
                disabled={upgrading}
                className="border border-blue-500/30 bg-blue-500/10 rounded-lg p-4 text-left hover:border-blue-500/60 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-heading text-sm">VERIFIED</span>
                </div>
                <p className="text-white font-heading text-lg">$29/mo</p>
                <p className="text-text-secondary text-xs mt-1">Blue badge, priority support</p>
              </button>
            )}
            {gym.partnership_tier !== 'featured' && (
              <button
                onClick={async () => {
                  setUpgrading(true)
                  try {
                    const data = await api.upgradeGym(gymId, 'featured')
                    if (data.url) window.location.href = data.url
                  } catch (err: unknown) {
                    toast.error(err instanceof Error ? err.message : 'Failed')
                  } finally { setUpgrading(false) }
                }}
                disabled={upgrading}
                className="border border-yellow-500/30 bg-yellow-500/10 rounded-lg p-4 text-left hover:border-yellow-500/60 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-yellow-400 font-heading text-sm">FEATURED</span>
                </div>
                <p className="text-white font-heading text-lg">$99/mo</p>
                <p className="text-text-secondary text-xs mt-1">Gold badge, top placement</p>
              </button>
            )}
            <button
              onClick={async () => {
                setUpgrading(true)
                try {
                  const data = await api.upgradeGym(gymId, 'partner')
                  if (data.url) window.location.href = data.url
                } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : 'Failed')
                } finally { setUpgrading(false) }
              }}
              disabled={upgrading}
              className="border border-purple-500/30 bg-purple-500/10 rounded-lg p-4 text-left hover:border-purple-500/60 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-heading text-sm">PARTNER</span>
              </div>
              <p className="text-white font-heading text-lg">$199/mo</p>
              <p className="text-text-secondary text-xs mt-1">Purple badge, full features</p>
            </button>
          </div>
        </div>
      )}

      {/* Gym website & contact (for claimed gyms) */}
      {(gym.website_url || gym.lead_email || gym.lead_phone || gym.logo_url) && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-text-secondary text-sm font-medium mb-3">GYM INFO</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {gym.website_url && (
              <a href={gym.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                <ExternalLink className="w-4 h-4" />
                Website
              </a>
            )}
            {gym.lead_email && (
              <a href={`mailto:${gym.lead_email}`} className="flex items-center gap-1.5 text-text-secondary hover:text-white">
                <Mail className="w-4 h-4" />
                {gym.lead_email}
              </a>
            )}
            {gym.lead_phone && (
              <a href={`tel:${gym.lead_phone}`} className="flex items-center gap-1.5 text-text-secondary hover:text-white">
                <Phone className="w-4 h-4" />
                {gym.lead_phone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Active Promotions */}
      {promotions.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-text-secondary text-sm font-medium mb-4 flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            ACTIVE PROMOTIONS
          </h3>
          <div className="space-y-3">
            {promotions.map(promo => (
              <div key={promo.id} className="bg-background rounded-lg p-4 flex items-start gap-3">
                <Tag className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  promo.type === 'open_mat' ? 'text-accent' :
                  promo.type === 'trial' ? 'text-blue-400' :
                  promo.type === 'discount' ? 'text-yellow-400' :
                  promo.type === 'event' ? 'text-purple-400' : 'text-text-secondary'
                }`} />
                <div>
                  <h4 className="text-white font-medium">{promo.title}</h4>
                  {promo.description && <p className="text-text-secondary text-sm mt-1">{promo.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      promo.type === 'open_mat' ? 'bg-accent/20 text-accent' :
                      promo.type === 'trial' ? 'bg-blue-500/20 text-blue-400' :
                      promo.type === 'discount' ? 'bg-yellow-500/20 text-yellow-400' :
                      promo.type === 'event' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-text-secondary'
                    }`}>
                      {promo.type.replace('_', ' ')}
                    </span>
                    {promo.end_date && (
                      <span className="text-text-secondary text-xs">
                        Ends {new Date(promo.end_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium gate notice */}
      {gym.premium && !isPremium && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 flex items-start gap-4">
          <Lock className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-medium mb-1">Premium Gym</h3>
            <p className="text-text-secondary text-sm mb-3">Upgrade to Premium to book open mat sessions at this gym.</p>
            <Link
              href="/app/settings"
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      )}

      {/* Info + Contact grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* About */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-text-secondary text-sm font-medium mb-3">ABOUT</h3>
          <p className="text-white leading-relaxed">{gym.description || 'No description available.'}</p>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Drop-in Rate</span>
              <span className="text-white font-heading text-2xl">{gym.price || 'Contact gym'}</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-text-secondary text-sm font-medium mb-3">CONTACT</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-text-secondary flex-shrink-0" />
              <span className="text-white text-sm">{gym.address}, {gym.city}, {gym.state}</span>
            </div>
            {gym.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-text-secondary flex-shrink-0" />
                <a href={`tel:${gym.phone}`} className="text-primary text-sm hover:underline">{gym.phone}</a>
              </div>
            )}
            {gym.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-text-secondary flex-shrink-0" />
                <a href={`mailto:${gym.email}`} className="text-primary text-sm hover:underline">{gym.email}</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ad Banner */}
      <AdBanner slot="gym_detail_sidebar" className="mt-4" />

      {/* Sessions */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-text-secondary text-sm font-medium mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          OPEN MAT SESSIONS
        </h3>

        {gym.sessions && gym.sessions.length > 0 ? (
          <div className="space-y-2">
            {gym.sessions.map((session) => {
              const isBooked = bookedSessions.has(session.id)
              const canBook = (!gym.premium || isPremium) && session.available > 0 && !isBooked

              return (
                <div key={session.id} className="flex items-center justify-between bg-background rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <Clock className="w-5 h-5 text-accent flex-shrink-0" />
                    <div>
                      <span className="text-white font-medium">{session.day}</span>
                      <span className="text-text-secondary ml-2">{session.start_time} - {session.end_time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${session.available <= 2 ? 'text-red-400' : 'text-text-secondary'}`}>
                      {session.available} {session.available === 1 ? 'slot' : 'slots'} left
                    </span>
                    {isBooked ? (
                      <span className="flex items-center gap-1 text-accent text-sm">
                        <CheckCircle className="w-4 h-4" /> Booked
                      </span>
                    ) : canBook ? (
                      <button
                        onClick={() => handleBookSession(session.id)}
                        disabled={bookingSession === session.id}
                        className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {bookingSession === session.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          'Book Session'
                        )}
                      </button>
                    ) : gym.premium && !isPremium ? (
                      <Lock className="w-4 h-4 text-accent" />
                    ) : (
                      <span className="text-text-secondary text-sm">Full</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-text-secondary text-sm text-center py-6">No sessions currently scheduled</p>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-text-secondary text-sm font-medium mb-4 flex items-center gap-2">
          <Star className="w-4 h-4" />
          REVIEWS ({gym.review_count || 0})
        </h3>

        {visibleReviews && visibleReviews.length > 0 ? (
          <div className="space-y-3 mb-4">
            {visibleReviews.map(review => (
              <div key={review.id} className="bg-background rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{review.user_name}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-border'}`} />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-text-secondary text-sm">{review.comment}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-text-secondary text-xs">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  <ReportButton
                    contentType="gym_review"
                    contentId={review.id}
                  />
                </div>
              </div>
            ))}

            {gym.reviews && gym.reviews.length > 3 && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="text-primary text-sm hover:underline flex items-center gap-1"
              >
                {showAllReviews ? (
                  <>Show Less <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Show All {gym.reviews.length} Reviews <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        ) : (
          <p className="text-text-secondary text-sm text-center py-4 mb-4">No reviews yet. Be the first!</p>
        )}

        {/* Review form */}
        <div className="border-t border-border pt-4">
          <h4 className="text-white text-sm font-medium mb-3">Leave a Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= reviewForm.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-border hover:text-yellow-500/50'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your experience (optional)"
              rows={3}
              className="w-full bg-background border border-border rounded-lg p-3 text-white placeholder-text-secondary focus:border-primary transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={submittingReview || reviewForm.rating === 0}
              className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
