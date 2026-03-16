import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { BottomTabBar } from "@/components/layout/BottomTabBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-backgroundLight">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <Container>
          <div className="flex h-14 items-center justify-between sm:h-16">
            <Link href="/dashboard" className="text-lg font-semibold text-gray-900 sm:text-xl">
              Tool Rental TT
            </Link>
            <DashboardNav />
          </div>
        </Container>
      </header>
      <main className="pb-20 md:pb-8">
        <Container className="py-6 md:py-8">{children}</Container>
      </main>
      <BottomTabBar />
    </div>
  );
}
