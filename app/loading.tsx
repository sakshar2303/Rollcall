export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-64px)] w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Left hero skeleton */}
      <div className="flex flex-col justify-center px-8 py-16 lg:px-14 xl:px-20 bg-card">
        <div className="max-w-xl flex flex-col gap-5">
          <div className="shimmer h-6 w-40 rounded-full" />
          <div className="flex flex-col gap-3">
            <div className="shimmer h-12 w-4/5 rounded-xl" />
            <div className="shimmer h-12 w-3/5 rounded-xl" />
            <div className="shimmer h-12 w-2/3 rounded-xl" />
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="shimmer h-4 w-full rounded" />
            <div className="shimmer h-4 w-5/6 rounded" />
            <div className="shimmer h-4 w-4/6 rounded" />
          </div>
          <div className="flex flex-col gap-3 mt-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="shimmer w-6 h-6 rounded-full" />
                <div className="shimmer h-3 w-32 rounded" />
                <div className="shimmer h-3 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right upload zone skeleton */}
      <div className="flex flex-col justify-center px-8 py-16 lg:px-14 bg-background">
        <div className="w-full max-w-xl mx-auto lg:mx-0 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="shimmer h-7 w-48 rounded-lg" />
            <div className="shimmer h-4 w-64 rounded" />
          </div>
          <div className="shimmer w-full h-80 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
