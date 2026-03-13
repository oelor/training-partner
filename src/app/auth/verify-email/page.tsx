'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Users } from 'lucide-react'
import api from '@/lib/api'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background bg-pattern flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg('No verification token provided.')
      return
    }

    const verify = async () => {
      try {
        await api.verifyEmail(token)
        setStatus('success')
      } catch (err: unknown) {
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : 'Verification failed')
      }
    }

    verify()
  }, [token])

  return (
    <div className="min-h-screen bg-background bg-pattern flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <span className="font-heading text-2xl text-white">TRAINING PARTNER</span>
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
            <h1 className="font-heading text-3xl text-white mb-3">VERIFYING EMAIL...</h1>
            <p className="text-text-secondary">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-heading text-3xl text-white mb-3">EMAIL VERIFIED!</h1>
            <p className="text-text-secondary mb-8">
              Your email has been verified. You can now access all features.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="font-heading text-3xl text-white mb-3">VERIFICATION FAILED</h1>
            <p className="text-text-secondary mb-8">
              {errorMsg || 'The verification link is invalid or has already been used.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center gap-2 bg-surface border border-border text-white px-6 py-3 rounded-lg font-medium hover:bg-surface/80 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/app/settings"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Resend Verification
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
