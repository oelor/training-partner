'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, BellOff, Check, CheckCheck, MessageCircle, UserPlus, Calendar,
  Star, Trophy, Loader2
} from 'lucide-react'
import api, { Notification } from '@/lib/api'
import { useToast } from '@/components/toast'

const ICON_MAP: Record<string, typeof Bell> = {
  message: MessageCircle,
  match: UserPlus,
  booking: Calendar,
  review: Star,
  achievement: Trophy,
}

function getNotificationIcon(type: string) {
  return ICON_MAP[type] || Bell
}

function getNotificationColor(type: string) {
  switch (type) {
    case 'message': return 'text-blue-400 bg-blue-400/10'
    case 'match': return 'text-accent bg-accent/10'
    case 'booking': return 'text-primary bg-primary/10'
    case 'review': return 'text-yellow-400 bg-yellow-400/10'
    case 'achievement': return 'text-purple-400 bg-purple-400/10'
    default: return 'text-text-secondary bg-background'
  }
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function NotificationsPage() {
  const router = useRouter()
  const toast = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingRead, setMarkingRead] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getNotifications()
        setNotifications(data.notifications || [])
      } catch {
        toast.error('Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAllRead = async () => {
    setMarkingRead(true)
    try {
      await api.markNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark notifications as read')
    } finally {
      setMarkingRead(false)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    const data = notification.data || {}
    switch (notification.type) {
      case 'message':
        if (data.user_id) router.push(`/app/messages?user=${data.user_id}`)
        else router.push('/app/messages')
        break
      case 'match':
        if (data.partner_id) router.push(`/app/partners/${data.partner_id}`)
        else router.push('/app/partners')
        break
      case 'booking':
        router.push('/app/bookings')
        break
      case 'review':
        if (data.gym_id) router.push(`/app/gyms/${data.gym_id}`)
        else router.push('/app/gyms')
        break
      default:
        break
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-white mb-1">NOTIFICATIONS</h1>
          <p className="text-text-secondary">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingRead}
            className="flex items-center gap-2 text-primary text-sm hover:underline disabled:opacity-50"
          >
            {markingRead ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-background rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-background rounded w-3/4" />
                  <div className="h-3 bg-background rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <BellOff className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="font-heading text-xl text-white mb-2">No notifications</h3>
          <p className="text-text-secondary">
            When you get new matches, messages, or booking updates, they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type)
            const colorClass = getNotificationColor(notification.type)

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  bg-surface border rounded-xl p-4 cursor-pointer transition-colors
                  ${notification.read
                    ? 'border-border hover:border-border/80'
                    : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-medium ${notification.read ? 'text-text-secondary' : 'text-white'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-text-secondary text-xs whitespace-nowrap flex-shrink-0">
                        {timeAgo(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm mt-0.5">{notification.body}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
