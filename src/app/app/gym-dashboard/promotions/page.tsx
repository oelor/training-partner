'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Tag, Calendar, Trash2, Edit2, X, Loader2, Megaphone } from 'lucide-react'
import api, { GymPromotion } from '@/lib/api'
import { useToast } from '@/components/toast'

const PROMO_TYPES = [
  { value: 'open_mat', label: 'Open Mat' },
  { value: 'trial', label: 'Free Trial' },
  { value: 'discount', label: 'Discount' },
  { value: 'event', label: 'Event' },
  { value: 'general', label: 'General' },
]

const TYPE_COLORS: Record<string, string> = {
  open_mat: 'bg-green-500/20 text-green-400 border-green-500/30',
  trial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  discount: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  event: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  general: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

function getTypeBadgeClass(type: string): string {
  return TYPE_COLORS[type] || TYPE_COLORS.general
}

function getTypeLabel(type: string): string {
  const found = PROMO_TYPES.find(t => t.value === type)
  return found ? found.label : type
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface FormData {
  title: string
  description: string
  type: string
  start_date: string
  end_date: string
}

const EMPTY_FORM: FormData = {
  title: '',
  description: '',
  type: 'general',
  start_date: '',
  end_date: '',
}

export default function PromotionsPage() {
  const toast = useToast()
  const [gymId, setGymId] = useState<number | null>(null)
  const [promotions, setPromotions] = useState<GymPromotion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  useEffect(() => {
    loadGymAndPromotions()
  }, [])

  async function loadGymAndPromotions() {
    try {
      const dashData = await api.getGymDashboardStats()
      const id = dashData.gym.id
      setGymId(id)
      const promoData = await api.getGymPromotions(id)
      setPromotions(promoData.promotions || [])
    } catch {
      toast.error('Failed to load promotions')
    } finally {
      setLoading(false)
    }
  }

  async function loadPromotions() {
    if (!gymId) return
    try {
      const data = await api.getGymPromotions(gymId)
      setPromotions(data.promotions || [])
    } catch {
      toast.error('Failed to refresh promotions')
    }
  }

  function openCreateForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  function openEditForm(promo: GymPromotion) {
    setForm({
      title: promo.title,
      description: promo.description || '',
      type: promo.type || 'general',
      start_date: promo.start_date ? promo.start_date.split('T')[0] : '',
      end_date: promo.end_date ? promo.end_date.split('T')[0] : '',
    })
    setEditingId(promo.id)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSubmitting(true)
    try {
      if (editingId) {
        await api.updatePromotion(editingId, {
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          type: form.type,
          start_date: form.start_date || undefined,
          end_date: form.end_date || undefined,
        })
        toast.success('Promotion updated')
      } else {
        if (!gymId) {
          toast.error('Gym not loaded')
          return
        }
        await api.createPromotion({
          gym_id: gymId,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          type: form.type,
          start_date: form.start_date || undefined,
          end_date: form.end_date || undefined,
        })
        toast.success('Promotion created')
      }
      closeForm()
      await loadPromotions()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save promotion'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(promoId: number) {
    setDeletingId(promoId)
    try {
      await api.deletePromotion(promoId)
      toast.success('Promotion deleted')
      setConfirmDeleteId(null)
      await loadPromotions()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete promotion'
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/app/gym-dashboard"
            className="text-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-heading text-3xl lg:text-4xl text-white">PROMOTIONS</h1>
            <p className="text-text-secondary text-sm">
              Create and manage promotions to attract members
            </p>
          </div>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Promotion
        </button>
      </div>

      {/* Create / Edit Form Panel */}
      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-xl text-white">
              {editingId ? 'EDIT PROMOTION' : 'CREATE PROMOTION'}
            </h2>
            <button
              onClick={closeForm}
              className="text-text-secondary hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="promo-title" className="block text-sm text-text-secondary mb-1.5">
                Title <span className="text-primary">*</span>
              </label>
              <input
                id="promo-title"
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Free Open Mat Saturday"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder-text-secondary focus:border-primary transition-colors outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="promo-desc" className="block text-sm text-text-secondary mb-1.5">
                Description
              </label>
              <textarea
                id="promo-desc"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your promotion..."
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder-text-secondary focus:border-primary transition-colors outline-none resize-none"
              />
            </div>

            <div>
              <label htmlFor="promo-type" className="block text-sm text-text-secondary mb-1.5">
                Type
              </label>
              <select
                id="promo-type"
                value={form.type}
                onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:border-primary transition-colors outline-none appearance-none"
              >
                {PROMO_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="promo-start" className="block text-sm text-text-secondary mb-1.5">
                  Start Date
                </label>
                <input
                  id="promo-start"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:border-primary transition-colors outline-none"
                />
              </div>
              <div>
                <label htmlFor="promo-end" className="block text-sm text-text-secondary mb-1.5">
                  End Date
                </label>
                <input
                  id="promo-end"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:border-primary transition-colors outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update Promotion' : 'Create Promotion'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="text-text-secondary hover:text-white px-4 py-2.5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promotions List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-border rounded w-1/3 mb-3" />
              <div className="h-4 bg-border rounded w-2/3 mb-2" />
              <div className="h-4 bg-border rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <Megaphone className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="font-heading text-xl text-white mb-2">No promotions yet</h3>
          <p className="text-text-secondary mb-6">
            Create one to attract members!
          </p>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Promotion
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {promotions.map(promo => (
            <div
              key={promo.id}
              className="bg-surface border border-border rounded-xl p-5 hover:border-border/80 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-heading text-lg text-white">{promo.title}</h3>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${getTypeBadgeClass(promo.type)}`}
                    >
                      <Tag className="w-3 h-3" />
                      {getTypeLabel(promo.type)}
                    </span>
                    {!promo.is_active && (
                      <span className="text-xs text-text-secondary bg-background px-2 py-0.5 rounded-full border border-border">
                        Inactive
                      </span>
                    )}
                  </div>
                  {promo.description && (
                    <p className="text-text-secondary text-sm mb-2">{promo.description}</p>
                  )}
                  {(promo.start_date || promo.end_date) && (
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <Calendar className="w-3.5 h-3.5" />
                      {promo.start_date && promo.end_date
                        ? `${formatDate(promo.start_date)} - ${formatDate(promo.end_date)}`
                        : promo.start_date
                          ? `Starts ${formatDate(promo.start_date)}`
                          : `Ends ${formatDate(promo.end_date)}`}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditForm(promo)}
                    className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-white px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  {confirmDeleteId === promo.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(promo.id)}
                        disabled={deletingId === promo.id}
                        className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-colors disabled:opacity-50"
                      >
                        {deletingId === promo.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-sm text-text-secondary hover:text-white px-2 py-1.5 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(promo.id)}
                      className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-red-400 px-3 py-1.5 rounded-lg border border-border hover:border-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
