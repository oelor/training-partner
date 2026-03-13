'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Users, Home, User, MapPin, Settings, LogOut, Menu, X,
  MessageCircle, Crown, UserSearch, Bell, Calendar, AlertTriangle, Loader2,
  Shield, Newspaper
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'
import ErrorBoundary from '@/components/error-boundary'

const baseNavItems = [
  { href: '/app', label: 'Dashboard', icon: Home },
  { href: '/app/partners', label: 'Find Partners', icon: UserSearch },
  { href: '/app/gyms', label: 'Partner Gyms', icon: MapPin },
  { href: '/app/messages', label: 'Messages', icon: MessageCircle },
  { href: '/app/community', label: 'Community', icon: Newspaper },
  { href: '/app/bookings', label: 'Bookings', icon: Calendar },
  { href: '/app/notifications', label: 'Notifications', icon: Bell },
  { href: '/app/profile', label: 'Profile', icon: User },
  { href: '/app/settings', label: 'Settings', icon: Settings },
]

const adminNavItem = { href: '/app/admin', label: 'Admin', icon: Shield }

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, logout, subscription } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [resendingVerification, setResendingVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      const fetchUnread = () => {
        api.getUnreadCount().then(data => setUnreadMessages(data.unread)).catch(() => {})
      }
      fetchUnread()
      const interval = setInterval(fetchUnread, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center animate-pulse">
            <Users className="w-7 h-7 text-white" />
          </div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleResendVerification = async () => {
    setResendingVerification(true)
    try {
      await api.resendVerification()
      setVerificationSent(true)
    } catch {
      // silently fail
    } finally {
      setResendingVerification(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} aria-label="Open navigation menu" className="text-white">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-lg text-white">TRAINING PARTNER</span>
        </div>
        <Link href="/app/messages" className="relative text-text-secondary hover:text-white">
          <Bell className="w-5 h-5" />
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </Link>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-surface border-r border-border z-50
        transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <Link href="/app" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="font-heading text-xl text-white">TRAINING PARTNER</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} aria-label="Close navigation menu" className="lg:hidden text-text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                {user.display_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <div className="text-white font-medium truncate">{user.display_name}</div>
                <div className="text-text-secondary text-sm truncate">{user.email}</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {[...baseNavItems, ...((user?.role === 'admin' || user?.role === 'gym_owner') ? [adminNavItem] : [])].map((item) => {
              const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative
                    ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-white hover:bg-background'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.label === 'Messages' && unreadMessages > 0 && (
                    <span className="absolute right-3 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Subscription badge */}
          {subscription?.plan === 'premium' ? (
            <div className="mx-4 mb-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                <Crown className="w-4 h-4" />
                Premium Active
              </div>
            </div>
          ) : (
            <Link href="/app/settings" className="mx-4 mb-3 p-3 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors block">
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Crown className="w-4 h-4" />
                Upgrade to Premium
              </div>
            </Link>
          )}

          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        {/* Email Verification Banner */}
        {user && !user.email_verified && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-6 py-3">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Please verify your email to unlock all features.</span>
              </div>
              {verificationSent ? (
                <span className="text-accent text-sm whitespace-nowrap">Verification email sent!</span>
              ) : (
                <button
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className="text-yellow-400 hover:text-yellow-300 text-sm font-medium whitespace-nowrap flex items-center gap-1"
                >
                  {resendingVerification && <Loader2 className="w-3 h-3 animate-spin" />}
                  Resend Email
                </button>
              )}
            </div>
          </div>
        )}
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
