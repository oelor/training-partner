'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Minimal header — just the logo */}
      <header className="relative z-10 flex items-center justify-center py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-xl text-white tracking-wider">
            TRAINING<span className="text-primary">PARTNER</span>
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 pb-12">
        {children}
      </main>
    </div>
  )
}
