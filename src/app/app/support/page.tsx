'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Heart, ExternalLink, Users, Trophy, MapPin, Shield,
  Loader2, CheckCircle, Star, ArrowRight, Handshake
} from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'

const donationAmounts = [5, 10, 25, 50, 100]

const impactItems = [
  {
    icon: Users,
    title: 'Connect Athletes',
    description: 'Help combat sports athletes find training partners and build community, regardless of location or income.',
  },
  {
    icon: MapPin,
    title: 'Support Local Gyms',
    description: 'Fund programs that help grassroots gyms get listed, attract members, and stay open in underserved areas.',
  },
  {
    icon: Trophy,
    title: 'Youth Wrestling Programs',
    description: 'The Mat Association provides free wrestling opportunities for youth who otherwise couldn\'t afford it.',
  },
  {
    icon: Shield,
    title: 'Safe Training Environments',
    description: 'Support verified background checks and safety standards to keep training spaces welcoming and secure.',
  },
]

const tmaPrograms = [
  {
    title: 'Youth Wrestling Initiative',
    description: 'Free mat time and coaching for kids ages 6-18 in underserved communities.',
    stat: '200+ youth served',
  },
  {
    title: 'Gym Equipment Grants',
    description: 'Providing mats, gear, and equipment to grassroots gyms that need it most.',
    stat: '15 gyms supported',
  },
  {
    title: 'Coaching Certification',
    description: 'Subsidized coaching certification for volunteer coaches at community programs.',
    stat: '40+ coaches certified',
  },
]

export default function SupportPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25)
  const [customAmount, setCustomAmount] = useState('')
  const [donating, setDonating] = useState(false)
  const [donated, setDonated] = useState(false)
  const [activeTab, setActiveTab] = useState<'donate' | 'about'>('donate')

  const effectiveAmount = selectedAmount ?? (customAmount ? parseInt(customAmount, 10) : 0)

  const handleDonate = async () => {
    if (!effectiveAmount || effectiveAmount < 1) return
    setDonating(true)
    try {
      const res = await api.createSupportDonation({ amount_cents: effectiveAmount * 100, cause: 'tma_general' })
      if (res.url) {
        window.location.href = res.url
      } else {
        setDonated(true)
        toast.success('Thank you for your generous donation!')
      }
    } catch {
      toast.error('Failed to process donation. Please try again.')
    } finally {
      setDonating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10 animate-slide-up">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-heading text-4xl text-white mb-3">SUPPORT THE <span className="gradient-text">MISSION</span></h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          Training Partner is built by athletes, for athletes. Your support helps us keep the
          platform free and fund The Mat Association&apos;s programs for underserved communities.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab('donate')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'donate'
              ? 'bg-primary text-white'
              : 'bg-surface border border-border text-text-secondary hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4 inline mr-2" />
          Donate
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'about'
              ? 'bg-primary text-white'
              : 'bg-surface border border-border text-text-secondary hover:text-white'
          }`}
        >
          <Handshake className="w-4 h-4 inline mr-2" />
          About TMA
        </button>
      </div>

      {activeTab === 'donate' && (
        <div className="grid md:grid-cols-5 gap-8 animate-fade-in">
          {/* Donation form - 3 cols */}
          <div className="md:col-span-3">
            <div className="bg-surface border border-border rounded-xl p-6">
              {donated ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-accent" />
                  </div>
                  <h2 className="font-heading text-2xl text-white mb-2">THANK YOU!</h2>
                  <p className="text-text-secondary mb-6">
                    Your ${effectiveAmount} donation makes a real difference for combat sports athletes everywhere.
                  </p>
                  <button
                    onClick={() => { setDonated(false); setSelectedAmount(25); }}
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    Make Another Donation
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-heading text-xl text-white mb-6">MAKE A DONATION</h2>

                  {/* Amount selector */}
                  <div className="mb-6">
                    <label className="block text-text-secondary text-xs uppercase tracking-wider mb-3">
                      Select Amount
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                      {donationAmounts.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                          className={`py-3 rounded-lg text-sm font-medium transition-all ${
                            selectedAmount === amt
                              ? 'bg-primary text-white ring-2 ring-primary/50'
                              : 'bg-background border border-border text-text-secondary hover:text-white hover:border-primary/50'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                        placeholder="Custom amount"
                        className="w-full bg-background border border-border rounded-lg py-3 pl-8 pr-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  {/* Donation info */}
                  <div className="bg-background rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Secure payment via Stripe</span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      100% of your donation supports The Mat Association, a 501(c)(3) nonprofit.
                      Your donation may be tax-deductible.
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleDonate}
                    disabled={!effectiveAmount || effectiveAmount < 1 || donating}
                    className="w-full bg-primary text-white py-3.5 rounded-lg font-heading text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 btn-glow"
                  >
                    {donating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        DONATE {effectiveAmount ? `$${effectiveAmount}` : ''}
                      </>
                    )}
                  </button>

                  {!user && (
                    <p className="text-text-secondary text-xs text-center mt-3">
                      <Link href="/auth/signin" className="text-primary hover:underline">Sign in</Link> to track your donation history.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Impact sidebar - 2 cols */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-heading text-lg text-white">YOUR IMPACT</h3>
            {impactItems.map((item) => (
              <div key={item.title} className="bg-surface border border-border rounded-xl p-4 card-hover">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-primary animate-float" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-medium mb-1">{item.title}</h4>
                    <p className="text-text-secondary text-xs leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="space-y-8 animate-fade-in">
          {/* TMA Overview */}
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Handshake className="w-7 h-7 text-accent" />
            </div>
            <h2 className="font-heading text-2xl text-white mb-3">THE MAT ASSOCIATION</h2>
            <p className="text-text-secondary max-w-2xl mx-auto mb-6">
              The Mat Association is a 501(c)(3) nonprofit dedicated to making combat sports
              accessible to everyone. We believe that the discipline, confidence, and community
              that come from training should not be limited by geography or income.
            </p>
            <a
              href="https://thematassociation.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Visit thematassociation.org
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-heading text-xl text-white mb-4">OUR PROGRAMS</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {tmaPrograms.map((prog) => (
                <div key={prog.title} className="bg-surface border border-border rounded-xl p-5 card-hover">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-primary" />
                    <h4 className="text-white font-medium text-sm">{prog.title}</h4>
                  </div>
                  <p className="text-text-secondary text-xs leading-relaxed mb-3">{prog.description}</p>
                  <div className="text-accent text-xs font-medium">{prog.stat}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Partnership CTA */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0 mt-1">
                <Handshake className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-white mb-2">BECOME A PARTNER GYM</h3>
                <p className="text-text-secondary text-sm mb-4">
                  Gyms can partner with The Mat Association to offer free community hours, youth programs,
                  and discounted memberships for underserved athletes. Get listed on Training Partner and grow
                  your community.
                </p>
                <Link
                  href="/app/gyms"
                  className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors btn-glow"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Donate CTA */}
          <div className="text-center py-4">
            <button
              onClick={() => setActiveTab('donate')}
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-heading text-sm hover:bg-primary/90 transition-colors"
            >
              <Heart className="w-4 h-4" />
              SUPPORT OUR MISSION
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
