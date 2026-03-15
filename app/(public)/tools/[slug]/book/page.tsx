import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getToolBySlug } from "@/lib/data/tool-by-slug";
import { Container } from "@/components/layout/Container";
import { BookingForm } from "./BookingForm";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
}

export default async function BookPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;
  const resolvedSearch = await searchParams;

  if (!session?.user?.id) {
    const callbackPath = `/tools/${slug}/book`;
    const q = new URLSearchParams();
    if (resolvedSearch.start) q.set("start", resolvedSearch.start);
    if (resolvedSearch.end) q.set("end", resolvedSearch.end);
    const callbackUrl = q.toString() ? `${callbackPath}?${q.toString()}` : callbackPath;
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const { start, end } = resolvedSearch;

  const tool = await getToolBySlug(slug);
  if (!tool) redirect("/tools");

  return (
    <div className="py-8">
      <Container>
        <h1 className="text-2xl font-bold text-gray-900">Book: {tool.name}</h1>
        <p className="mt-1 text-gray-600">Choose dates and delivery option</p>
        <BookingForm
          tool={{
            id: tool.id,
            slug: tool.slug,
            name: tool.name,
            dailyRate: tool.dailyRate,
            depositAmount: tool.depositAmount,
          }}
          defaultStart={start ?? undefined}
          defaultEnd={end ?? undefined}
        />
      </Container>
    </div>
  );
}
