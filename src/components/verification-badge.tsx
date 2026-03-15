'use client'

import { useState } from 'react'
import { CheckCircle, Shield, Trophy } from 'lucide-react'

interface VerificationBadgeProps {
  tier: string
  sport?: string
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function VerificationBadge({ tier, sport, title, size = 'sm' }: VerificationBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  if (!tier || tier === 'none') return null

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const iconSize = sizeMap[size]

  const config: Record<string, {
    icon: React.ReactNode
    tooltip: string
    containerClass: string
  }> = {
    verified: {
      icon: <CheckCircle className={`${iconSize} text-blue-400`} />,
      tooltip: 'Verified',
      containerClass: '',
    },
    pro: {
      icon: <Shield className={`${iconSize} text-purple-400`} />,
      tooltip: sport ? `Pro Athlete \u2014 ${sport}` : 'Pro Athlete',
      containerClass: '',
    },
    champion: {
      icon: (
        <span className="relative inline-flex items-center">
          <Trophy className={`${iconSize} text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]`} />
          <span className="absolute -top-1 -right-1 text-yellow-300 text-[8px] leading-none">&#9733;</span>
        </span>
      ),
      tooltip: title ? `${title}${sport ? ` \u2014 ${sport}` : ''}` : 'Champion',
      containerClass: '',
    },
  }

  const cfg = config[tier]
  if (!cfg) return null

  return (
    <span
      className={`relative inline-flex items-center cursor-help ${cfg.containerClass}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {cfg.icon}
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-white whitespace-nowrap z-50 shadow-lg pointer-events-none animate-fade-in">
          {cfg.tooltip}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-surface" />
        </span>
      )}
    </span>
  )
}
