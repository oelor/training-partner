'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Clock, X, Loader2, CheckCircle, XCircle } from 'lucide-react'
import api, { Booking } from '@/lib/api'
import { useToast } from '@/components/toast'
import { CardSkeleton } from '@/components/skeleton'

export default function BookingsPage() {
  const toast = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<number | null>(null)

  useEffect(() => {
    loadBookings()
  }, [])

  async function loadBookings() {
    try {
      const data = await api.getBookings()
      setBookings(data.bookings || [])
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(bookingId: number) {
    setCancelling(bookingId)
    try {
      await api.cancelBooking(bookingId)
      toast.success('Booking cancelled')
      loadBookings()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel'
      toast.error(message)
    } finally {
      setCancelling(null)
    }
  }

  const upcoming = bookings.filter(b => b.status === 'confirmed')
  const past = bookings.filter(b => b.status !== 'confirmed')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl lg:text-4xl text-white mb-2">MY BOOKINGS</h1>
        <p className="text-text-secondary">Manage your open mat sessions</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="font-heading text-xl text-white mb-2">No bookings yet</h3>
          <p className="text-text-secondary mb-6">Browse gyms to book open mat sessions</p>
          <Link href="/app/gyms" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Browse Gyms
          </Link>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-heading text-xl text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Upcoming Sessions ({upcoming.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {upcoming.map(booking => (
                  <div key={booking.id} className="bg-surface border border-border rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-heading text-lg">{booking.gym_name}</h3>
                        <p className="text-text-secondary text-sm flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {booking.gym_city}
                        </p>
                      </div>
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded capitalize">
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-text-secondary text-sm mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {booking.day}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {booking.start_time} - {booking.end_time}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancelling === booking.id}
                      className="text-red-400 text-sm hover:text-red-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {cancelling === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      Cancel Booking
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="font-heading text-xl text-white mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-text-secondary" />
                Past / Cancelled ({past.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {past.map(booking => (
                  <div key={booking.id} className="bg-surface border border-border rounded-xl p-5 opacity-60">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-heading text-lg">{booking.gym_name}</h3>
                        <p className="text-text-secondary text-sm">{booking.gym_city}</p>
                      </div>
                      <span className="bg-border text-text-secondary text-xs px-2 py-1 rounded capitalize">
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-text-secondary text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {booking.day}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {booking.start_time} - {booking.end_time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
