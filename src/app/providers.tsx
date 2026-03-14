'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { AuthProvider } from '@/lib/auth-context'
import { ToastProvider } from '@/components/toast'
import FeedbackWidget from '@/components/feedback-widget'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import PageTimeTracker from '@/components/PageTimeTracker'
import PostHogPageView from './PostHogPageView'

function PostHogInit() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
    if (key) {
      posthog.init(key, {
        api_host: host,
        capture_pageview: false,
        autocapture: true,
        session_recording: {
          maskAllInputs: false,
        },
        enable_recording_console_log: true,
      })
    }
  }, [])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY

  const content = (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <FeedbackWidget />
        <PageTimeTracker />
      </ToastProvider>
    </AuthProvider>
  )

  if (!posthogKey) {
    return content
  }

  return (
    <PHProvider client={posthog}>
      <PostHogInit />
      <PostHogPageView />
      {content}
    </PHProvider>
  )
}
