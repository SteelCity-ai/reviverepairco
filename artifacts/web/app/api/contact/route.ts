import { NextResponse } from "next/server";
import { sendContactEmail } from "../../../lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RECIPIENTS = [
  "ddawson@reviveroofrepair.com",
  "dcdawson22@gmail.com",
];

interface ContactPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  serviceType?: string;
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

/**
 * Best-effort POST to portal-api to create a service request.
 * Failure is logged but does NOT break the user-facing form flow —
 * the email notification is the record of truth for contact intake.
 */
async function tryCreateServiceRequest(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
}): Promise<void> {
  const portalUrl = process.env.PORTAL_API_URL;
  const secret = process.env.INTERNAL_API_SECRET;

  if (!portalUrl || !secret) {
    console.warn(
      "[contact-intake] PORTAL_API_URL or INTERNAL_API_SECRET not set — skipping service-request creation",
    );
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(`${portalUrl}/api/v1/internal/service-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secret}`,
      },
      body: JSON.stringify({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        serviceType: payload.serviceType || "other",
        description: payload.message,
        source: "website_form",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(
        `[contact-intake] Portal-api returned ${res.status}: ${body}`,
      );
    }
  } catch (err) {
    // Intake failure is non-blocking — email already sent, user gets success.
    console.error("[contact-intake] Failed to create service request:", err);
  }
}

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const firstName = (body.firstName ?? "").trim();
  const lastName = (body.lastName ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const email = (body.email ?? "").trim();
  const serviceType = (body.serviceType ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!firstName || !lastName || !phone) {
    return NextResponse.json(
      { error: "First name, last name, and phone are required." },
      { status: 400 },
    );
  }

  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const subject = `New estimate request from ${fullName}${serviceType ? ` — ${serviceType}` : ""}`;

  const textLines = [
    "New estimate request submitted on reviveroofrepair.com",
    "",
    `Name:    ${fullName}`,
    `Phone:   ${phone}`,
    `Email:   ${email || "(not provided)"}`,
    `Service: ${serviceType || "(not specified)"}`,
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
        <tr><td style="padding: 6px 0; color: #64748b; width: 110px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${escapeHtml(fullName)}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Phone</td><td style="padding: 6px 0;"><a href="tel:${escapeHtml(phone)}" style="color: #0f172a; text-decoration: none; font-weight: 600;">${escapeHtml(phone)}</a></td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0;">${email ? `<a href="mailto:${escapeHtml(email)}" style="color: #0f172a;">${escapeHtml(email)}</a>` : "<em>not provided</em>"}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Service</td><td style="padding: 6px 0;">${escapeHtml(serviceType) || "<em>not specified</em>"}</td></tr>
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

    // Best-effort service-request intake — fire and forget (non-blocking).
    // Email already sent; intake failure is a logged warning, not a user error.
    tryCreateServiceRequest({ firstName, lastName, email, phone, serviceType, message });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form email send failed:", err);
    return NextResponse.json(
      { error: "We couldn't send your request. Please call (717) 500-1434." },
      { status: 500 },
    );
  }
}
