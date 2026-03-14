export default function MessagesLoading() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-pulse">
      {/* Header skeleton */}
      <div className="mb-4">
        <div className="h-8 w-36 bg-border/50 rounded" />
      </div>

      <div className="flex-1 flex bg-surface border border-border rounded-xl overflow-hidden min-h-0">
        {/* Conversation List skeleton */}
        <div className="w-full md:w-80 border-r border-border flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="h-5 w-28 bg-border/50 rounded" />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-border/50 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-border/50 rounded" />
                    <div className="h-3 w-8 bg-border/50 rounded" />
                  </div>
                  <div className="h-3 w-3/4 bg-border/50 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area skeleton - hidden on mobile */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center">
          <div className="w-16 h-16 bg-border/50 rounded-full mb-4" />
          <div className="h-5 w-40 bg-border/50 rounded mb-2" />
          <div className="h-4 w-64 bg-border/50 rounded" />
        </div>
      </div>
    </div>
  )
}
