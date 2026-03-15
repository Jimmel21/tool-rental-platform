import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/admin" className="text-xl font-semibold text-gray-900">
              Admin — Tool Rental TT
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/admin"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Admin Home
              </Link>
              <Link
                href="/"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Site
              </Link>
            </nav>
          </div>
        </Container>
      </header>
      <main>
        <Container className="py-8">{children}</Container>
      </main>
    </div>
  );
}
