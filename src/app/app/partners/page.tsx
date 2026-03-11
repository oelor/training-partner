'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, MapPin, MessageCircle, Filter, Search, X, Loader2 } from 'lucide-react'
import api, { Partner } from '@/lib/api'
import { CardSkeleton } from '@/components/skeleton'
import { useToast } from '@/components/toast'

const sportsList = ['All', 'Wrestling', 'MMA', 'BJJ', 'Boxing', 'Judo', 'Kickboxing', 'Muay Thai']
const skillLevels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Pro']

export default function PartnersPage() {
  const router = useRouter()
  const toast = useToast()
  const [partners, setPartners] = useState<Partner[]>([])
  const [filters, setFilters] = useState({ sport: 'All', skill: 'All', search: '' })
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
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

  const handleMessage = (partnerId: number) => {
    router.push(`/app/messages?user=${partnerId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl text-white mb-2">FIND PARTNERS</h1>
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
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by name, sport, or city..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
          />
        </div>

        <div className={`lg:flex gap-4 ${showFilters ? 'flex' : 'hidden'}`}>
          <select
            value={filters.sport}
            onChange={(e) => setFilters({...filters, sport: e.target.value})}
            className="bg-surface border border-border rounded-lg py-3 px-4 text-white focus:border-primary transition-colors"
          >
            {sportsList.map(sport => (
              <option key={sport} value={sport}>{sport === 'All' ? 'All Sports' : sport}</option>
            ))}
          </select>

          <select
            value={filters.skill}
            onChange={(e) => setFilters({...filters, skill: e.target.value})}
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
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="font-heading text-xl text-white mb-2">No partners found</h3>
          <p className="text-text-secondary">Try adjusting your filters or complete your profile to see matches</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-surface border border-border rounded-xl p-5 card-hover cursor-pointer"
              onClick={() => setSelectedPartner(partner)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                  {partner.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                {partner.match > 0 && (
                  <div className="text-right">
                    <div className="text-accent font-mono text-xl font-bold">{Math.round(partner.match * 100)}%</div>
                    <div className="text-text-secondary text-xs">match</div>
                  </div>
                )}
              </div>

              <h3 className="font-heading text-xl text-white mb-1">{partner.name}</h3>
              <p className="text-text-secondary text-sm mb-3">
                {partner.sport || partner.sports?.[0] || 'Combat Sports'} {partner.skill ? `• ${partner.skill}` : ''}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {partner.goals?.slice(0, 3).map(goal => (
                  <span key={goal} className="text-xs px-2 py-1 bg-background rounded-full text-text-secondary">
                    {goal}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1 text-text-secondary text-sm">
                <MapPin className="w-4 h-4" />
                {partner.city || partner.location || 'Unknown'} {partner.experience ? `• ${partner.experience} years exp.` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPartner(null)}>
          <div
            className="bg-surface border border-border rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  {selectedPartner.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-heading text-2xl text-white">{selectedPartner.name}</h3>
                  <p className="text-text-secondary">
                    {selectedPartner.sport || selectedPartner.sports?.[0]} {selectedPartner.skill ? `• ${selectedPartner.skill}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="text-text-secondary hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {selectedPartner.match > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Match Score</span>
                  <span className="text-accent font-mono font-bold">{Math.round(selectedPartner.match * 100)}%</span>
                </div>
              )}
              {selectedPartner.weight && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Weight Class</span>
                  <span className="text-white">{selectedPartner.weight}</span>
                </div>
              )}
              {selectedPartner.experience > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Experience</span>
                  <span className="text-white">{selectedPartner.experience} years</span>
                </div>
              )}
              {selectedPartner.city && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Location</span>
                  <span className="text-white">{selectedPartner.city}</span>
                </div>
              )}
              {selectedPartner.sports?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Sports</span>
                  <span className="text-white">{selectedPartner.sports.join(', ')}</span>
                </div>
              )}
              {selectedPartner.goals?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Training Goals</span>
                  <span className="text-white">{selectedPartner.goals.join(', ')}</span>
                </div>
              )}
            </div>

            {selectedPartner.bio && (
              <div className="border-t border-border pt-4 mb-6">
                <h4 className="text-text-secondary text-sm mb-2">About</h4>
                <p className="text-white">{selectedPartner.bio}</p>
              </div>
            )}

            <button
              onClick={() => handleMessage(selectedPartner.id)}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
