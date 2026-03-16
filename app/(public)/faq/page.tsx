import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about renting tools in Trinidad & Tobago with Tool Rental TT.",
};

const faqs = [
  {
    q: "How do I rent a tool?",
    a: "Browse our tools, select your dates, choose pickup or delivery, and complete the booking. You can pay online or by bank transfer. Once payment is confirmed, you'll receive your booking reference and pickup or delivery details.",
  },
  {
    q: "What is the deposit for?",
    a: "The deposit secures the tool and covers potential damage or loss. It is held for the duration of the rental and released when the tool is returned in good condition. If there is damage, we may deduct from the deposit and will explain the reason.",
  },
  {
    q: "Can I cancel my booking?",
    a: "Yes. You can cancel before the rental start date. Our terms explain any cancellation fees. Once the rental has started, cancellations are handled case by case — contact us via WhatsApp.",
  },
  {
    q: "Do you deliver?",
    a: "Yes. Many listings offer delivery for an extra fee based on your area. Select \"Delivery\" when booking and choose your zone. You'll enter your address and the fee will be added to your total.",
  },
  {
    q: "What if the tool is faulty or not as described?",
    a: "Contact us immediately via WhatsApp with your booking reference. We will work with you and the owner to resolve the issue, which may include a replacement, partial refund, or full refund depending on the situation.",
  },
  {
    q: "How do I return the tool?",
    a: "Return the tool to the owner by the end date and time agreed (usually the same location as pickup). Ensure it's clean and in the same condition. The owner will confirm receipt and we will release your deposit shortly after.",
  },
];

export default function FAQPage() {
  return (
    <div className="py-12">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">Frequently asked questions</h1>
        <p className="mt-4 text-gray-600">
          Common questions about renting tools with Tool Rental TT. Can’t find your answer? <a href="/contact" className="font-medium text-gray-900 underline">Contact us</a>.
        </p>
        <dl className="mt-10 space-y-8">
          {faqs.map((faq, i) => (
            <div key={i}>
              <dt className="font-semibold text-gray-900">{faq.q}</dt>
              <dd className="mt-2 text-gray-600">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  );
}
