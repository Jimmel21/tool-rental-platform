import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Tool Rental TT — your trusted tool and equipment rental service in Trinidad & Tobago.",
};

export default function AboutPage() {
  return (
    <div className="py-12">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">About Tool Rental TT</h1>
        <p className="mt-4 text-gray-600">
          Tool Rental TT connects people in Trinidad & Tobago with the equipment they need. Whether you’re a homeowner tackling a weekend project or a contractor looking for reliable gear, we make it easy to browse, book, and rent tools by the day or week.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-gray-900">Our mission</h2>
        <p className="mt-2 text-gray-600">
          We aim to reduce waste and cost by enabling sharing of quality equipment, while giving owners a simple way to earn from tools they don’t use every day.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-gray-900">Why rent with us</h2>
        <ul className="mt-2 list-inside list-disc space-y-2 text-gray-600">
          <li>Verified tools and trusted owners</li>
          <li>Clear pricing with daily and weekly rates</li>
          <li>Secure deposits and straightforward cancellation</li>
          <li>Pickup or delivery options</li>
          <li>WhatsApp support for quick questions</li>
        </ul>
        <p className="mt-8 text-gray-600">
          Have questions? <a href="/contact" className="font-medium text-gray-900 underline hover:no-underline">Get in touch</a> or message us on WhatsApp.
        </p>
      </Container>
    </div>
  );
}
