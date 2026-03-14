'use client'

import { useEffect, useState } from 'react'
import {
  Users, BarChart3, MessageCircle, AlertTriangle, MapPin,
  Calendar, TrendingUp, Shield, Check, X, ChevronRight,
  Search, Loader2, Eye
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'
import api, { AdminStats, AdminUser, AdminReport, AdminPendingIdentity } from '@/lib/api'

export default function AdminPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [reports, setReports] = useState<AdminReport[]>([])
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'identities'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [allUsers, setAllUsers] = useState<AdminUser[]>([])
  const [userTotal, setUserTotal] = useState(0)
  const [resolvingId, setResolvingId] = useState<number | null>(null)
  const [pendingIdentities, setPendingIdentities] = useState<AdminPendingIdentity[]>([])
  const [identitiesLoading, setIdentitiesLoading] = useState(false)
  const [reviewingId, setReviewingId] = useState<number | null>(null)
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({})
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const isAdmin = user?.role === 'admin' || user?.role === 'gym_owner'

  useEffect(() => {
    if (!isAdmin) return
    const load = async () => {
      try {
        const [statsRes, reportsRes, usersRes] = await Promise.all([
          api.getAdminStats(),
          api.getAdminReports('pending'),
          api.getAdminUsers({ limit: 10 }),
        ])
        setStats(statsRes.stats)
        setReports(reportsRes.reports)
        setRecentUsers(usersRes.users)
        setAllUsers(usersRes.users)
        setUserTotal(usersRes.total)
      } catch {
        // not admin
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isAdmin])

  const loadPendingIdentities = async () => {
    setIdentitiesLoading(true)
    try {
      const res = await api.getAdminPendingIdentities()
      setPendingIdentities(res.verifications)
    } catch { /* */ }
    finally { setIdentitiesLoading(false) }
  }

  useEffect(() => {
    if (activeTab === 'identities' && pendingIdentities.length === 0 && !identitiesLoading) {
      loadPendingIdentities()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const handleIdentityReview = async (id: number, status: 'approved' | 'rejected') => {
    setReviewingId(id)
    try {
      await api.adminReviewIdentity(id, { status, reviewer_notes: reviewNotes[id] || '' })
      setPendingIdentities(pendingIdentities.filter(v => v.id !== id))
      toast.success(`Identity verification ${status}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to review identity')
    } finally {
      setReviewingId(null)
    }
  }

  const handleSearch = async () => {
    try {
      const res = await api.getAdminUsers({ search: searchQuery, limit: 50 })
      setAllUsers(res.users)
      setUserTotal(res.total)
    } catch { /* */ }
  }

  const handleResolve = async (reportId: number, status: string) => {
    setResolvingId(reportId)
    try {
      await api.resolveReport(reportId, status)
      setReports(reports.filter(r => r.id !== reportId))
      if (stats) setStats({ ...stats, pending_reports: stats.pending_reports - 1 })
    } catch { /* */ }
    finally { setResolvingId(null) }
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl text-white">ACCESS DENIED</h1>
        <p className="text-text-secondary">You do not have admin permissions.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl lg:text-4xl text-white mb-2">ADMIN DASHBOARD</h1>
        <p className="text-text-secondary">Platform overview and management</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border pb-2">
        {[
          { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
          { id: 'users' as const, label: 'Users', icon: Users },
          { id: 'reports' as const, label: `Reports ${stats?.pending_reports ? `(${stats.pending_reports})` : ''}`, icon: AlertTriangle },
          { id: 'identities' as const, label: 'Identity Verification', icon: Shield },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary text-white' : 'text-text-secondary hover:text-white hover:bg-surface'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-primary' },
              { label: 'Complete Profiles', value: stats.complete_profiles, icon: Check, color: 'text-accent' },
              { label: 'New This Week', value: stats.recent_signups, icon: TrendingUp, color: 'text-yellow-400' },
              { label: 'Pending Reports', value: stats.pending_reports, icon: AlertTriangle, color: stats.pending_reports > 0 ? 'text-red-400' : 'text-text-secondary' },
              { label: 'Partner Gyms', value: stats.total_gyms, icon: MapPin, color: 'text-blue-400' },
              { label: 'Active Bookings', value: stats.active_bookings, icon: Calendar, color: 'text-purple-400' },
              { label: 'Messages Sent', value: stats.total_messages, icon: MessageCircle, color: 'text-cyan-400' },
              { label: 'Trust & Safety', value: stats.pending_reports > 0 ? 'Action Needed' : 'All Clear', icon: Shield, color: stats.pending_reports > 0 ? 'text-yellow-400' : 'text-accent' },
            ].map((stat, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-heading text-white">{stat.value}</div>
                <div className="text-text-secondary text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Signups */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="font-heading text-lg text-white mb-4">RECENT SIGNUPS</h3>
            <div className="space-y-3">
              {recentUsers.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                      {u.display_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="text-white text-sm">{u.display_name}</div>
                      <div className="text-text-secondary text-xs">{u.email}</div>
                    </div>
                  </div>
                  <div className="text-text-secondary text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search users by name or email..."
                className="w-full bg-surface border border-border rounded-lg py-2 pl-10 pr-4 text-white placeholder-text-secondary text-sm focus:border-primary transition-colors"
              />
            </div>
            <button onClick={handleSearch} className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90">
              Search
            </button>
          </div>

          <div className="text-text-secondary text-sm">{userTotal} total users</div>

          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-text-secondary font-medium px-4 py-3">User</th>
                  <th className="text-left text-text-secondary font-medium px-4 py-3 hidden sm:table-cell">Role</th>
                  <th className="text-left text-text-secondary font-medium px-4 py-3 hidden md:table-cell">Verified</th>
                  <th className="text-left text-text-secondary font-medium px-4 py-3 hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-background/50">
                    <td className="px-4 py-3">
                      <div className="text-white">{u.display_name}</div>
                      <div className="text-text-secondary text-xs">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        u.role === 'admin' ? 'bg-primary/20 text-primary' :
                        u.role === 'gym_owner' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-border text-text-secondary'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {u.email_verified ? (
                        <Check className="w-4 h-4 text-accent" />
                      ) : (
                        <X className="w-4 h-4 text-text-secondary" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-12 bg-surface border border-border rounded-xl">
              <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
              <div className="text-white font-medium mb-1">No Pending Reports</div>
              <div className="text-text-secondary text-sm">All reports have been resolved</div>
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-white font-medium">{report.reason}</div>
                    <div className="text-text-secondary text-xs mt-1">
                      {report.reporter_name} reported {report.reported_name}
                    </div>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                {report.details && (
                  <p className="text-text-secondary text-sm mb-4">{report.details}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(report.id, 'resolved')}
                    disabled={resolvingId === report.id}
                    className="flex items-center gap-1 bg-accent/20 text-accent px-3 py-1.5 rounded-lg text-sm hover:bg-accent/30 disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" /> Resolve
                  </button>
                  <button
                    onClick={() => handleResolve(report.id, 'dismissed')}
                    disabled={resolvingId === report.id}
                    className="flex items-center gap-1 bg-border text-text-secondary px-3 py-1.5 rounded-lg text-sm hover:bg-border/80 disabled:opacity-50"
                  >
                    <X className="w-3 h-3" /> Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Identity Verification Tab */}
      {activeTab === 'identities' && (
        <div className="space-y-4">
          {identitiesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : pendingIdentities.length === 0 ? (
            <div className="text-center py-12 bg-surface border border-border rounded-xl">
              <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
              <div className="text-white font-medium mb-1">No Pending Verifications</div>
              <div className="text-text-secondary text-sm">All identity verifications have been reviewed</div>
            </div>
          ) : (
            pendingIdentities.map(verification => (
              <div key={verification.id} className="bg-surface border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-medium">{verification.user_name}</div>
                    <div className="text-text-secondary text-xs">{verification.user_email}</div>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {new Date(verification.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-text-secondary text-xs mb-2">ID Photo</div>
                    <div
                      className="relative cursor-pointer group"
                      onClick={() => setPreviewImage(verification.id_photo)}
                    >
                      <img
                        src={verification.id_photo}
                        alt={`ID photo for ${verification.user_name}`}
                        className="w-full h-40 object-cover rounded-lg border border-border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-xs mb-2">Selfie</div>
                    <div
                      className="relative cursor-pointer group"
                      onClick={() => setPreviewImage(verification.selfie_photo)}
                    >
                      <img
                        src={verification.selfie_photo}
                        alt={`Selfie for ${verification.user_name}`}
                        className="w-full h-40 object-cover rounded-lg border border-border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor={`notes-${verification.id}`} className="block text-text-secondary text-xs mb-1">
                    Reviewer Notes (optional)
                  </label>
                  <input
                    id={`notes-${verification.id}`}
                    type="text"
                    value={reviewNotes[verification.id] || ''}
                    onChange={(e) => setReviewNotes({ ...reviewNotes, [verification.id]: e.target.value })}
                    placeholder="Add notes for the user..."
                    className="w-full bg-background border border-border rounded-lg py-2 px-3 text-white placeholder-text-secondary text-sm focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleIdentityReview(verification.id, 'approved')}
                    disabled={reviewingId === verification.id}
                    className="flex items-center gap-1 bg-accent/20 text-accent px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/30 disabled:opacity-50"
                  >
                    {reviewingId === verification.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-4 h-4" />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleIdentityReview(verification.id, 'rejected')}
                    disabled={reviewingId === verification.id}
                    className="flex items-center gap-1 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/30 disabled:opacity-50"
                  >
                    {reviewingId === verification.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-4 h-4" />}
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[80vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-text-secondary"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Identity verification preview"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
