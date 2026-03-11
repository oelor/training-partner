'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, MapPin, Clock, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'

// Demo data for the dashboard
const demoPartners = [
  { id: '1', name: 'Mike T.', sport: 'Wrestling', skill: 'Advanced', match: 95, distance: '2.3 mi' },
  { id: '2', name: 'Sarah J.', sport: 'MMA', skill: 'Intermediate', match: 88, distance: '4.1 mi' },
  { id: '3', name: 'Carlos R.', sport: 'BJJ', skill: 'Advanced', match: 82, distance: '1.8 mi' },
]

const demoGyms = [
  { id: '1', name: 'Iron Temple MMA', openMat: 'Sat 10am-2pm', distance: '1.2 mi', verified: true },
  { id: '2', name: 'Grappling Factory', openMat: 'Sun 9am-12pm', distance: '3.5 mi', verified: true },
]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profileComplete, setProfileComplete] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('trainingPartnerUser')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      // Check if profile is complete
      setProfileComplete(!!(userData.sport && userData.skillLevel && userData.location))
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl text-white mb-2">
            WELCOME BACK, {user?.name?.split(' ')[0] || 'ATHLETE'}!
          </h1>
          <p className="text-text-secondary">
            Ready to find your next training partner?
          </p>
        </div>
        
        {!profileComplete && (
          <Link 
            href="/app/profile" 
            className="flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-lg hover:bg-accent/30 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Complete Your Profile
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <span className="text-text-secondary text-sm">Matches</span>
          </div>
          <div className="font-heading text-2xl text-white">12</div>
          <div className="text-accent text-sm flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +3 this week
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <span className="text-text-secondary text-sm">Nearby</span>
          </div>
          <div className="font-heading text-2xl text-white">8</div>
          <div className="text-text-secondary text-sm">Partners</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <span className="text-text-secondary text-sm">Open Mat</span>
          </div>
          <div className="font-heading text-2xl text-white">5</div>
          <div className="text-text-secondary text-sm">This week</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <span className="text-text-secondary text-sm">Profile</span>
          </div>
          <div className="font-heading text-2xl text-white">{profileComplete ? '100%' : '40%'}</div>
          <div className="text-text-secondary text-sm">{profileComplete ? 'Complete' : 'Incomplete'}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link 
          href="/app/partners" 
          className="bg-gradient-to-r from-primary/20 to-surface border border-primary/50 rounded-xl p-6 hover:border-primary transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-xl text-white mb-1">FIND PARTNERS</h3>
              <p className="text-text-secondary text-sm">Browse compatible training partners in your area</p>
            </div>
            <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link 
          href="/app/gyms" 
          className="bg-gradient-to-r from-accent/20 to-surface border border-accent/50 rounded-xl p-6 hover:border-accent transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-xl text-white mb-1">FIND GYMS</h3>
              <p className="text-text-secondary text-sm">Discover partner gyms with open mat hours</p>
            </div>
            <ArrowRight className="w-6 h-6 text-accent group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-2xl text-white">TOP MATCHES</h2>
          <Link href="/app/partners" className="text-primary text-sm hover:underline">
            View All
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {demoPartners.map((partner) => (
            <div key={partner.id} className="bg-surface border border-border rounded-xl p-4 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="text-right">
                  <div className="text-accent font-mono text-lg font-bold">{partner.match}%</div>
                  <div className="text-text-secondary text-xs">match</div>
                </div>
              </div>
              <h3 className="font-heading text-lg text-white mb-1">{partner.name}</h3>
              <p className="text-text-secondary text-sm mb-2">{partner.sport} • {partner.skill}</p>
              <div className="flex items-center gap-1 text-text-secondary text-xs">
                <MapPin className="w-3 h-3" />
                {partner.distance} away
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Gyms */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-2xl text-white">NEARBY GYMS</h2>
          <Link href="/app/gyms" className="text-primary text-sm hover:underline">
            View All
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {demoGyms.map((gym) => (
            <div key={gym.id} className="bg-surface border border-border rounded-xl p-4 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                {gym.verified && (
                  <span className="bg-accent/20 text-accent text-xs px-2 py-1 rounded">
                    Verified
                  </span>
                )}
              </div>
              <h3 className="font-heading text-lg text-white mb-1">{gym.name}</h3>
              <div className="flex items-center gap-1 text-text-secondary text-sm mb-2">
                <Clock className="w-4 h-4" />
                {gym.openMat}
              </div>
              <div className="flex items-center gap-1 text-text-secondary text-xs">
                <MapPin className="w-3 h-3" />
                {gym.distance} away
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium CTA */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-heading text-xl text-white mb-2">UNLOCK PREMIUM</h3>
            <p className="text-text-secondary text-sm">
              Get access to exclusive open mat hours at 150+ partner gyms
            </p>
          </div>
          <Link 
            href="/app/settings" 
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Upgrade - $20/mo
          </Link>
        </div>
      </div>
    </div>
  )
}
