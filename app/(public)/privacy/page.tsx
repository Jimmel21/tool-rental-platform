import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Tool Rental TT — how we collect, use, and protect your data in Trinidad & Tobago.",
};

export default function PrivacyPage() {
  return (
    <div className="py-12">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString("en-TT")}</p>
        <div className="prose prose-gray mt-8 max-w-none space-y-6 text-gray-600">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Who we are</h2>
            <p>Tool Rental TT (“we”) operates the tool rental platform at this website. We are committed to protecting your privacy.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. Data we collect</h2>
            <p>We collect information you provide when you register, book, or contact us: name, email, phone, address (for delivery), and payment-related data. We also collect usage data (e.g. IP address, device type) and cookies for the operation of the site.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. How we use it</h2>
            <p>We use your data to provide the rental service, process payments, communicate about bookings, improve the platform, and comply with legal obligations. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Sharing</h2>
            <p>We may share your data with: (a) tool owners and renters as needed to fulfil bookings, (b) payment processors, (c) service providers who assist us (e.g. hosting), and (d) authorities when required by law.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Security</h2>
            <p>We use reasonable technical and organisational measures to protect your data. Passwords are hashed; payments are handled by secure providers. No method of transmission over the internet is 100% secure.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Your rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data where applicable by law. You can update your profile in your account or contact us. You may also opt out of marketing communications.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. Retention</h2>
            <p>We retain your data for as long as your account is active and as needed for legal, tax, or dispute purposes. Booking and payment records may be kept for several years as required.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">8. Contact</h2>
            <p>For privacy-related questions or requests, <Link href="/contact" className="font-medium text-gray-900 underline">contact us</Link>.</p>
          </section>
        </div>
        <p className="mt-10 text-sm text-gray-500">
          See also our <Link href="/terms" className="font-medium text-gray-900 underline">Terms of Service</Link>.
        </p>
      </Container>
    </div>
  );
}
