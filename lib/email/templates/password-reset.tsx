import { renderLayout } from "./base";

export interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  expiresMinutes: number;
}

export function renderPasswordResetEmail(
  props: PasswordResetEmailProps
): { subject: string; html: string; text: string } {
  const { name, resetUrl, expiresMinutes } = props;

  const subject = "Reset your Tool Rental TT password";

  const html = renderLayout({
    title: subject,
    previewText: "Click the button below to reset your password.",
    children: `
      <p>Hi ${name},</p>
      <p>We received a request to reset the password for your <strong>Tool Rental TT</strong> account.</p>

      <p style="margin:0 0 12px 0;">Click the button below to choose a new password. This link will expire in ${expiresMinutes} minutes.</p>

      <p style="margin:16px 0 18px 0;">
        <a href="${resetUrl}" class="btn">Reset password</a>
      </p>

      <p style="margin:0 0 12px 0;">If the button doesn&apos;t work, copy and paste this link into your browser:</p>
      <p style="word-break:break-all;font-size:12px;margin:0 0 12px 0;">${resetUrl}</p>

      <p style="margin-top:12px;font-size:13px;color:#6b7280;">
        If you didn&apos;t request this, you can safely ignore this email. Your password will stay the same.
      </p>
    `,
  });

  const text = [
    `Hi ${name},`,
    ``,
    `We received a request to reset your Tool Rental TT password.`,
    ``,
    `Reset link (expires in ${expiresMinutes} minutes):`,
    resetUrl,
    ``,
    `If you didn't request this, you can ignore this email.`,
  ].join("\n");

  return { subject, html, text };
}

