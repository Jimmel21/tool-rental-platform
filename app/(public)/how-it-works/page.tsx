import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Rent tools in Trinidad & Tobago in three simple steps: browse, book, and collect or get delivery.",
};

export default function HowItWorksPage() {
  return (
    <div className="py-12">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">How it works</h1>
        <p className="mt-4 text-gray-600">
          Renting a tool with Tool Rental TT is simple. Follow these steps from search to return.
        </p>

        <ol className="mt-10 space-y-10">
          <li className="flex gap-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">1</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Browse and choose</h2>
              <p className="mt-2 text-gray-600">
                Search by category or keyword on our <Link href="/tools" className="font-medium text-gray-900 underline">tools page</Link>. Check daily and weekly rates, deposit, and availability. When you find what you need, click to view full details and then &quot;Book this tool&quot;.
              </p>
            </div>
          </li>
          <li className="flex gap-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">2</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Book and pay</h2>
              <p className="mt-2 text-gray-600">
                Select your rental dates and choose pickup or delivery. You’ll see the total (rental + deposit + delivery if applicable). Complete the booking and pay online or arrange bank transfer. Once payment is confirmed, you’ll get a booking reference and next steps.
              </p>
            </div>
          </li>
          <li className="flex gap-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">3</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Collect, use, return</h2>
              <p className="mt-2 text-gray-600">
                On the start date, collect the tool from the owner or receive delivery. Use it for your project and return it by the end date in the same condition. Your deposit is released after a successful return. Need help? Contact us via WhatsApp.
              </p>
            </div>
          </li>
        </ol>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="font-semibold text-gray-900">Deposits and cancellations</h2>
          <p className="mt-2 text-sm text-gray-600">
            A deposit is required to secure the tool and is held until the tool is returned in good condition. You can cancel free of charge before the rental start date in line with our <Link href="/terms" className="font-medium text-gray-900 underline">terms</Link>.
          </p>
        </div>
      </Container>
    </div>
  );
}
