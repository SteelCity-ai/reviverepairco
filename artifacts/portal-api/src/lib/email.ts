import nodemailer from "nodemailer";

const ZOHO_USER = process.env.ZOHO_SMTP_USER;
const ZOHO_PASS = process.env.ZOHO_SMTP_PASSWORD;
const FROM = "Revive Repair <noreply@reviverepairco.com>";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!ZOHO_USER || !ZOHO_PASS) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: { user: ZOHO_USER, pass: ZOHO_PASS },
  });
  return transporter;
}

export interface SendMailArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail(args: SendMailArgs): Promise<void> {
  const t = getTransporter();
  if (!t) {
    console.warn(
      `[email] ZOHO_SMTP_* not set — would have sent "${args.subject}" to ${args.to}`,
    );
    return;
  }
  await t.sendMail({
    from: FROM,
    to: Array.isArray(args.to) ? args.to.join(",") : args.to,
    subject: args.subject,
    html: args.html,
    text: args.text ?? args.html.replace(/<[^>]+>/g, ""),
  });
}
