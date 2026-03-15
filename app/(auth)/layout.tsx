import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <Container>
          <div className="flex h-16 items-center">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              Tool Rental TT
            </Link>
          </div>
        </Container>
      </header>
      <main className="py-12">
        <Container className="max-w-md">{children}</Container>
      </main>
    </div>
  );
}
