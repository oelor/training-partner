'use client'

import { ExternalLink } from 'lucide-react'
import api from '@/lib/api'
import type { GearProduct } from '@/lib/gear-products'

export function GearProductCard({ product }: { product: GearProduct }) {
  const handleClick = async () => {
    try {
      const data = await api.trackAffiliateClick(product.id)
      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      // Fallback: just open Amazon
      window.open(`https://www.amazon.com/s?k=${encodeURIComponent(product.name)}&tag=trainingpartner-20`, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col hover:border-primary/30 transition-colors">
      <div className="mb-3">
        <span className="text-xs text-text-secondary">{product.brand}</span>
        <h3 className="font-heading text-lg text-white mt-1">{product.name}</h3>
      </div>

      <p className="text-text-secondary text-sm flex-1 mb-4">{product.description}</p>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
        <span className="text-white font-heading text-xl">{product.price}</span>
        <button
          onClick={handleClick}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Shop on Amazon
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
