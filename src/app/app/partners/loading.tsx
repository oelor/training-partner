export default function PartnersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-9 w-48 bg-border/50 rounded mb-2" />
        <div className="h-4 w-40 bg-border/50 rounded" />
      </div>

      {/* Search & Filters skeleton */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 h-12 bg-surface border border-border rounded-lg" />
        <div className="hidden lg:flex gap-4">
          <div className="h-12 w-36 bg-surface border border-border rounded-lg" />
          <div className="h-12 w-36 bg-surface border border-border rounded-lg" />
        </div>
      </div>

      {/* Partner Cards Grid skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-border/50 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-border/50 rounded" />
                <div className="h-3 w-1/2 bg-border/50 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-border/50 rounded" />
            <div className="h-4 w-2/3 bg-border/50 rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-border/50 rounded-full" />
              <div className="h-6 w-16 bg-border/50 rounded-full" />
              <div className="h-6 w-16 bg-border/50 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
