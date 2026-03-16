import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PublicNotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
          <Container className="max-w-md text-center">
            <p className="text-6xl font-bold text-gray-200 sm:text-8xl">404</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Page not found</h1>
            <p className="mt-2 text-gray-600">
              The page you’re looking for doesn’t exist or has been moved.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
              >
                Back to home
              </Link>
              <Link
                href="/tools"
                className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Browse tools
              </Link>
            </div>
          </Container>
        </div>
      </main>
      <Footer />
    </>
  );
}
