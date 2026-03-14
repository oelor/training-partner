'use client'

import { Shield } from 'lucide-react'

interface VerifiedBadgeProps {
  size?: 'sm' | 'md'
}

export default function VerifiedBadge({ size = 'sm' }: VerifiedBadgeProps) {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1'

  return (
    <span className={`inline-flex items-center gap-1 ${padding} bg-accent/20 text-accent rounded-full ${textSize} font-medium`}>
      <Shield className={iconSize} />
      Verified
    </span>
  )
}
