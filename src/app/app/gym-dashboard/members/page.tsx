'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Clock,
  Shield,
  UserPlus,
  Check,
  X,
  Loader2,
  ChevronDown,
  Trash2,
  Send,
  UserCheck,
  Mail,
} from 'lucide-react'
import api, { GymMember } from '@/lib/api'
import { useToast } from '@/components/toast'
import { useAuth } from '@/lib/auth-context'

type Tab = 'members' | 'pending' | 'staff'

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-primary/20 text-primary',
  staff: 'bg-blue-500/20 text-blue-400',
  member: 'bg-accent/20 text-accent',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function Avatar({ name, url }: { name: string; url?: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
    )
  }
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return (
    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

function RoleDropdown({
  currentRole,
  memberId,
  onRoleChange,
}: {
  currentRole: string
  memberId: number
  onRoleChange: (memberId: number, role: 'member' | 'admin' | 'staff') => void
}) {
  const [open, setOpen] = useState(false)
  const roles: Array<'member' | 'staff' | 'admin'> = ['member', 'staff', 'admin']

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border border-border text-sm text-text-secondary hover:text-white hover:border-primary/50 transition-colors"
      >
        <span className="capitalize">{currentRole}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-surface border border-border rounded-lg shadow-xl overflow-hidden min-w-[120px]">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => {
                  onRoleChange(memberId, role)
                  setOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm capitalize hover:bg-white/5 transition-colors ${
                  role === currentRole ? 'text-primary' : 'text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function GymMembersPage() {
  const { user } = useAuth()
  const toast = useToast()

  const [tab, setTab] = useState<Tab>('members')
  const [gymId, setGymId] = useState<number | null>(null)
  const [members, setMembers] = useState<GymMember[]>([])
  const [pendingMembers, setPendingMembers] = useState<GymMember[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<Set<number>>(new Set())
  const [inviteUserId, setInviteUserId] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'staff' | 'admin'>('member')
  const [inviting, setInviting] = useState(false)

  const addActionLoading = (id: number) =>
    setActionLoading((prev) => new Set(prev).add(id))
  const removeActionLoading = (id: number) =>
    setActionLoading((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const dashRes = await api.getGymDashboardStats()
      const gid = dashRes.gym.id
      setGymId(gid)

      const [approvedRes, pendingRes] = await Promise.all([
        api.getGymMembers(gid, 'approved'),
        api.getGymMembers(gid, 'pending'),
      ])

      setMembers(approvedRes.members)
      setPendingMembers(pendingRes.members)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.error('Failed to load members:', e)
      toast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleApprove = async (membershipId: number) => {
    addActionLoading(membershipId)
    try {
      await api.respondGymMembership(membershipId, 'approve')
      toast.success('Member approved')
      await fetchData()
    } catch {
      toast.error('Failed to approve member')
    } finally {
      removeActionLoading(membershipId)
    }
  }

  const handleReject = async (membershipId: number) => {
    addActionLoading(membershipId)
    try {
      await api.respondGymMembership(membershipId, 'reject')
      toast.success('Request rejected')
      await fetchData()
    } catch {
      toast.error('Failed to reject request')
    } finally {
      removeActionLoading(membershipId)
    }
  }

  const handleRemove = async (membershipId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return
    addActionLoading(membershipId)
    try {
      await api.removeGymMember(membershipId)
      toast.success('Member removed')
      await fetchData()
    } catch {
      toast.error('Failed to remove member')
    } finally {
      removeActionLoading(membershipId)
    }
  }

  const handleRoleChange = async (membershipId: number, role: 'member' | 'admin' | 'staff') => {
    addActionLoading(membershipId)
    try {
      await api.updateGymMemberRole(membershipId, role)
      toast.success(`Role updated to ${role}`)
      setMembers((prev) =>
        prev.map((m) => (m.id === membershipId ? { ...m, role } : m))
      )
    } catch {
      toast.error('Failed to update role')
    } finally {
      removeActionLoading(membershipId)
    }
  }

  const handleInvite = async () => {
    if (!gymId) return
    const uid = parseInt(inviteUserId, 10)
    if (isNaN(uid) || uid <= 0) {
      toast.error('Please enter a valid user ID')
      return
    }
    setInviting(true)
    try {
      await api.inviteGymMember(gymId, uid, inviteRole)
      toast.success('Invitation sent')
      setInviteUserId('')
      await fetchData()
    } catch {
      toast.error('Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const approvedMembers = members.filter((m) => m.role === 'member')
  const staffAndAdmins = members.filter((m) => m.role === 'admin' || m.role === 'staff')
  const userRequests = pendingMembers.filter((m) => m.requested_by === 'user')
  const gymInvitations = pendingMembers.filter((m) => m.requested_by === 'gym')

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'members', label: 'Members', icon: <Users className="w-4 h-4" />, count: members.length },
    { key: 'pending', label: 'Pending Requests', icon: <Clock className="w-4 h-4" />, count: pendingMembers.length },
    { key: 'staff', label: 'Staff & Admins', icon: <Shield className="w-4 h-4" />, count: staffAndAdmins.length },
  ]

  const renderMemberCard = (member: GymMember, showActions: boolean) => (
    <div
      key={member.id}
      className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
    >
      <Avatar name={member.display_name} url={member.avatar_url} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body font-semibold text-white truncate">
            {member.display_name}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
              roleBadgeColors[member.role] || roleBadgeColors.member
            }`}
          >
            {member.role}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
          {member.city && <span>{member.city}</span>}
          {member.email && (
            <span className="flex items-center gap-1 truncate">
              <Mail className="w-3 h-3" />
              {member.email}
            </span>
          )}
        </div>
        <div className="text-xs text-text-secondary mt-1">
          Joined {formatDate(member.created_at)}
        </div>
      </div>
      {showActions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <RoleDropdown
            currentRole={member.role}
            memberId={member.id}
            onRoleChange={handleRoleChange}
          />
          <button
            onClick={() => handleRemove(member.id)}
            disabled={actionLoading.has(member.id)}
            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50"
            title="Remove member"
          >
            {actionLoading.has(member.id) ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  )

  const renderPendingCard = (member: GymMember) => (
    <div
      key={member.id}
      className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
    >
      <Avatar name={member.display_name} url={member.avatar_url} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body font-semibold text-white truncate">
            {member.display_name}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              member.requested_by === 'user'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {member.requested_by === 'user' ? 'Requested to join' : 'Invited by gym'}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
          {member.city && <span>{member.city}</span>}
          {member.email && (
            <span className="flex items-center gap-1 truncate">
              <Mail className="w-3 h-3" />
              {member.email}
            </span>
          )}
        </div>
        <div className="text-xs text-text-secondary mt-1">
          Requested {formatDate(member.created_at)}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {member.requested_by === 'user' && (
          <>
            <button
              onClick={() => handleApprove(member.id)}
              disabled={actionLoading.has(member.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
            >
              {actionLoading.has(member.id) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Approve
            </button>
            <button
              onClick={() => handleReject(member.id)}
              disabled={actionLoading.has(member.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </>
        )}
        {member.requested_by === 'gym' && (
          <span className="text-sm text-text-secondary italic flex items-center gap-1">
            <Send className="w-3 h-3" />
            Awaiting response
          </span>
        )}
      </div>
    </div>
  )

  const renderEmptyState = (message: string, icon: React.ReactNode) => (
    <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
      <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="font-body text-sm">{message}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-background px-4 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/app/gym-dashboard"
          className="p-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-white hover:border-primary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-heading text-3xl text-white">Members</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-body font-medium whitespace-nowrap transition-colors flex-1 justify-center ${
              tab === t.key
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`}
          >
            {t.icon}
            {t.label}
            {t.count > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  tab === t.key
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-text-secondary'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {/* Members Tab */}
      {!loading && tab === 'members' && (
        <div className="space-y-3">
          {members.length === 0
            ? renderEmptyState('No members yet', <Users className="w-5 h-5" />)
            : members.map((m) => renderMemberCard(m, true))}
        </div>
      )}

      {/* Pending Tab */}
      {!loading && tab === 'pending' && (
        <div className="space-y-6">
          {pendingMembers.length === 0 ? (
            renderEmptyState('No pending requests', <Clock className="w-5 h-5" />)
          ) : (
            <>
              {userRequests.length > 0 && (
                <div>
                  <h3 className="font-body text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Membership Requests ({userRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {userRequests.map((m) => renderPendingCard(m))}
                  </div>
                </div>
              )}
              {gymInvitations.length > 0 && (
                <div>
                  <h3 className="font-body text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Sent Invitations ({gymInvitations.length})
                  </h3>
                  <div className="space-y-3">
                    {gymInvitations.map((m) => renderPendingCard(m))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Staff & Admins Tab */}
      {!loading && tab === 'staff' && (
        <div className="space-y-3">
          {staffAndAdmins.length === 0
            ? renderEmptyState('No staff or admins', <Shield className="w-5 h-5" />)
            : staffAndAdmins.map((m) => renderMemberCard(m, true))}
        </div>
      )}

      {/* Invite Section */}
      {!loading && (
        <div className="mt-10 bg-surface border border-border rounded-xl p-6">
          <h3 className="font-heading text-xl text-white mb-1 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invite a Member
          </h3>
          <p className="font-body text-sm text-text-secondary mb-4">
            Send an invitation to a user by their ID.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inviteUserId}
              onChange={(e) => setInviteUserId(e.target.value)}
              placeholder="User ID"
              className="flex-1 px-4 py-2.5 rounded-lg bg-background border border-border text-white placeholder:text-text-secondary font-body text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'member' | 'staff' | 'admin')}
              className="px-4 py-2.5 rounded-lg bg-background border border-border text-white font-body text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="member">Member</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteUserId.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-body font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Invite
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
