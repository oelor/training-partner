'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#1F1F1F' }}>
          <AlertTriangle className="w-8 h-8" style={{ color: '#FF4D00' }} />
        </div>

        <h1 className="font-heading text-4xl text-white mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
          SOMETHING WENT WRONG
        </h1>

        <p className="mb-8" style={{ color: '#A0A0A0' }}>
          An unexpected error occurred. This has been logged and we&apos;ll look into it.
        </p>

        {error.digest && (
          <p className="text-xs mb-6 font-mono" style={{ color: '#666' }}>
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: '#FF4D00' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E64400')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF4D00')}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: '#1F1F1F', border: '1px solid #333333' }}
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
