'use client'

import { useState } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from './toast'

const REASONS = [
  'Inappropriate behavior',
  'Fake profile',
  'Harassment or threats',
  'Spam',
  'Unsafe training practices',
  'Other',
]

interface ReportDialogProps {
  userId: number
  userName: string
  onClose: () => void
}

export default function ReportDialog({ userId, userName, onClose }: ReportDialogProps) {
  const toast = useToast()
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason) return
    setSubmitting(true)
    try {
      await api.reportUser(userId, reason, details || undefined)
      toast.success('Report submitted. We will review it promptly.')
      onClose()
    } catch {
      toast.error('Failed to submit report. Please try again.')
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

        <div className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-2">Reason *</label>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border transition-colors ${
                    reason === r
                      ? 'border-red-500 bg-red-500/10 text-white'
                      : 'border-border text-text-secondary hover:border-red-500/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">Additional details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context..."
              rows={3}
              className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors resize-none"
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
              disabled={!reason || submitting}
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
