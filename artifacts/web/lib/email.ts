import nodemailer from "nodemailer";

interface SendContactEmailArgs {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

/**
 * Thrown when no email transport is configured. Callers must treat this as a
 * hard failure: a lead that cannot be emailed must never be reported as sent.
 */
export class EmailNotConfiguredError extends Error {
  readonly code = "EMAIL_NOT_CONFIGURED";

  constructor() {
    super("Email transport is not configured.");
    this.name = "EmailNotConfiguredError";
  }
}

function hasSmtpConfig(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
}

function hasGmailConfig(): boolean {
  return Boolean(
    process.env.GMAIL_CLIENT_ID &&
      process.env.GMAIL_CLIENT_SECRET &&
      process.env.GMAIL_REFRESH_TOKEN,
  );
}

/** True when either supported credential set is present. */
export function isEmailConfigured(): boolean {
  return hasSmtpConfig() || hasGmailConfig();
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
  if (
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN
  ) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user:
          process.env.GMAIL_USER ||
          process.env.SMTP_USER ||
          "ddawson@reviveroofrepair.com",
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });
  }

  throw new EmailNotConfiguredError();
}

export async function sendContactEmail(args: SendContactEmailArgs): Promise<void> {
  const transporter = await getTransporter();
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
