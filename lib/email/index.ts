import { sendEmailViaBrevo, SendEmailResult } from "./brevo";
import { renderWelcomeEmail, WelcomeEmailProps } from "./templates/welcome";
import {
  renderBookingConfirmationEmail,
  BookingConfirmationEmailProps,
} from "./templates/booking-confirmation";
import {
  renderPaymentReceivedEmail,
  PaymentReceivedEmailProps,
} from "./templates/payment-received";
import {
  renderBookingReminderEmail,
  BookingReminderEmailProps,
} from "./templates/booking-reminder";
import {
  renderBookingCompletedEmail,
  BookingCompletedEmailProps,
} from "./templates/booking-completed";
import {
  renderPasswordResetEmail,
  PasswordResetEmailProps,
} from "./templates/password-reset";
import {
  renderIdVerificationEmail,
  IdVerificationEmailProps,
} from "./templates/id-verification";

const MAX_RETRIES = 3;

async function sendWithRetry(
  to: string,
  toName: string | undefined,
  subject: string,
  html: string,
  text: string | undefined
): Promise<SendEmailResult> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < MAX_RETRIES) {
    attempt += 1;
    const result = await sendEmailViaBrevo({ to, toName, subject, html, text });
    if (result.success) {
      return result;
    }
    lastError = result.error;
    const delayMs = 500 * 2 ** (attempt - 1);
    console.warn(
      `[email] Send attempt ${attempt} failed for ${to}. Retrying in ${delayMs}ms.`,
      result.error
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  console.error("[email] Failed to send after retries", { to, subject, lastError });
  return { success: false, error: lastError };
}

export async function sendWelcomeEmail(
  to: string,
  toName: string | undefined,
  props: WelcomeEmailProps
) {
  const { subject, html, text } = renderWelcomeEmail(props);
  return sendWithRetry(to, toName, subject, html, text);
}

export async function sendBookingConfirmationEmail(
  to: string,
  toName: string | undefined,
  props: BookingConfirmationEmailProps
) {
  const { subject, html, text } = renderBookingConfirmationEmail(props);
  return sendWithRetry(to, toName, subject, html, text);
}

export async function sendPaymentReceivedEmail(
  to: string,
  toName: string | undefined,
  props: PaymentReceivedEmailProps
) {
  const { subject, html, text } = renderPaymentReceivedEmail(props);
  return sendWithRetry(to, toName, subject, html, text);
}

export async function sendBookingReminderEmail(
  to: string,
  toName: string | undefined,
  props: BookingReminderEmailProps
) {
  const { subject, html, text } = renderBookingReminderEmail(props);
  return sendWithRetry(to, toName, subject, html, text);
}

export async function sendBookingCompletedEmail(
  to: string,
  toName: string | undefined,
  props: BookingCompletedEmailProps
) {
  const { subject, html, text } = renderBookingCompletedEmail(props);
  return sendWithRetry(to, toName, subject, html, text);
}

export async function sendPasswordResetEmail(
  to: string,
  toName: string | undefined,
  props: PasswordResetEmailProps
) {
  const { subject, html, text } = renderPasswordResetEmail(props);
  return sendWithRetry(to, toName, subject, html, text);
}

export async function sendIdVerificationEmail(
  to: string,
  toName: string | undefined,
  props: IdVerificationEmailProps
) {
  const { subject, html, text } = renderIdVerificationEmail(props);
  return sendWithRetry(to, toName, subject, html, text);
}

// Simple admin alerts (plain-text, no template)
export async function sendAdminAlertEmail(subject: string, body: string) {
  const to = process.env.ADMIN_ALERT_EMAIL ?? process.env.EMAIL_FROM_ADDRESS;
  if (!to) {
    console.warn("[email] ADMIN_ALERT_EMAIL/EMAIL_FROM_ADDRESS not set; skipping admin alert");
    return { success: false, error: new Error("No admin email configured") };
  }
  return sendWithRetry(
    to,
    "Admin",
    subject,
    `<pre style="font-family:monospace;white-space:pre-wrap;">${body}</pre>`,
    body
  );
}

