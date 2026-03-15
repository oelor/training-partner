'use client'

import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'

// ============================================================
// Shared empty state wrapper
// ============================================================
function EmptyStateWrapper({
  children,
  text,
  subtext,
  ctaText,
  ctaHref,
  className,
}: {
  children: React.ReactNode
  text: string
  subtext?: string
  ctaText?: string
  ctaHref?: string
  className?: string
}) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="animate-float mb-6">
        {children}
      </div>
      <p className="text-white font-medium text-lg mb-2">{text}</p>
      {subtext && <p className="text-text-secondary text-sm max-w-md mb-6">{subtext}</p>}
      {ctaText && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-heading hover:bg-primary/90 transition-colors"
        >
          {ctaText}
        </Link>
      )}
    </div>
  )
}

// ============================================================
// NoMatches — person looking around/searching
// ============================================================
export function NoMatches({
  ctaHref = '/app/profile',
  ctaText = 'UPDATE PROFILE',
  className,
}: {
  ctaHref?: string
  ctaText?: string
  className?: string
}) {
  return (
    <EmptyStateWrapper
      text="No matches yet"
      subtext="Update your profile to find compatible training partners in your area."
      ctaText={ctaText}
      ctaHref={ctaHref}
      className={className}
    >
      <svg viewBox="0 0 200 200" className="w-48 h-48 text-text-secondary" fill="currentColor" aria-hidden="true">
        {/* Person looking around / searching */}
        <ellipse cx="100" cy="52" rx="14" ry="16" opacity="0.3" />
        {/* Torso */}
        <path d="M 88 66 L 112 66 L 116 86 L 118 108 L 110 114 L 90 114 L 82 108 L 84 86 Z" opacity="0.3" />
        {/* Hand shading eyes — searching */}
        <path d="M 88 72 L 72 66 L 60 62 L 52 60 Q 48 58 50 55 Q 54 56 58 60 L 68 64 L 80 70 Z" opacity="0.3" />
        <path d="M 50 55 L 44 54 Q 40 53 42 50 Q 46 50 48 54 Z" opacity="0.3" />
        {/* Other arm relaxed */}
        <path d="M 112 72 L 124 80 L 130 90 L 132 98 Q 133 102 129 102 Q 127 98 128 94 L 124 84 L 116 76 Z" opacity="0.3" />
        {/* Legs */}
        <path d="M 90 114 L 82 134 L 76 154 L 72 168 Q 70 174 74 176 L 82 176 Q 84 174 80 172 L 76 172 L 80 156 L 86 138 L 92 120 Z" opacity="0.3" />
        <path d="M 110 114 L 118 134 L 124 154 L 128 168 Q 130 174 126 176 L 118 176 Q 116 174 120 172 L 124 172 L 120 156 L 114 138 L 108 120 Z" opacity="0.3" />
        {/* Search circle accent */}
        <circle cx="148" cy="44" r="18" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.15" />
        <line x1="160" y1="56" x2="172" y2="68" stroke="currentColor" strokeWidth="3" opacity="0.15" strokeLinecap="round" />
      </svg>
    </EmptyStateWrapper>
  )
}

