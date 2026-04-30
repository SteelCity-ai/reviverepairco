interface SendContactEmailArgs {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export async function sendContactEmail(_args: SendContactEmailArgs): Promise<void> {
  throw new Error(
    "Email service is not yet connected. Please connect Gmail in Replit to enable form submissions.",
  );
}
