export default function ProductCardSkeleton() {
  return (
    <div
      className="overflow-hidden flex flex-col relative animate-pulse bg-white border border-gray-200 rounded-2xl h-full shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
    >
      {/* Image Container Skeleton */}
      <div className="relative flex items-center justify-center h-40 overflow-hidden bg-gray-50 border-b border-gray-200">
        {/* Placeholder for center icon/image */}
        <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
      </div>

      {/* Info Container Skeleton */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        {/* Brand & Stock Skeleton */}
        <div className="flex items-center justify-between gap-2 text-[10px] leading-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-3 w-10 bg-gray-250 rounded-md" />
            <span className="w-0.5 h-0.5 rounded-full bg-gray-250 shrink-0" />
            <div className="h-3 w-12 bg-gray-250 rounded-md" />
          </div>
          <div className="h-3 w-12 bg-gray-250 rounded-md" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-1.5 py-0.5 min-h-[2.3rem]">
          <div className="h-3 w-full bg-gray-250 rounded-md" />
          <div className="h-3 w-4/5 bg-gray-250 rounded-md" />
        </div>

        {/* Rating Skeleton */}
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-16 bg-gray-250 rounded-md" />
        </div>

        {/* Specs Skeleton */}
        <div className="h-3 w-3/4 bg-gray-200 rounded-md mt-0.5" />

        {/* Price & Action Skeleton */}
        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-3 w-12 bg-gray-250 rounded-md" />
            <div className="h-5 w-20 bg-gray-250 rounded-md" />
          </div>
          <div className="h-9 w-9 bg-gray-250 rounded-full shrink-0" />
        </div>
      </div>
    </div>
  )
}
