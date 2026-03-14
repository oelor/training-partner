'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, CheckCircle, AlertCircle, Loader2, Navigation, Trophy, ArrowRight, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'

type CheckinState = 'loading' | 'invalid' | 'ready' | 'locating' | 'checking_in' | 'success' | 'error' | 'guest_form' | 'guest_success'

interface GymInfo {
  id: number
  name: string
  city: string
  state: string
  lat: number
  lng: number
}

export default function CheckinPage() {
  const params = useParams()
  const code = params.code as string
  const { user, loading: authLoading } = useAuth()

  const [state, setState] = useState<CheckinState>('loading')
  const [gym, setGym] = useState<GymInfo | null>(null)
  const [error, setError] = useState('')
  const [pointsEarned, setPointsEarned] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestSubmitting, setGuestSubmitting] = useState(false)

  // Resolve the check-in code on mount
  useEffect(() => {
    async function resolve() {
      try {
        const data = await api.resolveCheckinCode(code)
        if (data.ok && data.gym) {
          setGym(data.gym)
          setState('ready')
        } else {
          setState('invalid')
        }
      } catch {
        setState('invalid')
      }
    }
    resolve()
  }, [code])

  // Auto-start check-in for logged-in users once gym is resolved
  useEffect(() => {
    if (state === 'ready' && !authLoading && user && gym) {
      startCheckin()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, authLoading, user])

  const startCheckin = useCallback(async () => {
    if (!gym) return
    setState('locating')

    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser')
      setState('error')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setState('checking_in')
        try {
          const res = await api.qrCheckinVerify(code, position.coords.latitude, position.coords.longitude)
          if (res.ok) {
            setPointsEarned(res.points_earned)
            setTotalPoints(res.total_points)
            setState('success')
          } else if (res.error === 'too_far') {
            setError(`You're ${res.distance_m}m away from ${res.gym_name || gym.name}. You need to be closer to check in.${res.address ? `\n\nGym address: ${res.address}` : ''}`)
            setState('error')
          } else if (res.error === 'already_checked_in') {
            setError(`You already checked in at ${res.gym_name || gym.name} recently.`)
            setState('error')
          } else {
            setError(res.error || 'Check-in failed')
            setState('error')
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Check-in failed. Please try again.')
          setState('error')
        }
      },
      (geoError) => {
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError('Location access is required to check in. Please enable location permissions in your browser settings and try again.')
            break
          case geoError.TIMEOUT:
            setError('Getting your location timed out. Please try again.')
            break
          default:
            setError('Could not determine your location. Please try again.')
        }
        setState('error')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [gym, code])

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gym || !guestName.trim() || !guestEmail.trim()) return
    setGuestSubmitting(true)

    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser')
      setState('error')
      setGuestSubmitting(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await api.qrCheckinGuest(code, {
            name: guestName.trim(),
            email: guestEmail.trim(),
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          if (res.ok) {
            setState('guest_success')
          } else if (res.error === 'too_far') {
            setError(`You're ${res.distance_m}m away. You need to be closer to check in.`)
            setState('error')
          } else {
            setError(res.error || 'Check-in failed')
            setState('error')
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Check-in failed')
          setState('error')
        } finally {
          setGuestSubmitting(false)
        }
      },
      () => {
        setError('Location access is required to check in.')
        setState('error')
        setGuestSubmitting(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">TP</span>
            </div>
            <span className="font-heading text-xl text-white">TRAINING PARTNER</span>
          </Link>
        </div>

        {/* Loading */}
        {state === 'loading' && (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Loading check-in...</p>
          </div>
        )}

        {/* Invalid code */}
        {state === 'invalid' && (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="font-heading text-2xl text-white mb-2">INVALID CODE</h1>
            <p className="text-text-secondary mb-6">This check-in code is no longer valid or doesn&apos;t exist.</p>
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium">
              Go to Training Partner <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Ready — not logged in */}
        {state === 'ready' && !authLoading && !user && gym && (
          <div className="bg-surface border border-border rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-heading text-2xl text-white mb-1">CHECK IN AT</h1>
              <h2 className="font-heading text-xl gradient-text">{gym.name}</h2>
              <p className="text-text-secondary text-sm mt-1">{gym.city}, {gym.state}</p>
            </div>

            {/* Sign in option */}
            <Link
              href={`/auth/signin?return=/checkin/${code}`}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mb-3"
            >
              <LogIn className="w-5 h-5" />
              Sign In to Check In &amp; Earn Points
            </Link>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-text-secondary text-xs">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Guest option */}
            <button
              onClick={() => setState('guest_form')}
              className="w-full bg-surface border border-border text-white py-3 rounded-xl font-medium hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Check In as Guest
            </button>
          </div>
        )}

        {/* Guest form */}
        {state === 'guest_form' && gym && (
          <div className="bg-surface border border-border rounded-2xl p-8">
            <div className="text-center mb-6">
              <h1 className="font-heading text-xl text-white mb-1">GUEST CHECK-IN</h1>
              <p className="text-text-secondary text-sm">{gym.name} — {gym.city}, {gym.state}</p>
            </div>

            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div>
                <label htmlFor="guestName" className="block text-text-secondary text-sm mb-1">Your Name</label>
                <input
                  id="guestName"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="guestEmail" className="block text-text-secondary text-sm mb-1">Email</label>
                <input
                  id="guestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={guestSubmitting || !guestName.trim() || !guestEmail.trim()}
                className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {guestSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Checking location...</>
                ) : (
                  <><Navigation className="w-5 h-5" /> Check In</>
                )}
              </button>
            </form>

            <button
              onClick={() => setState('ready')}
              className="w-full text-text-secondary text-sm mt-4 hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Locating */}
        {state === 'locating' && gym && (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <Navigation className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
            <h1 className="font-heading text-xl text-white mb-2">GETTING YOUR LOCATION</h1>
            <p className="text-text-secondary text-sm">Please allow location access when prompted...</p>
          </div>
        )}

        {/* Checking in */}
        {state === 'checking_in' && gym && (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h1 className="font-heading text-xl text-white mb-2">CHECKING IN</h1>
            <p className="text-text-secondary text-sm">Verifying your location at {gym.name}...</p>
          </div>
        )}

        {/* Success */}
        {state === 'success' && gym && (
          <div className="bg-surface border border-accent/30 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h1 className="font-heading text-2xl text-white mb-1">CHECKED IN!</h1>
            <p className="text-text-secondary mb-4">Welcome to {gym.name}</p>

            <div className="bg-background rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-primary font-heading text-2xl">+{pointsEarned} pts</span>
              </div>
              <p className="text-text-secondary text-sm">Total: {totalPoints.toLocaleString()} points</p>
            </div>

            <Link
              href="/app/passport"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <Trophy className="w-5 h-5" />
              View Training Passport
            </Link>
          </div>
        )}

        {/* Guest success */}
        {state === 'guest_success' && gym && (
          <div className="bg-surface border border-accent/30 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h1 className="font-heading text-2xl text-white mb-1">CHECKED IN!</h1>
            <p className="text-text-secondary mb-6">Welcome to {gym.name}</p>

            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4">
              <p className="text-white text-sm font-medium mb-2">Create a free account to:</p>
              <ul className="text-text-secondary text-sm space-y-1 text-left">
                <li>• Earn points and badges with every check-in</li>
                <li>• Track your training passport across gyms</li>
                <li>• Find training partners in your area</li>
              </ul>
            </div>

            <Link
              href={`/auth/signup?return=/checkin/${code}`}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Error */}
        {state === 'error' && gym && (
          <div className="bg-surface border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="font-heading text-xl text-white mb-2">CHECK-IN FAILED</h1>
            <p className="text-text-secondary text-sm whitespace-pre-line mb-6">{error}</p>
            <button
              onClick={() => { setError(''); setState('ready'); }}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-text-secondary text-xs">
            Powered by <Link href="/" className="text-primary hover:underline">Training Partner</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
