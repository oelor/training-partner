'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CompatibilityData {
  category: string
  score: number
}

interface MatchCompatibilityChartProps {
  data: CompatibilityData[]
  overallMatch: number
}

export default function MatchCompatibilityChart({
  data,
  overallMatch,
}: MatchCompatibilityChartProps) {
  const getColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#3b82f6'
    if (score >= 40) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-surface border border-border rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="font-heading text-lg text-white mb-2">COMPATIBILITY MATCH</h3>
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="text-4xl font-heading text-accent"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.4 }}
          >
            {overallMatch}%
          </motion.div>
          <div className="flex-1">
            <div className="w-full bg-background rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-accent to-primary h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallMatch}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <p className="text-text-secondary text-xs mt-2">Overall compatibility score</p>
          </div>
        </motion.div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="category" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
