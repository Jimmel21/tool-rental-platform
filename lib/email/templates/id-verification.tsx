import { renderLayout } from "./base";

export interface IdVerificationEmailProps {
  name: string;
  approved: boolean;
  /** Only relevant when approved = false */
  rejectionReason?: string;
  profileUrl?: string;
}

export function renderIdVerificationEmail(
  props: IdVerificationEmailProps
): { subject: string; html: string; text: string } {
  const {
    name,
    approved,
    rejectionReason,
    profileUrl = "/dashboard/profile",
  } = props;

  const subject = approved
    ? "Your ID has been verified — Tool Rental TT"
    : "Action required: ID verification unsuccessful — Tool Rental TT";

  const html = approved
    ? renderLayout({
        title: "ID Verified",
        previewText: "Your identity has been successfully verified.",
        children: `
          <p>Hi ${name},</p>
          <p>Great news — your identity document has been reviewed and <strong>successfully verified</strong>.</p>
          <p>You now have full access to all rental features on Tool Rental TT.</p>
          <p style="margin:16px 0 12px 0;">
            <a href="${profileUrl}" class="btn">View your profile</a>
          </p>
          <p style="margin-top:12px;">Thank you for completing verification. If you have any questions, feel free to reach out.</p>
        `,
      })
    : renderLayout({
        title: "ID Verification Unsuccessful",
        previewText: "Your ID verification could not be completed. Please resubmit.",
        children: `
          <p>Hi ${name},</p>
          <p>Unfortunately, we were unable to verify your identity document.</p>
          ${
            rejectionReason
              ? `<p><strong>Reason:</strong> ${rejectionReason}</p>`
              : ""
          }
          <p>Please log in and resubmit your ID with a clear, unobstructed photo or scan of a valid document.</p>
          <p style="margin:16px 0 12px 0;">
            <a href="${profileUrl}" class="btn">Resubmit ID</a>
          </p>
          <p style="margin-top:12px;">If you believe this is an error, please contact us and we'll be happy to help.</p>
        `,
      });

  const text = approved
    ? [
        `Hi ${name},`,
        ``,
        `Your identity document has been successfully verified.`,
        `You now have full access to all rental features on Tool Rental TT.`,
        ``,
        `View your profile: ${profileUrl}`,
      ].join("\n")
    : [
        `Hi ${name},`,
        ``,
        `Unfortunately, we were unable to verify your identity document.`,
        rejectionReason ? `Reason: ${rejectionReason}` : "",
        ``,
        `Please log in and resubmit your ID: ${profileUrl}`,
      ]
        .filter((l) => l !== undefined)
        .join("\n");

  return { subject, html, text };
}
