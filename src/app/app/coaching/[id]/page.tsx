'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Clock, DollarSign, MapPin, User, Users, Monitor,
  UserCheck, Shield, Loader2, MessageSquare, Send, AlertTriangle,
  Calendar, Award, CreditCard, ExternalLink, CheckCircle
} from 'lucide-react'
import api, { CoachingListingDetail } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'

const SESSION_TYPE_LABELS: Record<string, string> = {
  private: 'Private Session',
  semi_private: 'Semi-Private Session',
  group: 'Group Session',
  online: 'Online Session',
}

const SESSION_TYPE_ICONS: Record<string, typeof User> = {
  private: User,
  semi_private: UserCheck,
  group: Users,
  online: Monitor,
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

export default function CoachingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const toast = useToast()
  const [listing, setListing] = useState<CoachingListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInquiry, setShowInquiry] = useState(false)
  const [showOffPlatformModal, setShowOffPlatformModal] = useState(false)
  const [inquiryMessage, setInquiryMessage] = useState('')
  const [offPlatformNotes, setOffPlatformNotes] = useState('')
  const [offPlatformDate, setOffPlatformDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bookingInProgress, setBookingInProgress] = useState(false)

  const listingId = Number(params.id)

  // Handle booking success/cancel URL params
  useEffect(() => {
    const booked = searchParams.get('booked')
    if (booked === 'success') {
      toast.success('Booking confirmed! Your coach will be notified.')
    } else if (booked === 'cancelled') {
      toast.error('Booking was cancelled.')
    }
  }, [searchParams, toast])

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCoachingListing(listingId)
        setListing(data.listing)
      } catch {
        toast.error('Failed to load listing')
      } finally {
        setLoading(false)
      }
    }
    if (listingId) load()
  }, [listingId, toast])

  const handleInquire = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (inquiryMessage.length < 10) {
      toast.error('Message must be at least 10 characters')
      return
    }
    setSubmitting(true)
    try {
      await api.inquireCoachingListing(listingId, inquiryMessage)
      toast.success('Inquiry sent! The coach will be notified.')
      setShowInquiry(false)
      setInquiryMessage('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send inquiry'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBookAndPay = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setBookingInProgress(true)
    try {
      const res = await api.bookCoachingSession(listingId)
      if (res.url) {
        window.location.href = res.url
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start booking'
      toast.error(message)
    } finally {
      setBookingInProgress(false)
    }
  }

  const handleBookOffPlatform = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.bookOffPlatform(listingId, {
        session_date: offPlatformDate || undefined,
        notes: offPlatformNotes || undefined,
      })
      toast.success(res.message)
      setShowOffPlatformModal(false)
      setOffPlatformNotes('')
      setOffPlatformDate('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to record booking'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="text-center py-16">
        <h2 className="font-heading text-2xl text-white mb-2">Listing not found</h2>
        <p className="text-text-secondary mb-6">This listing may have been removed.</p>
        <Link href="/app/coaching" className="text-primary hover:underline">
          Back to Coaching Marketplace
        </Link>
      </div>
    )
  }

  const Icon = SESSION_TYPE_ICONS[listing.session_type] || User
  const isOwnListing = user?.id === listing.coach_id

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Booking success banner */}
      {searchParams.get('booked') === 'success' && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-300">
            <strong>Booking confirmed!</strong> Your payment has been processed and your coach has been notified. You can view your bookings in your dashboard.
          </div>
        </div>
      )}

      {/* Back link */}
      <Link
        href="/app/coaching"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Coaching
      </Link>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listing details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium">
                {listing.sport}
              </span>
              <span className="bg-background border border-border text-text-secondary text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {SESSION_TYPE_LABELS[listing.session_type] || listing.session_type}
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl text-white mb-4">{listing.title}</h1>

            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{listing.description}</p>

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
              <div>
                <p className="text-text-secondary text-xs mb-1">Duration</p>
                <p className="text-white font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4 text-primary" />
                  {listing.duration_minutes} min
                </p>
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Price</p>
                <p className="text-white font-heading text-lg">
                  {formatPrice(listing.price_cents)}
                </p>
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Max Students</p>
                <p className="text-white font-medium flex items-center gap-1">
                  <Users className="w-4 h-4 text-primary" />
                  {listing.max_students}
                </p>
              </div>
              {listing.location && (
                <div>
                  <p className="text-text-secondary text-xs mb-1">Location</p>
                  <p className="text-white font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="truncate">{listing.location}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Options */}
          {!isOwnListing && (
            <div className="space-y-4">
              {/* Option 1: Pay through app (only if coach has Connect) */}
              {listing.coach_connect_enabled && (
                <div className="bg-surface border-2 border-primary/30 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="font-heading text-lg text-white">PAY THROUGH TRAINING PARTNER</h2>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Recommended</span>
                  </div>

                  <button
                    onClick={handleBookAndPay}
                    disabled={bookingInProgress}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-heading hover:bg-primary/90 transition-colors disabled:opacity-50 mb-4"
                  >
                    {bookingInProgress ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    {bookingInProgress ? 'Processing...' : `BOOK & PAY — ${formatPrice(listing.price_cents)}`}
                  </button>

                  <div className="space-y-2 text-sm text-text-secondary">
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Secure payment via Stripe
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Protected by our Terms of Service
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Dispute resolution available
                    </p>
                  </div>
                </div>
              )}

              {/* Option 2: Off-platform payment (always available) */}
              <div className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <ExternalLink className="w-5 h-5 text-text-secondary" />
                  <h2 className="font-heading text-lg text-white">ARRANGE PAYMENT DIRECTLY</h2>
                </div>

                <p className="text-text-secondary text-sm mb-3">
                  Coach accepts: {listing.payment_methods || 'Contact coach directly'}
                </p>

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setShowInquiry(true)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-heading transition-colors ${
                      listing.coach_connect_enabled
                        ? 'bg-background border border-border text-white hover:bg-surface'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    INQUIRE
                  </button>
                  <button
                    onClick={() => setShowOffPlatformModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-background border border-border text-white px-6 py-3 rounded-lg font-heading hover:bg-surface transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    RECORD BOOKING
                  </button>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-300">
                    <strong>Off-platform payments are not covered by our Terms of Service.</strong>{' '}
                    Training Partner cannot mediate disputes for off-platform transactions.
                    We strongly recommend using in-app payments when available.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Coach card & CTA */}
        <div className="space-y-4">
          {/* Coach profile card */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {listing.coach_avatar ? (
                  <img src={listing.coach_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-primary" />
                )}
              </div>
              <div>
                <p className="text-white font-heading text-lg">{listing.coach_name}</p>
                {listing.coach_city && (
                  <p className="text-text-secondary text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {listing.coach_city}
                  </p>
                )}
              </div>
            </div>

            {listing.experience_years && (
              <div className="flex items-center gap-2 mb-3 text-sm">
                <Award className="w-4 h-4 text-accent" />
                <span className="text-white">{listing.experience_years}+ years experience</span>
              </div>
            )}

            {listing.coach_connect_enabled && (
              <div className="flex items-center gap-2 mb-3 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-green-400">In-app payments enabled</span>
              </div>
            )}

            <div className="text-sm text-text-secondary">
              <p>{listing.inquiry_count} {listing.inquiry_count === 1 ? 'inquiry' : 'inquiries'} received</p>
            </div>
          </div>

          {/* Price card */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="text-center mb-4">
              <p className="text-text-secondary text-sm">Starting at</p>
              <p className="font-heading text-3xl text-white">{formatPrice(listing.price_cents)}</p>
              <p className="text-text-secondary text-sm">per session</p>
            </div>

            {isOwnListing && (
              <Link
                href="/app/coaching/mine"
                className="w-full flex items-center justify-center gap-2 bg-accent/20 text-accent px-6 py-3 rounded-lg font-heading"
              >
                This is your listing
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiry && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg">
            <h3 className="font-heading text-xl text-white mb-2">Send Inquiry</h3>
            <p className="text-text-secondary text-sm mb-4">
              Introduce yourself and let {listing.coach_name} know what you are looking for.
            </p>

            <textarea
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              placeholder="Hi, I'm interested in your coaching services. I have been training for..."
              className="w-full bg-background border border-border rounded-lg p-3 text-white placeholder-text-secondary/50 resize-none h-32 focus:outline-none focus:border-primary text-sm"
              maxLength={500}
            />
            <p className="text-text-secondary text-xs mt-1 mb-4">{inquiryMessage.length}/500 characters</p>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4 text-xs text-yellow-300">
              <strong>Note:</strong> This is an inquiry only. If this coach accepts in-app payments, you can book and pay securely through Training Partner after discussing details.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowInquiry(false); setInquiryMessage(''); }}
                className="flex-1 bg-background border border-border text-white px-4 py-2.5 rounded-lg text-sm hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInquire}
                disabled={submitting || inquiryMessage.length < 10}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-heading hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? 'Sending...' : 'Send Inquiry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Off-Platform Booking Modal */}
      {showOffPlatformModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg">
            <h3 className="font-heading text-xl text-white mb-2">Record Off-Platform Booking</h3>
            <p className="text-text-secondary text-sm mb-4">
              Record that you have arranged a session with {listing.coach_name} outside of Training Partner.
            </p>

            <div className="space-y-4 mb-4">
              <div>
                <label className="text-text-secondary text-xs block mb-1">Session Date (optional)</label>
                <input
                  type="date"
                  value={offPlatformDate}
                  onChange={(e) => setOffPlatformDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-3 text-white focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs block mb-1">Notes (optional)</label>
                <textarea
                  value={offPlatformNotes}
                  onChange={(e) => setOffPlatformNotes(e.target.value)}
                  placeholder="Any details about the arrangement..."
                  className="w-full bg-background border border-border rounded-lg p-3 text-white placeholder-text-secondary/50 resize-none h-20 focus:outline-none focus:border-primary text-sm"
                  maxLength={500}
                />
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-xs text-red-300">
              <strong>IMPORTANT DISCLAIMER:</strong> Off-platform payments are <strong>NOT</strong> covered by Training Partner&apos;s Terms of Service.
              Training Partner <strong>CANNOT</strong> and <strong>WILL NOT</strong> mediate, investigate, or resolve disputes arising from off-platform payments.
              You acknowledge that choosing off-platform payment waives your right to seek any remedy from Training Partner regarding this transaction.
              <strong> We strongly recommend using in-app payments for protection.</strong>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowOffPlatformModal(false); setOffPlatformNotes(''); setOffPlatformDate(''); }}
                className="flex-1 bg-background border border-border text-white px-4 py-2.5 rounded-lg text-sm hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBookOffPlatform}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 text-white px-4 py-2.5 rounded-lg text-sm font-heading hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {submitting ? 'Recording...' : 'I Understand, Record Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
