export function PageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse" role="status" aria-label="Loading page content">
      {/* Hero skeleton */}
      <div className="h-[60vh] bg-muted/20 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-xl px-6">
          <div className="h-10 bg-muted/40 rounded-lg w-3/4 mx-auto" />
          <div className="h-5 bg-muted/30 rounded w-1/2 mx-auto" />
          <div className="flex gap-3 justify-center pt-4">
            <div className="h-10 w-28 bg-muted/40 rounded-lg" />
            <div className="h-10 w-28 bg-muted/40 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {[1, 2, 3].map((section) => (
          <div key={section} className="space-y-4">
            <div className="h-8 bg-muted/30 rounded w-48" />
            <div className="h-4 bg-muted/20 rounded w-full" />
            <div className="h-4 bg-muted/20 rounded w-5/6" />
            <div className="h-4 bg-muted/20 rounded w-4/6" />
          </div>
        ))}
      </div>
    </div>
  )
}
