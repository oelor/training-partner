'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Bell, Shield, CreditCard, HelpCircle, LogOut, Check, Crown, Mail, CheckCircle, Loader2, AlertTriangle, X, Instagram, ExternalLink } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'

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
  const isPremium = subscription?.plan === 'premium'

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

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'subscription', label: 'Subscription', icon: Crown },
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
        <div className="lg:w-64 space-y-2">
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

          <hr className="border-border my-4" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
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
                          <input
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

              {!isPremium && (
                <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-accent text-background px-4 py-1 rounded-bl-md font-medium text-sm">
                    RECOMMENDED
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-text-secondary text-sm">Premium Plan</div>
                      <div className="text-white font-heading text-3xl">$20<span className="text-lg text-text-secondary">/month</span></div>
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
                  <button className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Upgrade Now
                  </button>
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
                  <select className="bg-background border border-border rounded-lg py-2 px-3 text-white text-sm">
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
                  {isPremium ? 'Managed via Lemon Squeezy' : 'You\'re on the free plan'}
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

            <label className="block text-text-secondary text-sm mb-2">
              Type <span className="text-red-400 font-mono font-bold">DELETE</span> to confirm
            </label>
            <input
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
