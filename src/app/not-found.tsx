import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background bg-pattern flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="font-heading text-8xl text-primary mb-4">404</div>
        <h1 className="font-heading text-3xl text-white mb-3">PAGE NOT FOUND</h1>
        <p className="text-text-secondary mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/app"
            className="bg-surface border border-border text-white px-6 py-3 rounded-lg font-medium hover:bg-background transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
