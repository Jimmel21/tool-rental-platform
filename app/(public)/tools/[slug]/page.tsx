import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { getToolBySlug } from "@/lib/data/tool-by-slug";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { ToolDetailContent } from "./ToolDetailContent";
import { CheckAvailabilityBlock } from "./CheckAvailabilityBlock";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <div className="py-8">
      <Container>
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/tools" className="hover:text-gray-900">
            Tools
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/tools?category=${tool.category.slug}`} className="hover:text-gray-900">
            {tool.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{tool.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <ToolDetailContent
              name={tool.name}
              description={tool.description}
              images={tool.images}
              status={tool.status}
              brand={tool.brand}
              model={tool.model}
              conditionNotes={tool.conditionNotes}
              averageRating={tool.averageRating}
              reviewCount={tool.reviewCount}
              reviews={tool.reviews}
            />
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Pricing</h2>
                <AvailabilityBadge status={tool.status} />
              </div>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-2 text-gray-600">Daily rate</td>
                    <td className="py-2 text-right font-medium">
                      <PriceDisplay amount={tool.dailyRate} />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600">Weekly rate</td>
                    <td className="py-2 text-right font-medium">
                      <PriceDisplay amount={tool.weeklyRate} />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600">Deposit</td>
                    <td className="py-2 text-right font-medium">
                      <PriceDisplay amount={tool.depositAmount} />
                    </td>
                  </tr>
                </tbody>
              </table>
              <Link
                href={`/tools/${tool.slug}/book`}
                className="mt-4 flex w-full justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Book this tool
              </Link>
              <CheckAvailabilityBlock toolId={tool.id} toolSlug={tool.slug} />
            </div>

            {tool.owner && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-900">Owner</h3>
                <p className="mt-1 text-sm text-gray-600">{tool.owner.name}</p>
                <p className="mt-1 text-xs text-gray-500">Peer-to-peer listing</p>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}
