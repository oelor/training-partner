'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  MapPin,
  Target,
  Clock,
  Dumbbell,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'
import { useToast } from '@/components/toast'

const sportsList = [
  'Wrestling', 'MMA', 'BJJ', 'Boxing',
  'Kickboxing', 'Judo', 'Muay Thai', 'Karate', 'Sambo',
  'Taekwondo', 'Capoeira',
]
const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Pro']
const weightClasses = [
  'Flyweight (≤126 lbs)',
  'Bantamweight (126–132 lbs)',
  'Featherweight (132–145 lbs)',
  'Lightweight (145–155 lbs)',
  'Welterweight (155–170 lbs)',
  'Middleweight (170–185 lbs)',
  'Light Heavyweight (185–205 lbs)',
  'Heavyweight (205–265 lbs)',
  'Super Heavyweight (265+ lbs)',
]
const trainingGoals = ['Competition', 'Fitness', 'Self-defense', 'Technique', 'Sparring', 'Fun']
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const fullDays: Record<string, string> = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }
const timeSlots = ['Morning', 'Afternoon', 'Evening']

const STEPS = [
  { id: 'basics', label: 'Basics', icon: User },
  { id: 'sports', label: 'Sports', icon: Dumbbell },
  { id: 'details', label: 'Details', icon: Target },
  { id: 'schedule', label: 'Schedule', icon: Clock },
] as const

export default function OnboardingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.display_name || '',
    age: '',
    location: user?.city || '',
    sports: [] as string[],
    skillLevel: '',
    weightClass: '',
    trainingGoals: [] as string[],
    experienceYears: '',
    bio: '',
    availability: [] as { day: string; time: string }[],
  })

  const toggleSport = (sport: string) => {
    setProfile((p) => ({
      ...p,
      sports: p.sports.includes(sport) ? p.sports.filter((s) => s !== sport) : [...p.sports, sport],
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

  const canProceed = () => {
    switch (step) {
      case 0: return profile.name.trim().length > 0 && profile.location.trim().length > 0
      case 1: return profile.sports.length > 0
      case 2: return profile.skillLevel !== ''
      case 3: return true // schedule is optional
      default: return true
    }
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      await api.updateProfile({
        display_name: profile.name,
        city: profile.location,
        sports: profile.sports,
        skill_level: profile.skillLevel,
        weight_class: profile.weightClass,
        training_goals: profile.trainingGoals,
        experience_years: profile.experienceYears ? parseInt(profile.experienceYears) : 0,
        bio: profile.bio,
        age: profile.age ? parseInt(profile.age) : 0,
        location: profile.location,
        availability: profile.availability,
      })
      await refreshUser()
      toast.success('Profile complete! Finding your matches...')
      router.push('/app')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const done = i < step
            const active = i === step
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    done
                      ? 'bg-accent text-background'
                      : active
                        ? 'bg-primary text-white'
                        : 'bg-surface border border-border text-text-secondary'
                  }`}
                >
                  {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-sm hidden sm:block ${active ? 'text-white font-medium' : 'text-text-secondary'}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 ${i < step ? 'bg-accent' : 'bg-border'}`} />
                )}
              </div>
            )
          })}
        </div>
        <div className="h-1 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1">
        {/* Step 0: Basics */}
        {step === 0 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-heading text-3xl text-white mb-2">LET&apos;S GET STARTED</h2>
              <p className="text-text-secondary">Tell us the basics so we can find partners near you.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-text-secondary text-sm mb-2">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full bg-surface border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-text-secondary text-sm mb-2">Age</label>
                  <input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    placeholder="Age"
                    className="w-full bg-surface border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-text-secondary text-sm mb-2">Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                      id="location"
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="City, State"
                      className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="bio" className="block text-text-secondary text-sm mb-2">Short Bio</label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell partners about yourself and your training style..."
                  rows={3}
                  className="w-full bg-surface border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Sports */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-heading text-3xl text-white mb-2">YOUR COMBAT SPORTS</h2>
              <p className="text-text-secondary">Select all the disciplines you train. Pick at least one.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sportsList.map((sport) => {
                const selected = profile.sports.includes(sport)
                return (
                  <button
                    key={sport}
                    onClick={() => toggleSport(sport)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selected
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-border bg-surface text-text-secondary hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{sport}</div>
                    {selected && <Check className="w-4 h-4 text-primary mt-1" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-heading text-3xl text-white mb-2">SKILL & GOALS</h2>
              <p className="text-text-secondary">Help us match you with the right partners.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-text-secondary text-sm mb-3">Skill Level *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {skillLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setProfile({ ...profile, skillLevel: level })}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        profile.skillLevel === level
                          ? 'border-primary bg-primary/10 text-white'
                          : 'border-border bg-surface text-text-secondary hover:border-primary/50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="weightClass" className="block text-text-secondary text-sm mb-2">Weight Class</label>
                <select
                  id="weightClass"
                  value={profile.weightClass}
                  onChange={(e) => setProfile({ ...profile, weightClass: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg py-3 px-4 text-white focus:border-primary transition-colors"
                >
                  <option value="">Select weight class (optional)</option>
                  {weightClasses.map((wc) => (
                    <option key={wc} value={wc}>{wc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="experience" className="block text-text-secondary text-sm mb-2">Years of Experience</label>
                <input
                  id="experience"
                  type="number"
                  value={profile.experienceYears}
                  onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                  placeholder="How many years?"
                  className="w-full bg-surface border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-3">Training Goals</label>
                <div className="flex flex-wrap gap-3">
                  {trainingGoals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`px-4 py-2 rounded-full border-2 transition-all ${
                        profile.trainingGoals.includes(goal)
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-text-secondary hover:border-accent/50'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-heading text-3xl text-white mb-2">WHEN DO YOU TRAIN?</h2>
              <p className="text-text-secondary">
                Tap the time slots when you&apos;re available. This helps us match you with partners who share your schedule.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 sm:p-6">
              {/* Header row */}
              <div className="grid grid-cols-[60px_1fr_1fr_1fr] gap-2 mb-3">
                <div />
                {timeSlots.map((t) => (
                  <div key={t} className="text-center text-text-secondary text-xs font-medium">{t}</div>
                ))}
              </div>
              {/* Day rows */}
              {days.map((day) => (
                <div key={day} className="grid grid-cols-[60px_1fr_1fr_1fr] gap-2 mb-2">
                  <div className="text-text-secondary text-sm flex items-center">{day}</div>
                  {timeSlots.map((time) => {
                    const full = fullDays[day] || day
                    const sel = profile.availability.some((a) => a.day === full && a.time === time)
                    return (
                      <button
                        key={time}
                        onClick={() => toggleAvail(day, time)}
                        className={`h-10 rounded-lg transition-all ${
                          sel ? 'bg-primary text-white' : 'bg-background border border-border hover:border-primary/50'
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
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
        ) : (
          <button
            onClick={() => router.push('/app')}
            className="text-text-secondary hover:text-white transition-colors text-sm"
          >
            Skip for now
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={saving}
            className="flex items-center gap-2 bg-accent text-background px-8 py-3 rounded-lg font-bold hover:bg-accent/90 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                Find My Partners <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
