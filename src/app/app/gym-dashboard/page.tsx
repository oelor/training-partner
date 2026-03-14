'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import api, { Gym, GymDashboardStats, GymOwnerDetail } from '@/lib/api'
import { useToast } from '@/components/toast'
import Link from 'next/link'
import {
  Users,
  Clock,
  Star,
  BadgeCheck,
  Pencil,
  ArrowRight,
  Megaphone,
  Tag,
  FileText,
  Calendar,
  UserPlus,
  MapPin,
  AlertCircle,
  RefreshCw,
  Loader2,
  Building2,
  QrCode,
} from 'lucide-react'
import QrCodeCard from '@/components/qr-code-card'

interface ActivityItem {
  type: 'request' | 'checkin' | 'review'
  label: string
  detail: string
  time: string
}

export default function GymDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const toast = useToast()
  const [gym, setGym] = useState<Gym | null>(null)
  const [gymDetail, setGymDetail] = useState<GymOwnerDetail | null>(null)
  const [stats, setStats] = useState<GymDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkinCode, setCheckinCode] = useState<string | null>(null)
  const [checkinRadius, setCheckinRadius] = useState(200)

  const loadData = async () => {
    setError(null)
    setLoading(true)
    try {
      const [dashData, detailData, codeData] = await Promise.all([
        api.getGymDashboardStats().catch(() => null),
        api.getMyGym().catch(() => null),
        api.getCheckinCode().catch(() => null),
      ])
      if (dashData?.ok) {
        setGym(dashData.gym)
        setStats(dashData.stats)
      }
      if (detailData?.ok) {
        setGymDetail(detailData.gym)
      }
      if (codeData?.ok) {
        setCheckinCode(codeData.checkin_code)
        setCheckinRadius(codeData.checkin_radius_m || 200)
      }
      if (!dashData?.ok && !detailData?.ok) {
        setError('Failed to load gym dashboard data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gym dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (user?.role !== 'gym_owner') {
      setLoading(false)
      return
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.role])

  const handleRetry = () => {
    loadData()
  }

  // Build activity feed from gym detail data
  const buildActivityFeed = (): ActivityItem[] => {
    const items: ActivityItem[] = []

    if (gymDetail?.reviews) {
      gymDetail.reviews.slice(0, 5).forEach((review) => {
        items.push({
          type: 'review',
          label: 'New Review',
          detail: `${review.rating}/5 - "${review.comment?.slice(0, 60) || 'No comment'}${(review.comment?.length || 0) > 60 ? '...' : ''}"`,
          time: review.created_at ? formatRelativeTime(review.created_at) : 'Recently',
        })
      })
    }

    if (gymDetail?.sessions) {
      gymDetail.sessions.slice(0, 5).forEach((session) => {
        items.push({
          type: 'checkin',
          label: 'Session',
          detail: `${session.day} - ${session.start_time} to ${session.end_time}`,
          time: 'Scheduled',
        })
      })
    }

    return items.slice(0, 8)
  }

  // Show non-owner CTA
  if (!authLoading && user && user.role !== 'gym_owner') {
    return (
      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading text-3xl text-white mb-3">REGISTER YOUR GYM</h1>
          <p className="text-text-secondary max-w-md mx-auto mb-8">
            Are you a gym owner? Register your facility on Training Partner to attract new members,
            manage check-ins, post announcements, and grow your community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app/gyms"
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              Register Your Gym <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/app"
              className="text-text-secondary hover:text-white transition-colors text-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const activityFeed = buildActivityFeed()

  const statCards = [
    {
      label: 'Total Members',
      value: stats?.total_members ?? 0,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/20',
    },
    {
      label: 'Pending Requests',
      value: stats?.pending_requests ?? 0,
      icon: UserPlus,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
    },
    {
      label: 'Check-ins (7d)',
      value: stats?.checkins_7d ?? 0,
      icon: Clock,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
    },
    {
      label: 'Avg Rating',
      value: stats?.avg_rating ? stats.avg_rating.toFixed(1) : '0.0',
      icon: Star,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      suffix: stats?.total_reviews ? ` (${stats.total_reviews})` : '',
    },
  ]

  const quickActions = [
    {
      label: 'QR Check-in',
      description: 'View and download your gym QR code',
      icon: QrCode,
      href: '#qr-checkin',
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
      borderColor: 'border-orange-500/50',
    },
    {
      label: 'Manage Members',
      description: 'View and manage gym memberships',
      icon: Users,
      href: '/app/gym-dashboard/members',
      color: 'text-primary',
      bg: 'bg-primary/20',
      borderColor: 'border-primary/50',
    },
    {
      label: 'Promotions',
      description: 'Create and manage special offers',
      icon: Tag,
      href: '/app/gym-dashboard/promotions',
      color: 'text-accent',
      bg: 'bg-accent/20',
      borderColor: 'border-accent/50',
    },
    {
      label: 'Announcements',
      description: 'Post updates for your members',
      icon: Megaphone,
      href: '/app/gym-dashboard/announcements',
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      borderColor: 'border-blue-500/50',
    },
    {
      label: 'Sessions',
      description: 'Manage class schedule and open mats',
      icon: Calendar,
      href: '/app/gym-dashboard/sessions',
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
      borderColor: 'border-purple-500/50',
    },
    {
      label: 'Documents',
      description: 'Waivers, policies, and files',
      icon: FileText,
      href: '/app/gym-dashboard/documents',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/50',
    },
  ]

  const activityIcons = {
    request: { icon: UserPlus, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    checkin: { icon: Clock, color: 'text-green-400', bg: 'bg-green-500/20' },
    review: { icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  }

  return (
    <div className="space-y-8">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium text-sm">Could not load dashboard data</p>
              <p className="text-text-secondary text-xs mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Header Section */}
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-border rounded mb-2" />
          <div className="h-4 w-40 bg-border rounded" />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl lg:text-4xl text-white">
              {gym?.name?.toUpperCase() || 'YOUR GYM'}
            </h1>
            {gym?.verified && (
              <span className="inline-flex items-center gap-1 bg-primary/20 text-primary text-xs px-2 py-1 rounded-lg">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>
          <Link
            href="/app/gym-dashboard/edit"
            className="inline-flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-lg text-sm text-white hover:border-primary transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit Gym Profile
          </Link>
        </div>
      )}

      {gym?.city && (
        <div className="flex items-center gap-1.5 text-text-secondary text-sm -mt-4">
          <MapPin className="w-4 h-4" />
          {gym.city}{gym.state ? `, ${gym.state}` : ''}
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-border rounded-lg" />
                <div className="h-4 w-16 bg-border rounded" />
              </div>
              <div className="h-8 w-12 bg-border rounded mb-1" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <span className="text-text-secondary text-sm">{card.label}</span>
                </div>
                <div className="font-heading text-2xl text-white">
                  {card.value}
                  {card.suffix && (
                    <span className="text-text-secondary text-sm font-body ml-1">{card.suffix}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="font-heading text-2xl text-white mb-4">QUICK ACTIONS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                href={action.href}
                className={`bg-surface border ${action.borderColor} rounded-xl p-5 hover:bg-surface/80 transition-colors group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${action.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-lg text-white group-hover:text-primary transition-colors">
                        {action.label.toUpperCase()}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-text-secondary text-sm mt-1">{action.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* QR Check-in Code */}
      {checkinCode && gym && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QrCodeCard
            checkinCode={checkinCode}
            gymName={gym.name || 'Your Gym'}
            radiusM={checkinRadius}
            onCodeRegenerated={(newCode) => setCheckinCode(newCode)}
          />
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="font-heading text-lg text-white mb-3">HOW IT WORKS</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-0.5">1</span>
                <span className="text-text-secondary">Print or display the QR code at your entrance</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-0.5">2</span>
                <span className="text-text-secondary">Athletes scan with their phone camera</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-0.5">3</span>
                <span className="text-text-secondary">GPS verifies they&apos;re at your gym (within {checkinRadius}m)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-0.5">4</span>
                <span className="text-text-secondary">Members earn points, guests provide contact info</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-text-secondary text-xs">
                Adjust the check-in radius in your{' '}
                <Link href="/app/gym-dashboard/edit" className="text-primary hover:underline">gym settings</Link>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-text-secondary text-xs mb-1">Total Check-ins</div>
            <div className="font-heading text-xl text-white">{stats.total_checkins}</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-text-secondary text-xs mb-1">Total Reviews</div>
            <div className="font-heading text-xl text-white">{stats.total_reviews}</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-text-secondary text-xs mb-1">Active Promotions</div>
            <div className="font-heading text-xl text-white">{stats.active_promotions}</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-text-secondary text-xs mb-1">Announcements</div>
            <div className="font-heading text-xl text-white">{stats.total_announcements}</div>
          </div>
        </div>
      )}

      {/* Recent Activity Feed */}
      <div>
        <h2 className="font-heading text-2xl text-white mb-4">RECENT ACTIVITY</h2>
        {loading ? (
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-border rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-border rounded mb-2" />
                  <div className="h-3 w-48 bg-border rounded" />
                </div>
                <div className="h-3 w-16 bg-border rounded" />
              </div>
            ))}
          </div>
        ) : activityFeed.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-surface/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-text-secondary" />
            </div>
            <p className="text-white font-heading text-lg mb-2">No Recent Activity</p>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              Activity from member requests, check-ins, and reviews will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl divide-y divide-border">
            {activityFeed.map((item, i) => {
              const config = activityIcons[item.type]
              const Icon = config.icon
              return (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{item.label}</p>
                    <p className="text-text-secondary text-xs truncate">{item.detail}</p>
                  </div>
                  <span className="text-text-secondary text-xs flex-shrink-0">{item.time}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  } catch {
    return 'Recently'
  }
}
