'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simulate sign in
    setTimeout(() => {
      const storedUser = localStorage.getItem('trainingPartnerUser')
      if (storedUser) {
        setLoading(false)
        router.push('/app')
      } else {
        // For demo, create a demo user
        const demoUser = {
          id: 'demo-1',
          name: 'Demo User',
          email: formData.email,
          sport: 'MMA',
          createdAt: new Date().toISOString()
        }
        localStorage.setItem('trainingPartnerUser', JSON.stringify(demoUser))
        setLoading(false)
        router.push('/app')
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background bg-pattern flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <span className="font-heading text-2xl text-white">TRAINING PARTNER</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl text-white mb-2">WELCOME BACK</h1>
          <p className="text-text-secondary">Sign in to continue training</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-text-secondary text-sm mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="you@example.com"
                className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-text-secondary text-sm mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
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

          {/* Forgot Password */}
          <div className="text-right">
            <Link href="/auth/forgot-password" className="text-primary text-sm hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-lg font-heading text-lg hover:bg-primary/90 transition-all disabled:opacity-50 btn-glow"
          >
            {loading ? 'Signing In...' : 'SIGN IN'}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-text-secondary mt-8">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign Up Free
          </Link>
        </p>
      </div>
    </div>
  )
}
