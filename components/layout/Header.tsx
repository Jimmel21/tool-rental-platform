import Link from "next/link";
import { Container } from "./Container";
import { SearchBar } from "@/components/ui/SearchBar";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <Container>
        <div className="flex h-16 flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Tool Rental TT
          </Link>
          <div className="hidden w-64 max-w-[40%] md:block">
            <SearchBar placeholder="Search tools…" className="w-full" />
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Home
            </Link>
            <Link
              href="/tools"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Browse Tools
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Register
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
