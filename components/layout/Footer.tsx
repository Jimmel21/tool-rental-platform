import Link from "next/link";
import { Container } from "./Container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <Container>
        <div className="py-12 md:flex md:items-center md:justify-between">
          <div className="flex justify-center gap-6 md:order-2">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Home
            </Link>
            <Link
              href="/tools"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Browse Tools
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Log in
            </Link>
          </div>
          <p className="mt-8 text-center text-sm text-gray-500 md:order-1 md:mt-0">
            &copy; {currentYear} Tool Rental TT. Trinidad &amp; Tobago.
          </p>
        </div>
      </Container>
    </footer>
  );
}
