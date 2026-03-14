'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  color: 'primary' | 'accent' | 'green' | 'yellow'
}

interface FeatureShowcaseProps {
  features: Feature[]
}

const colorMap = {
  primary: 'from-primary/20 to-primary/5 border-primary/30',
  accent: 'from-accent/20 to-accent/5 border-accent/30',
  green: 'from-green-500/20 to-green-500/5 border-green-500/30',
  yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
}

const iconColorMap = {
  primary: 'text-primary',
  accent: 'text-accent',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
}

export default function FeatureShowcase({ features }: FeatureShowcaseProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {features.map((feature, index) => {
        const Icon = feature.icon
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}
            className={`bg-gradient-to-br ${colorMap[feature.color]} border rounded-xl p-6 cursor-pointer group`}
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mb-4"
            >
              <div className={`w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center ${iconColorMap[feature.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
            </motion.div>

            <h3 className="font-heading text-lg text-white mb-2 group-hover:text-primary transition-colors">
              {feature.title}
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {feature.description}
            </p>

            {/* Animated accent line */}
            <motion.div
              className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              viewport={{ once: true }}
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}
