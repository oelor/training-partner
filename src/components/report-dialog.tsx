'use client'

import { useState } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from './toast'

const CATEGORIES = [
  { value: 'harassment', label: 'Harassment or threats' },
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'underage', label: 'Underage user' },
  { value: 'other', label: 'Other' },
]

interface ReportDialogProps {
  userId: number
  userName: string
  onClose: () => void
  contentType?: string
  contentId?: number
}

export default function ReportDialog({ userId, userName, onClose, contentType = 'profile', contentId }: ReportDialogProps) {
  const toast = useToast()
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!category) return
    if (description.length < 10) {
      setError('Please provide at least 10 characters of detail')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await api.submitReport({
        reported_user_id: userId,
        content_type: contentType,
        content_id: contentId,
        category,
        description,
        evidence_url: evidenceUrl || undefined,
      })
      toast.success(res.message || 'Report submitted. We will review it promptly.')
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit report. Please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-xl max-w-md w-full p-6 animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-heading text-xl text-white">REPORT USER</h3>
            <p className="text-text-secondary text-sm">Report {userName}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-2">Reason *</label>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border transition-colors ${
                    category === cat.value
                      ? 'border-red-500 bg-red-500/10 text-white'
                      : 'border-border text-text-secondary hover:border-red-500/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="report-details" className="block text-text-secondary text-sm mb-2">
              Details * <span className="text-text-secondary/60">({description.length}/500, min 10)</span>
            </label>
            <textarea
              id="report-details"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder="Please describe the issue in detail..."
              rows={3}
              className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors resize-none"
            />
          </div>

          <div>
            <label htmlFor="report-evidence-url" className="block text-text-secondary text-sm mb-2">Evidence URL (optional)</label>
            <input
              id="report-evidence-url"
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-border text-text-secondary hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!category || description.length < 10 || submitting}
              className="flex-1 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Submit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
