'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface AnimatedSkillBadgeProps {
  icon: LucideIcon
  label: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'pro'
  delay?: number
}

const levelColors = {
  beginner: 'from-blue-500 to-blue-600',
  intermediate: 'from-green-500 to-green-600',
  advanced: 'from-yellow-500 to-yellow-600',
  pro: 'from-purple-500 to-purple-600',
}

const levelBgColors = {
  beginner: 'bg-blue-500/20',
  intermediate: 'bg-green-500/20',
  advanced: 'bg-yellow-500/20',
  pro: 'bg-purple-500/20',
}

export default function AnimatedSkillBadge({
  icon: Icon,
  label,
  level,
  delay = 0,
}: AnimatedSkillBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      className={`bg-gradient-to-br ${levelColors[level]} rounded-xl p-4 text-white shadow-lg cursor-pointer`}
    >
      <motion.div
        whileHover={{ rotate: 20 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-2"
      >
        <Icon className="w-6 h-6" />
      </motion.div>
      <h3 className="font-heading text-sm font-bold">{label}</h3>
      <p className="text-xs opacity-90 capitalize">{level}</p>
    </motion.div>
  )
}
