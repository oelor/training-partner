'use client'

import { useEffect, useCallback, useRef } from 'react'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

interface GoogleSignInProps {
  onCredential: (credential: string) => void
  disabled?: boolean
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void
          prompt: () => void
        }
      }
    }
  }
}

export default function GoogleSignIn({ onCredential, disabled }: GoogleSignInProps) {
  const btnRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  const handleCredentialResponse = useCallback((response: { credential: string }) => {
    if (response.credential) {
      onCredential(response.credential)
    }
  }, [onCredential])

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || initialized.current) return

    const initGoogle = () => {
      if (!window.google?.accounts?.id || !btnRef.current) return
      initialized.current = true

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
      })

      window.google.accounts.id.renderButton(btnRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: '100%',
      })
    }

    // If script already loaded
    if (window.google?.accounts?.id) {
      initGoogle()
      return
    }

    // Load Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initGoogle
    document.head.appendChild(script)

    return () => {
      // Cleanup not strictly needed as script persists
    }
  }, [handleCredentialResponse])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
      <div ref={btnRef} className="flex justify-center" />
    </div>
  )
}
