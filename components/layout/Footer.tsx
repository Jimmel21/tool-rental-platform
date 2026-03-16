import Link from "next/link";
import { Container } from "./Container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <Container>
        <div className="py-12 md:flex md:items-center md:justify-between">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:order-2">
            <Link href="/" className="text-sm text-muted hover:text-primary">Home</Link>
            <Link href="/tools" className="text-sm text-muted hover:text-primary">Browse Tools</Link>
            <Link href="/about" className="text-sm text-muted hover:text-primary">About</Link>
            <Link href="/how-it-works" className="text-sm text-muted hover:text-primary">How it works</Link>
            <Link href="/faq" className="text-sm text-muted hover:text-primary">FAQ</Link>
            <Link href="/contact" className="text-sm text-muted hover:text-primary">Contact</Link>
            <Link href="/terms" className="text-sm text-muted hover:text-primary">Terms</Link>
            <Link href="/privacy" className="text-sm text-muted hover:text-primary">Privacy</Link>
            <Link href="/login" className="text-sm text-muted hover:text-primary">Log in</Link>
          </div>
          <p className="mt-8 text-center text-sm text-muted md:order-1 md:mt-0">
            &copy; {currentYear} Tool Rental TT. Trinidad &amp; Tobago.
          </p>
        </div>
      </Container>
    </footer>
  );
}
