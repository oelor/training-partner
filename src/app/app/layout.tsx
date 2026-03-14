'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Home,
  Users,
  MessageCircle,
  MapPin,
  User,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Crown,
  Trophy,
  Building2,
  Dumbbell,
  Medal,
  CalendarDays,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'

const navItems = [
  { href: '/app', icon: Home, label: 'Dashboard' },
  { href: '/app/partners', icon: Users, label: 'Partners' },
  { href: '/app/messages', icon: MessageCircle, label: 'Messages', badge: true },
  { href: '/app/gyms', icon: MapPin, label: 'Gyms' },
  { href: '/app/profile', icon: User, label: 'Profile' },
]

const secondaryNav = [
  { href: '/app/training-log', icon: Dumbbell, label: 'Training Log' },
  { href: '/app/leaderboard', icon: Medal, label: 'Leaderboard' },
  { href: '/app/events', icon: CalendarDays, label: 'Events' },
  { href: '/app/passport', icon: Trophy, label: 'Passport' },
  { href: '/app/bookings', icon: Crown, label: 'Bookings' },
  { href: '/app/community', icon: Users, label: 'Community' },
  { href: '/app/notifications', icon: Bell, label: 'Notifications' },
  { href: '/app/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Poll for unread messages
  useEffect(() => {
    if (!user) return
    const fetchUnread = () => {
      api.getUnreadCount().then(d => setUnreadCount(d.unread || 0)).catch(() => {})
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000) // every 30s
    return () => clearInterval(interval)
  }, [user])

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

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app'
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border h-14 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-text-secondary hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/app" className="ml-2 font-heading text-xl text-white tracking-wider">
          TRAINING PARTNER
        </Link>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-full w-64 bg-surface border-r border-border
        transform transition-transform duration-200
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border">
            <Link href="/app" className="font-heading text-2xl text-white tracking-wider">
              TRAINING<span className="text-primary">PARTNER</span>
            </Link>
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navItems.map(({ href, icon: Icon, label, badge }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Icon className="w-5 h-5" />
                  {badge && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {label}
                {badge && unreadCount > 0 && (
                  <span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}

            {user.role === 'gym_owner' && (
              <Link
                href="/app/gym-dashboard"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/app/gym-dashboard')
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="w-5 h-5 flex-shrink-0" />
                Gym Dashboard
              </Link>
            )}

            <div className="pt-4 pb-2 px-3">
              <span className="text-xs text-text-secondary uppercase tracking-wider">More</span>
            </div>

            {secondaryNav.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                {user.display_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{user.display_name}</p>
                <p className="text-xs text-text-secondary truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ href, icon: Icon, label, badge }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-0 ${
                isActive(href) ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '!' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] truncate">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
