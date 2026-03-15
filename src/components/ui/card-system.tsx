'use client'

import React from 'react'
import clsx from 'clsx'
import { getSportColor } from '@/lib/sport-colors'

// ============================================================
// GlassCard — subtle frosted glass effect
// ============================================================
export function GlassCard({
  children,
  className,
  hover = true,
  as: Component = 'div',
  ...props
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
  as?: React.ElementType
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Component
      className={clsx(
        'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm',
        hover && 'transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

// ============================================================
// SportCard — card with sport-colored accent
// ============================================================
export function SportCard({
  sport,
  children,
  className,
  hover = true,
  ...props
}: {
  sport: string
  children: React.ReactNode
  className?: string
  hover?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  const colors = getSportColor(sport)

  return (
    <div
      className={clsx(
        'rounded-2xl border-l-4 bg-white/5 backdrop-blur-sm border border-white/10',
        hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
      style={{
        borderLeftColor: colors.primary,
        ['--sport-glow' as string]: `${colors.primary}20`,
      }}
      onMouseEnter={(e) => {
        if (hover) {
          ;(e.currentTarget as HTMLElement).style.boxShadow = `0 10px 40px ${colors.primary}15`
        }
        props.onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        if (hover) {
          ;(e.currentTarget as HTMLElement).style.boxShadow = ''
        }
        props.onMouseLeave?.(e)
      }}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================
// StatCard — for stats/metrics with glassmorphism
// ============================================================
export function StatCard({
  value,
  label,
  icon,
  className,
}: {
  value: string
  label: string
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center',
        'transition-all duration-300 hover:bg-white/10 hover:border-white/20',
        className
      )}
    >
      {icon && (
        <div className="flex justify-center mb-3">
          {icon}
        </div>
      )}
      <div className="font-heading text-3xl sm:text-4xl text-primary mb-1">{value}</div>
      <div className="text-text-secondary text-sm">{label}</div>
    </div>
  )
}

// ============================================================
// SportBadge — small sport-colored badge/tag
// ============================================================
export function SportBadge({
  sport,
  className,
}: {
  sport: string
  className?: string
}) {
  const colors = getSportColor(sport)

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        colors.bg,
        colors.text,
        className
      )}
    >
      {sport}
    </span>
  )
}
