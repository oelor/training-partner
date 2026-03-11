'use client'

import { useState } from 'react'
import { User, Bell, Shield, CreditCard, HelpCircle, LogOut, Check, Crown } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    partnerMatches: true,
    gymUpdates: true,
    promotions: false
  })

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
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl lg:text-4xl text-white mb-2">SETTINGS</h1>
        <p className="text-text-secondary">
          Manage your account preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
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
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-surface border border-border rounded-xl p-6">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">ACCOUNT SETTINGS</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <div className="text-white font-medium">Email Address</div>
                    <div className="text-text-secondary text-sm">user@example.com</div>
                  </div>
                  <button className="text-primary text-sm hover:underline">Change</button>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <div className="text-white font-medium">Password</div>
                    <div className="text-text-secondary text-sm">Last changed 30 days ago</div>
                  </div>
                  <button className="text-primary text-sm hover:underline">Change</button>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <div className="text-white font-medium">Two-Factor Authentication</div>
                    <div className="text-text-secondary text-sm">Add an extra layer of security</div>
                  </div>
                  <button className="text-primary text-sm hover:underline">Enable</button>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="text-white font-medium">Delete Account</div>
                    <div className="text-text-secondary text-sm">Permanently delete your account and data</div>
                  </div>
                  <button className="text-red-400 text-sm hover:underline">Delete</button>
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
              
              {/* Current Plan */}
              <div className="bg-background border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-text-secondary text-sm">Current Plan</div>
                    <div className="text-white font-heading text-2xl">FREE</div>
                  </div>
                  <span className="bg-border text-text-secondary text-xs px-3 py-1 rounded">Active</span>
                </div>
                <div className="text-text-secondary text-sm">
                  Limited to basic partner matching. Upgrade for full access.
                </div>
              </div>

              {/* Premium Plan */}
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
                  <li className="flex items-center gap-2 text-white text-sm">
                    <Check className="w-4 h-4 text-accent" /> Unlimited partner matches
                  </li>
                  <li className="flex items-center gap-2 text-white text-sm">
                    <Check className="w-4 h-4 text-accent" /> Access to all partner gyms
                  </li>
                  <li className="flex items-center gap-2 text-white text-sm">
                    <Check className="w-4 h-4 text-accent" /> Exclusive open mat hours
                  </li>
                  <li className="flex items-center gap-2 text-white text-sm">
                    <Check className="w-4 h-4 text-accent" /> Priority messaging
                  </li>
                  <li className="flex items-center gap-2 text-white text-sm">
                    <Check className="w-4 h-4 text-accent" /> Verified gym access
                  </li>
                </ul>
                <button className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Upgrade Now
                </button>
              </div>
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
                    <option>Friends Only</option>
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
                
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <div className="text-white font-medium">Show Online Status</div>
                    <div className="text-text-secondary text-sm">Let others see when you're online</div>
                  </div>
                  <button className="w-12 h-6 bg-accent rounded-full">
                    <div className="w-5 h-5 bg-white rounded-full translate-x-6" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="text-white font-medium">Data Export</div>
                    <div className="text-text-secondary text-sm">Download all your data</div>
                  </div>
                  <button className="text-primary text-sm hover:underline">Export</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl text-white mb-6">BILLING</h2>
              
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <div className="text-white font-medium mb-2">No billing history</div>
                <div className="text-text-secondary text-sm">You're on the free plan</div>
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
    </div>
  )
}
