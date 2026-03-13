'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Shield, Star, Search } from 'lucide-react'
import api, { Gym } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { GymCardSkeleton } from '@/components/skeleton'
import { useToast } from '@/components/toast'

export default function GymsPage() {
  const { subscription } = useAuth()
  const toast = useToast()
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
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
          aria-label="Search gyms by name, city, or sport"
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
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
