import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function TermsPage() {
  return (
    <div className="py-12">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Terms and Conditions
        </h1>
        <p className="mt-2 text-gray-600">
          Placeholder. Add your terms of service and privacy policy here.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-block text-sm font-medium text-gray-900 hover:underline"
        >
          ← Back to registration
        </Link>
      </Container>
    </div>
  );
}
