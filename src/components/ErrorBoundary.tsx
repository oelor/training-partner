'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { trackError } from '@/lib/analytics'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary that catches React render crashes and:
 * 1. Sends the error to PostHog analytics (if loaded)
 * 2. Shows a user-friendly fallback instead of a white screen
 * 3. Offers a retry button to recover
 *
 * Wrap around feature sections so one crash doesn't take down the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Send to PostHog for analysis
    trackError(error.message, {
      component: errorInfo.componentStack?.split('\n')[1]?.trim() || 'unknown',
      action: 'render_crash',
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    })

    // Also log to console for dev
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md">
            <div className="text-3xl mb-3">😵</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Something went wrong
            </h3>
            <p className="text-zinc-400 text-sm mb-4">
              This section hit an error. Your data is safe — try refreshing or
              tap the button below.
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
