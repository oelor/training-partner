'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Users, MapPin, MessageCircle, Trophy, Calendar, ArrowRight, UserSearch, TrendingUp, Star, Crown, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import api, { Partner, Gym, Booking, isPremiumPlan } from '@/lib/api'
import { CardSkeleton } from '@/components/skeleton'
import TrainingStatsChart from '@/components/training-stats-chart'

export default function DashboardPage() {
  const { user, profile, subscription } = useAuth()
  const [partners, setPartners] = useState<Partner[]>([])
  const [gyms, setGyms] = useState<Gym[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [pData, gData, bData, mData] = await Promise.all([
          api.getPartners({ limit: 3 }).catch(() => ({ partners: [], total: 0 })),
          api.getGyms().catch(() => ({ gyms: [], total: 0 })),
          api.getBookings().catch(() => ({ bookings: [] })),
          api.getUnreadCount().catch(() => ({ unread: 0 })),
        ])
        setPartners(pData.partners || [])
        setGyms(gData.gyms?.slice(0, 3) || [])
        setBookings(bData.bookings || [])
        setUnread(mData.unread || 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const profileComplete = profile?.profile_complete || 0
  const isProfileIncomplete = !profile || profileComplete < 50

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    async function reload() {
      try {
        const [pData, gData, bData, mData] = await Promise.all([
          api.getPartners({ limit: 3 }).catch(() => ({ partners: [], total: 0 })),
          api.getGyms().catch(() => ({ gyms: [], total: 0 })),
          api.getBookings().catch(() => ({ bookings: [] })),
          api.getUnreadCount().catch(() => ({ unread: 0 })),
        ])
        setPartners(pData.partners || [])
        setGyms(gData.gyms?.slice(0, 3) || [])
        setBookings(bData.bookings || [])
        setUnread(mData.unread || 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    reload()
  }

  return (
    <>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium text-sm">Couldn&apos;t load dashboard data</p>
              <p className="text-text-secondary text-xs mt-1">{error}</p>
            </div>
          </div>
          <button onClick={handleRetry} className="inline-flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}
      <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="font-heading text-3xl text-white mb-2">
          WELCOME BACK, {user?.display_name?.split(' ')[0]?.toUpperCase() || 'ATHLETE'}!
        </h1>
        <p className="text-text-secondary">Here&apos;s what&apos;s happening in your training network</p>
      </div>

      {/* Profile Completion Banner */}
      {isProfileIncomplete && (
        <Link href="/app/onboarding" className="block bg-primary/10 border border-primary/30 rounded-xl p-6 hover:bg-primary/15 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-heading text-lg mb-1">Complete Your Profile</h3>
              <p className="text-text-secondary text-sm">Add your sports, skill level, and training goals to get matched with partners</p>
              <div className="mt-3 w-full max-w-xs bg-background rounded-full h-2">
                <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${profileComplete}%` }} />
              </div>
              <p className="text-primary text-xs mt-1">{profileComplete}% complete</p>
            </div>
            <ArrowRight className="w-6 h-6 text-primary flex-shrink-0" />
          </div>
        </Link>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-border rounded-lg" />
                <div className="h-4 w-16 bg-border rounded" />
              </div>
              <div className="h-8 w-12 bg-border rounded mb-1" />
              <div className="h-4 w-20 bg-border rounded" />
            </div>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <UserSearch className="w-5 h-5 text-primary" />
            </div>
            <span className="text-text-secondary text-sm">Matches</span>
          </div>
          <div className="font-heading text-2xl text-white">{partners.length}</div>
          <div className="text-text-secondary text-sm">Partners found</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-text-secondary text-sm">Messages</span>
          </div>
          <div className="font-heading text-2xl text-white">{unread}</div>
          <div className="text-text-secondary text-sm">Unread</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-text-secondary text-sm">Sessions</span>
          </div>
          <div className="font-heading text-2xl text-white">{bookings.length}</div>
          <div className="text-text-secondary text-sm">Upcoming</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-text-secondary text-sm">Gyms</span>
          </div>
          <div className="font-heading text-2xl text-white">{gyms.length}</div>
          <div className="text-text-secondary text-sm">Partner gyms</div>
        </div>
      </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Link
          href="/app/partners"
          className="bg-gradient-to-r from-primary/20 to-surface border border-primary/50 rounded-xl p-6 hover:border-primary transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-xl text-white mb-1">FIND PARTNERS</h3>
              <p className="text-text-secondary text-sm">Browse compatible training partners in your area</p>
            </div>
            <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/app/gyms"
          className="bg-gradient-to-r from-accent/20 to-surface border border-accent/50 rounded-xl p-6 hover:border-accent transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-xl text-white mb-1">FIND GYMS</h3>
              <p className="text-text-secondary text-sm">Discover partner gyms with open mat hours</p>
            </div>
            <ArrowRight className="w-6 h-6 text-accent group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Training Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <TrainingStatsChart
          data={[
            { week: 'Week 1', sessions: 3, hours: 6 },
            { week: 'Week 2', sessions: 4, hours: 8 },
            { week: 'Week 3', sessions: 5, hours: 10 },
            { week: 'Week 4', sessions: 4, hours: 8 },
            { week: 'Week 5', sessions: 6, hours: 12 },
            { week: 'Week 6', sessions: 5, hours: 10 },
          ]}
        />
      </motion.div>

      {/* Top Partners */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-2xl text-white">TOP MATCHES</h2>
          <Link href="/app/partners" className="text-primary text-sm hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : partners.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-surface/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-text-secondary" />
            </div>
            <p className="text-white font-heading text-lg mb-2">Find Your Training Partners</p>
            <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">Get matched with compatible athletes in your area for BJJ, wrestling, and combat sports training</p>
            {isProfileIncomplete ? (
              <Link href="/app/onboarding" className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors">
                Complete Profile <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="text-text-secondary text-sm italic">
                Adjust your preferences in settings to see more matches
              </div>
            )}
            <p className="text-text-secondary text-xs mt-4">
              Premium members get priority matching and see 3x more partners
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <Link key={partner.id} href={`/app/partners/${partner.id}`} className="bg-surface border border-border rounded-xl p-4 card-hover group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                    {partner.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  {partner.match > 0 && (
                    <div className="text-right">
                      <div className="text-accent font-mono text-lg font-bold">{Math.round(partner.match * 100)}%</div>
                      <div className="text-text-secondary text-xs">match</div>
                    </div>
                  )}
                </div>
                <h3 className="font-heading text-lg text-white mb-1 group-hover:text-primary transition-colors">{partner.name}</h3>
                <p className="text-text-secondary text-sm mb-2">
                  {partner.sport || partner.sports?.[0] || 'Combat Sports'} {partner.skill ? `• ${partner.skill}` : ''}
                </p>
                {partner.city && (
                  <div className="flex items-center gap-1 text-text-secondary text-xs">
                    <MapPin className="w-3 h-3" />
                    {partner.city}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Nearby Gyms */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-2xl text-white">NEARBY GYMS</h2>
          <Link href="/app/gyms" className="text-primary text-sm hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : gyms.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-surface/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-text-secondary" />
            </div>
            <p className="text-white font-heading text-lg mb-2">Discover Partner Gyms</p>
            <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">Explore our network of partner gyms with verified open mat hours and facilities in your area</p>
            {isPremiumPlan(subscription?.plan) ? (
              <Link href="/app/gyms" className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors">
                View All Gyms <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link href="/app/settings" className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors">
                Upgrade to View <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <p className="text-text-secondary text-xs mt-4">Premium members get access to 150+ gyms with exclusive open mat hours</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {gyms.map((gym) => (
              <Link key={gym.id} href={`/app/gyms/${gym.id}`} className="bg-surface border border-border rounded-xl overflow-hidden card-hover group">
                <div className="h-28 relative overflow-hidden">
                  <Image
                    src="/images/gym-interior.png"
                    alt={`${gym.name} gym`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                  <MapPin className="absolute bottom-2 right-2 w-5 h-5 text-primary/70" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading text-lg text-white truncate group-hover:text-primary transition-colors">{gym.name}</h3>
                    {gym.verified && (
                      <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded flex-shrink-0">Verified</span>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm mb-2">{gym.city}, {gym.state}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-sm">{gym.rating}</span>
                    </div>
                    <span className="text-text-secondary text-xs">({gym.review_count} reviews)</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Premium CTA */}
      {subscription?.plan !== 'premium' && (
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/30 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-xl text-white mb-1">UNLOCK PREMIUM</h3>
                <p className="text-text-secondary text-sm">
                  Get access to exclusive open mat hours at 150+ partner gyms
                </p>
              </div>
            </div>
            <Link
              href="/app/settings"
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap text-center"
            >
              Upgrade - $20/mo
            </Link>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
