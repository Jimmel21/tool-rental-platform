export interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: unknown;
}

export async function sendEmailViaBrevo(
  params: SendEmailParams
): Promise<SendEmailResult> {
  if (!process.env.BREVO_API_KEY) {
    console.warn(
      "[email] BREVO_API_KEY is not set; skipping send to",
      params.to
    );
    return { success: false, error: new Error("BREVO_API_KEY not configured") };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          email: process.env.EMAIL_FROM_ADDRESS!,
          name: process.env.EMAIL_FROM_NAME!,
        },
        to: [{ email: params.to, name: params.toName }],
        subject: params.subject,
        htmlContent: params.html,
        textContent: params.text,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      messageId?: string;
      message?: string;
    };

    if (!response.ok) {
      console.error("[email] Brevo API error", {
        status: response.status,
        body: data,
      });
      return { success: false, error: new Error(data.message || "Brevo error") };
    }

    const messageId = data.messageId;
    console.info("[email] Sent via Brevo", {
      to: params.to,
      subject: params.subject,
      messageId,
    });
    return { success: true, messageId };
  } catch (error) {
    console.error("Brevo email error:", error);
    return { success: false, error };
  }
}

