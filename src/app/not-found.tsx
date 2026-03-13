import Link from 'next/link'
import { Users, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0D0D0D' }}>
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="font-heading text-8xl" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#FF4D00', letterSpacing: '0.05em' }}>
            404
          </span>
        </div>

        <h1 className="font-heading text-3xl text-white mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
          PAGE NOT FOUND
        </h1>

        <p className="mb-8" style={{ color: '#A0A0A0' }}>
          Looks like this page tapped out. Let&apos;s get you back on the mat.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: '#FF4D00' }}
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>

          <Link
            href="/app/partners"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: '#1F1F1F', border: '1px solid #333333' }}
          >
            <Search className="w-4 h-4" />
            Find Partners
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2" style={{ color: '#666' }}>
          <Users className="w-4 h-4" />
          <span className="text-sm">Training Partner</span>
        </div>
      </div>
    </div>
  )
}
