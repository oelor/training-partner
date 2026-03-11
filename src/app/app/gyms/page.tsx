'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Clock, Shield, Phone, Mail, Calendar, Star, X, Lock, Search, Loader2 } from 'lucide-react'
import api, { Gym, GymDetail } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { GymCardSkeleton } from '@/components/skeleton'
import { useToast } from '@/components/toast'

export default function GymsPage() {
  const { subscription } = useAuth()
  const toast = useToast()
  const [gyms, setGyms] = useState<Gym[]>([])
  const [selectedGym, setSelectedGym] = useState<GymDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [bookingSession, setBookingSession] = useState<number | null>(null)
  const isPremium = subscription?.plan === 'premium'

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getGyms({ search: search || undefined })
        setGyms(data.gyms || [])
      } catch {
        toast.error('Failed to load gyms')
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
  }, [search, toast])

  const openGymDetail = async (gymId: number) => {
    setDetailLoading(true)
    try {
      const data = await api.getGymDetail(gymId)
      setSelectedGym(data.gym)
    } catch {
      toast.error('Failed to load gym details')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleBookSession = async (sessionId: number) => {
    setBookingSession(sessionId)
    try {
      await api.createBooking(sessionId)
      toast.success('Session booked successfully!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Booking failed'
      toast.error(message)
    } finally {
      setBookingSession(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl text-white mb-2">PARTNER GYMS</h1>
          <p className="text-text-secondary">
            {gyms.length} verified gyms with open mat hours
          </p>
        </div>

        {!isPremium && (
          <Link href="/app/settings" className="bg-primary/20 border border-primary/50 px-4 py-2 rounded-lg text-sm hover:bg-primary/30 transition-colors">
            <span className="text-white">Upgrade to Premium </span>
            <span className="text-text-secondary">to access all open mat hours</span>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Search gyms by name, city, or sport..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
        />
      </div>

      {/* Gyms Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <GymCardSkeleton key={i} />)}
        </div>
      ) : gyms.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="font-heading text-xl text-white mb-2">No gyms found</h3>
          <p className="text-text-secondary">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {gyms.map((gym) => (
            <div
              key={gym.id}
              className={`bg-surface border rounded-xl p-5 card-hover cursor-pointer ${
                gym.premium && !isPremium ? 'border-accent/50' : 'border-border'
              }`}
              onClick={() => openGymDetail(gym.id)}
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
                </div>
              </div>

              <h3 className="font-heading text-xl text-white mb-1">{gym.name}</h3>
              <p className="text-text-secondary text-sm mb-3">{gym.city}, {gym.state}</p>

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
            </div>
          ))}
        </div>
      )}

      {/* Gym Detail Modal */}
      {(selectedGym || detailLoading) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => { setSelectedGym(null) }}>
          <div
            className="bg-surface border border-border rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : selectedGym && (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl text-white">{selectedGym.name}</h3>
                      <p className="text-text-secondary">{selectedGym.city}, {selectedGym.state}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedGym(null)} className="text-text-secondary hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {selectedGym.premium && !isPremium && (
                  <div className="bg-accent/20 border border-accent/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-accent" />
                      <div>
                        <span className="text-white font-medium">Premium Content </span>
                        <span className="text-text-secondary">- Upgrade to book open mat sessions</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h4 className="text-text-secondary text-sm mb-2">About</h4>
                    <p className="text-white">{selectedGym.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedGym.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-text-secondary" />
                        <span className="text-white">{selectedGym.phone}</span>
                      </div>
                    )}
                    {selectedGym.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-text-secondary" />
                        <span className="text-white">{selectedGym.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-text-secondary" />
                      <span className="text-white">{selectedGym.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-white">{selectedGym.rating} rating ({selectedGym.review_count} reviews)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedGym.sports?.map(sport => (
                      <span key={sport} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                        {sport}
                      </span>
                    ))}
                    {selectedGym.amenities?.map(amenity => (
                      <span key={amenity} className="px-3 py-1 bg-background border border-border text-text-secondary rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Sessions */}
                  <div>
                    <h4 className="text-text-secondary text-sm mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Open Mat Sessions
                    </h4>
                    <div className="space-y-2">
                      {selectedGym.sessions?.map((session) => (
                        <div key={session.id} className="flex items-center justify-between bg-background rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-accent" />
                            <span className="text-white">{session.day} {session.start_time} - {session.end_time}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-text-secondary text-sm">{session.available} slots</span>
                            {(!selectedGym.premium || isPremium) ? (
                              <button
                                onClick={() => handleBookSession(session.id)}
                                disabled={bookingSession === session.id || session.available <= 0}
                                className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                              >
                                {bookingSession === session.id ? 'Booking...' : 'Book'}
                              </button>
                            ) : (
                              <Lock className="w-4 h-4 text-accent" />
                            )}
                          </div>
                        </div>
                      ))}
                      {(!selectedGym.sessions || selectedGym.sessions.length === 0) && (
                        <p className="text-text-secondary text-sm text-center py-4">No sessions scheduled</p>
                      )}
                    </div>
                  </div>

                  {/* Reviews */}
                  {selectedGym.reviews && selectedGym.reviews.length > 0 && (
                    <div>
                      <h4 className="text-text-secondary text-sm mb-3">Reviews</h4>
                      <div className="space-y-3">
                        {selectedGym.reviews.map(review => (
                          <div key={review.id} className="bg-background rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium text-sm">{review.user_name}</span>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-border'}`} />
                                ))}
                              </div>
                            </div>
                            {review.comment && <p className="text-text-secondary text-sm">{review.comment}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Drop-in Rate</span>
                      <span className="text-white font-heading text-2xl">{selectedGym.price}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
