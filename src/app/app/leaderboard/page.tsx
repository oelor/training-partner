'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trophy, Medal, Clock, CheckCircle, Flame, MapPin, Filter } from 'lucide-react'
import api, { LeaderboardEntry } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'

const TYPES = [
  { key: 'points', label: 'Points', icon: Flame, unit: 'pts' },
  { key: 'checkins', label: 'Check-ins', icon: CheckCircle, unit: 'check-ins' },
  { key: 'sessions', label: 'Sessions', icon: Medal, unit: 'sessions' },
  { key: 'hours', label: 'Hours', icon: Clock, unit: 'hrs' },
]

const PERIODS = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: 'All time' },
]

const SPORTS = [
  'BJJ', 'Wrestling', 'Judo', 'MMA', 'Muay Thai', 'Boxing', 'Karate',
  'Taekwondo', 'Kickboxing', 'Sambo', 'Capoeira',
]

function getInitials(name: string): string {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getRankStyle(rank: number): string {
  if (rank === 1) return 'text-yellow-400 font-bold'
  if (rank === 2) return 'text-gray-300 font-bold'
  if (rank === 3) return 'text-amber-600 font-bold'
  return 'text-text-secondary'
}

function getRankBg(rank: number): string {
  if (rank === 1) return 'bg-yellow-400/10 border-yellow-400/30'
  if (rank === 2) return 'bg-gray-300/10 border-gray-300/20'
  if (rank === 3) return 'bg-amber-600/10 border-amber-600/20'
  return 'bg-surface border-border'
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const { error: showError } = useToast()
  const [type, setType] = useState('points')
  const [period, setPeriod] = useState(30)
  const [city, setCity] = useState('')
  const [sport, setSport] = useState('')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [myRank, setMyRank] = useState<number | null>(null)
  const [myScore, setMyScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const currentType = TYPES.find(t => t.key === type) || TYPES[0]

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const params: { type: string; period: number; limit: number; city?: string; sport?: string } = {
        type,
        period,
        limit: 20,
      }
      if (city.trim()) params.city = city.trim()
      if (sport && (type === 'sessions' || type === 'hours')) params.sport = sport
      const res = await api.getLeaderboard(params)
      setLeaderboard(res.leaderboard || [])
      setMyRank(res.my_rank)
      setMyScore(res.my_score || 0)
    } catch (err) {
      showError('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }, [type, period, city, sport, showError])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const formatScore = (score: number) => {
    if (currentType.unit === 'pts') return score.toLocaleString()
    return score.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="w-7 h-7 text-primary" />
          <h1 className="font-heading text-3xl text-white tracking-wider">LEADERBOARD</h1>
        </div>
        <p className="text-text-secondary ml-10">Compete with the community</p>
      </div>

      {/* Type tabs */}
      <div className="flex flex-wrap gap-2">
        {TYPES.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                type === t.key
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary hover:text-white hover:bg-white/10 border border-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap gap-2">
        {PERIODS.map(p => (
          <button
            key={p.days}
            onClick={() => setPeriod(p.days)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              period === p.days
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`}
          >
            {p.label}
          </button>
        ))}

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            showFilters || city || sport
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-surface rounded-xl border border-border">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-text-secondary mb-1">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Filter by city..."
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          {(type === 'sessions' || type === 'hours') && (
            <div className="min-w-[180px]">
              <label className="block text-xs text-text-secondary mb-1">Sport</label>
              <select
                value={sport}
                onChange={e => setSport(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="">All sports</option>
                {SPORTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
          {(city || sport) && (
            <div className="flex items-end">
              <button
                onClick={() => { setCity(''); setSport('') }}
                className="px-3 py-2 text-sm text-text-secondary hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* My Rank card */}
      {!loading && user && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
            {myRank ? `#${myRank}` : '--'}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">Your Ranking</p>
            <p className="text-text-secondary text-sm">
              {myRank
                ? `Rank #${myRank} with ${formatScore(myScore)} ${currentType.unit}`
                : `${formatScore(myScore)} ${currentType.unit} — not yet ranked`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-heading text-primary">{formatScore(myScore)}</p>
            <p className="text-xs text-text-secondary">{currentType.unit}</p>
          </div>
        </div>
      )}

      {/* Leaderboard list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-40" />
          <p className="text-text-secondary">No data yet for this period.</p>
          <p className="text-text-secondary text-sm mt-1">Check in or log training sessions to appear on the leaderboard.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map(entry => {
            const isMe = user && entry.id === user.id
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  isMe
                    ? 'bg-primary/10 border-primary/30'
                    : getRankBg(entry.rank)
                }`}
              >
                {/* Rank */}
                <div className={`w-8 text-center text-lg ${getRankStyle(entry.rank)}`}>
                  {entry.rank <= 3 ? (
                    <span>{entry.rank === 1 ? '\u{1F947}' : entry.rank === 2 ? '\u{1F948}' : '\u{1F949}'}</span>
                  ) : (
                    <span>{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                {entry.avatar_url ? (
                  <img
                    src={entry.avatar_url}
                    alt={entry.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {getInitials(entry.name)}
                  </div>
                )}

                {/* Name and city */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isMe ? 'text-primary' : 'text-white'}`}>
                    {entry.name}{isMe ? ' (you)' : ''}
                  </p>
                  {entry.city && (
                    <p className="text-xs text-text-secondary truncate">{entry.city}</p>
                  )}
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-lg font-heading ${isMe ? 'text-primary' : 'text-white'}`}>
                    {formatScore(entry.score)}
                  </p>
                  <p className="text-xs text-text-secondary">{currentType.unit}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
