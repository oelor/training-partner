'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Heart, MapPin, Star, Loader2, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'

interface FavoriteGym {
  id: number
  name: string
  city: string
  state: string
  sports: string[]
  rating: number
  review_count: number
  verified: boolean
  premium: boolean
  favorited_at: string
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [favorites, setFavorites] = useState<FavoriteGym[]>([])
  const [loading, setLoading] = useState(true)

  const loadFavorites = useCallback(async () => {
    try {
      const data = await api.getFavoriteGyms()
      setFavorites(data.favorites || [])
    } catch {
      toast.error('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const handleRemove = async (gymId: number, gymName: string) => {
    try {
      await api.toggleFavoriteGym(gymId)
      setFavorites(prev => prev.filter(f => f.id !== gymId))
      toast.success(`${gymName} removed from favorites`)
    } catch {
      toast.error('Failed to remove favorite')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
          <Heart className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h1 className="font-heading text-3xl text-white">FAVORITE GYMS</h1>
          <p className="text-text-secondary text-sm">Your saved training spots</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <Heart className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <h3 className="text-white font-medium mb-2">No favorites yet</h3>
          <p className="text-text-secondary text-sm mb-4">
            Browse gyms and tap the heart icon to save your favorite training spots.
          </p>
          <Link
            href="/app/gyms"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Browse Gyms
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {favorites.map(gym => (
            <div
              key={gym.id}
              className="bg-surface border border-border rounded-xl p-5 hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <Link href={`/app/gyms/${gym.id}`} className="flex-1 min-w-0">
                  <h3 className="text-white font-medium group-hover:text-primary transition-colors truncate">
                    {gym.name}
                  </h3>
                  <p className="text-text-secondary text-sm flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {gym.city}, {gym.state}
                  </p>
                </Link>
                <button
                  onClick={() => handleRemove(gym.id, gym.name)}
                  className="p-1.5 text-text-secondary hover:text-red-400 transition-colors"
                  aria-label="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-3">
                {gym.rating > 0 && (
                  <span className="flex items-center gap-1 text-sm text-yellow-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {gym.rating.toFixed(1)}
                    <span className="text-text-secondary">({gym.review_count})</span>
                  </span>
                )}
                {gym.verified && (
                  <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded-full">Verified</span>
                )}
                {gym.premium && (
                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">Premium</span>
                )}
              </div>

              {gym.sports.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {gym.sports.map(sport => (
                    <span
                      key={sport}
                      className="text-xs px-2 py-0.5 bg-background border border-border text-text-secondary rounded-full"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
