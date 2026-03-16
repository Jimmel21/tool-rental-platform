import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Tool Rental TT — tool and equipment rental in Trinidad & Tobago.",
};

export default function TermsPage() {
  return (
    <div className="py-12">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString("en-TT")}</p>
        <div className="prose prose-gray mt-8 max-w-none space-y-6 text-gray-600">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Acceptance</h2>
            <p>By using Tool Rental TT (“the platform”), you agree to these terms. If you do not agree, do not use the service.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. Service</h2>
            <p>The platform facilitates tool and equipment rentals between renters and owners in Trinidad & Tobago. We do not own the tools; we connect users and process payments. Owners are responsible for the condition and legality of their listings.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. Bookings and payment</h2>
            <p>When you book, you agree to pay the total (rental + deposit + delivery if applicable). Payment is due as indicated (e.g. online or bank transfer). The deposit is held until the tool is returned in good condition. We may deduct from the deposit for damage, loss, or late return as set out in our policies.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Cancellation</h2>
            <p>Cancellation by the renter before the rental start date may be subject to a fee as stated at booking. After the rental has started, no refund is given for early return unless otherwise agreed. We reserve the right to cancel a booking if payment is not received or if the tool becomes unavailable.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Use and return</h2>
            <p>You must use the tool only for lawful purposes and return it by the agreed end date in the same condition (fair wear and tear excepted). Late returns may incur extra charges and affect your deposit.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Limitation of liability</h2>
            <p>To the fullest extent permitted by law, Tool Rental TT is not liable for indirect, incidental, or consequential loss arising from use of the platform or rented tools. Our total liability is limited to the amount you paid for the relevant booking.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. Changes</h2>
            <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance. For material changes we will notify users where practical.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">8. Contact</h2>
            <p>Questions about these terms? <Link href="/contact" className="font-medium text-gray-900 underline">Contact us</Link>.</p>
          </section>
        </div>
        <p className="mt-10 text-sm text-gray-500">
          See also our <Link href="/privacy" className="font-medium text-gray-900 underline">Privacy Policy</Link>.
        </p>
      </Container>
    </div>
  );
}
