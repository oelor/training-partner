'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Sparkles,
  Swords,
  Trophy,
  Dumbbell,
  Heart,
  Users,
  Target,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'
import { useToast } from '@/components/toast'
import { trackOnboardingStep, trackOnboardingCompleted } from '@/lib/analytics'

// ─── Data ──────────────────────────────────────────────────────

const sportsList = [
  { id: 'Wrestling', label: 'Wrestling', emoji: '🤼' },
  { id: 'BJJ', label: 'BJJ', emoji: '🥋' },
  { id: 'MMA', label: 'MMA', emoji: '🥊' },
  { id: 'Boxing', label: 'Boxing', emoji: '🥊' },
  { id: 'Muay Thai', label: 'Muay Thai', emoji: '🦵' },
  { id: 'Judo', label: 'Judo', emoji: '🥋' },
  { id: 'Kickboxing', label: 'Kickboxing', emoji: '🦶' },
  { id: 'Taekwondo', label: 'Taekwondo', emoji: '🥋' },
  { id: 'Sambo', label: 'Sambo', emoji: '🤼' },
  { id: 'Karate', label: 'Karate', emoji: '🥋' },
  { id: 'Capoeira', label: 'Capoeira', emoji: '🕺' },
]

const experienceLevels = [
  {
    id: 'Beginner',
    label: 'Just starting out',
    description: 'Less than 1 year of training',
    emoji: '🌱',
    years: 0,
  },
  {
    id: 'Intermediate',
    label: "I've been training a while",
    description: '1-3 years of experience',
    emoji: '💪',
    years: 2,
  },
  {
    id: 'Advanced',
    label: "I'm serious about this",
    description: '3-10 years of experience',
    emoji: '🔥',
    years: 5,
  },
  {
    id: 'Pro',
    label: 'I compete at a high level',
    description: '10+ years of experience',
    emoji: '🏆',
    years: 12,
  },
]

const goalsList = [
  { id: 'Fun', label: 'Fun & Fitness', icon: Heart },
  { id: 'Technique', label: 'Learn Technique', icon: Target },
  { id: 'Sparring', label: 'Find Sparring Partners', icon: Swords },
  { id: 'Competition', label: 'Compete', icon: Trophy },
  { id: 'Fitness', label: 'Get in Shape', icon: Dumbbell },
  { id: 'Self-defense', label: 'Meet Training Buddies', icon: Users },
]

const weightClasses = [
  { group: 'Lighter', items: [
    'Flyweight (≤126 lbs)',
    'Bantamweight (126–132 lbs)',
    'Featherweight (132–145 lbs)',
  ]},
  { group: 'Middle', items: [
    'Lightweight (145–155 lbs)',
    'Welterweight (155–170 lbs)',
    'Middleweight (170–185 lbs)',
  ]},
  { group: 'Heavier', items: [
    'Light Heavyweight (185–205 lbs)',
    'Heavyweight (205–265 lbs)',
    'Super Heavyweight (265+ lbs)',
  ]},
]

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const fullDays: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
  Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
}
const timeSlots = ['Morning', 'Afternoon', 'Evening']
const timeSlotEmoji: Record<string, string> = {
  Morning: '🌅',
  Afternoon: '☀️',
  Evening: '🌙',
}

const TOTAL_STEPS = 9

