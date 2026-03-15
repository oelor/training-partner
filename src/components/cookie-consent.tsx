'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'tp_cookie_consent'
const COOKIE_NAME = 'tp_consent'

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      setVisible(true)
      // Trigger slide-up animation after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateIn(true)
        })
      })
    }
  }, [])

  const handleConsent = (choice: 'all' | 'essential') => {
    localStorage.setItem(STORAGE_KEY, choice)
    setCookie(COOKIE_NAME, choice, 365)
    setAnimateIn(false)
    // Wait for slide-down animation before hiding
    setTimeout(() => setVisible(false), 300)
  }

  if (!visible) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        animateIn ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-zinc-900 border-t border-zinc-700 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 text-sm text-white/90">
            <p>
              We use cookies to provide essential site functionality and improve your experience.
              By clicking &ldquo;Accept All,&rdquo; you consent to analytics and preference cookies.
              See our{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{' '}
              for details.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleConsent('essential')}
              className="px-4 py-2 text-sm font-medium text-white/80 border border-zinc-600 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={() => handleConsent('all')}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
