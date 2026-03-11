'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { User, MapPin, Target, Clock, Save, Check } from 'lucide-react'

const sportsList = [
  'Wrestling', 'MMA', 'Brazilian Jiu-Jitsu', 'Boxing', 
  'Kickboxing', 'Judo', 'Taekwondo', 'Karate', 'Sambo', 'Muay Thai'
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

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const isNew = searchParams.get('new') === 'true'
  
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
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
    const storedUser = localStorage.getItem('trainingPartnerUser')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setProfile(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || '',
        sport: userData.sport || []
      }))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('trainingPartnerUser', JSON.stringify({
      ...profile,
      sports: profile.sports,
      trainingGoals: profile.trainingGoals,
      skillLevel: profile.skillLevel,
      weightClass: profile.weightClass,
      location: profile.location,
      experienceYears: profile.experienceYears,
      availability: profile.availability
    }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
        return {
          ...prev,
          availability: prev.availability.filter(a => !(a.day === day && a.time === time))
        }
      }
      return {
        ...prev,
        availability: [...prev.availability, { day, time }]
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl text-white mb-2">YOUR PROFILE</h1>
          <p className="text-text-secondary">
            Complete your profile to get better matches
          </p>
        </div>
        
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            saved 
              ? 'bg-accent text-background' 
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Saved!' : 'Save Profile'}
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
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              placeholder="you@example.com"
              className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
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
                      {time.replace(' (', '\n(').replace(')', '')}
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
    </div>
  )
}
