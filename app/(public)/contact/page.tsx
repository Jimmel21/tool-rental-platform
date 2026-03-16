import { Container } from "@/components/layout/Container";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { whatsAppMessageGeneral } from "@/lib/whatsapp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Tool Rental TT — WhatsApp, or send a message. We're here to help with tool rentals in Trinidad & Tobago.",
};

export default function ContactPage() {
  return (
    <div className="py-12">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900">Contact us</h1>
        <p className="mt-4 text-gray-600">
          Have a question about renting a tool, your booking, or the platform? We’re happy to help.
        </p>

        <div className="mt-10 rounded-xl border-2 border-[#25D366] bg-[#dcfce7] p-6">
          <h2 className="font-semibold text-gray-900">WhatsApp (fastest)</h2>
          <p className="mt-1 text-sm text-gray-600">
            Message us on WhatsApp for quick answers. We’ll open the app with a pre-filled greeting.
          </p>
          <div className="mt-4">
            <WhatsAppButton message={whatsAppMessageGeneral()} size="lg">
              Message us on WhatsApp
            </WhatsAppButton>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="font-semibold text-gray-900">Other enquiries</h2>
          <p className="mt-2 text-sm text-gray-600">
            For general enquiries you can also start a chat on WhatsApp using the button above. We aim to reply within one business day.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Tool Rental TT — Trinidad &amp; Tobago
          </p>
        </div>
      </Container>
    </div>
  );
}
