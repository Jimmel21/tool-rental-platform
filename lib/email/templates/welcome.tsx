import { renderLayout } from "./base";

export interface WelcomeEmailProps {
  name: string;
  toolsUrl?: string;
  contactUrl?: string;
}

export function renderWelcomeEmail(
  props: WelcomeEmailProps
): { subject: string; html: string; text: string } {
  const { name, toolsUrl = "/tools", contactUrl = "/contact" } =
    props;

  const subject = "Welcome to Tool Rental TT";

  const html = renderLayout({
    title: subject,
    previewText: "Browse and book tools across Trinidad & Tobago.",
    children: `
      <p>Hi ${name},</p>
      <p>Welcome to <strong>Tool Rental TT</strong> — your marketplace for renting tools and equipment across Trinidad & Tobago.</p>

      <p style="margin:0 0 8px 0;">With your account you can:</p>
      <ul style="margin:0 0 12px 18px;padding:0;font-size:14px;">
        <li>Browse tools by category, brand, or keyword</li>
        <li>Compare daily rates, deposits, and delivery options</li>
        <li>Book online and track your bookings in your dashboard</li>
      </ul>

      <p style="margin:0 0 12px 0;">Start by browsing tools and shortlisting what you need for your next project.</p>

      <p style="margin:16px 0 12px 0;">
        <a href="${toolsUrl}" class="btn">Browse tools</a>
      </p>

      <p style="margin-top:12px;">If you ever get stuck, just reply to this email or WhatsApp us and we’ll help.</p>
    `,
  });

  const text = [
    `Hi ${name},`,
    ``,
    `Welcome to Tool Rental TT — your marketplace for renting tools and equipment across Trinidad & Tobago.`,
    ``,
    `You can browse tools, compare rates, and book online.`,
    ``,
    `Browse tools: ${toolsUrl}`,
    contactUrl ? `Contact us: ${contactUrl}` : ``,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

