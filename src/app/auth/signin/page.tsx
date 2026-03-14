'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'
import GoogleSignIn from '@/components/google-signin'

export default function SignInPage() {
  const router = useRouter()
  const { login, googleLogin } = useAuth()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password)
      toast.success('Welcome back!')
      router.push('/app')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background bg-pattern flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,77,0,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0,255,136,0.2) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/95 to-background" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <span className="font-heading text-2xl text-white">TRAINING PARTNER</span>
        </div>

        <div className="mb-8">
          <h1 className="font-heading text-4xl text-white mb-2">WELCOME BACK</h1>
          <p className="text-text-secondary">Sign in to continue training</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Your password"
                className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-12 text-white placeholder-text-secondary focus:border-primary transition-colors"
                required
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

          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-sm text-text-secondary hover:text-primary transition-colors">
              Forgot password?
            </Link>
          </div>

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
            {loading ? 'Signing In...' : 'SIGN IN'}
          </button>
        </form>

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
              toast.success('Welcome!')
              router.push(result.isNewUser ? '/app/onboarding' : '/app')
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Google sign-in failed'
              setError(message)
              toast.error(message)
            } finally {
              setLoading(false)
            }
          }}
          disabled={loading}
        />

        <p className="text-center text-text-secondary mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign Up Free
          </Link>
        </p>
      </div>
    </div>
  )
}
