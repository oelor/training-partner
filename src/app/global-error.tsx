'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#0D0D0D', color: '#FFFFFF', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <div style={{
              width: '4rem', height: '4rem', borderRadius: '50%',
              backgroundColor: '#1F1F1F', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
            }}>
              <AlertTriangle style={{ width: '2rem', height: '2rem', color: '#FF4D00' }} />
            </div>

            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.25rem', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              CRITICAL ERROR
            </h1>

            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>
              Something went seriously wrong. Please try refreshing the page.
            </p>

            <button
              onClick={reset}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem', borderRadius: '0.5rem',
                backgroundColor: '#FF4D00', color: 'white', border: 'none',
                fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
              }}
            >
              <RefreshCw style={{ width: '1rem', height: '1rem' }} />
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
