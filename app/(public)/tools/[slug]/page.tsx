import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { getToolBySlug } from "@/lib/data/tool-by-slug";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { ToolDetailContent } from "./ToolDetailContent";
import { CheckAvailabilityBlock } from "./CheckAvailabilityBlock";
import { ToolDetailStickyBar } from "./ToolDetailStickyBar";
import { getWhatsAppUrl, whatsAppMessageToolInterest } from "@/lib/whatsapp";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolrental.tt";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return { title: "Tool not found" };
  const title = `${tool.name} — Rent in Trinidad & Tobago`;
  const description =
    tool.description?.slice(0, 155) ??
    `Rent ${tool.name} in Trinidad & Tobago. From ${tool.dailyRate} TTD/day.`;
  const image = tool.images?.[0] ? (tool.images[0].startsWith("http") ? tool.images[0] : `${siteUrl}${tool.images[0]}`) : undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/tools/${tool.slug}`,
      type: "website",
      images: image ? [{ url: image, alt: tool.name }] : undefined,
    },
  };
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tool.name,
    description: tool.description ?? undefined,
    image: tool.images?.filter((u) => u.startsWith("http")) ?? [],
    brand: tool.brand ? { "@type": "Brand", name: tool.brand } : undefined,
    offers: {
      "@type": "Offer",
      price: tool.dailyRate,
      priceCurrency: "TTD",
      availability: tool.status === "AVAILABLE" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      tool.averageRating != null && tool.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: tool.averageRating,
            reviewCount: tool.reviewCount,
          }
        : undefined,
  };

  return (
    <div className="py-8 pb-24 md:pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Container>
        <nav className="mb-6 text-sm text-muted">
          <Link href="/tools" className="hover:text-primary">
            Tools
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/tools?category=${tool.category.slug}`} className="hover:text-primary">
            {tool.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-navy">{tool.name}</span>
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
                <h2 className="font-semibold text-navy">Pricing</h2>
                <AvailabilityBadge status={tool.status} />
              </div>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-2 text-muted">Daily rate</td>
                    <td className="py-2 text-right font-medium">
                      <PriceDisplay amount={tool.dailyRate} />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-muted">Weekly rate</td>
                    <td className="py-2 text-right font-medium">
                      <PriceDisplay amount={tool.weeklyRate} />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-muted">Deposit</td>
                    <td className="py-2 text-right font-medium">
                      <PriceDisplay amount={tool.depositAmount} />
                    </td>
                  </tr>
                </tbody>
              </table>
              <Link
                href={`/tools/${tool.slug}/book`}
                className="mt-4 flex w-full justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary/90"
              >
                Book this tool
              </Link>
              <a
                href={getWhatsAppUrl(whatsAppMessageToolInterest(tool.name))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-3 text-sm font-medium text-white hover:bg-[#20BD5A]"
              >
                Ask about this tool on WhatsApp
              </a>
              <CheckAvailabilityBlock toolId={tool.id} toolSlug={tool.slug} />
            </div>

            {tool.owner && (
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-navy">Owner</h3>
                <p className="mt-1 text-sm text-muted">{tool.owner.name}</p>
                <p className="mt-1 text-xs text-muted">Peer-to-peer listing</p>
              </div>
            )}
          </aside>
        </div>
      </Container>
      <ToolDetailStickyBar toolSlug={tool.slug} dailyRate={tool.dailyRate} />
    </div>
  );
}
