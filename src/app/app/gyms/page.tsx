'use client'

import { useState } from 'react'
import { MapPin, Clock, Shield, Phone, Mail, Calendar, Star, X, Lock } from 'lucide-react'

// Demo gym data
const allGyms = [
  { 
    id: '1', 
    name: 'Iron Temple MMA', 
    address: '123 Champion Way',
    city: 'Los Angeles, CA',
    phone: '(555) 123-4567',
    email: 'contact@irontemple.com',
    sports: ['MMA', 'BJJ', 'Wrestling'],
    amenities: ['Showers', 'Locker Room', 'Parking', 'Pro Shop'],
    openMatHours: [
      { day: 'Saturday', time: '10:00 AM - 2:00 PM', slots: 20 },
      { day: 'Sunday', time: '9:00 AM - 12:00 PM', slots: 15 },
    ],
    price: '$20/drop-in',
    distance: '1.2 mi',
    verified: true,
    rating: 4.8,
    premium: true,
    description: 'Premier MMA facility with world-class coaching and training equipment.'
  },
  { 
    id: '2', 
    name: 'Grappling Factory', 
    address: '456 Mat Street',
    city: 'Los Angeles, CA',
    phone: '(555) 234-5678',
    email: 'info@grapplingfactory.com',
    sports: ['BJJ', 'Judo'],
    amenities: ['Mat Space', 'Weight Room', 'Coffee Bar'],
    openMatHours: [
      { day: 'Sunday', time: '9:00 AM - 12:00 PM', slots: 25 },
      { day: 'Wednesday', time: '7:00 PM - 9:00 PM', slots: 18 },
    ],
    price: '$15/drop-in',
    distance: '3.5 mi',
    verified: true,
    rating: 4.6,
    premium: false,
    description: 'Traditional grappling-focused gym with experienced instructors.'
  },
  { 
    id: '3', 
    name: 'Knucklehead Boxing', 
    address: '789 Punch Ave',
    city: 'Los Angeles, CA',
    phone: '(555) 345-6789',
    email: 'train@knucklehead.com',
    sports: ['Boxing', 'Kickboxing'],
    amenities: ['Ring', 'Heavy Bags', 'Sparring Area'],
    openMatHours: [
      { day: 'Monday', time: '6:00 PM - 8:00 PM', slots: 12 },
      { day: 'Thursday', time: '6:00 PM - 8:00 PM', slots: 12 },
    ],
    price: '$10/drop-in',
    distance: '4.2 mi',
    verified: true,
    rating: 4.5,
    premium: false,
    description: 'Old-school boxing gym with authentic atmosphere.'
  },
  { 
    id: '4', 
    name: 'Elite Wrestling Club', 
    address: '321 Mat Blvd',
    city: 'Los Angeles, CA',
    phone: '(555) 456-7890',
    email: 'info@elitewrestling.com',
    sports: ['Wrestling', 'MMA'],
    amenities: ['Mat Space', 'Strength Room', 'Video Analysis'],
    openMatHours: [
      { day: 'Tuesday', time: '7:00 PM - 9:00 PM', slots: 30 },
      { day: 'Thursday', time: '7:00 PM - 9:00 PM', slots: 30 },
      { day: 'Saturday', time: '10:00 AM - 1:00 PM', slots: 40 },
    ],
    price: '$25/month',
    distance: '2.8 mi',
    verified: true,
    rating: 4.9,
    premium: true,
    description: 'Competition-focused wrestling club with Olympic-level coaching.'
  },
  { 
    id: '5', 
    name: 'Zen Combat Academy', 
    address: '555 Harmony Lane',
    city: 'Los Angeles, CA',
    phone: '(555) 567-8901',
    email: 'zen@combatacademy.com',
    sports: ['MMA', 'BJJ', 'Muay Thai'],
    amenities: ['Cage', 'Sauna', 'Lounge', 'NFT'],
    openMatHours: [
      { day: 'Friday', time: '8:00 PM - 10:00 PM', slots: 16 },
    ],
    price: '$30/drop-in',
    distance: '5.1 mi',
    verified: true,
    rating: 4.7,
    premium: true,
    description: 'Modern facility with premium amenities and diverse training options.'
  },
]

