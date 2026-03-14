'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, ArrowLeft, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { BlockedUser } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'

export default function BlockedUsersPage() {
  useAuth()
  const toast = useToast()

  const [blocks, setBlocks] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [unblocking, setUnblocking] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const res = await api.getBlocks()
        setBlocks(res.blocks)
      } catch {
        toast.error('Failed to load blocked users')
      } finally {
        setLoading(false)
      }
    }
    fetchBlocks()
  }, [toast])

  const handleUnblock = async (userId: number, name: string) => {
    if (!confirm(`Unblock ${name}?`)) return
    setUnblocking(prev => ({ ...prev, [userId]: true }))
    try {
      await api.unblockUser(userId)
      setBlocks(prev => prev.filter(b => b.user_id !== userId))
      toast.success(`${name} has been unblocked`)
    } catch {
      toast.error('Failed to unblock user')
    } finally {
      setUnblocking(prev => ({ ...prev, [userId]: false }))
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/app/settings"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          BLOCKED USERS
        </h1>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : blocks.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <Shield className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">You haven&apos;t blocked anyone</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl divide-y divide-border">
          {blocks.map(block => (
            <div key={block.id} className="flex items-center gap-4 p-4">
              {/* Avatar */}
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {block.name?.charAt(0)?.toUpperCase() || '?'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{block.name}</p>
                <p className="text-xs text-text-secondary">Blocked {formatDate(block.created_at)}</p>
              </div>

              {/* Unblock Button */}
              <button
                onClick={() => handleUnblock(block.user_id, block.name)}
                disabled={unblocking[block.user_id]}
                className="px-4 py-1.5 text-sm text-red-400 hover:bg-red-400/10 border border-red-400/30 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {unblocking[block.user_id] && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
