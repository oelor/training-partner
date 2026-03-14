'use client'

import { useState, useEffect, useCallback, KeyboardEvent } from 'react'
import {
  Dumbbell, Plus, Minus, Loader2, Trash2, Clock, Flame,
  ChevronDown, X, Filter, Calendar,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'

// ---------- Types ----------

interface TrainingLog {
  id: number
  user_id: number
  gym_id: number | null
  checkin_id: number | null
  partner_id: number | null
  sport: string
  session_type: string
  duration_minutes: number
  intensity: number
  notes: string
  techniques: string[]
  rounds: number
  gym_name: string | null
  gym_city: string | null
  partner_name: string | null
  partner_avatar: string | null
  created_at: string
}

interface TrainingStats {
  total_sessions: number
  total_minutes: number
  avg_duration: number
  avg_intensity: number
  total_rounds: number
  sports_trained: number
  gyms_visited: number
  training_partners: number
  streak: number
  period_days: number
}

interface GymMembership {
  gym_id: number
  gym_name: string
  gym_city: string
  status: string
}

// ---------- Constants ----------

const SPORTS = ['BJJ', 'Wrestling', 'MMA', 'Boxing', 'Muay Thai', 'Judo', 'Kickboxing', 'Other'] as const
const SESSION_TYPES = [
  'sparring', 'drilling', 'rolling', 'striking', 'conditioning',
  'technique', 'competition', 'private_lesson', 'open_mat', 'other',
] as const

const PAGE_SIZE = 20

// ---------- Helpers ----------

function formatRelative(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function intensityColor(intensity: number): string {
  if (intensity <= 3) return 'bg-green-500'
  if (intensity <= 6) return 'bg-yellow-500'
  if (intensity <= 8) return 'bg-orange-500'
  return 'bg-red-500'
}

function intensityTextColor(intensity: number): string {
  if (intensity <= 3) return 'text-green-400'
  if (intensity <= 6) return 'text-yellow-400'
  if (intensity <= 8) return 'text-orange-400'
  return 'text-red-400'
}

function sessionTypeLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---------- Component ----------

export default function TrainingLogPage() {
  const { user } = useAuth()
  const toast = useToast()

  // Data state
  const [logs, setLogs] = useState<TrainingLog[]>([])
  const [stats, setStats] = useState<TrainingStats | null>(null)
  const [memberships, setMemberships] = useState<GymMembership[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Form visibility & state
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formSport, setFormSport] = useState<string>('BJJ')
  const [formType, setFormType] = useState<string>('sparring')
  const [formDuration, setFormDuration] = useState(60)
  const [formIntensity, setFormIntensity] = useState(5)
  const [formRounds, setFormRounds] = useState<number | ''>('')
  const [formGymId, setFormGymId] = useState<number | ''>('')
  const [formNotes, setFormNotes] = useState('')
  const [formTechniques, setFormTechniques] = useState<string[]>([])
  const [techniqueInput, setTechniqueInput] = useState('')

  // Filters
  const [filterSport, setFilterSport] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')

  // Deleting
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // ---------- Data loading ----------

  const loadStats = useCallback(async () => {
    try {
      const data = await (api as any).getTrainingStats('month')
      setStats(data.stats || data)
    } catch {
      // stats are non-critical
    }
  }, [])

  const loadLogs = useCallback(async (offset = 0, append = false) => {
    try {
      const params: Record<string, any> = { limit: PAGE_SIZE, offset }
      if (filterSport) params.sport = filterSport
      if (filterType) params.session_type = filterType

      const data = await (api as any).getTrainingLogs(params)
      const fetched: TrainingLog[] = data.logs || []
      setTotal(data.total ?? fetched.length)
      setLogs((prev) => (append ? [...prev, ...fetched] : fetched))
    } catch {
      toast.error('Failed to load training logs')
    }
  }, [filterSport, filterType, toast])

  const loadMemberships = useCallback(async () => {
    try {
      const data = await api.getMyGymMemberships()
      const active = ((data as any).memberships || []).filter((m: GymMembership) => m.status === 'active')
      setMemberships(active)
    } catch {
      // non-critical
    }
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([loadLogs(0), loadStats(), loadMemberships()])
      setLoading(false)
    }
    init()
  }, [loadLogs, loadStats, loadMemberships])

  // Reload when filters change
  useEffect(() => {
    loadLogs(0)
  }, [filterSport, filterType, loadLogs])

  // ---------- Actions ----------

  function resetForm() {
    setFormSport('BJJ')
    setFormType('sparring')
    setFormDuration(60)
    setFormIntensity(5)
    setFormRounds('')
    setFormGymId('')
    setFormNotes('')
    setFormTechniques([])
    setTechniqueInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await (api as any).createTrainingLog({
        sport: formSport,
        session_type: formType,
        duration_minutes: formDuration,
        intensity: formIntensity,
        rounds: formRounds || undefined,
        gym_id: formGymId || undefined,
        notes: formNotes || undefined,
        techniques: formTechniques.length > 0 ? formTechniques : undefined,
      })
      toast.success('Session logged!')
      resetForm()
      setShowForm(false)
      loadLogs(0)
      loadStats()
    } catch {
      toast.error('Failed to log session')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await (api as any).deleteTrainingLog(id)
      setLogs((prev) => prev.filter((l) => l.id !== id))
      setTotal((t) => t - 1)
      toast.success('Session deleted')
      loadStats()
    } catch {
      toast.error('Failed to delete session')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleLoadMore() {
    setLoadingMore(true)
    await loadLogs(logs.length, true)
    setLoadingMore(false)
  }

  function handleTechniqueKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && techniqueInput.trim()) {
      e.preventDefault()
      const tag = techniqueInput.trim().replace(/,+$/, '')
      if (tag && !formTechniques.includes(tag)) {
        setFormTechniques([...formTechniques, tag])
      }
      setTechniqueInput('')
    }
  }

  function removeTechnique(tag: string) {
    setFormTechniques(formTechniques.filter((t) => t !== tag))
  }

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const totalHours = stats?.total_minutes ? (stats.total_minutes / 60).toFixed(1) : '0'
  const avgIntensity = stats?.avg_intensity ? stats.avg_intensity.toFixed(1) : '0'
  const streak = stats?.streak ?? 0
  const sessionsThisMonth = stats?.total_sessions ?? 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl text-white">TRAINING LOG</h1>
          <p className="text-text-secondary text-sm">Log your sessions, track your progress</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="font-heading text-2xl lg:text-3xl text-primary">{sessionsThisMonth}</p>
          <p className="text-text-secondary text-xs mt-1">Sessions This Month</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="font-heading text-2xl lg:text-3xl text-accent">{totalHours}</p>
          <p className="text-text-secondary text-xs mt-1">Total Hours</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="font-heading text-2xl lg:text-3xl text-white">{avgIntensity}</p>
          <p className="text-text-secondary text-xs mt-1">Avg Intensity</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="font-heading text-2xl lg:text-3xl text-primary">{streak}</p>
          <p className="text-text-secondary text-xs mt-1">Current Streak</p>
        </div>
      </div>

      {/* Log New Session Toggle */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-primary hover:bg-primary/90 text-white font-heading text-lg px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
      >
        {showForm ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        {showForm ? 'CANCEL' : 'LOG NEW SESSION'}
      </button>

      {/* New Session Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-5 space-y-5"
        >
          <h2 className="font-heading text-xl text-white">NEW SESSION</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Sport */}
            <div>
              <label className="text-text-secondary text-sm mb-1.5 block">Sport</label>
              <div className="relative">
                <select
                  value={formSport}
                  onChange={(e) => setFormSport(e.target.value)}
                  className="w-full appearance-none bg-background border border-border rounded-lg py-3 px-4 pr-10 text-white focus:border-primary transition-colors"
                >
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Session Type */}
            <div>
              <label className="text-text-secondary text-sm mb-1.5 block">Session Type</label>
              <div className="relative">
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full appearance-none bg-background border border-border rounded-lg py-3 px-4 pr-10 text-white focus:border-primary transition-colors"
                >
                  {SESSION_TYPES.map((t) => (
                    <option key={t} value={t}>{sessionTypeLabel(t)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-text-secondary text-sm mb-1.5 block">Duration (minutes)</label>
              <input
                type="number"
                min={1}
                max={600}
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white focus:border-primary transition-colors"
              />
            </div>

            {/* Rounds */}
            <div>
              <label className="text-text-secondary text-sm mb-1.5 block">Rounds (optional)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formRounds}
                onChange={(e) => setFormRounds(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 6"
                className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder:text-text-secondary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Intensity */}
          <div>
            <label className="text-text-secondary text-sm mb-2 block">
              Intensity: <span className={intensityTextColor(formIntensity)}>{formIntensity}/10</span>
            </label>
            <div className="flex gap-1.5">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFormIntensity(n)}
                  className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all ${
                    n <= formIntensity
                      ? `${intensityColor(n)} text-white`
                      : 'bg-background border border-border text-text-secondary hover:border-white/20'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Gym */}
          {memberships.length > 0 && (
            <div>
              <label className="text-text-secondary text-sm mb-1.5 block">Gym (optional)</label>
              <div className="relative">
                <select
                  value={formGymId}
                  onChange={(e) => setFormGymId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full appearance-none bg-background border border-border rounded-lg py-3 px-4 pr-10 text-white focus:border-primary transition-colors"
                >
                  <option value="">No gym selected</option>
                  {memberships.map((m) => (
                    <option key={m.gym_id} value={m.gym_id}>
                      {m.gym_name} — {m.gym_city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
              </div>
            </div>
          )}

          {/* Techniques */}
          <div>
            <label className="text-text-secondary text-sm mb-1.5 block">Techniques (optional)</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formTechniques.map((tag) => (
                <span
                  key={tag}
                  className="bg-primary/15 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1.5"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTechnique(tag)}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={techniqueInput}
              onChange={(e) => setTechniqueInput(e.target.value)}
              onKeyDown={handleTechniqueKeyDown}
              placeholder="Type a technique and press Enter"
              className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder:text-text-secondary/50 focus:border-primary transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-text-secondary text-sm mb-1.5 block">Notes (optional)</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={3}
              placeholder="How did the session go?"
              className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder:text-text-secondary/50 focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-heading text-lg px-8 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            LOG SESSION
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-text-secondary" />
        <div className="relative">
          <select
            value={filterSport}
            onChange={(e) => setFilterSport(e.target.value)}
            className="appearance-none bg-background border border-border rounded-lg py-2 px-3 pr-8 text-sm text-white focus:border-primary transition-colors"
          >
            <option value="">All Sports</option>
            {SPORTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none bg-background border border-border rounded-lg py-2 px-3 pr-8 text-sm text-white focus:border-primary transition-colors"
          >
            <option value="">All Types</option>
            {SESSION_TYPES.map((t) => (
              <option key={t} value={t}>{sessionTypeLabel(t)}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
        </div>
        {(filterSport || filterType) && (
          <button
            onClick={() => { setFilterSport(''); setFilterType('') }}
            className="text-text-secondary hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {/* Session History */}
      <section>
        <h2 className="font-heading text-xl text-white mb-4">SESSION HISTORY</h2>

        {logs.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-xl">
            <Dumbbell className="w-12 h-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">
              No training sessions logged yet. Log your first session to start tracking your progress!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-surface border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Top row: sport pill + type + date */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-primary/15 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {log.sport}
                      </span>
                      <span className="text-white text-sm font-medium">
                        {sessionTypeLabel(log.session_type)}
                      </span>
                      <span className="text-text-secondary text-xs flex items-center gap-1 ml-auto">
                        <Calendar className="w-3 h-3" />
                        {formatRelative(log.created_at)}
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(log.duration_minutes)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${intensityColor(log.intensity)}`} />
                        <span className={intensityTextColor(log.intensity)}>
                          {log.intensity}/10
                        </span>
                      </span>
                      {log.rounds > 0 && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" />
                          {log.rounds} {log.rounds === 1 ? 'round' : 'rounds'}
                        </span>
                      )}
                      {log.gym_name && (
                        <span className="text-text-secondary text-xs">
                          @ {log.gym_name}
                        </span>
                      )}
                      {log.partner_name && (
                        <span className="text-text-secondary text-xs">
                          w/ {log.partner_name}
                        </span>
                      )}
                    </div>

                    {/* Techniques */}
                    {log.techniques && log.techniques.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {log.techniques.map((tech) => (
                          <span
                            key={tech}
                            className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {log.notes && (
                      <p className="text-text-secondary text-sm mt-2 line-clamp-2">{log.notes}</p>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(log.id)}
                    disabled={deletingId === log.id}
                    className="text-text-secondary hover:text-red-400 transition-colors p-1 flex-shrink-0"
                    title="Delete session"
                  >
                    {deletingId === log.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {logs.length < total && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-surface border border-border hover:border-primary/50 text-white font-heading px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              {loadingMore ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : null}
              {loadingMore ? 'LOADING...' : 'LOAD MORE'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