export default function GymsPage() {
  const [selectedGym, setSelectedGym] = useState<typeof allGyms[0] | null>(null)
  const [isPremium] = useState(false) // Would come from user subscription

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl text-white mb-2">PARTNER GYMS</h1>
          <p className="text-text-secondary">
            {allGyms.length} verified gyms with open mat hours
          </p>
        </div>
        
        {!isPremium && (
          <div className="bg-primary/20 border border-primary/50 px-4 py-2 rounded-lg text-sm">
            <span className="text-white">Upgrade to Premium </span>
            <span className="text-text-secondary">to access all open mat hours</span>
          </div>
        )}
      </div>

      {/* Premium Notice */}
      <div className="bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-accent" />
          <div>
            <span className="text-white font-medium">Premium Feature: </span>
            <span className="text-text-secondary">Upgrade to access exclusive open mat hours at all partner gyms</span>
          </div>
        </div>
      </div>

      {/* Gyms Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {allGyms.map((gym) => (
          <div 
            key={gym.id} 
            className={`bg-surface border rounded-xl p-5 card-hover cursor-pointer ${
              gym.premium && !isPremium ? 'border-accent/50' : 'border-border'
            }`}
            onClick={() => setSelectedGym(gym)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-14 h-14 bg-accent/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-7 h-7 text-accent" />
              </div>
              <div className="flex items-center gap-2">
                {gym.verified && (
                  <span className="bg-accent/20 text-accent text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
                {gym.premium && (
                  <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                    Premium
                  </span>
                )}
              </div>
            </div>
            
            <h3 className="font-heading text-xl text-white mb-1">{gym.name}</h3>
            <p className="text-text-secondary text-sm mb-3">{gym.city}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {gym.sports.map(sport => (
                <span key={sport} className="text-xs px-2 py-1 bg-background rounded-full text-text-secondary">
                  {sport}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {gym.rating}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {gym.distance}
              </span>
            </div>
            
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-white font-medium">{gym.price}</span>
              <span className="text-primary text-sm">{gym.openMatHours.length} open mat sessions</span>
            </div>
          </div>
        ))}
      </div>

      {/* Gym Detail Modal */}
      {selectedGym && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedGym(null)}>
          <div 
            className="bg-surface border border-border rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl text-white">{selectedGym.name}</h3>
                  <p className="text-text-secondary">{selectedGym.city}</p>
                </div>
              </div>
              <button onClick={() => setSelectedGym(null)} className="text-text-secondary hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Premium Lock */}
            {selectedGym.premium && !isPremium && (
              <div className="bg-accent/20 border border-accent/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-accent" />
                  <div>
                    <span className="text-white font-medium">Premium Content </span>
                    <span className="text-text-secondary">- Upgrade to access this gym's open mat hours</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-text-secondary text-sm mb-2">About</h4>
                <p className="text-white">{selectedGym.description}</p>
              </div>

              {/* Contact */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-text-secondary" />
                  <span className="text-white">{selectedGym.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-text-secondary" />
                  <span className="text-white">{selectedGym.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-text-secondary" />
                  <span className="text-white">{selectedGym.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-white">{selectedGym.rating} rating</span>
                </div>
              </div>

              {/* Sports & Amenities */}
              <div className="flex flex-wrap gap-2">
                {selectedGym.sports.map(sport => (
                  <span key={sport} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                    {sport}
                  </span>
                ))}
                {selectedGym.amenities.map(amenity => (
                  <span key={amenity} className="px-3 py-1 bg-background border border-border text-text-secondary rounded-full text-sm">
                    {amenity}
                  </span>
                ))}
              </div>

              {/* Open Mat Hours */}
              <div>
                <h4 className="text-text-secondary text-sm mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Open Mat Hours
                </h4>
                <div className="space-y-2">
                  {selectedGym.openMatHours.map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-background rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-white">{session.day} {session.time}</span>
                      </div>
                      <span className="text-text-secondary text-sm">{session.slots} slots available</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-secondary">Drop-in Rate</span>
                  <span className="text-white font-heading text-2xl">{selectedGym.price}</span>
                </div>
                
                {selectedGym.premium && !isPremium ? (
                  <button className="w-full bg-accent text-background py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" />
                    Upgrade to Access
                  </button>
                ) : (
                  <button className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Book Open Mat Session
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