// ─── Component ─────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const toast = useToast()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [saving, setSaving] = useState(false)
  const startTime = useRef(Date.now())

  const [profile, setProfile] = useState({
    name: user?.display_name || '',
    location: '',
    sports: [] as string[],
    skillLevel: '',
    experienceYears: 0,
    trainingGoals: [] as string[],
    weightClass: '',
    noWeightPreference: false,
    availability: [] as { day: string; time: string }[],
    bio: '',
  })

  // ─── Navigation ────────────────────────────────────────────

  const goNext = useCallback(() => {
    const stepNames = ['welcome', 'sports', 'experience', 'goals', 'weight', 'location', 'schedule', 'bio', 'summary']
    trackOnboardingStep(step, stepNames[step] || 'unknown', true)
    setDirection('forward')
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  }, [step])

  const goBack = useCallback(() => {
    setDirection('back')
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  // ─── Toggles ───────────────────────────────────────────────

  const toggleSport = (sport: string) => {
    setProfile((p) => ({
      ...p,
      sports: p.sports.includes(sport)
        ? p.sports.filter((s) => s !== sport)
        : [...p.sports, sport],
    }))
  }

  const toggleGoal = (goal: string) => {
    setProfile((p) => ({
      ...p,
      trainingGoals: p.trainingGoals.includes(goal)
        ? p.trainingGoals.filter((g) => g !== goal)
        : [...p.trainingGoals, goal],
    }))
  }

  const toggleAvail = (day: string, time: string) => {
    setProfile((p) => {
      const full = fullDays[day] || day
      const exists = p.availability.some((a) => a.day === full && a.time === time)
      return {
        ...p,
        availability: exists
          ? p.availability.filter((a) => !(a.day === full && a.time === time))
          : [...p.availability, { day: full, time }],
      }
    })
  }

  // ─── Validation ────────────────────────────────────────────

  const canProceed = () => {
    switch (step) {
      case 0: return true // welcome
      case 1: return profile.sports.length > 0
      case 2: return profile.skillLevel !== ''
      case 3: return profile.trainingGoals.length > 0
      case 4: return profile.weightClass !== '' || profile.noWeightPreference
      case 5: return profile.location.trim().length > 0
      case 6: return true // schedule optional
      case 7: return true // bio optional
      case 8: return true // summary
      default: return true
    }
  }

  // ─── Submit ────────────────────────────────────────────────

  const handleFinish = async () => {
    setSaving(true)
    try {
      await api.updateProfile({
        display_name: profile.name || user?.display_name || '',
        city: profile.location,
        sports: profile.sports,
        skill_level: profile.skillLevel,
        weight_class: profile.noWeightPreference ? '' : profile.weightClass,
        training_goals: profile.trainingGoals,
        experience_years: profile.experienceYears,
        bio: profile.bio,
        age: 0,
        location: profile.location,
        availability: profile.availability,
      })
      trackOnboardingCompleted(Date.now() - startTime.current)
      await refreshUser()
      toast.success('You\'re all set! Let\'s find your training partners.')
      router.push('/app')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  // ─── Animation class ──────────────────────────────────────

  const animClass = direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'

  // ─── Progress ──────────────────────────────────────────────

  const progress = step === 0 ? 0 : Math.round((step / (TOTAL_STEPS - 1)) * 100)

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Progress bar - hidden on welcome and summary */}
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-text-secondary hover:text-white transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-text-secondary text-sm">
              {step} of {TOTAL_STEPS - 2}
            </span>
          </div>
          <div className="h-1 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 flex flex-col" key={step}>
        {/* ─── Step 0: Welcome ──────────────────────────────── */}
        {step === 0 && (
          <div className={`flex-1 flex flex-col items-center justify-center text-center space-y-8 ${animClass}`}>
            <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center animate-bounce-in">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-3">
              <h1 className="font-heading text-4xl sm:text-5xl text-white tracking-wide">
                WELCOME TO<br />
                <span className="text-primary">TRAINING</span>PARTNER
              </h1>
              <p className="text-text-secondary text-lg max-w-md mx-auto">
                Let&apos;s set up your profile in under 2 minutes so we can match you with the right training partners.
              </p>
            </div>

            <button
              onClick={goNext}
              className="group flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg
                         hover:bg-primary-hover transition-all duration-300 hover:scale-105 btn-glow animate-pulse-glow"
            >
              Let&apos;s Go
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => router.push('/app')}
              className="text-text-secondary hover:text-white text-sm transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* ─── Step 1: Sports ───────────────────────────────── */}
        {step === 1 && (
          <div className={`space-y-6 ${animClass}`}>
            <div className="text-center">
              <h2 className="font-heading text-3xl sm:text-4xl text-white mb-2">
                WHAT SPORTS ARE YOU INTO?
              </h2>
              <p className="text-text-secondary">Tap all that apply. You can always change these later.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sportsList.map((sport) => {
                const selected = profile.sports.includes(sport.id)
                return (
                  <button
                    key={sport.id}
                    onClick={() => toggleSport(sport.id)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${
                      selected
                        ? 'border-primary bg-primary/10 text-white shadow-lg shadow-primary/20'
                        : 'border-border bg-surface text-text-secondary hover:border-primary/40 hover:bg-surface/80'
                    }`}
                  >
                    <div className="text-2xl mb-1">{sport.emoji}</div>
                    <div className="font-medium text-sm">{sport.label}</div>
                    {selected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-scale-in">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── Step 2: Experience Level ─────────────────────── */}
        {step === 2 && (
          <div className={`space-y-6 ${animClass}`}>
            <div className="text-center">
              <h2 className="font-heading text-3xl sm:text-4xl text-white mb-2">
                HOW EXPERIENCED ARE YOU?
              </h2>
              <p className="text-text-secondary">This helps us match you with the right partners.</p>
            </div>

            <div className="space-y-3">
              {experienceLevels.map((level) => {
                const selected = profile.skillLevel === level.id
                return (
                  <button
                    key={level.id}
                    onClick={() => setProfile((p) => ({
                      ...p,
                      skillLevel: level.id,
                      experienceYears: level.years,
                    }))}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] flex items-center gap-4 ${
                      selected
                        ? 'border-primary bg-primary/10 text-white shadow-lg shadow-primary/20'
                        : 'border-border bg-surface text-text-secondary hover:border-primary/40'
                    }`}
                  >
                    <span className="text-3xl">{level.emoji}</span>
                    <div className="flex-1">
                      <div className="font-medium text-white">{level.label}</div>
                      <div className="text-sm text-text-secondary">{level.description}</div>
                    </div>
                    {selected && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-scale-in">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── Step 3: Training Goals ───────────────────────── */}
        {step === 3 && (
          <div className={`space-y-6 ${animClass}`}>
            <div className="text-center">
              <h2 className="font-heading text-3xl sm:text-4xl text-white mb-2">
                WHAT ARE YOUR GOALS?
              </h2>
              <p className="text-text-secondary">Pick as many as you want.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goalsList.map((goal) => {
                const selected = profile.trainingGoals.includes(goal.id)
                const Icon = goal.icon
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-4 ${
                      selected
                        ? 'border-accent bg-accent/10 text-white shadow-lg shadow-accent/20'
                        : 'border-border bg-surface text-text-secondary hover:border-accent/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      selected ? 'bg-accent/20 text-accent' : 'bg-background text-text-secondary'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{goal.label}</span>
                    {selected && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-accent rounded-full flex items-center justify-center animate-scale-in">
                        <Check className="w-3 h-3 text-background" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── Step 4: Weight Class ─────────────────────────── */}
        {step === 4 && (
          <div className={`space-y-6 ${animClass}`}>
            <div className="text-center">
              <h2 className="font-heading text-3xl sm:text-4xl text-white mb-2">
                WHAT&apos;S YOUR WEIGHT CLASS?
              </h2>
              <p className="text-text-secondary">Helps us find size-appropriate partners.</p>
            </div>

            <div className="space-y-4">
              {weightClasses.map((group) => (
                <div key={group.group}>
                  <div className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 px-1">
                    {group.group}
                  </div>
                  <div className="space-y-2">
                    {group.items.map((wc) => {
                      const selected = profile.weightClass === wc && !profile.noWeightPreference
                      return (
                        <button
                          key={wc}
                          onClick={() => setProfile((p) => ({ ...p, weightClass: wc, noWeightPreference: false }))}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 hover:scale-[1.01] flex items-center justify-between ${
                            selected
                              ? 'border-primary bg-primary/10 text-white'
                              : 'border-border bg-surface text-text-secondary hover:border-primary/40'
                          }`}
                        >
                          <span className="text-sm">{wc}</span>
                          {selected && (
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-scale-in">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* No preference option */}
              <button
                onClick={() => setProfile((p) => ({ ...p, weightClass: '', noWeightPreference: true }))}
                className={`w-full p-4 rounded-xl border-2 border-dashed text-center transition-all duration-300 hover:scale-[1.01] ${
                  profile.noWeightPreference
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-text-secondary hover:border-accent/40'
                }`}
              >
                <Zap className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">I don&apos;t care about weight matching</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 5: Location ─────────────────────────────── */}
        {step === 5 && (
          <div className={`space-y-6 ${animClass}`}>
            <div className="text-center">
              <h2 className="font-heading text-3xl sm:text-4xl text-white mb-2">
                WHERE ARE YOU LOCATED?
              </h2>
              <p className="text-text-secondary">So we can find partners near you.</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                  placeholder="City, State (e.g. San Francisco, CA)"
                  autoFocus
                  className="w-full bg-surface border-2 border-border rounded-xl py-4 pl-12 pr-4 text-white text-lg
                             placeholder-text-secondary focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 6: Schedule ──────────────────────────────── */}
        {step === 6 && (
          <div className={`space-y-6 ${animClass}`}>
            <div className="text-center">
              <h2 className="font-heading text-3xl sm:text-4xl text-white mb-2">
                WHEN ARE YOU FREE TO TRAIN?
              </h2>
              <p className="text-text-secondary">Tap the times that work for you. This is optional.</p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-3 sm:p-5">
              {/* Header row */}
              <div className="grid grid-cols-[50px_1fr_1fr_1fr] sm:grid-cols-[70px_1fr_1fr_1fr] gap-2 mb-3">
                <div />
                {timeSlots.map((t) => (
                  <div key={t} className="text-center">
                    <div className="text-lg">{timeSlotEmoji[t]}</div>
                    <div className="text-text-secondary text-xs font-medium">{t}</div>
                  </div>
                ))}
              </div>
              {/* Day rows */}
              {days.map((day) => (
                <div key={day} className="grid grid-cols-[50px_1fr_1fr_1fr] sm:grid-cols-[70px_1fr_1fr_1fr] gap-2 mb-2">
                  <div className="text-text-secondary text-sm flex items-center font-medium">{day}</div>
                  {timeSlots.map((time) => {
                    const full = fullDays[day] || day
                    const sel = profile.availability.some((a) => a.day === full && a.time === time)
                    return (
                      <button
                        key={time}
                        onClick={() => toggleAvail(day, time)}
                        className={`h-11 rounded-lg transition-all duration-200 active:scale-95 ${
                          sel
                            ? 'bg-primary text-white shadow-md shadow-primary/30'
                            : 'bg-background border border-border hover:border-primary/50'
                        }`}
                      >
                        {sel && <Check className="w-4 h-4 mx-auto" />}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step 7: Bio ──────────────────────────────────── */}
        {step === 7 && (
          <div className={`space-y-6 ${animClass}`}>
            <div className="text-center">
              <h2 className="font-heading text-3xl sm:text-4xl text-white mb-2">
                QUICK BIO
              </h2>
              <p className="text-text-secondary">
                Tell potential training partners about yourself. Totally optional.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value.slice(0, 300) }))}
                placeholder="I've been training BJJ for 3 years and love rolling. Always down for a good sparring session..."
                rows={5}
                className="w-full bg-surface border-2 border-border rounded-xl py-4 px-4 text-white text-base
                           placeholder-text-secondary/50 focus:border-primary focus:outline-none transition-colors resize-none"
              />
              <div className="text-right text-text-secondary text-xs">
                {profile.bio.length}/300
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 8: Summary / All Set ────────────────────── */}
        {step === 8 && (
          <div className={`flex-1 flex flex-col items-center text-center space-y-6 ${animClass}`}>
            <div className="w-20 h-20 bg-accent/20 rounded-2xl flex items-center justify-center animate-bounce-in">
              <Check className="w-10 h-10 text-accent" />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-4xl sm:text-5xl text-white">
                YOU&apos;RE ALL SET!
              </h2>
              <p className="text-text-secondary text-lg">
                Here&apos;s a quick look at your profile.
              </p>
            </div>

            {/* Summary cards */}
            <div className="w-full max-w-md space-y-3 text-left">
              <SummaryRow label="Sports" value={profile.sports.join(', ') || 'None selected'} />
              <SummaryRow label="Level" value={profile.skillLevel || 'Not set'} />
              <SummaryRow label="Goals" value={profile.trainingGoals.join(', ') || 'None selected'} />
              <SummaryRow
                label="Weight"
                value={profile.noWeightPreference ? 'No preference' : (profile.weightClass || 'Not set')}
              />
              <SummaryRow label="Location" value={profile.location || 'Not set'} />
              <SummaryRow
                label="Schedule"
                value={profile.availability.length > 0 ? `${profile.availability.length} time slots` : 'Flexible'}
              />
              {profile.bio && <SummaryRow label="Bio" value={profile.bio} />}
            </div>

            <div className="pt-4 space-y-3 w-full max-w-md">
              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-accent text-background px-8 py-4 rounded-xl
                           font-bold text-lg hover:bg-accent/90 disabled:opacity-50 transition-all duration-300
                           hover:scale-[1.02] active:scale-[0.98] animate-pulse-glow btn-glow"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    Start Exploring <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <button
                onClick={goBack}
                className="w-full text-text-secondary hover:text-white text-sm transition-colors py-2"
              >
                Go back and edit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation (hidden on welcome and summary steps) */}
      {step > 0 && step < 8 && (
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex items-center justify-between">
            {/* Skip option for optional steps */}
            {(step === 6 || step === 7) ? (
              <button
                onClick={goNext}
                className="text-text-secondary hover:text-white transition-colors text-sm"
              >
                Skip
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-medium
                         hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] btn-glow"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Summary Row ───────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 bg-surface/50 rounded-lg p-3 border border-border/50">
      <span className="text-text-secondary text-sm font-medium min-w-[70px]">{label}</span>
      <span className="text-white text-sm flex-1">{value}</span>
    </div>
  )
}
