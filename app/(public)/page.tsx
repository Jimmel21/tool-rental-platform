import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { HeroSearch } from "./HeroSearch";
import { PopularToolsCarousel } from "./PopularToolsCarousel";
import { getCategories } from "@/lib/data/categories";
import { getToolsList } from "@/lib/data/tools";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let popularTools: Awaited<ReturnType<typeof getToolsList>>["items"] = [];
  try {
    const [catList, toolsData] = await Promise.all([
      getCategories(),
      getToolsList({ page: 1, limit: 8, sort: "popular" }),
    ]);
    categories = catList;
    popularTools = toolsData.items;
  } catch {
    // DB may not have slug column yet; run: npx prisma migrate deploy
  }
  const featuredCategories = categories.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl md:text-6xl">
              Rent tools in Trinidad &amp; Tobago
            </h1>
            <p className="mt-4 text-lg text-muted">
              Browse equipment by the day or week. Book online, pick up or get
              delivery.
            </p>
            <div className="mt-8">
              <HeroSearch />
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/tools"
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
              >
                Browse all tools
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-primary bg-white px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary/5"
              >
                Create account
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured categories */}
      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-bold text-navy">
            Browse by category
          </h2>
          <p className="mt-1 text-muted">
            Find the right equipment for your project
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCategories.length > 0
              ? featuredCategories.map((c: { slug: string; name: string; description?: string | null; icon?: string | null; toolCount?: number }) => (
                  <CategoryCard
                    key={c.slug}
                    slug={c.slug}
                    name={c.name}
                    description={c.description}
                    icon={c.icon}
                    toolCount={c.toolCount}
                  />
                ))
              : Array.from({ length: 6 }).map((_, i) => (
                  <CategoryCard
                    key={i}
                    slug={`cat-${i}`}
                    name={`Category ${i + 1}`}
                    description="Tools for your project"
                    toolCount={0}
                  />
                ))}
          </div>
        </Container>
      </section>

      {/* Popular tools carousel */}
      <section className="bg-white py-16">
        <Container>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-navy">
              Popular tools
            </h2>
            <Link
              href="/tools"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <PopularToolsCarousel tools={popularTools} />
        </Container>
      </section>

      {/* How it works */}
      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-bold text-navy">How it works</h2>
          <p className="mt-1 text-muted">
            Rent in three simple steps
          </p>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mt-4 font-semibold text-navy">Browse</h3>
              <p className="mt-2 text-sm text-muted">
                Search by category or name. Compare rates and check availability.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mt-4 font-semibold text-navy">Book</h3>
              <p className="mt-2 text-sm text-muted">
                Pick your dates, pay the deposit online, and confirm your booking.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mt-4 font-semibold text-navy">Rent</h3>
              <p className="mt-2 text-sm text-muted">
                Collect from the owner or get delivery. Return when done.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust signals */}
      <section className="border-t border-gray-200 bg-white py-16">
        <Container>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex items-start gap-4">
              <span className="text-2xl" aria-hidden>✓</span>
              <div>
                <h3 className="font-semibold text-navy">Verified tools</h3>
                <p className="mt-1 text-sm text-muted">
                  Equipment checked and listed by trusted owners
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl" aria-hidden>🛡️</span>
              <div>
                <h3 className="font-semibold text-navy">Deposits protected</h3>
                <p className="mt-1 text-sm text-muted">
                  Secure payments. Refund when you return on time
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl" aria-hidden>💬</span>
              <div>
                <h3 className="font-semibold text-navy">WhatsApp support</h3>
                <p className="mt-1 text-sm text-muted">
                  Need help? Chat with us on WhatsApp +1 868 XXX XXXX
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
