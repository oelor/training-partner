'use client'

import { useState, useEffect } from 'react'
import { Users, MapPin, MessageCircle, Filter, Search, X } from 'lucide-react'

// Demo partner data
const allPartners = [
  { id: '1', name: 'Mike Thompson', sport: 'Wrestling', skill: 'Advanced', weight: 'Featherweight', goals: ['Competition', 'Technique'], experience: 8, location: '2.3 mi', match: 95, bio: 'Former college wrestler looking for serious training partners.' },
  { id: '2', name: 'Sarah Johnson', sport: 'MMA', skill: 'Intermediate', weight: 'Flyweight', goals: ['Fitness', 'Sparring'], experience: 3, location: '4.1 mi', match: 88, bio: 'Balancing work and training. Looking for technical sparring.' },
  { id: '3', name: 'Carlos Rodriguez', sport: 'BJJ', skill: 'Advanced', weight: 'Lightweight', goals: ['Competition', 'Technique'], experience: 10, location: '1.8 mi', match: 82, bio: 'Brown belt looking to mix it up with wrestlers.' },
  { id: '4', name: 'James Wilson', sport: 'Boxing', skill: 'Intermediate', weight: 'Welterweight', goals: ['Fitness', 'Self-defense'], experience: 4, location: '5.2 mi', match: 75, bio: 'Boxing background, want to add clinch work.' },
  { id: '5', name: 'Lisa Chen', sport: 'Judo', skill: 'Advanced', weight: 'Middleweight', goals: ['Competition'], experience: 12, location: '3.7 mi', match: 71, bio: 'Olympic hopeful, need randori partners.' },
  { id: '6', name: 'David Kim', sport: 'MMA', skill: 'Beginner', weight: 'Heavyweight', goals: ['Fitness', 'Self-defense'], experience: 1, location: '6.1 mi', match: 65, bio: 'Just started, looking for patient partners.' },
  { id: '7', name: 'Amanda Foster', sport: 'Kickboxing', skill: 'Intermediate', weight: 'Featherweight', goals: ['Competition', 'Fitness'], experience: 5, location: '2.9 mi', match: 78, bio: 'Kicker looking to improve ground game.' },
  { id: '8', name: 'Marcus Brown', sport: 'Wrestling', skill: 'Pro', weight: 'Light Heavyweight', goals: ['Technique', 'Sparring'], experience: 15, location: '4.5 mi', match: 68, bio: 'Former pro, training for fun now.' },
]

const sportsList = ['All', 'Wrestling', 'MMA', 'BJJ', 'Boxing', 'Judo', 'Kickboxing']
const skillLevels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Pro']

export default function PartnersPage() {
  const [partners, setPartners] = useState(allPartners)
  const [filters, setFilters] = useState({ sport: 'All', skill: 'All', search: '' })
  const [selectedPartner, setSelectedPartner] = useState<typeof allPartners[0] | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let filtered = allPartners
    
    if (filters.sport !== 'All') {
      filtered = filtered.filter(p => p.sport === filters.sport)
    }
    if (filters.skill !== 'All') {
      filtered = filtered.filter(p => p.skill === filters.skill)
    }
    if (filters.search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.sport.toLowerCase().includes(filters.search.toLowerCase())
      )
    }
    
    setPartners(filtered)
  }, [filters])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl text-white mb-2">FIND PARTNERS</h1>
          <p className="text-text-secondary">
            {partners.length} compatible partners near you
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
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by name or sport..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="w-full bg-surface border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
          />
        </div>

        {/* Desktop Filters */}
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map((partner) => (
          <div 
            key={partner.id} 
            className="bg-surface border border-border rounded-xl p-5 card-hover cursor-pointer"
            onClick={() => setSelectedPartner(partner)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-accent font-mono text-xl font-bold">{partner.match}%</div>
                <div className="text-text-secondary text-xs">match</div>
              </div>
            </div>
            
            <h3 className="font-heading text-xl text-white mb-1">{partner.name}</h3>
            <p className="text-text-secondary text-sm mb-3">{partner.sport} • {partner.skill}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {partner.goals.map(goal => (
                <span key={goal} className="text-xs px-2 py-1 bg-background rounded-full text-text-secondary">
                  {goal}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-1 text-text-secondary text-sm">
              <MapPin className="w-4 h-4" />
              {partner.location} away • {partner.experience} years exp.
            </div>
          </div>
        ))}
      </div>

      {partners.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="font-heading text-xl text-white mb-2">No partners found</h3>
          <p className="text-text-secondary">Try adjusting your filters</p>
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
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl text-white">{selectedPartner.name}</h3>
                  <p className="text-text-secondary">{selectedPartner.sport} • {selectedPartner.skill}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="text-text-secondary hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-text-secondary">Match Score</span>
                <span className="text-accent font-mono font-bold">{selectedPartner.match}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Weight Class</span>
                <span className="text-white">{selectedPartner.weight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Experience</span>
                <span className="text-white">{selectedPartner.experience} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Location</span>
                <span className="text-white">{selectedPartner.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Training Goals</span>
                <span className="text-white">{selectedPartner.goals.join(', ')}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-6">
              <h4 className="text-text-secondary text-sm mb-2">About</h4>
              <p className="text-white">{selectedPartner.bio}</p>
            </div>

            <button className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
