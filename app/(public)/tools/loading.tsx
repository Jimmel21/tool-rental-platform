import { Container } from "@/components/layout/Container";
import { ToolCardSkeleton } from "@/components/ui/Skeleton";

export default function ToolsLoading() {
  return (
    <div className="py-8">
      <Container>
        <div className="h-9 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ToolCardSkeleton key={i} />
          ))}
        </div>
      </Container>
    </div>
  );
}
