'use client'

import { AuthProvider } from '@/lib/auth-context'
import { ToastProvider } from '@/components/toast'
import FeedbackWidget from '@/components/feedback-widget'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
        <FeedbackWidget />
      </ToastProvider>
    </AuthProvider>
  )
}
