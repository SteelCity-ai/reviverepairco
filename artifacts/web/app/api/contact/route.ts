import { NextResponse } from "next/server";
import { sendContactEmail } from "../../../lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RECIPIENTS = [
  "ddawson@reviveroofrepair.com",
  "dcdawson22@gmail.com",
];

interface ContactPayload {
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  message?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const email = (body.email ?? "").trim();
  const service = (body.service ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !phone) {
    return NextResponse.json(
      { error: "Name and phone are required." },
      { status: 400 },
    );
  }

  const subject = `New estimate request from ${name}${service ? ` — ${service}` : ""}`;

  const textLines = [
    "New estimate request submitted on reviveroofrepair.com",
    "",
    `Name:    ${name}`,
    `Phone:   ${phone}`,
    `Email:   ${email || "(not provided)"}`,
    `Service: ${service || "(not specified)"}`,
    "",
    "Message:",
    message || "(no message)",
  ];
  const text = textLines.join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.55;">
      <h2 style="margin: 0 0 16px; color: #0f172a;">New estimate request</h2>
      <p style="margin: 0 0 16px; color: #475569;">Submitted on reviveroofrepair.com</p>
      <table cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 520px;">
        <tr><td style="padding: 6px 0; color: #64748b; width: 110px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Phone</td><td style="padding: 6px 0;"><a href="tel:${escapeHtml(phone)}" style="color: #0f172a; text-decoration: none; font-weight: 600;">${escapeHtml(phone)}</a></td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0;">${email ? `<a href="mailto:${escapeHtml(email)}" style="color: #0f172a;">${escapeHtml(email)}</a>` : "<em>not provided</em>"}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Service</td><td style="padding: 6px 0;">${escapeHtml(service) || "<em>not specified</em>"}</td></tr>
      </table>
      <h3 style="margin: 24px 0 8px; color: #0f172a;">Message</h3>
      <div style="white-space: pre-wrap; padding: 14px 16px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">${escapeHtml(message) || "<em>no message</em>"}</div>
    </div>
  `;

  try {
    await sendContactEmail({
      to: RECIPIENTS,
      subject,
      text,
      html,
      replyTo: email || undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form email send failed:", err);
    return NextResponse.json(
      { error: "We couldn't send your request. Please call (717) 500-1434." },
      { status: 500 },
    );
  }
}
