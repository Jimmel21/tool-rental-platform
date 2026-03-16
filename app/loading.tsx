import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  );
}
