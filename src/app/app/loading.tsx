export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome Header skeleton */}
      <div>
        <div className="h-4 w-40 bg-border/50 rounded mb-2" />
        <div className="h-8 w-64 bg-border/50 rounded mb-2" />
        <div className="h-4 w-56 bg-border/50 rounded" />
      </div>

      {/* Weekly Activity skeleton */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="h-5 w-28 bg-border/50 rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-background rounded-lg p-4 text-center">
              <div className="w-5 h-5 bg-border/50 rounded mx-auto mb-2" />
              <div className="h-7 w-8 bg-border/50 rounded mx-auto mb-1" />
              <div className="h-3 w-14 bg-border/50 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-border/50 rounded-lg mx-auto mb-2" />
            <div className="h-4 w-20 bg-border/50 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Stats Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-border/50 rounded-lg" />
              <div className="h-4 w-16 bg-border/50 rounded" />
            </div>
            <div className="h-7 w-10 bg-border/50 rounded mb-1" />
            <div className="h-4 w-20 bg-border/50 rounded" />
          </div>
        ))}
      </div>

      {/* Action Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6">
            <div className="h-6 w-36 bg-border/50 rounded mb-2" />
            <div className="h-4 w-full bg-border/50 rounded" />
          </div>
        ))}
      </div>

      {/* Recent Sessions skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-7 w-44 bg-border/50 rounded" />
          <div className="h-4 w-16 bg-border/50 rounded" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-border/50 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-border/50 rounded mb-2" />
                <div className="h-3 w-28 bg-border/50 rounded" />
              </div>
              <div className="h-3 w-12 bg-border/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
