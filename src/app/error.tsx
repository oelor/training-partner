'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background bg-pattern flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="font-heading text-6xl text-primary mb-4">OOPS</div>
        <h1 className="font-heading text-3xl text-white mb-3">SOMETHING WENT WRONG</h1>
        <p className="text-text-secondary mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
