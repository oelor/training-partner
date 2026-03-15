'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, CalendarDays, Info } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'
import Turnstile from '@/components/turnstile'
import GoogleSignIn from '@/components/google-signin'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export default function SignUpPage() {
  const router = useRouter()
  const { register, googleLogin } = useAuth()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    sport: '',
    date_of_birth: '',
    agreeToTerms: false
  })
  const [dobNotice, setDobNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions')
      return
    }
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth)
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const monthDiff = today.getMonth() - dob.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--
      }
      if (age < 13) {
        setError('You must be at least 13 years old to use Training Partner')
        return
      }
    }
    setLoading(true)
    setError('')

    try {
      await register(formData.name, formData.email, formData.password, formData.sport, turnstileToken || undefined, formData.date_of_birth || undefined)
      toast.success('Account created! Welcome to Training Partner.')
      router.push('/onboarding')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const sports = [
    'Wrestling', 'MMA', 'BJJ', 'Boxing',
    'Kickboxing', 'Judo', 'Muay Thai', 'Karate', 'Other'
  ]

  const updateDobNotice = (val: string) => {
    setDobNotice('')
    if (!val || val.startsWith('0000')) return
    const dob = new Date(val + 'T00:00:00')
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    if (age >= 13 && age < 18) {
      setDobNotice('Users under 18 require parental consent. Some features will be restricted.')
    }
  }

  return (
    <div className="min-h-screen bg-background bg-pattern flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,77,0,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0,255,136,0.2) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/95 to-background" />
      </div>
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8 transition-colors animate-fade-in">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-2 mb-8 animate-fade-in" style={{ animationDelay: '0ms' }}>
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <span className="font-heading text-2xl text-white">TRAINING PARTNER</span>
        </div>

        <div className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h1 className="font-heading text-4xl text-white mb-2">CREATE <span className="gradient-text">ACCOUNT</span></h1>
          <p className="text-text-secondary">Create your free account and find training partners</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div>
            <label htmlFor="fullName" className="block text-text-secondary text-sm mb-2">Full Name</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                id="fullName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-text-secondary text-sm mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="you@example.com"
                className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-text-secondary text-sm mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Min 8 chars, upper + lower + number"
                className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-12 text-white placeholder-text-secondary focus:border-primary transition-colors"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="sport" className="block text-text-secondary text-sm mb-2">Primary Sport</label>
            <select
              id="sport"
              value={formData.sport}
              onChange={(e) => setFormData({...formData, sport: e.target.value})}
              className="w-full bg-surface border border-border rounded-lg py-3 px-4 text-white focus:border-primary transition-colors"
              required
            >
              <option value="">Select your primary sport</option>
              {sports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">Date of Birth</label>
            <div className="grid grid-cols-3 gap-2">
              <select
                aria-label="Month"
                value={formData.date_of_birth ? new Date(formData.date_of_birth + 'T00:00:00').getMonth() + 1 : ''}
                onChange={(e) => {
                  const month = e.target.value
                  if (!month) { setFormData({ ...formData, date_of_birth: '' }); setDobNotice(''); return }
                  const parts = formData.date_of_birth ? formData.date_of_birth.split('-') : ['', '', '']
                  const y = parts[0] || ''
                  const d = parts[2] || ''
                  const m = month.padStart(2, '0')
                  if (y && d) {
                    const val = `${y}-${m}-${d}`
                    setFormData({ ...formData, date_of_birth: val })
                    updateDobNotice(val)
                  } else {
                    setFormData({ ...formData, date_of_birth: `${y || '0000'}-${m}-${d || '01'}` })
                    setDobNotice('')
                  }
                }}
                className="bg-surface border border-border rounded-lg py-3 px-3 text-white focus:border-primary transition-colors"
                required
              >
                <option value="">Month</option>
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                aria-label="Day"
                value={formData.date_of_birth ? parseInt(formData.date_of_birth.split('-')[2] || '') || '' : ''}
                onChange={(e) => {
                  const day = e.target.value
                  if (!day) { return }
                  const parts = formData.date_of_birth ? formData.date_of_birth.split('-') : ['', '', '']
                  const y = parts[0] || '0000'
                  const m = parts[1] || '01'
                  const d = day.padStart(2, '0')
                  const val = `${y}-${m}-${d}`
                  setFormData({ ...formData, date_of_birth: val })
                  if (y !== '0000') updateDobNotice(val)
                }}
                className="bg-surface border border-border rounded-lg py-3 px-3 text-white focus:border-primary transition-colors"
                required
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                aria-label="Year"
                value={formData.date_of_birth ? parseInt(formData.date_of_birth.split('-')[0] || '') || '' : ''}
                onChange={(e) => {
                  const year = e.target.value
                  if (!year) { return }
                  const parts = formData.date_of_birth ? formData.date_of_birth.split('-') : ['', '', '']
                  const m = parts[1] || '01'
                  const d = parts[2] || '01'
                  const val = `${year}-${m}-${d}`
                  setFormData({ ...formData, date_of_birth: val })
                  updateDobNotice(val)
                }}
                className="bg-surface border border-border rounded-lg py-3 px-3 text-white focus:border-primary transition-colors"
                required
              >
                <option value="">Year</option>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            {dobNotice && (
              <div className="flex items-center gap-2 mt-2 text-yellow-400 text-sm">
                <Info className="w-4 h-4 flex-shrink-0" />
                {dobNotice}
              </div>
            )}
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
              className="mt-1 w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary"
            />
            <label htmlFor="terms" className="text-text-secondary text-sm">
              I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </label>
          </div>

          {TURNSTILE_SITE_KEY && (
            <Turnstile
              siteKey={TURNSTILE_SITE_KEY}
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken('')}
              theme="dark"
            />
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-lg font-heading text-lg hover:bg-primary/90 transition-all disabled:opacity-50 btn-glow flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        {/* Google OAuth: hidden until NEXT_PUBLIC_GOOGLE_CLIENT_ID is configured */}
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-text-secondary text-sm">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <GoogleSignIn
              onCredential={async (credential) => {
                setLoading(true)
                setError('')
                try {
                  const result = await googleLogin(credential)
                  toast.success(result.isNewUser ? 'Account created!' : 'Welcome back!')
                  router.push(result.isNewUser ? '/onboarding' : '/app')
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : 'Google sign-up failed'
                  setError(message)
                  toast.error(message)
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
            />
          </>
        )}

        <p className="text-center text-text-secondary mt-8">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
