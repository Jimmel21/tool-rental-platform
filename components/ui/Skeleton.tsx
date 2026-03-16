interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      aria-hidden
    />
  );
}

export function ToolCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex gap-4">
        <Skeleton className="h-16 w-20 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-14" />
      </div>
    </div>
  );
}
