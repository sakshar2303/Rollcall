export default function TrendingLoading() {
  return (
    <div className="min-h-screen w-full max-w-screen-xl mx-auto px-6 lg:px-10 pt-10 pb-24">
      {/* Page header skeleton */}
      <div className="flex flex-col gap-3 mb-12">
        <div className="shimmer h-6 w-32 rounded-full" />
        <div className="shimmer h-14 w-64 rounded-xl" />
        <div className="shimmer h-5 w-80 rounded" />
      </div>

      {/* Two playlist sections */}
      {[1, 2].map(section => (
        <div key={section} className="flex flex-col gap-6 mb-20">
          <div className="flex items-center gap-4 pb-4 border-b border-border/60">
            <div className="shimmer w-16 h-16 rounded-xl" />
            <div className="flex flex-col gap-2">
              <div className="shimmer h-6 w-48 rounded-lg" />
              <div className="shimmer h-4 w-72 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="shimmer w-7 h-7 rounded-full" />
                <div className="shimmer w-11 h-11 rounded-md shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="shimmer h-3 w-3/4 rounded" />
                  <div className="shimmer h-2.5 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
