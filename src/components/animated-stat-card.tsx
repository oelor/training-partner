'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface AnimatedStatCardProps {
  icon: LucideIcon
  label: string
  value: number | string
  color: 'primary' | 'blue' | 'green' | 'yellow'
  delay?: number
}

const colorMap = {
  primary: { bg: 'bg-primary/20', text: 'text-primary', icon: 'text-primary' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: 'text-blue-400' },
  green: { bg: 'bg-green-500/20', text: 'text-green-400', icon: 'text-green-400' },
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: 'text-yellow-400' },
}

export default function AnimatedStatCard({
  icon: Icon,
  label,
  value,
  color,
  delay = 0,
}: AnimatedStatCardProps) {
  const colors = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, translateY: -5 }}
      className="bg-surface border border-border rounded-xl p-6 cursor-pointer"
    >
      <motion.div
        className="flex items-center gap-3 mb-2"
        whileHover={{ x: 5 }}
      >
        <motion.div
          className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}
          whileHover={{ rotate: 10 }}
        >
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </motion.div>
        <span className="text-text-secondary text-sm">{label}</span>
      </motion.div>
      <motion.div
        className="font-heading text-2xl text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: delay + 0.2 }}
      >
        {value}
      </motion.div>
      <div className="text-text-secondary text-sm">Active</div>
    </motion.div>
  )
}
