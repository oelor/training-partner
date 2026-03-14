'use client'

import { motion } from 'framer-motion'
import { MapPin, Navigation } from 'lucide-react'
import { useState } from 'react'

interface GymLocation {
  id: number
  name: string
  distance: number
  city: string
  sports: string[]
}

interface GymLocationFinderProps {
  gyms?: GymLocation[]
  userLocation?: { lat: number; lng: number }
}

export default function GymLocationFinder({
  gyms = [],
  userLocation,
}: GymLocationFinderProps) {
  const [selectedGym, setSelectedGym] = useState<number | null>(null)

  // Mock gyms if not provided
  const mockGyms: GymLocation[] = [
    { id: 1, name: 'Elite Combat Gym', distance: 0.8, city: 'Downtown', sports: ['BJJ', 'MMA'] },
    { id: 2, name: 'Wrestling Academy', distance: 1.2, city: 'Midtown', sports: ['Wrestling', 'Judo'] },
    { id: 3, name: 'Boxing Club', distance: 1.5, city: 'Uptown', sports: ['Boxing', 'Kickboxing'] },
    { id: 4, name: 'Martial Arts Center', distance: 2.1, city: 'Westside', sports: ['Karate', 'Muay Thai'] },
  ]

  const displayGyms = gyms.length > 0 ? gyms : mockGyms

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-surface border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-lg text-white">NEARBY GYMS</h3>
        {userLocation && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-primary text-sm hover:text-primary/80 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Use My Location
          </motion.button>
        )}
      </div>

      {/* Mock Map Container */}
      <motion.div
        className="relative w-full h-64 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg border border-border mb-6 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* User location marker */}
        {userLocation && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-primary/30 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="w-4 h-4 bg-primary rounded-full border-2 border-white" />
            </div>
          </motion.div>
        )}

        {/* Gym markers */}
        {displayGyms.map((gym, index) => (
          <motion.div
            key={gym.id}
            className="absolute cursor-pointer"
            style={{
              left: `${20 + (index % 2) * 60}%`,
              top: `${30 + (index % 3) * 30}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => setSelectedGym(gym.id)}
          >
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                selectedGym === gym.id
                  ? 'bg-accent border-white'
                  : 'bg-primary/80 border-primary'
              }`}
              animate={selectedGym === gym.id ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <MapPin className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Gym List */}
      <div className="space-y-2">
        {displayGyms.map((gym, index) => (
          <motion.button
            key={gym.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedGym(gym.id)}
            whileHover={{ x: 5 }}
            className={`
              w-full text-left p-3 rounded-lg transition-colors
              ${selectedGym === gym.id
                ? 'bg-primary/20 border border-primary'
                : 'bg-background border border-border hover:border-primary/50'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">{gym.name}</h4>
                <p className="text-xs text-text-secondary mt-1">
                  {gym.distance} km away • {gym.city}
                </p>
                <div className="flex gap-1 mt-2">
                  {gym.sports.map(sport => (
                    <span key={sport} className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
              <motion.div
                animate={selectedGym === gym.id ? { rotate: 360 } : {}}
                transition={{ duration: 0.6 }}
              >
                <MapPin className="w-5 h-5 text-primary" />
              </motion.div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
