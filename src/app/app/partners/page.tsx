'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Users, MapPin, Filter, Search, X, UserSearch, ArrowRight } from 'lucide-react'
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

  const hasActiveFilters = filters.sport !== 'All' || filters.skill !== 'All' || filters.search !== ''

  const clearFilters = () => {
    setFilters({ sport: 'All', skill: 'All', search: '' })
  }

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
            {loading ? 'Searching...' : `${partners.length} compatible partner${partners.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 lg:hidden bg-surface border px-4 py-2 rounded-lg transition-colors ${
            hasActiveFilters ? 'border-primary text-primary' : 'border-border text-text-secondary'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
              {(filters.sport !== 'All' ? 1 : 0) + (filters.skill !== 'All' ? 1 : 0) + (filters.search ? 1 : 0)}
            </span>
          )}
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
            className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-10 text-white placeholder-text-secondary focus:border-primary transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({...filters, search: ''})}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className={`lg:flex gap-3 items-center ${showFilters ? 'flex flex-wrap' : 'hidden'}`}>
          <select
            value={filters.sport}
            onChange={(e) => setFilters({...filters, sport: e.target.value})}
            aria-label="Filter by sport"
            className={`bg-surface border rounded-lg py-3 px-4 text-white focus:border-primary transition-colors ${
              filters.sport !== 'All' ? 'border-primary' : 'border-border'
            }`}
          >
            {sportsList.map(sport => (
              <option key={sport} value={sport}>{sport === 'All' ? 'All Sports' : sport}</option>
            ))}
          </select>

          <select
            value={filters.skill}
            onChange={(e) => setFilters({...filters, skill: e.target.value})}
            aria-label="Filter by skill level"
            className={`bg-surface border rounded-lg py-3 px-4 text-white focus:border-primary transition-colors ${
              filters.skill !== 'All' ? 'border-primary' : 'border-border'
            }`}
          >
            {skillLevels.map(level => (
              <option key={level} value={level}>{level === 'All' ? 'All Levels' : level}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-primary text-sm hover:text-primary/80 transition-colors px-2 py-1"
            >
              <X className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Active filter chips on mobile */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 lg:hidden">
          {filters.sport !== 'All' && (
            <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs px-3 py-1.5 rounded-full">
              {filters.sport}
              <button onClick={() => setFilters({...filters, sport: 'All'})} aria-label={`Remove ${filters.sport} filter`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.skill !== 'All' && (
            <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs px-3 py-1.5 rounded-full">
              {filters.skill}
              <button onClick={() => setFilters({...filters, skill: 'All'})} aria-label={`Remove ${filters.skill} filter`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs px-3 py-1.5 rounded-full">
              &quot;{filters.search}&quot;
              <button onClick={() => setFilters({...filters, search: ''})} aria-label="Remove search filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Partners Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 sm:p-12 text-center">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
            {hasActiveFilters ? (
              <UserSearch className="w-10 h-10 text-text-secondary" />
            ) : (
              <Users className="w-10 h-10 text-text-secondary animate-float" />
            )}
          </div>
          {hasActiveFilters ? (
            <>
              <h3 className="font-heading text-2xl text-white mb-3">No matches for these filters</h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                Try broadening your search criteria or removing some filters to see more training partners.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Clear All Filters
              </button>
            </>
          ) : (
            <>
              <h3 className="font-heading text-2xl text-white mb-3">No training partners found yet</h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                Complete your profile with your sports, skill level, and location to get matched with compatible training partners in your area.
              </p>
              <Link href="/app/profile" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Complete Profile <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
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
