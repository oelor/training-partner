'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Loader2, Clock, DollarSign, MessageSquare, Eye, EyeOff,
  ArrowLeft, Pencil, Trash2, CreditCard, ExternalLink, CheckCircle,
  AlertTriangle, Shield, XCircle
} from 'lucide-react'
import api, { CoachingListingMine, ConnectStatus, CoachingBooking } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  private: 'Private',
  semi_private: 'Semi-Private',
  group: 'Group',
  online: 'Online',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  paid: 'bg-green-500/10 text-green-400',
  completed: 'bg-blue-500/10 text-blue-400',
  cancelled: 'bg-red-500/10 text-red-400',
  refunded: 'bg-purple-500/10 text-purple-400',
  disputed: 'bg-orange-500/10 text-orange-400',
}

export default function MyCoachingListingsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<CoachingListingMine[]>([])
  const [loading, setLoading] = useState(true)
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null)
  const [connectLoading, setConnectLoading] = useState(true)
  const [connectActionLoading, setConnectActionLoading] = useState(false)
  const [bookings, setBookings] = useState<CoachingBooking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)

  // Handle connect return URL params
  useEffect(() => {
    const connect = searchParams.get('connect')
    if (connect === 'complete') {
      toast.success('Stripe Connect setup complete! Checking status...')
      // Refresh connect status
      api.getConnectStatus().then(data => {
        setConnectStatus(data)
      }).catch(() => {})
    } else if (connect === 'refresh') {
      toast.error('Stripe setup was not completed. Please try again.')
    }
  }, [searchParams, toast])

  useEffect(() => {
    async function load() {
      try {
        const [listingsData, connectData, bookingsData] = await Promise.allSettled([
          api.getMyCoachingListings(),
          api.getConnectStatus(),
          api.getMyBookings('coach'),
        ])

        if (listingsData.status === 'fulfilled') setListings(listingsData.value.listings)
        if (connectData.status === 'fulfilled') setConnectStatus(connectData.value)
        if (bookingsData.status === 'fulfilled') setBookings(bookingsData.value.bookings)
      } catch {
        toast.error('Failed to load your listings')
      } finally {
        setLoading(false)
        setConnectLoading(false)
        setBookingsLoading(false)
      }
    }
    if (user) load()
  }, [user, toast])

  const handleDeactivate = async (id: number) => {
    try {
      await api.deleteCoachingListing(id)
      setListings(prev => prev.map(l => l.id === id ? { ...l, is_active: 0 } : l))
      toast.success('Listing deactivated')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate'
      toast.error(message)
    }
  }

  const handleReactivate = async (id: number) => {
    try {
      await api.updateCoachingListing(id, { is_active: true } as Record<string, unknown> as Parameters<typeof api.updateCoachingListing>[1])
      setListings(prev => prev.map(l => l.id === id ? { ...l, is_active: 1 } : l))
      toast.success('Listing reactivated')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reactivate'
      toast.error(message)
    }
  }

  const handleConnectOnboard = async () => {
    setConnectActionLoading(true)
    try {
      const res = await api.startConnectOnboarding()
      if (res.url) {
        window.location.href = res.url
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start Stripe setup'
      toast.error(message)
    } finally {
      setConnectActionLoading(false)
    }
  }

  const handleConnectDashboard = async () => {
    setConnectActionLoading(true)
    try {
      const res = await api.getConnectDashboard()
      if (res.url) {
        window.open(res.url, '_blank')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to open Stripe dashboard'
      toast.error(message)
    } finally {
      setConnectActionLoading(false)
    }
  }

  const handleUpdateBooking = async (bookingId: number, status: string) => {
    try {
      await api.updateBooking(bookingId, { status })
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: status as CoachingBooking['status'] } : b))
      toast.success(`Booking ${status}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update booking'
      toast.error(message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/app/coaching"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-white">MY COACHING LISTINGS</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your coaching services</p>
        </div>
        <Link
          href="/app/coaching/create"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-heading hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          NEW LISTING
        </Link>
      </div>

      {/* Stripe Connect Section */}
      {!connectLoading && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-lg text-white">STRIPE CONNECT — RECEIVE PAYMENTS</h2>
          </div>

          {!connectStatus?.connected ? (
            <div>
              <p className="text-text-secondary text-sm mb-4">
                Set up Stripe Connect to receive payments directly through Training Partner. Students can book and pay securely, and you will receive payouts to your bank account (minus a 15% platform fee).
              </p>
              <button
                onClick={handleConnectOnboard}
                disabled={connectActionLoading}
                className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-heading hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {connectActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                {connectActionLoading ? 'Setting up...' : 'Connect with Stripe'}
              </button>
            </div>
          ) : !connectStatus.onboarded ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">Setup incomplete</span>
              </div>
              <p className="text-text-secondary text-sm mb-4">
                Your Stripe account has been created but setup is not complete. Please finish the onboarding to start receiving payments.
              </p>
              <button
                onClick={handleConnectOnboard}
                disabled={connectActionLoading}
                className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-2.5 rounded-lg text-sm font-heading hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {connectActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                {connectActionLoading ? 'Loading...' : 'Complete Stripe Setup'}
              </button>
            </div>
          ) : connectStatus.charges_enabled ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Payments enabled</span>
              </div>
              <p className="text-text-secondary text-sm mb-4">
                Students can book and pay through Training Partner. You will receive payouts directly to your bank account.
              </p>
              <button
                onClick={handleConnectDashboard}
                disabled={connectActionLoading}
                className="flex items-center gap-2 bg-background border border-border text-white px-6 py-2.5 rounded-lg text-sm font-heading hover:bg-surface transition-colors disabled:opacity-50"
              >
                {connectActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                {connectActionLoading ? 'Loading...' : 'View Stripe Dashboard'}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">Charges not yet enabled</span>
              </div>
              <p className="text-text-secondary text-sm mb-4">
                Your Stripe account is set up but charges are not yet enabled. This may take a few minutes or Stripe may need additional information.
              </p>
              <button
                onClick={handleConnectOnboard}
                disabled={connectActionLoading}
                className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-2.5 rounded-lg text-sm font-heading hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {connectActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                {connectActionLoading ? 'Loading...' : 'Update Stripe Info'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bookings Section */}
      {!bookingsLoading && bookings.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-heading text-lg text-white mb-4">INCOMING BOOKINGS</h2>
          <div className="space-y-3">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-background border border-border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{booking.listing_title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[booking.status] || 'bg-gray-500/10 text-gray-400'}`}>
                        {booking.status}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${booking.payment_method === 'stripe' ? 'bg-primary/10 text-primary' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {booking.payment_method === 'stripe' ? 'In-app' : 'Off-platform'}
                      </span>
                    </div>
                    <p className="text-text-secondary text-xs">
                      Student: {booking.student_name || 'Unknown'} | {formatPrice(booking.amount_cents)}
                      {booking.session_date && ` | ${new Date(booking.session_date).toLocaleDateString()}`}
                    </p>
                    {booking.notes && (
                      <p className="text-text-secondary text-xs mt-1 italic">{booking.notes}</p>
                    )}
                  </div>
                  {(booking.status === 'paid' || booking.status === 'pending') && (
                    <div className="flex items-center gap-2">
                      {booking.status === 'paid' && (
                        <button
                          onClick={() => handleUpdateBooking(booking.id, 'completed')}
                          className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors px-3 py-1.5 rounded-lg border border-green-400/30 hover:border-green-400/50"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateBooking(booking.id, 'cancelled')}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg border border-red-400/30 hover:border-red-400/50"
                      >
                        <XCircle className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listings */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <h3 className="font-heading text-xl text-white mb-2">No Listings Yet</h3>
          <p className="text-text-secondary mb-6">Create your first coaching listing to start connecting with students.</p>
          <Link
            href="/app/coaching/create"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-heading hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            CREATE LISTING
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map(listing => (
            <div
              key={listing.id}
              className={`bg-surface border rounded-xl p-5 ${listing.is_active ? 'border-border' : 'border-border/50 opacity-60'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{listing.sport}</span>
                    <span className="text-xs bg-background border border-border text-text-secondary px-2 py-0.5 rounded-full">
                      {SESSION_TYPE_LABELS[listing.session_type] || listing.session_type}
                    </span>
                    {!listing.is_active && (
                      <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>

                  <Link href={`/app/coaching/${listing.id}`} className="font-heading text-lg text-white hover:text-primary transition-colors">
                    {listing.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-text-secondary">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatPrice(listing.price_cents)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {listing.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {listing.inquiry_count} inquiries ({listing.pending_inquiries} pending)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {listing.is_active ? (
                    <button
                      onClick={() => handleDeactivate(listing.id)}
                      className="flex items-center gap-1 text-xs text-text-secondary hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-red-400/30"
                    >
                      <EyeOff className="w-3 h-3" />
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(listing.id)}
                      className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-accent/30"
                    >
                      <Eye className="w-3 h-3" />
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
