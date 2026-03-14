'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import api, { isPremiumPlan } from '@/lib/api'

interface Ad {
  id: number
  advertiser_name: string
  image_url: string
  link_url: string
  alt_text: string
}

export function AdBanner({ slot, className = '' }: { slot: string; className?: string }) {
  const { subscription } = useAuth()
  const [ad, setAd] = useState<Ad | null>(null)
  const tracked = useRef(false)

  useEffect(() => {
    if (isPremiumPlan(subscription?.plan)) return
    api.getAd(slot).then(data => {
      if (data.ad) {
        setAd(data.ad)
      }
    }).catch(() => {})
  }, [slot, subscription?.plan])

  useEffect(() => {
    if (ad && !tracked.current) {
      tracked.current = true
      api.trackAdImpression(ad.id)
    }
  }, [ad])

  if (isPremiumPlan(subscription?.plan) || !ad) return null

  return (
    <div className={`bg-surface/50 border border-border/50 rounded-xl overflow-hidden ${className}`}>
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => api.trackAdClick(ad.id)}
        className="block"
      >
        {ad.image_url ? (
          <img src={ad.image_url} alt={ad.alt_text || 'Advertisement'} className="w-full h-auto" />
        ) : (
          <div className="p-4 text-center">
            <p className="text-white font-medium">{ad.advertiser_name}</p>
            <p className="text-text-secondary text-sm mt-1">{ad.alt_text}</p>
          </div>
        )}
      </a>
      <div className="flex items-center justify-between px-3 py-1.5 bg-background/50">
        <span className="text-text-secondary text-xs">Ad · {ad.advertiser_name}</span>
        <a href="/app/settings" className="text-primary text-xs hover:text-primary/80 transition-colors">
          Upgrade to remove
        </a>
      </div>
    </div>
  )
}
