export default function ProductCardSkeleton() {
  return (
    <div
      className="overflow-hidden flex flex-col relative animate-pulse bg-white border border-gray-200 rounded-2xl h-full shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
    >
      {/* Image Container Skeleton */}
      <div className="relative flex items-center justify-center h-52 overflow-hidden bg-gray-50 border-b border-gray-200">
        {/* Placeholder for center icon/image */}
        <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
      </div>

      {/* Info Container Skeleton */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Brand & Stock Skeleton */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-3.5 w-12 bg-gray-200 rounded-md" />
            <span className="w-0.5 h-0.5 rounded-full bg-gray-200 shrink-0" />
            <div className="h-3.5 w-10 bg-gray-200 rounded-md" />
          </div>
          <div className="h-3.5 w-14 bg-gray-200 rounded-md" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-1.5 py-1 min-h-[2.5rem]">
          <div className="h-3.5 w-full bg-gray-200 rounded-md" />
          <div className="h-3.5 w-3/4 bg-gray-200 rounded-md" />
        </div>

        {/* Rating Skeleton */}
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-20 bg-gray-200 rounded-md" />
          <div className="h-3.5 w-6 bg-gray-200 rounded-md" />
        </div>

        {/* Attributes Skeleton */}
        <div className="flex flex-wrap gap-1 mt-0.5">
          <div className="h-5 w-12 bg-gray-150 rounded-md" />
          <div className="h-5 w-14 bg-gray-150 rounded-md" />
        </div>

        {/* Price & Actions Skeleton */}
        <div className="mt-auto pt-2 flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <div className="h-6 w-24 bg-gray-200 rounded-md" />
            <div className="h-4 w-12 bg-gray-200 rounded-md" />
          </div>
          <div className="h-[38px] w-full bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
