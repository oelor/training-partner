'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Loader2, CheckCircle, Users } from 'lucide-react'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      await api.requestPasswordReset(email.trim())
      setSent(true)
    } catch (err: unknown) {
      // Always show success to prevent email enumeration
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background bg-pattern flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center animate-slide-up">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-heading text-3xl text-white mb-3 animate-fade-in">CHECK YOUR EMAIL</h1>
          <p className="text-text-secondary mb-8">
            If an account exists for <span className="text-white">{email}</span>, we&apos;ve sent password reset instructions.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background bg-pattern flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <Link href="/auth/signin" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8 transition-colors animate-fade-in">
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>

        <div className="flex items-center gap-2 mb-8 animate-fade-in" style={{ animationDelay: '0ms' }}>
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <span className="font-heading text-2xl text-white">TRAINING PARTNER</span>
        </div>

        <div className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h1 className="font-heading text-4xl text-white mb-2">FORGOT PASSWORD?</h1>
          <p className="text-text-secondary">
            Enter your email and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div>
            <label htmlFor="email" className="block text-text-secondary text-sm mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 btn-glow flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  )
}
