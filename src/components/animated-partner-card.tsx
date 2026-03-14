'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, MapPin, Zap } from 'lucide-react'
import { Partner } from '@/lib/api'

interface AnimatedPartnerCardProps {
  partner: Partner
  delay?: number
}

export default function AnimatedPartnerCard({
  partner,
  delay = 0,
}: AnimatedPartnerCardProps) {
  const matchPercent = partner.match ? Math.round(partner.match * 100) : null

  return (
    <Link href={`/app/partners/${partner.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}
        className="bg-surface border border-border rounded-xl overflow-hidden cursor-pointer h-full"
      >
        {/* Avatar Section */}
        <motion.div
          className="relative h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-20 h-20 bg-primary/30 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
            {partner.avatar_url ? (
              <img
                src={partner.avatar_url}
                alt={partner.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              partner.name?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          {matchPercent && (
            <motion.div
              className="absolute top-2 right-2 bg-accent/90 text-white px-2 py-1 rounded-lg text-xs font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.3 }}
            >
              {matchPercent}%
            </motion.div>
          )}
        </motion.div>

        {/* Content Section */}
        <div className="p-4">
          <motion.h3
            className="font-heading text-lg text-white mb-1 truncate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
          >
            {partner.name}
          </motion.h3>

          <motion.p
            className="text-text-secondary text-sm mb-3 line-clamp-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.25 }}
          >
            {partner.sport || 'Combat Sports'}
            {partner.skill ? ` • ${partner.skill}` : ''}
          </motion.p>

          {/* Stats Row */}
          <motion.div
            className="flex items-center gap-2 mb-3 text-xs text-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
          >
            {partner.city && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{partner.city}</span>
              </div>
            )}
            {partner.experience && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{partner.experience}y</span>
              </div>
            )}
          </motion.div>


        </div>
      </motion.div>
    </Link>
  )
}
