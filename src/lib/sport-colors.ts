// Sport color system — shared across the entire app
// Each sport has a consistent color palette for branding, accents, and UI elements

export interface SportColor {
  primary: string
  secondary: string
  gradient: string
  bg: string
  text: string
  border: string
  glow: string
}

export const sportColors: Record<string, SportColor> = {
  bjj: { primary: '#3B82F6', secondary: '#1D4ED8', gradient: 'from-blue-500 to-blue-700', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' },
  wrestling: { primary: '#EF4444', secondary: '#B91C1C', gradient: 'from-red-500 to-red-700', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', glow: 'shadow-red-500/20' },
  boxing: { primary: '#F59E0B', secondary: '#D97706', gradient: 'from-amber-500 to-amber-700', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
  mma: { primary: '#F97316', secondary: '#EA580C', gradient: 'from-orange-500 to-orange-700', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' },
  muay_thai: { primary: '#14B8A6', secondary: '#0D9488', gradient: 'from-teal-500 to-teal-700', bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30', glow: 'shadow-teal-500/20' },
  judo: { primary: '#8B5CF6', secondary: '#7C3AED', gradient: 'from-violet-500 to-violet-700', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', glow: 'shadow-violet-500/20' },
  kickboxing: { primary: '#EC4899', secondary: '#DB2777', gradient: 'from-pink-500 to-pink-700', bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30', glow: 'shadow-pink-500/20' },
  karate: { primary: '#F43F5E', secondary: '#E11D48', gradient: 'from-rose-500 to-rose-700', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', glow: 'shadow-rose-500/20' },
  taekwondo: { primary: '#06B6D4', secondary: '#0891B2', gradient: 'from-cyan-500 to-cyan-700', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20' },
  default: { primary: '#A855F7', secondary: '#9333EA', gradient: 'from-purple-500 to-purple-700', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-purple-500/20' },
}

/**
 * Get the sport color palette for a given sport name.
 * Handles various input formats: "Muay Thai", "muay-thai", "MUAY_THAI", "Brazilian Jiu-Jitsu" -> "bjj"
 */
export function getSportColor(sport: string): SportColor {
  const normalized = sport.toLowerCase().replace(/[\s-]/g, '_')

  // Handle common aliases
  if (normalized === 'brazilian_jiu_jitsu' || normalized === 'jiu_jitsu') {
    return sportColors.bjj
  }

  return sportColors[normalized] || sportColors.default
}

/**
 * Get inline gradient style for backgrounds/overlays
 */
export function getSportGradientStyle(sport: string): React.CSSProperties {
  const c = getSportColor(sport)
  return { background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})` }
}

/**
 * Get the sport key normalized for lookups
 */
export function normalizeSportKey(sport: string): string {
  const normalized = sport.toLowerCase().replace(/[\s-]/g, '_')
  if (normalized === 'brazilian_jiu_jitsu' || normalized === 'jiu_jitsu') return 'bjj'
  return normalized
}