// ============================================================
// NoMessages — two people back-to-back
// ============================================================
export function NoMessages({
  ctaHref = '/app/partners',
  ctaText = 'BROWSE PARTNERS',
  className,
}: {
  ctaHref?: string
  ctaText?: string
  className?: string
}) {
  return (
    <EmptyStateWrapper
      text="No messages yet"
      subtext="Start a conversation with a training partner to coordinate sessions."
      ctaText={ctaText}
      ctaHref={ctaHref}
      className={className}
    >
      <svg viewBox="0 0 200 200" className="w-48 h-48 text-text-secondary" fill="currentColor" aria-hidden="true">
        {/* Left figure — facing left */}
        <ellipse cx="70" cy="60" rx="12" ry="14" opacity="0.25" />
        <path d="M 62 72 L 78 72 L 82 90 L 82 108 L 76 114 L 62 114 L 56 108 L 58 90 Z" opacity="0.25" />
        <path d="M 62 78 L 50 72 L 42 68 Q 38 66 40 62 Q 44 64 46 68 L 56 74 Z" opacity="0.25" />
        <path d="M 62 114 L 56 134 L 52 154 L 50 168 Q 48 174 52 176 L 60 176 Z" opacity="0.25" />
        <path d="M 76 114 L 80 134 L 82 154 L 84 168 Q 86 174 82 176 L 74 176 Z" opacity="0.25" />
        {/* Right figure — facing right */}
        <ellipse cx="130" cy="60" rx="12" ry="14" opacity="0.25" />
        <path d="M 122 72 L 138 72 L 142 90 L 142 108 L 136 114 L 122 114 L 116 108 L 118 90 Z" opacity="0.25" />
        <path d="M 138 78 L 150 72 L 158 68 Q 162 66 160 62 Q 156 64 154 68 L 144 74 Z" opacity="0.25" />
        <path d="M 122 114 L 118 134 L 116 154 L 114 168 Q 112 174 116 176 L 124 176 Z" opacity="0.25" />
        <path d="M 136 114 L 140 134 L 144 154 L 146 168 Q 148 174 144 176 L 136 176 Z" opacity="0.25" />
        {/* Speech bubble dots */}
        <circle cx="46" cy="46" r="3" opacity="0.15" />
        <circle cx="38" cy="40" r="2.5" opacity="0.12" />
        <circle cx="32" cy="35" r="2" opacity="0.08" />
        <circle cx="154" cy="46" r="3" opacity="0.15" />
        <circle cx="162" cy="40" r="2.5" opacity="0.12" />
        <circle cx="168" cy="35" r="2" opacity="0.08" />
      </svg>
    </EmptyStateWrapper>
  )
}

// ============================================================
// NoEvents — empty mat/ring
// ============================================================
export function NoEvents({
  ctaHref,
  ctaText,
  className,
}: {
  ctaHref?: string
  ctaText?: string
  className?: string
}) {
  return (
    <EmptyStateWrapper
      text="No upcoming events"
      subtext="Check back soon or create your own training event."
      ctaText={ctaText}
      ctaHref={ctaHref}
      className={className}
    >
      <svg viewBox="0 0 200 200" className="w-48 h-48 text-text-secondary" fill="currentColor" aria-hidden="true">
        {/* Empty mat / ring shape */}
        <ellipse cx="100" cy="130" rx="70" ry="25" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15" />
        <ellipse cx="100" cy="130" rx="55" ry="20" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
        {/* Corner posts */}
        <rect x="32" y="100" width="4" height="35" rx="2" opacity="0.15" />
        <rect x="164" y="100" width="4" height="35" rx="2" opacity="0.15" />
        {/* Ropes */}
        <path d="M 36 108 Q 100 98 168 108" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
        <path d="M 36 118 Q 100 108 168 118" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
        {/* Calendar icon floating above */}
        <rect x="80" y="48" width="40" height="36" rx="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <line x1="80" y1="58" x2="120" y2="58" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <line x1="90" y1="44" x2="90" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
        <line x1="110" y1="44" x2="110" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
        {/* Calendar X */}
        <line x1="92" y1="66" x2="108" y2="78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.15" />
        <line x1="108" y1="66" x2="92" y2="78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.15" />
      </svg>
    </EmptyStateWrapper>
  )
}

// ============================================================
// NoBookings — calendar with person
// ============================================================
export function NoBookings({
  ctaHref = '/app/coaching',
  ctaText = 'BROWSE COACHES',
  className,
}: {
  ctaHref?: string
  ctaText?: string
  className?: string
}) {
  return (
    <EmptyStateWrapper
      text="No bookings yet"
      subtext="Browse coaches to book a private session or group class."
      ctaText={ctaText}
      ctaHref={ctaHref}
      className={className}
    >
      <svg viewBox="0 0 200 200" className="w-48 h-48 text-text-secondary" fill="currentColor" aria-hidden="true">
        {/* Person silhouette */}
        <ellipse cx="80" cy="60" rx="12" ry="14" opacity="0.25" />
        <path d="M 72 72 L 88 72 L 92 90 L 92 108 L 86 114 L 72 114 L 66 108 L 68 90 Z" opacity="0.25" />
        <path d="M 72 114 L 66 134 L 62 154 L 60 168 Q 58 174 62 176 L 70 176 Z" opacity="0.25" />
        <path d="M 86 114 L 90 134 L 94 154 L 96 168 Q 98 174 94 176 L 86 176 Z" opacity="0.25" />
        {/* Calendar beside person */}
        <rect x="110" y="55" width="50" height="45" rx="5" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <line x1="110" y1="68" x2="160" y2="68" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <line x1="122" y1="50" x2="122" y2="60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.2" />
        <line x1="148" y1="50" x2="148" y2="60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.2" />
        {/* Empty calendar rows */}
        <rect x="118" y="74" width="8" height="6" rx="1" opacity="0.1" />
        <rect x="131" y="74" width="8" height="6" rx="1" opacity="0.1" />
        <rect x="144" y="74" width="8" height="6" rx="1" opacity="0.1" />
        <rect x="118" y="84" width="8" height="6" rx="1" opacity="0.1" />
        <rect x="131" y="84" width="8" height="6" rx="1" opacity="0.1" />
        <rect x="144" y="84" width="8" height="6" rx="1" opacity="0.1" />
        {/* Arrow connecting person to calendar */}
        <path d="M 92 85 L 106 80" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.15" strokeDasharray="4 3" />
      </svg>
    </EmptyStateWrapper>
  )
}

