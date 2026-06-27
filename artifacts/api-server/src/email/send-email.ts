import { Resend } from "resend";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", opts.to);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  const fromName = process.env.FROM_NAME ?? "Hasanpur Connect";
  const from = `${fromName} <${fromEmail}>`;

  try {
    const result = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (result.error) {
      const errMsg = JSON.stringify(result.error);
      if (errMsg.includes("testing emails") || errMsg.includes("verify a domain")) {
        console.warn(
          `[email] Resend domain not verified — email to ${opts.to} was not sent. ` +
          `To send emails to any address, verify a domain at resend.com/domains and set FROM_EMAIL to an address on that domain. ` +
          `Until then, emails will only work for the Resend account owner's address.`
        );
      } else {
        console.error("[email] Resend error sending to", opts.to, "—", errMsg);
      }
    } else {
      console.log("[email] Sent to", opts.to, "id:", result.data?.id);
    }
  } catch (err) {
    console.error("[email] Exception sending to", opts.to, "—", err);
  }
}
