import Link from 'next/link'

export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="font-heading text-6xl text-primary mb-4">404</div>
      <h1 className="font-heading text-2xl text-white mb-3">PAGE NOT FOUND</h1>
      <p className="text-text-secondary text-sm mb-8 text-center max-w-md">
        This page doesn&apos;t exist. It may have been moved or removed.
      </p>
      <Link
        href="/app"
        className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
