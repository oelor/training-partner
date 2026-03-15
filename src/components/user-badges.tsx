'use client'

import { useState } from 'react'
import { Trophy, GraduationCap, Medal, Award } from 'lucide-react'
import type { UserBadge } from '@/lib/api'

interface UserBadgesProps {
  badges: UserBadge[]
  maxDisplay?: number
}

const COMPETITION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  state: { bg: 'bg-amber-900/30', text: 'text-amber-400', border: 'border-amber-700/50' },
  national: { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/50' },
  international: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  world_olympic: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
}

const COACHING_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  youth: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  high_school: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  university: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  professional: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
}

const LEVEL_LABELS: Record<string, string> = {
  state: 'State',
  national: 'National',
  international: 'International',
  world_olympic: 'World/Olympic',
  youth: 'Youth',
  high_school: 'High School',
  university: 'University',
  professional: 'Professional',
}

// Sort by impressiveness
const LEVEL_ORDER: Record<string, number> = {
  world_olympic: 10, professional: 9, international: 8, university: 7,
  national: 6, high_school: 5, state: 4, youth: 3,
}

export default function UserBadges({ badges, maxDisplay = 3 }: UserBadgesProps) {
  const [expandedBadge, setExpandedBadge] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)

  if (!badges || badges.length === 0) return null

  // Sort by impressiveness
  const sorted = [...badges].sort((a, b) => (LEVEL_ORDER[b.badge_level] || 0) - (LEVEL_ORDER[a.badge_level] || 0))
  const displayed = showAll ? sorted : sorted.slice(0, maxDisplay)
  const overflow = sorted.length - maxDisplay

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {displayed.map(badge => {
        const colors = badge.badge_type === 'competition'
          ? COMPETITION_COLORS[badge.badge_level] || COMPETITION_COLORS.state
          : COACHING_COLORS[badge.badge_level] || COACHING_COLORS.youth
        const Icon = badge.badge_type === 'competition' ? Medal : GraduationCap

        return (
          <div key={badge.id} className="relative">
            <button
              onClick={() => setExpandedBadge(expandedBadge === badge.id ? null : badge.id)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all hover:scale-105 cursor-pointer ${colors.bg} ${colors.text} ${colors.border}`}
            >
              <Icon className="w-3 h-3" />
              {LEVEL_LABELS[badge.badge_level] || badge.badge_level}
            </button>

            {expandedBadge === badge.id && (
              <div className="absolute top-full left-0 mt-2 z-50 w-64 bg-surface border border-border rounded-lg shadow-xl p-3 animate-fade-in">
                <div className="flex items-start gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{badge.title}</div>
                    <div className="text-text-secondary text-xs">{badge.sport}</div>
                  </div>
                </div>
                {badge.organization && (
                  <div className="text-text-secondary text-xs mb-1">
                    <Award className="w-3 h-3 inline mr-1" />
                    {badge.organization}
                  </div>
                )}
                {badge.year && (
                  <div className="text-text-secondary text-xs">{badge.year}</div>
                )}
                <div
                  className="absolute -top-1.5 left-4 w-3 h-3 bg-surface border-l border-t border-border rotate-45"
                />
              </div>
            )}
          </div>
        )
      })}

      {!showAll && overflow > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-text-secondary hover:text-white transition-colors"
        >
          +{overflow} more
        </button>
      )}
    </div>
  )
}