// ============================================================
// NoTeams — scattered figures
// ============================================================
export function NoTeams({
  ctaHref,
  ctaText,
  className,
}: {
  ctaHref?: string
  ctaText?: string
  className?: string
}) {
  return (
    <EmptyStateWrapper
      text="No teams yet"
      subtext="Create a team or join one to train with a consistent group."
      ctaText={ctaText}
      ctaHref={ctaHref}
      className={className}
    >
      <svg viewBox="0 0 200 200" className="w-48 h-48 text-text-secondary" fill="currentColor" aria-hidden="true">
        {/* Scattered small figures */}
        {/* Figure 1 - top left */}
        <ellipse cx="50" cy="55" rx="8" ry="9" opacity="0.2" />
        <path d="M 44 63 L 56 63 L 58 76 L 58 88 L 54 92 L 46 92 L 42 88 L 43 76 Z" opacity="0.2" />
        <path d="M 46 92 L 43 106 L 42 118 Z" opacity="0.2" />
        <path d="M 54 92 L 57 106 L 58 118 Z" opacity="0.2" />

        {/* Figure 2 - top right */}
        <ellipse cx="150" cy="48" rx="8" ry="9" opacity="0.15" />
        <path d="M 144 56 L 156 56 L 158 69 L 158 81 L 154 85 L 146 85 L 142 81 L 143 69 Z" opacity="0.15" />
        <path d="M 146 85 L 143 99 L 142 111 Z" opacity="0.15" />
        <path d="M 154 85 L 157 99 L 158 111 Z" opacity="0.15" />

        {/* Figure 3 - bottom center */}
        <ellipse cx="100" cy="80" rx="8" ry="9" opacity="0.25" />
        <path d="M 94 88 L 106 88 L 108 101 L 108 113 L 104 117 L 96 117 L 92 113 L 93 101 Z" opacity="0.25" />
        <path d="M 96 117 L 93 131 L 92 143 Z" opacity="0.25" />
        <path d="M 104 117 L 107 131 L 108 143 Z" opacity="0.25" />

        {/* Figure 4 - bottom left */}
        <ellipse cx="60" cy="110" rx="7" ry="8" opacity="0.12" />
        <path d="M 55 117 L 65 117 L 67 128 L 67 138 L 63 141 L 57 141 L 53 138 L 54 128 Z" opacity="0.12" />

        {/* Figure 5 - bottom right */}
        <ellipse cx="140" cy="105" rx="7" ry="8" opacity="0.12" />
        <path d="M 135 112 L 145 112 L 147 123 L 147 133 L 143 136 L 137 136 L 133 133 L 134 123 Z" opacity="0.12" />

        {/* Dashed connection lines */}
        <line x1="58" y1="70" x2="92" y2="85" stroke="currentColor" strokeWidth="1" opacity="0.08" strokeDasharray="4 4" />
        <line x1="108" y1="85" x2="142" y2="65" stroke="currentColor" strokeWidth="1" opacity="0.08" strokeDasharray="4 4" />
        <line x1="96" y1="110" x2="68" y2="115" stroke="currentColor" strokeWidth="1" opacity="0.08" strokeDasharray="4 4" />
        <line x1="108" y1="110" x2="133" y2="112" stroke="currentColor" strokeWidth="1" opacity="0.08" strokeDasharray="4 4" />
      </svg>
    </EmptyStateWrapper>
  )
}
