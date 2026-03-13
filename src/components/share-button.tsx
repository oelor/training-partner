'use client'

import { useState, useEffect, useCallback } from 'react'
import { Share2, Check, Copy, X } from 'lucide-react'

interface ShareButtonProps {
  title: string
  text: string
  url?: string
  className?: string
  variant?: 'icon' | 'button'
}

export default function ShareButton({ title, text, url, className = '', variant = 'icon' }: ShareButtonProps) {
  const [showFallback, setShowFallback] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setShowFallback(false)
  }, [])

  useEffect(() => {
    if (showFallback) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showFallback, handleKeyDown])

  const handleShare = async () => {
    // Use native Web Share API if available (mobile browsers, Safari, Chrome on Android)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl })
        return
      } catch (err) {
        // User cancelled or API failed — fall through to fallback
        if ((err as Error)?.name === 'AbortError') return
      }
    }

    // Fallback: show share options modal
    setShowFallback(true)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareLinks = [
    {
      name: 'X (Twitter)',
      url: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-white/10',
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-500/10',
    },
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
      color: 'hover:bg-green-500/10',
    },
    {
      name: 'Reddit',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
      color: 'hover:bg-orange-500/10',
    },
  ]

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={handleShare}
          className={`text-text-secondary hover:text-primary transition-colors ${className}`}
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={handleShare}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm text-text-secondary hover:text-white hover:border-primary/50 transition-colors ${className}`}
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      )}

      {/* Fallback share modal */}
      {showFallback && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFallback(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Share options"
        >
          <div className="bg-surface border border-border rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Share</h3>
              <button onClick={() => setShowFallback(false)} aria-label="Close share dialog" className="text-text-secondary hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {shareLinks.map(link => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-left px-4 py-3 rounded-xl text-sm text-white transition-colors ${link.color}`}
                  onClick={() => setShowFallback(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>

            <button
              onClick={copyToClipboard}
              aria-label={copied ? 'Link copied' : 'Copy link to clipboard'}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-background border border-border rounded-xl text-sm text-text-secondary hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-accent" />
                  <span className="text-accent">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
