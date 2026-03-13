'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { User, MapPin, Target, Clock, Save, Check, Loader2, Camera, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'
import { useToast } from '@/components/toast'
import { ProfileSkeleton } from '@/components/skeleton'

function AvatarUpload({ currentUrl, userName, onUploaded }: { currentUrl?: string; userName?: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const toast = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // 100KB limit for base64 storage in D1
    if (file.size > 100 * 1024) {
      toast.error('Image must be under 100KB. Try a smaller or more compressed image.')
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      setPreview(dataUrl)
      setUploading(true)
      try {
        const res = await api.uploadAvatar(dataUrl)
        onUploaded(res.avatar_url)
        toast.success('Avatar updated!')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        toast.error(msg)
        setPreview(null)
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const displayUrl = preview || currentUrl
  const initial = userName?.charAt(0)?.toUpperCase() || '?'

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
          {displayUrl ? (
            <img src={displayUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary">{initial}</span>
          )}
        </div>
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      <div className="text-sm text-text-secondary">
        <p>Click to upload avatar</p>
        <p className="text-xs">Max 100KB · JPG, PNG, WebP</p>
      </div>
    </div>
  )
}

const sportsList = [
  'Wrestling', 'MMA', 'BJJ', 'Boxing',
  'Kickboxing', 'Judo', 'Muay Thai', 'Karate', 'Sambo'
]
const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Pro']
const weightClasses = [
  'Flyweight (126 lbs)', 'Bantamweight (126-132 lbs)', 'Featherweight (132-145 lbs)',
  'Lightweight (145-155 lbs)', 'Welterweight (155-170 lbs)', 'Middleweight (170-185 lbs)',
  'Light Heavyweight (185-205 lbs)', 'Heavyweight (205-265 lbs)', 'Super Heavyweight (265+ lbs)'
]
const trainingGoals = ['Competition', 'Fitness', 'Self-defense', 'Technique', 'Sparring']
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const times = ['Morning (6am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-10pm)']

function ProfileForm() {
  const searchParams = useSearchParams()
  const isNew = searchParams.get('new') === 'true'
  const { user, profile: authProfile, refreshUser } = useAuth()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    location: '',
    sports: [] as string[],
    skillLevel: '',
    weightClass: '',
    trainingGoals: [] as string[],
    experienceYears: '',
    bio: '',
    availability: [] as { day: string; time: string }[]
  })

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.display_name || '',
        location: user.city || '',
      }))
    }
    if (authProfile) {
      setProfile(prev => ({
        ...prev,
        sports: authProfile.sports || [],
        skillLevel: authProfile.skill_level || '',
        weightClass: authProfile.weight_class || '',
        trainingGoals: authProfile.training_goals || [],
        experienceYears: authProfile.experience_years ? String(authProfile.experience_years) : '',
        bio: authProfile.bio || '',
        age: authProfile.age ? String(authProfile.age) : '',
        location: authProfile.location || user?.city || '',
        availability: authProfile.availability || [],
      }))
    }
    setLoading(false)
  }, [user, authProfile])

  const handleSave = async () => {
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
      toast.success('Profile saved successfully!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const toggleSport = (sport: string) => {
    setProfile(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }))
  }

  const toggleGoal = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      trainingGoals: prev.trainingGoals.includes(goal)
        ? prev.trainingGoals.filter(g => g !== goal)
        : [...prev.trainingGoals, goal]
    }))
  }

  const toggleAvailability = (day: string, time: string) => {
    setProfile(prev => {
      const exists = prev.availability.some(a => a.day === day && a.time === time)
      if (exists) {
        return { ...prev, availability: prev.availability.filter(a => !(a.day === day && a.time === time)) }
      }
      return { ...prev, availability: [...prev.availability, { day, time }] }
    })
  }

  if (loading) return <ProfileSkeleton />

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl text-white mb-2">YOUR PROFILE</h1>
          <p className="text-text-secondary">Complete your profile to get better matches</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {isNew && (
        <div className="bg-accent/20 border border-accent/50 text-accent px-4 py-3 rounded-lg">
          Welcome! Complete your profile to find the perfect training partners.
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-heading text-xl text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          BASIC INFO
        </h2>

        <div className="mb-6">
          <AvatarUpload
            currentUrl={user?.avatar_url}
            userName={user?.display_name}
            onUploaded={() => refreshUser()}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-text-secondary text-sm mb-2">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              placeholder="Your full name"
              className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-background border border-border rounded-lg py-3 px-4 text-text-secondary cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">Age</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({...profile, age: e.target.value})}
              placeholder="Your age"
              className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                placeholder="City, State"
                className="w-full bg-background border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sports */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-heading text-xl text-white mb-6">COMBAT SPORTS</h2>
        <div className="flex flex-wrap gap-3">
          {sportsList.map(sport => (
            <button
              key={sport}
              onClick={() => toggleSport(sport)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                profile.sports.includes(sport)
                  ? 'bg-primary border-primary text-white'
                  : 'border-border text-text-secondary hover:border-primary hover:text-white'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Level & Weight Class */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-heading text-xl text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          SKILL DETAILS
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-text-secondary text-sm mb-2">Skill Level</label>
            <select
              value={profile.skillLevel}
              onChange={(e) => setProfile({...profile, skillLevel: e.target.value})}
              className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white focus:border-primary transition-colors"
            >
              <option value="">Select your skill level</option>
              {skillLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">Weight Class</label>
            <select
              value={profile.weightClass}
              onChange={(e) => setProfile({...profile, weightClass: e.target.value})}
              className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white focus:border-primary transition-colors"
            >
              <option value="">Select your weight class</option>
              {weightClasses.map(wc => (
                <option key={wc} value={wc}>{wc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">Years of Experience</label>
            <input
              type="number"
              value={profile.experienceYears}
              onChange={(e) => setProfile({...profile, experienceYears: e.target.value})}
              placeholder="Years training"
              className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Training Goals */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-heading text-xl text-white mb-6">TRAINING GOALS</h2>
        <div className="flex flex-wrap gap-3">
          {trainingGoals.map(goal => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                profile.trainingGoals.includes(goal)
                  ? 'bg-accent border-accent text-background'
                  : 'border-border text-text-secondary hover:border-accent hover:text-white'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-heading text-xl text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          AVAILABILITY
        </h2>

        <div className="space-y-3">
          {days.map(day => (
            <div key={day} className="flex flex-wrap items-center gap-3">
              <div className="w-24 text-text-secondary text-sm">{day}</div>
              <div className="flex gap-2">
                {times.map(time => {
                  const isSelected = profile.availability.some(a => a.day === day && a.time === time)
                  return (
                    <button
                      key={time}
                      onClick={() => toggleAvailability(day, time)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-background border border-border text-text-secondary hover:border-primary'
                      }`}
                    >
                      {time.split(' ')[0]}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-heading text-xl text-white mb-6">ABOUT YOU</h2>
        <textarea
          value={profile.bio}
          onChange={(e) => setProfile({...profile, bio: e.target.value})}
          placeholder="Tell potential partners about yourself, your style, what you're looking for in a training partner..."
          rows={4}
          className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors resize-none"
        />
      </div>

      {/* Save Button (bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileForm />
    </Suspense>
  )
}
