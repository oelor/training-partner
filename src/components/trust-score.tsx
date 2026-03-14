'use client'

import { useState, useEffect } from 'react'
import { Lock, ThumbsUp } from 'lucide-react'
import api, { TrustScore as TrustScoreType } from '@/lib/api'
import { Skeleton } from '@/components/skeleton'

interface TrustScoreProps {
  userId: number
}

export default function TrustScore({ userId }: TrustScoreProps) {
  const [score, setScore] = useState<TrustScoreType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getTrustScore(userId)
        setScore(res.score)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    if (userId) load()
  }, [userId])

  if (loading) {
    return <Skeleton className="h-8 w-48" />
  }

  if (!score) return null

  if (score.locked) {
    return (
      <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-4 py-3">
        <Lock className="w-4 h-4 text-text-secondary" />
        <span className="text-text-secondary text-sm">
          Trust score unlocks after {score.sessions_remaining || 'a few'} more sessions
        </span>
      </div>
    )
  }

  const colorClass = score.percentage >= 80
    ? 'text-accent'
    : score.percentage >= 50
      ? 'text-yellow-400'
      : 'text-red-400'

  return (
    <div className="flex items-center gap-2">
      <ThumbsUp className={`w-4 h-4 ${colorClass}`} />
      <span className={`text-sm font-medium ${colorClass}`}>
        {score.percentage}% positive
      </span>
      <span className="text-text-secondary text-sm">
        ({score.total_ratings} {score.total_ratings === 1 ? 'rating' : 'ratings'})
      </span>
    </div>
  )
}
