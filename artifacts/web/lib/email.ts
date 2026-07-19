import nodemailer from "nodemailer";

interface SendContactEmailArgs {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Gmail OAuth2 via Replit (when SMTP vars aren't set directly)
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER || process.env.SMTP_USER || "ddawson@reviveroofrepair.com",
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });
  }

  return null;
}

export async function sendContactEmail(args: SendContactEmailArgs): Promise<void> {
  const transporter = await getTransporter();

  if (!transporter) {
    // Log the submission so it's not lost — operator can review logs and set up email later
    console.log("[EMAIL NOT SENT — transporter not configured]");
    console.log(`  To:      ${args.to.join(", ")}`);
    console.log(`  Subject: ${args.subject}`);
    console.log(`  ReplyTo: ${args.replyTo || "(none)"}`);
    console.log(`  Body:\n${args.text}`);
    console.log("[END CONTACT FORM SUBMISSION]");
    return;
  }

  const from = process.env.SMTP_FROM || process.env.GMAIL_USER || args.to[0];

  await transporter.sendMail({
    from,
    to: args.to.join(", "),
    subject: args.subject,
    text: args.text,
    html: args.html,
    replyTo: args.replyTo || undefined,
  });
}