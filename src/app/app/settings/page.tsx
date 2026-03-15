'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, Bell, Shield, CreditCard, HelpCircle, LogOut, Check, Crown, Mail, CheckCircle, Loader2, AlertTriangle, X, Instagram, ExternalLink, Upload, Phone, Heart, Ban, Link2, BellRing, Download, Flag, MessageCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import api, { isPremiumPlan, IdentityVerification, BlockedUser, IntegrationProvider, UserReport, MessagePreferences } from '@/lib/api'
import { useToast } from '@/components/toast'

export default function SettingsPage() {
  const router = useRouter()
  const { user, subscription, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('account')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    partnerMatches: true,
    gymUpdates: true,
    promotions: false
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [instagramUsername, setInstagramUsername] = useState('')
  const [editingInstagram, setEditingInstagram] = useState(false)
  const [savingInstagram, setSavingInstagram] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const isPremium = isPremiumPlan(subscription?.plan)
  const [upgrading, setUpgrading] = useState(false)
  const toast = useToast()

  // Identity Verification state
  const [identityStatus, setIdentityStatus] = useState<IdentityVerification | null>(null)
  const [identityLoading, setIdentityLoading] = useState(true)
  const [idPhoto, setIdPhoto] = useState<string | null>(null)
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null)
  const [submittingIdentity, setSubmittingIdentity] = useState(false)
  const [deletingIdentity, setDeletingIdentity] = useState(false)

  // Emergency Contact state
  const [emergencyContact, setEmergencyContact] = useState({
    name: user?.emergency_contact_name || '',
    phone: user?.emergency_contact_phone || '',
    relation: user?.emergency_contact_relation || '',
  })
  const [savingEmergency, setSavingEmergency] = useState(false)

  // Blocked Users state
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [blocksLoading, setBlocksLoading] = useState(true)
  const [unblockingId, setUnblockingId] = useState<number | null>(null)

  // Data Export state
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  // Integrations state
  const [integrations, setIntegrations] = useState<IntegrationProvider[]>([])
  const [integrationsLoading, setIntegrationsLoading] = useState(true)
  const [togglingProvider, setTogglingProvider] = useState<string | null>(null)

  // My Reports state
  const [myReports, setMyReports] = useState<UserReport[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)

  // Message Preferences state
  const [msgPrefs, setMsgPrefs] = useState<MessagePreferences>({ verified_only: false, min_tier: 'none', max_distance_km: 0, sports_match: false })
  const [msgPrefsLoading, setMsgPrefsLoading] = useState(true)
  const [msgPrefsSaving, setMsgPrefsSaving] = useState(false)

  const loadIdentityStatus = useCallback(async () => {
    try {
      const res = await api.getIdentityStatus()
      setIdentityStatus(res.verification)
    } catch { /* */ }
    finally { setIdentityLoading(false) }
  }, [])

  const loadBlocks = useCallback(async () => {
    try {
      const res = await api.getBlocks()
      setBlockedUsers(res.blocks)
    } catch { /* */ }
    finally { setBlocksLoading(false) }
  }, [])

  const loadIntegrations = useCallback(async () => {
    try {
      const res = await api.getIntegrations()
      setIntegrations(res.providers)
    } catch { /* */ }
    finally { setIntegrationsLoading(false) }
  }, [])

  const loadMyReports = useCallback(async () => {
    try {
      const res = await api.getMyReports()
      setMyReports(res.reports)
    } catch { /* */ }
    finally { setReportsLoading(false) }
  }, [])

  const loadMessagePreferences = useCallback(async () => {
    try {
      const res = await api.getMessagePreferences()
      setMsgPrefs(res.preferences)
    } catch { /* */ }
    finally { setMsgPrefsLoading(false) }
  }, [])

  useEffect(() => {
    loadIdentityStatus()
    loadBlocks()
    loadIntegrations()
    loadMyReports()
    loadMessagePreferences()
  }, [loadIdentityStatus, loadBlocks, loadIntegrations, loadMyReports, loadMessagePreferences])

  useEffect(() => {
    if (user) {
      setEmergencyContact({
        name: user.emergency_contact_name || '',
        phone: user.emergency_contact_phone || '',
        relation: user.emergency_contact_relation || '',
      })
    }
  }, [user])

  const handleToggleNotify = async (providerId: string) => {
    setTogglingProvider(providerId)
    try {
      const res = await api.toggleIntegrationNotify(providerId)
      setIntegrations(prev => prev.map(p =>
        p.id === providerId ? { ...p, on_waitlist: res.on_waitlist } : p
      ))
      toast.success(res.on_waitlist ? "You'll be notified when this integration launches!" : 'Notification removed')
    } catch {
      toast.error('Failed to update notification preference')
    } finally {
      setTogglingProvider(null)
    }
  }

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSubmitIdentity = async () => {
    if (!idPhoto || !selfiePhoto) {
      toast.error('Please upload both an ID photo and a selfie')
      return
    }
    setSubmittingIdentity(true)
    try {
      await api.submitIdentity({ id_photo: idPhoto, selfie_photo: selfiePhoto })
      toast.success('Identity verification submitted for review')
      setIdPhoto(null)
      setSelfiePhoto(null)
      await loadIdentityStatus()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit verification')
    } finally {
      setSubmittingIdentity(false)
    }
  }

  const handleDeleteIdentity = async () => {
    if (!confirm('Are you sure you want to delete your identity verification data?')) return
    setDeletingIdentity(true)
    try {
      await api.deleteIdentityData()
      setIdentityStatus(null)
      toast.success('Identity data deleted')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete identity data')
    } finally {
      setDeletingIdentity(false)
    }
  }

  const handleSaveEmergencyContact = async () => {
    setSavingEmergency(true)
    try {
      await api.updateEmergencyContact(emergencyContact)
      toast.success('Emergency contact updated')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update emergency contact')
    } finally {
      setSavingEmergency(false)
    }
  }

  const handleUnblock = async (userId: number) => {
    setUnblockingId(userId)
    try {
      await api.unblockUser(userId)
      setBlockedUsers(blockedUsers.filter(b => b.user_id !== userId))
      toast.success('User unblocked')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to unblock user')
    } finally {
      setUnblockingId(null)
    }
  }

  const handleUpgrade = async (plan: 'premium_athlete' | 'premium_gym' = 'premium_athlete') => {
    setUpgrading(true)
    try {
      const res = await api.createCheckout(plan)
      if (res.url) {
        window.location.href = res.url
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start checkout'
      alert(message)
    } finally {
      setUpgrading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return
    setDeleting(true)
    setDeleteError('')
    try {
      await api.deleteAccount('DELETE')
      logout()
      router.push('/')
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }
  const handleExportData = async () => {
    setExporting(true)
    setExportError('')
    try {
      const data = await api.exportMyData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `training-partner-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to export data'
      setExportError(message)
      toast.error(message)
    } finally {
      setExporting(false)
    }
  }

  const [resendingVerification, setResendingVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  const handleResendVerification = async () => {
    setResendingVerification(true)
    try {
      await api.resendVerification()
      setVerificationSent(true)
    } catch { /* silently fail */ }
    finally { setResendingVerification(false) }
  }

  const handleCancelSubscription = async () => {
    setCancelling(true)
    setCancelError('')
    try {
      await api.cancelSubscription()
      setShowCancelModal(false)
      window.location.reload()
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  const handleSaveMessagePreferences = async () => {
    setMsgPrefsSaving(true)
    try {
      const res = await api.updateMessagePreferences(msgPrefs)
      setMsgPrefs(res.preferences)
      toast.success('Message preferences saved')
    } catch {
      toast.error('Failed to save message preferences')
    } finally {
      setMsgPrefsSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'integrations', label: 'Connected Apps', icon: Link2 },
    { id: 'identity', label: 'Verification', icon: Shield },
    { id: 'emergency', label: 'Emergency Contact', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'blocked', label: 'Blocked Users', icon: Ban },
    { id: 'reports', label: 'My Reports', icon: Flag },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl lg:text-4xl text-white mb-2">SETTINGS</h1>
        <p className="text-text-secondary">Manage your account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation */}
        <div className="overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 lg:w-64 lg:space-y-2">
          <div className="flex lg:flex-col gap-2 lg:gap-0 min-w-max lg:min-w-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-white hover:bg-surface'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
          </div>

          <hr className="border-border my-2 lg:my-4 hidden lg:block" />

          <button
            onClick={handleLogout}
            className="hidden lg:flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        <div className="flex-1 bg-surface border border-border rounded-xl p-6">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">ACCOUNT SETTINGS</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <div className="text-white font-medium">Display Name</div>
                    <div className="text-text-secondary text-sm">{user?.display_name || 'Not set'}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <div className="text-white font-medium">Email Address</div>
                    <div className="text-text-secondary text-sm">{user?.email || 'Not set'}</div>
                  </div>
                  {user?.email_verified ? (
                    <span className="flex items-center gap-1 text-accent text-sm">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  ) : verificationSent ? (
                    <span className="text-accent text-sm">Email sent!</span>
                  ) : (
                    <button
                      onClick={handleResendVerification}
                      disabled={resendingVerification}
                      className="flex items-center gap-1 text-primary text-sm hover:underline disabled:opacity-50"
                    >
                      {resendingVerification ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                      Verify
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <div className="text-white font-medium">Role</div>
                    <div className="text-text-secondary text-sm capitalize">{user?.role || 'athlete'}</div>
                  </div>
                </div>
                <div className="py-4 border-b border-border">
                  <div className="text-white font-medium mb-3">Connected Accounts</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Instagram className="w-5 h-5 text-pink-400" />
                        <div>
                          <div className="text-sm text-white">Instagram</div>
                          <div className="text-xs text-text-secondary">
                            {user?.instagram_username
                              ? `@${user?.instagram_username}`
                              : 'Not connected'}
                          </div>
                        </div>
                      </div>
                      {editingInstagram ? (
                        <div className="flex items-center gap-2">
                          <label htmlFor="instagramUsername" className="sr-only">Instagram Username</label>
                          <input
                            id="instagramUsername"
                            type="text"
                            value={instagramUsername}
                            onChange={e => setInstagramUsername(e.target.value.replace(/^@/, '').replace(/[^a-zA-Z0-9_.]/g, ''))}
                            placeholder="username"
                            maxLength={30}
                            pattern="[a-zA-Z0-9_.]+"
                            className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-white w-36 focus:border-primary focus:outline-none"
                          />
                          <button
                            disabled={savingInstagram}
                            onClick={async () => {
                              setSavingInstagram(true)
                              try {
                                await api.updateInstagram(instagramUsername.trim())
                                setEditingInstagram(false)
                                window.location.reload()
                              } catch {} finally {
                                setSavingInstagram(false)
                              }
                            }}
                            className="text-primary text-sm hover:underline disabled:opacity-50"
                          >
                            {savingInstagram ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                          </button>
                          <button onClick={() => setEditingInstagram(false)} className="text-text-secondary text-sm hover:text-white">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setInstagramUsername((user?.instagram_username as string) || '')
                            setEditingInstagram(true)
                          }}
                          className="text-primary text-sm hover:underline"
                        >
                          {user?.instagram_username ? 'Edit' : 'Connect'}
                        </button>
                      )}
                    </div>
                    {user?.instagram_username && (
                      <a
                        href={`https://instagram.com/${encodeURIComponent(user?.instagram_username || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-pink-400 transition-colors"
                      >
                        View profile <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <div className="text-white font-medium">Download My Data</div>
                    <div className="text-text-secondary text-sm">Export all your data as a JSON file (limit: once per 24 hours)</div>
                  </div>
                  <button
                    onClick={handleExportData}
                    disabled={exporting}
                    className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline disabled:opacity-50"
                  >
                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {exporting ? 'Exporting...' : 'Download'}
                  </button>
                </div>
                {exportError && (
                  <div className="text-red-400 text-sm py-1">{exportError}</div>
                )}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="text-white font-medium">Delete Account</div>
                    <div className="text-text-secondary text-sm">Permanently delete your account and data</div>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="text-red-400 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">NOTIFICATION PREFERENCES</h2>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'push', label: 'Push Notifications', desc: 'Receive push notifications on your device' },
                  { key: 'partnerMatches', label: 'New Partner Matches', desc: 'Get notified when you have new matches' },
                  { key: 'gymUpdates', label: 'Gym Updates', desc: 'News and updates from your partner gyms' },
                  { key: 'promotions', label: 'Promotions & Offers', desc: 'Receive promotional emails and offers' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-4 border-b border-border">
                    <div>
                      <div className="text-white font-medium">{item.label}</div>
                      <div className="text-text-secondary text-sm">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key as keyof typeof notifications]})}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications[item.key as keyof typeof notifications] ? 'bg-accent' : 'bg-border'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">SUBSCRIPTION</h2>

              <div className="bg-background border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-text-secondary text-sm">Current Plan</div>
                    <div className="text-white font-heading text-2xl">{isPremium ? 'PREMIUM' : 'FREE'}</div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded ${isPremium ? 'bg-primary/20 text-primary' : 'bg-border text-text-secondary'}`}>
                    {subscription?.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-text-secondary text-sm">
                  {isPremium
                    ? 'Full access to all features including premium gyms and unlimited matches.'
                    : 'Limited to basic partner matching. Upgrade for full access.'}
                </div>
              </div>

              {isPremium ? (
                <div className="bg-background border border-border rounded-xl p-6">
                  <h3 className="text-white font-medium mb-2">Manage Subscription</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    Your premium subscription renews automatically. You can cancel anytime.
                  </p>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-red-400 text-sm hover:underline"
                  >
                    Cancel Subscription
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-accent text-background px-4 py-1 rounded-bl-md font-medium text-sm">
                    RECOMMENDED
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-text-secondary text-sm">Premium Plan</div>
                      <div className="text-white font-heading text-3xl">$9.99<span className="text-lg text-text-secondary">/month</span></div>
                    </div>
                    <Crown className="w-10 h-10 text-accent" />
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-white text-sm"><Check className="w-4 h-4 text-accent" /> Unlimited partner matches</li>
                    <li className="flex items-center gap-2 text-white text-sm"><Check className="w-4 h-4 text-accent" /> Access to all partner gyms</li>
                    <li className="flex items-center gap-2 text-white text-sm"><Check className="w-4 h-4 text-accent" /> Exclusive open mat hours</li>
                    <li className="flex items-center gap-2 text-white text-sm"><Check className="w-4 h-4 text-accent" /> Priority messaging</li>
                    <li className="flex items-center gap-2 text-white text-sm"><Check className="w-4 h-4 text-accent" /> Verified gym access</li>
                  </ul>
                  <button
                    onClick={() => handleUpgrade('premium_athlete')}
                    disabled={upgrading}
                    className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {upgrading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Upgrade Now'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">CONNECTED APPS</h2>
              <p className="text-text-secondary text-sm">Connect your fitness trackers to sync training data automatically.</p>

              {integrationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {integrations.map(provider => {
                    const colors: Record<string, string> = {
                      whoop: '#EE5A24',
                      withings: '#00B4D8',
                      garmin: '#005DA6',
                      fitbit: '#00B0B9',
                    }
                    const color = colors[provider.id] || '#888'
                    return (
                      <div key={provider.id} className="bg-background border border-border rounded-xl p-5 flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-heading text-lg shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {provider.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">{provider.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-medium">
                              Coming Soon
                            </span>
                          </div>
                          <p className="text-text-secondary text-sm">{provider.description}</p>
                        </div>
                        <button
                          onClick={() => handleToggleNotify(provider.id)}
                          disabled={togglingProvider === provider.id}
                          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            provider.on_waitlist
                              ? 'bg-primary/10 text-primary border border-primary/30'
                              : 'bg-background border border-border text-text-secondary hover:text-white hover:border-primary'
                          }`}
                        >
                          {togglingProvider === provider.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : provider.on_waitlist ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <BellRing className="w-4 h-4" />
                          )}
                          {provider.on_waitlist ? 'Notifying' : 'Notify Me'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'identity' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">IDENTITY VERIFICATION</h2>

              {identityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : identityStatus?.status === 'approved' ? (
                <div className="bg-background border border-accent/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Verified</div>
                      <div className="text-text-secondary text-sm">
                        Your identity has been verified
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteIdentity}
                    disabled={deletingIdentity}
                    className="text-red-400 text-sm hover:underline disabled:opacity-50 flex items-center gap-1"
                  >
                    {deletingIdentity && <Loader2 className="w-3 h-3 animate-spin" />}
                    Delete verification data
                  </button>
                </div>
              ) : identityStatus?.status === 'pending' ? (
                <div className="bg-background border border-yellow-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Under Review</div>
                      <div className="text-text-secondary text-sm">
                        Submitted {new Date(identityStatus.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : identityStatus?.status === 'rejected' ? (
                <div className="space-y-4">
                  <div className="bg-background border border-red-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                        <X className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Not Approved</div>
                        <div className="text-text-secondary text-sm">Your verification was not approved</div>
                      </div>
                    </div>
                    {identityStatus.reviewer_notes && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-3">
                        <div className="text-text-secondary text-xs mb-1">Reviewer notes:</div>
                        <div className="text-red-400 text-sm">{identityStatus.reviewer_notes}</div>
                      </div>
                    )}
                  </div>
                  {/* Show resubmit form */}
                  <div className="bg-background border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-white font-medium">Resubmit Verification</h3>
                    <div>
                      <label htmlFor="idPhotoResubmit" className="block text-text-secondary text-sm mb-2">Photo ID (driver license, passport, etc.)</label>
                      <input
                        id="idPhotoResubmit"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) setIdPhoto(await handleFileToBase64(file))
                        }}
                        className="w-full bg-surface border border-border rounded-lg py-2 px-3 text-white text-sm file:mr-3 file:bg-primary file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:text-sm file:cursor-pointer"
                      />
                    </div>
                    <div>
                      <label htmlFor="selfieResubmit" className="block text-text-secondary text-sm mb-2">Selfie for comparison</label>
                      <input
                        id="selfieResubmit"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) setSelfiePhoto(await handleFileToBase64(file))
                        }}
                        className="w-full bg-surface border border-border rounded-lg py-2 px-3 text-white text-sm file:mr-3 file:bg-primary file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:text-sm file:cursor-pointer"
                      />
                    </div>
                    <button
                      onClick={handleSubmitIdentity}
                      disabled={submittingIdentity || !idPhoto || !selfiePhoto}
                      className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {submittingIdentity && <Loader2 className="w-4 h-4 animate-spin" />}
                      {submittingIdentity ? 'Submitting...' : 'Resubmit Verification'}
                    </button>
                  </div>
                </div>
              ) : (
                /* No verification yet */
                <div className="bg-background border border-border rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Verify Your Identity</div>
                      <div className="text-text-secondary text-sm">Get a verified badge on your profile to build trust with training partners</div>
                    </div>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Upload a photo of your government-issued ID and a selfie. Our team will review and verify your identity within 24-48 hours. Your photos are encrypted and deleted after review.
                  </p>
                  <div>
                    <label htmlFor="idPhoto" className="block text-text-secondary text-sm mb-2">Photo ID (driver license, passport, etc.)</label>
                    <input
                      id="idPhoto"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) setIdPhoto(await handleFileToBase64(file))
                      }}
                      className="w-full bg-surface border border-border rounded-lg py-2 px-3 text-white text-sm file:mr-3 file:bg-primary file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:text-sm file:cursor-pointer"
                    />
                    {idPhoto && <div className="text-accent text-xs mt-1">ID photo selected</div>}
                  </div>
                  <div>
                    <label htmlFor="selfie" className="block text-text-secondary text-sm mb-2">Selfie for comparison</label>
                    <input
                      id="selfie"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) setSelfiePhoto(await handleFileToBase64(file))
                      }}
                      className="w-full bg-surface border border-border rounded-lg py-2 px-3 text-white text-sm file:mr-3 file:bg-primary file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:text-sm file:cursor-pointer"
                    />
                    {selfiePhoto && <div className="text-accent text-xs mt-1">Selfie selected</div>}
                  </div>
                  <button
                    onClick={handleSubmitIdentity}
                    disabled={submittingIdentity || !idPhoto || !selfiePhoto}
                    className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submittingIdentity && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Upload className="w-4 h-4" />
                    {submittingIdentity ? 'Submitting...' : 'Submit for Verification'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">EMERGENCY CONTACT</h2>
              <p className="text-text-secondary text-sm">
                Your emergency contact information is kept private and only shared in safety-critical situations.
              </p>
              <div className="bg-background border border-border rounded-xl p-6 space-y-4">
                <div>
                  <label htmlFor="emergencyName" className="block text-text-secondary text-sm mb-2">Contact Name</label>
                  <input
                    id="emergencyName"
                    type="text"
                    value={emergencyContact.name}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full bg-surface border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyPhone" className="block text-text-secondary text-sm mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      id="emergencyPhone"
                      type="tel"
                      value={emergencyContact.phone}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full bg-surface border border-border rounded-lg py-3 pl-10 pr-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="emergencyRelation" className="block text-text-secondary text-sm mb-2">Relationship</label>
                  <select
                    id="emergencyRelation"
                    value={emergencyContact.relation}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, relation: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg py-3 px-4 text-white focus:border-primary transition-colors"
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="coach">Coach</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button
                  onClick={handleSaveEmergencyContact}
                  disabled={savingEmergency}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {savingEmergency && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingEmergency ? 'Saving...' : 'Save Emergency Contact'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">MESSAGE PREFERENCES</h2>
              <p className="text-text-secondary text-sm mb-4">Control who can send you messages</p>

              {msgPrefsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Verified Only Toggle */}
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div>
                      <div className="text-white font-medium">Only verified users</div>
                      <div className="text-text-secondary text-sm">Only receive messages from verified users</div>
                    </div>
                    <button
                      onClick={() => setMsgPrefs(p => ({ ...p, verified_only: !p.verified_only }))}
                      className={`w-12 h-6 rounded-full transition-colors ${msgPrefs.verified_only ? 'bg-accent' : 'bg-border'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${msgPrefs.verified_only ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Minimum Tier Dropdown */}
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div>
                      <div className="text-white font-medium">Minimum verification tier</div>
                      <div className="text-text-secondary text-sm">Set a minimum tier for who can message you</div>
                    </div>
                    <label htmlFor="minTier" className="sr-only">Minimum verification tier</label>
                    <select
                      id="minTier"
                      value={msgPrefs.min_tier}
                      onChange={(e) => setMsgPrefs(p => ({ ...p, min_tier: e.target.value }))}
                      className="bg-background border border-border rounded-lg py-2 px-3 text-white text-sm"
                    >
                      <option value="none">None</option>
                      <option value="verified">Verified</option>
                      <option value="pro">Pro</option>
                      <option value="champion">Champion</option>
                    </select>
                  </div>

                  {/* Max Distance */}
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div>
                      <div className="text-white font-medium">Maximum distance</div>
                      <div className="text-text-secondary text-sm">Only allow messages from nearby users (0 = no limit)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="maxDistance" className="sr-only">Maximum distance in km</label>
                      <input
                        id="maxDistance"
                        type="number"
                        min="0"
                        value={msgPrefs.max_distance_km}
                        onChange={(e) => setMsgPrefs(p => ({ ...p, max_distance_km: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="bg-background border border-border rounded-lg py-2 px-3 text-white text-sm w-24 text-right"
                      />
                      <span className="text-text-secondary text-sm">km</span>
                    </div>
                  </div>

                  {/* Sports Match Toggle */}
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div>
                      <div className="text-white font-medium">Sports match required</div>
                      <div className="text-text-secondary text-sm">Only receive messages from users who share your sports</div>
                    </div>
                    <button
                      onClick={() => setMsgPrefs(p => ({ ...p, sports_match: !p.sports_match }))}
                      className={`w-12 h-6 rounded-full transition-colors ${msgPrefs.sports_match ? 'bg-accent' : 'bg-border'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${msgPrefs.sports_match ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSaveMessagePreferences}
                      disabled={msgPrefsSaving}
                      className="bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {msgPrefsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'blocked' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">BLOCKED USERS</h2>
              {blocksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : blockedUsers.length === 0 ? (
                <div className="text-center py-12 bg-background border border-border rounded-xl">
                  <Ban className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <div className="text-white font-medium mb-1">No Blocked Users</div>
                  <div className="text-text-secondary text-sm">You haven&apos;t blocked anyone</div>
                </div>
              ) : (
                <div className="bg-background border border-border rounded-xl overflow-hidden">
                  {blockedUsers.map((blocked, i) => (
                    <div
                      key={blocked.id}
                      className={`flex items-center justify-between px-4 py-3 ${
                        i < blockedUsers.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <div>
                        <div className="text-white text-sm">{blocked.name}</div>
                        <div className="text-text-secondary text-xs">
                          Blocked {new Date(blocked.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnblock(blocked.user_id)}
                        disabled={unblockingId === blocked.user_id}
                        className="text-primary text-sm hover:underline disabled:opacity-50 flex items-center gap-1"
                      >
                        {unblockingId === blocked.user_id && <Loader2 className="w-3 h-3 animate-spin" />}
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">MY REPORTS</h2>
              <p className="text-text-secondary text-sm">
                Track the status of reports you&apos;ve submitted. Our team reviews all reports within 48 hours.
              </p>
              {reportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : myReports.length === 0 ? (
                <div className="text-center py-12 bg-background border border-border rounded-xl">
                  <Flag className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <div className="text-white font-medium mb-1">No Reports</div>
                  <div className="text-text-secondary text-sm">You haven&apos;t submitted any reports</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {myReports.map((report) => (
                    <div key={report.id} className="bg-background border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white text-sm font-medium capitalize">
                              {report.category.replace(/_/g, ' ')}
                            </span>
                            <span className="text-text-secondary text-xs">
                              ({report.content_type.replace(/_/g, ' ')})
                            </span>
                          </div>
                          {report.reported_user_name && (
                            <div className="text-text-secondary text-xs mb-1">
                              Reported: {report.reported_user_name}
                            </div>
                          )}
                          <p className="text-text-secondary text-sm line-clamp-2">{report.description}</p>
                          <div className="text-text-secondary text-xs mt-2">
                            {new Date(report.created_at).toLocaleDateString()}
                            {report.resolved_at && (
                              <span> &mdash; Resolved {new Date(report.resolved_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                          report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          report.status === 'reviewing' ? 'bg-blue-500/20 text-blue-400' :
                          report.status === 'actioned' ? 'bg-green-500/20 text-green-400' :
                          'bg-zinc-500/20 text-zinc-400'
                        }`}>
                          {report.status === 'pending' ? 'Pending' :
                           report.status === 'reviewing' ? 'Reviewing' :
                           report.status === 'actioned' ? 'Actioned' :
                           'Dismissed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">PRIVACY SETTINGS</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <div className="text-white font-medium">Profile Visibility</div>
                    <div className="text-text-secondary text-sm">Who can see your profile</div>
                  </div>
                  <label htmlFor="profileVisibility" className="sr-only">Profile Visibility</label>
                  <select id="profileVisibility" className="bg-background border border-border rounded-lg py-2 px-3 text-white text-sm">
                    <option>All Members</option>
                    <option>Partners Only</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <div className="text-white font-medium">Show Location</div>
                    <div className="text-text-secondary text-sm">Allow others to see your approximate location</div>
                  </div>
                  <button className="w-12 h-6 bg-accent rounded-full">
                    <div className="w-5 h-5 bg-white rounded-full translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">BILLING</h2>
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <div className="text-white font-medium mb-2">
                  {isPremium ? 'Premium subscription active' : 'No billing history'}
                </div>
                <div className="text-text-secondary text-sm">
                  {isPremium ? 'Managed via Stripe' : 'You\'re on the free plan'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">HELP & SUPPORT</h2>
              <div className="space-y-4">
                <a href="#" className="block py-4 border-b border-border text-white hover:text-primary transition-colors">
                  Frequently Asked Questions
                </a>
                <a href="#" className="block py-4 border-b border-border text-white hover:text-primary transition-colors">
                  Contact Support
                </a>
                <a href="#" className="block py-4 border-b border-border text-white hover:text-primary transition-colors">
                  Report a Problem
                </a>
                <a href="#" className="block py-4 text-white hover:text-primary transition-colors">
                  Community Guidelines
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <h2 className="font-heading text-xl text-white">CANCEL SUBSCRIPTION</h2>
              </div>
              <button onClick={() => { setShowCancelModal(false); setCancelError(''); }} className="text-text-secondary hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-text-secondary text-sm mb-4">
              Are you sure you want to cancel your Premium subscription?
            </p>
            <ul className="text-text-secondary text-sm space-y-1 mb-6 ml-4">
              <li>• You&apos;ll keep Premium access until your current billing period ends</li>
              <li>• After that, you&apos;ll revert to the Free plan</li>
              <li>• You can resubscribe anytime to regain Premium features</li>
            </ul>

            {cancelError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-sm mb-4">
                {cancelError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setCancelError(''); }}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Keep Premium
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="flex-1 bg-background border border-border text-text-secondary py-3 rounded-lg font-medium hover:text-white hover:border-red-500/50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                {cancelling ? 'Cancelling...' : 'Cancel Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="font-heading text-xl text-white">DELETE ACCOUNT</h2>
              </div>
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); setDeleteError(''); }} className="text-text-secondary hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-text-secondary text-sm mb-4">
              This action is <span className="text-red-400 font-medium">permanent and cannot be undone</span>. All your data will be deleted including:
            </p>
            <ul className="text-text-secondary text-sm space-y-1 mb-6 ml-4">
              <li>• Your profile and training preferences</li>
              <li>• All messages and conversations</li>
              <li>• Bookings and gym reviews</li>
              <li>• Subscription and payment history</li>
            </ul>

            <label htmlFor="deleteConfirmation" className="block text-text-secondary text-sm mb-2">
              Type <span className="text-red-400 font-mono font-bold">DELETE</span> to confirm
            </label>
            <input
              id="deleteConfirmation"
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-red-400 transition-colors mb-4"
            />

            {deleteError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-sm mb-4">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); setDeleteError(''); }}
                className="flex-1 bg-background border border-border text-white py-3 rounded-lg font-medium hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || deleting}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
