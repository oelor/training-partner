import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#FF4D00' }} />
        <p className="text-sm" style={{ color: '#A0A0A0' }}>Loading...</p>
      </div>
    </div>
  )
}
