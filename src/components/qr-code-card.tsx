'use client'

import { useState, useRef, useCallback } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Copy, RefreshCw, CheckCircle, Loader2, QrCode } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/toast'

interface QrCodeCardProps {
  checkinCode: string
  gymName: string
  radiusM: number
  onCodeRegenerated?: (newCode: string) => void
}

export default function QrCodeCard({ checkinCode, gymName, radiusM, onCodeRegenerated }: QrCodeCardProps) {
  const toast = useToast()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const checkinUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://trainingpartner.app'}/checkin/${checkinCode}`

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return

    // Create a new canvas with padding and branding
    const exportCanvas = document.createElement('canvas')
    const padding = 40
    const textHeight = 60
    exportCanvas.width = canvas.width + padding * 2
    exportCanvas.height = canvas.height + padding * 2 + textHeight

    const ctx = exportCanvas.getContext('2d')
    if (!ctx) return

    // White background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

    // QR code
    ctx.drawImage(canvas, padding, padding)

    // Gym name
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(gymName, exportCanvas.width / 2, canvas.height + padding + 30)

    // "Scan to check in" text
    ctx.fillStyle = '#666666'
    ctx.font = '12px sans-serif'
    ctx.fillText('Scan to check in — trainingpartner.app', exportCanvas.width / 2, canvas.height + padding + 50)

    // Download
    const link = document.createElement('a')
    link.download = `${gymName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-qr-checkin.png`
    link.href = exportCanvas.toDataURL('image/png')
    link.click()

    toast.success('QR code downloaded!')
  }, [gymName, toast])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(checkinUrl)
      setCopied(true)
      toast.success('Check-in link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }, [checkinUrl, toast])

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true)
    try {
      const res = await api.regenerateCheckinCode()
      if (res.ok && res.checkin_code) {
        onCodeRegenerated?.(res.checkin_code)
        toast.success('Check-in code regenerated! Old QR codes will no longer work.')
        setShowConfirm(false)
      }
    } catch {
      toast.error('Failed to regenerate code. You can only regenerate once per hour.')
    } finally {
      setRegenerating(false)
    }
  }, [onCodeRegenerated, toast])

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
          <QrCode className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading text-lg text-white">QR CHECK-IN</h3>
          <p className="text-text-secondary text-xs">Print or display this code at your gym</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-4" ref={canvasRef}>
        <div className="bg-white rounded-xl p-4">
          <QRCodeCanvas
            value={checkinUrl}
            size={200}
            level="H"
            includeMargin={false}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>
      </div>

      {/* Info */}
      <div className="text-center mb-4">
        <p className="text-text-secondary text-xs">Check-in radius: {radiusM}m</p>
        <code className="text-text-secondary text-xs font-mono block mt-1 truncate">{checkinUrl}</code>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 bg-surface border border-border text-white py-2.5 rounded-lg text-sm font-medium hover:border-primary/50 transition-colors"
        >
          {copied ? <CheckCircle className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* Regenerate */}
      {showConfirm ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-xs mb-2">
            This will invalidate the current QR code. Anyone with the old code will need the new one.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {regenerating ? 'Regenerating...' : 'Confirm Regenerate'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 bg-surface border border-border text-text-secondary py-2 rounded-lg text-xs font-medium hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full text-text-secondary text-xs hover:text-white transition-colors py-2 flex items-center justify-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Regenerate Code
        </button>
      )}
    </div>
  )
}
