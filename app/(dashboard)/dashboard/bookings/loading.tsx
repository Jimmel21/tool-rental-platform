import { BookingCardSkeleton } from "@/components/ui/Skeleton";

export default function BookingsLoading() {
  return (
    <div className="mt-8 space-y-4">
      <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
      {Array.from({ length: 4 }).map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </div>
  );
}
