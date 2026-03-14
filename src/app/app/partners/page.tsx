'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Users, MapPin, Filter, Search } from 'lucide-react'
import api, { Partner } from '@/lib/api'
import { CardSkeleton } from '@/components/skeleton'
import { useToast } from '@/components/toast'
import AnimatedPartnerCard from '@/components/animated-partner-card'

const sportsList = ['All', 'Wrestling', 'MMA', 'BJJ', 'Boxing', 'Judo', 'Kickboxing', 'Muay Thai']
const skillLevels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Pro']

export default function PartnersPage() {
  const toast = useToast()
  const [partners, setPartners] = useState<Partner[]>([])
  const [filters, setFilters] = useState({ sport: 'All', skill: 'All', search: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadPartners = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getPartners({
        sport: filters.sport !== 'All' ? filters.sport : undefined,
        skill: filters.skill !== 'All' ? filters.skill : undefined,
        search: filters.search || undefined,
        limit: 50,
      })
      setPartners(data.partners || [])
    } catch {
      toast.error('Failed to load partners')
    } finally {
      setLoading(false)
    }
  }, [filters.sport, filters.skill, filters.search, toast])

  useEffect(() => {
    const timer = setTimeout(loadPartners, 300)
    return () => clearTimeout(timer)
  }, [loadPartners])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl text-white mb-2">FIND <span className="gradient-text">PARTNERS</span></h1>
          <p className="text-text-secondary">
            {partners.length} compatible partners found
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 lg:hidden bg-surface border border-border px-4 py-2 rounded-lg text-text-secondary"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by name, sport, or city..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            aria-label="Search by name, sport, or city"
            className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
          />
        </div>

        <div className={`lg:flex gap-4 ${showFilters ? 'flex' : 'hidden'}`}>
          <select
            value={filters.sport}
            onChange={(e) => setFilters({...filters, sport: e.target.value})}
            aria-label="Filter by sport"
            className="bg-surface border border-border rounded-lg py-3 px-4 text-white focus:border-primary transition-colors"
          >
            {sportsList.map(sport => (
              <option key={sport} value={sport}>{sport === 'All' ? 'All Sports' : sport}</option>
            ))}
          </select>

          <select
            value={filters.skill}
            onChange={(e) => setFilters({...filters, skill: e.target.value})}
            aria-label="Filter by skill level"
            className="bg-surface border border-border rounded-lg py-3 px-4 text-white focus:border-primary transition-colors"
          >
            {skillLevels.map(level => (
              <option key={level} value={level}>{level === 'All' ? 'All Levels' : level}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Partners Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-border rounded-xl p-8">
          <Users className="w-16 h-16 text-text-secondary mx-auto mb-4 animate-float" />
          <h3 className="font-heading text-xl text-white mb-2">No training partners found yet</h3>
          <p className="text-text-secondary mb-6">Complete your profile to get matched with training partners</p>
          <Link href="/app/profile" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Complete Profile
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner, index) => (
            <AnimatedPartnerCard
              key={partner.id}
              partner={partner}
              delay={index * 0.05}
            />
          ))}
        </div>
      )}

    </div>
  )
}
