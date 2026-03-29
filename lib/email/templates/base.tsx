const PRIMARY = "#0358A7";

export interface EmailLayoutProps {
  title: string;
  previewText?: string;
  children: string;
}

export function renderLayout({
  title,
  previewText,
  children,
}: EmailLayoutProps): string {
  const safePreview = previewText ?? title;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body { margin:0; padding:0; background:#f3f4f6; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
      a { color:${PRIMARY}; text-decoration:none; }
      .btn { display:inline-block; background:${PRIMARY}; color:#ffffff !important; padding:10px 18px; border-radius:6px; font-weight:600; font-size:14px; }
      @media (max-width:600px) {
        .container { width:100% !important; padding:16px !important; }
      }
    </style>
  </head>
  <body>
    <span style="display:none!important;opacity:0;color:transparent;visibility:hidden;height:0;width:0;">${safePreview}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="container" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:${PRIMARY};padding:14px 20px;color:#ffffff;font-weight:600;font-size:16px;">
                Tool Rental TT
              </td>
            </tr>
            <tr>
              <td style="padding:20px 20px 8px 20px;color:#111827;font-size:18px;font-weight:600;">
                ${title}
              </td>
            </tr>
            <tr>
              <td style="padding:0 20px 20px 20px;color:#374151;font-size:14px;line-height:1.6;">
                ${children}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px 20px 20px;color:#6b7280;font-size:12px;border-top:1px solid #e5e7eb;">
                Need help? WhatsApp us at <strong>+1 868 ${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.slice(-7) ?? "XXX XXXX"}</strong><br/>
                &copy; ${new Date().getFullYear()} Tool Rental TT. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

