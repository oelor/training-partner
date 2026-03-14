'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface TrainingSession {
  date: number
  sport: string
  intensity: 'light' | 'moderate' | 'intense'
}

interface TrainingCalendarProps {
  sessions?: TrainingSession[]
}

export default function TrainingCalendar({ sessions = [] }: TrainingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'light':
        return 'bg-blue-500/30 border-blue-500/50'
      case 'moderate':
        return 'bg-yellow-500/30 border-yellow-500/50'
      case 'intense':
        return 'bg-red-500/30 border-red-500/50'
      default:
        return 'bg-surface'
    }
  }

  const getSessionForDate = (date: number) => {
    return sessions.find(s => s.date === date)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-surface border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-lg text-white">TRAINING CALENDAR</h3>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-1 hover:bg-background rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </motion.button>
          <span className="text-text-secondary text-sm min-w-[120px] text-center">{monthName}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-1 hover:bg-background rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </motion.button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs text-text-secondary font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty days */}
        {emptyDays.map(i => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days with sessions */}
        {days.map(day => {
          const session = getSessionForDate(day)
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: day * 0.01 }}
              whileHover={session ? { scale: 1.1 } : {}}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                transition-colors cursor-pointer
                ${session
                  ? `${getIntensityColor(session.intensity)} border`
                  : 'bg-background/50 text-text-secondary'
                }
              `}
            >
              <div className="text-center">
                <div className="text-white">{day}</div>
                {session && (
                  <div className="text-xs text-text-secondary mt-0.5">{session.sport.slice(0, 3)}</div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500/30 border border-blue-500/50 rounded" />
          <span className="text-text-secondary">Light</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500/30 border border-yellow-500/50 rounded" />
          <span className="text-text-secondary">Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500/30 border border-red-500/50 rounded" />
          <span className="text-text-secondary">Intense</span>
        </div>
      </div>
    </motion.div>
  )
}
