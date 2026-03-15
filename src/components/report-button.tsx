'use client'

import { useState } from 'react'
import { Flag, X, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from './toast'

const CATEGORIES = [
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'fake_profile', label: 'Fake Profile' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'underage', label: 'Underage User' },
  { value: 'other', label: 'Other' },
]

interface ReportButtonProps {
  reportedUserId?: number
  contentType: string
  contentId?: number
}

export default function ReportButton({ reportedUserId, contentType, contentId }: ReportButtonProps) {
  const toast = useToast()
  const [showModal, setShowModal] = useState(false)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!category) {
      setError('Please select a category')
      return
    }
    if (description.length < 10) {
      setError('Description must be at least 10 characters')
      return
    }
    if (description.length > 500) {
      setError('Description must be under 500 characters')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const res = await api.submitReport({
        reported_user_id: reportedUserId || undefined,
        content_type: contentType,
        content_id: contentId,
        category,
        description,
        evidence_url: evidenceUrl || undefined,
      })
      toast.success(res.message || 'Report submitted successfully')
      setShowModal(false)
      setCategory('')
      setDescription('')
      setEvidenceUrl('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit report'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setError('')
    setCategory('')
    setDescription('')
    setEvidenceUrl('')
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 text-text-secondary text-sm hover:text-yellow-400 transition-colors"
        title="Report"
      >
        <Flag className="w-3.5 h-3.5" />
        <span>Report</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
          <div className="relative bg-surface border border-border rounded-xl max-w-md w-full p-6 animate-slide-up">
            <button onClick={handleClose} className="absolute top-4 right-4 text-text-secondary hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Flag className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-heading text-xl text-white">REPORT CONTENT</h3>
                <p className="text-text-secondary text-sm">Help us keep the community safe</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label htmlFor="report-category" className="block text-text-secondary text-sm mb-2">Category *</label>
                <select
                  id="report-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white focus:border-primary transition-colors appearance-none"
                >
                  <option value="">Select a reason...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="report-description" className="block text-text-secondary text-sm mb-2">
                  Description * <span className="text-text-secondary/60">({description.length}/500)</span>
                </label>
                <textarea
                  id="report-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  placeholder="Please describe the issue in detail (minimum 10 characters)..."
                  rows={4}
                  className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Evidence URL */}
              <div>
                <label htmlFor="report-evidence" className="block text-text-secondary text-sm mb-2">Evidence URL (optional)</label>
                <input
                  id="report-evidence"
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-lg border border-border text-text-secondary hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!category || description.length < 10 || submitting}
                  className="flex-1 py-3 rounded-lg bg-yellow-600 text-white font-medium hover:bg-yellow-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
