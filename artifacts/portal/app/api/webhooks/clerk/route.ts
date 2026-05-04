import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";

interface ClerkUserEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string; id: string }>;
    primary_email_address_id?: string;
    first_name?: string | null;
    last_name?: string | null;
    public_metadata?: { role?: string; clientId?: string | null };
  };
}

// Server-only — must be an absolute URL for Node fetch.
const API_BASE =
  process.env.PORTAL_API_INTERNAL_URL ?? "http://localhost:3002/api/v1";
const INTERNAL_SECRET = process.env.INTERNAL_CRON_SECRET;

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[clerk-webhook] CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const hdr = await headers();
  const svixId = hdr.get("svix-id");
  const svixTs = hdr.get("svix-timestamp");
  const svixSig = hdr.get("svix-signature");
  if (!svixId || !svixTs || !svixSig) {
    return NextResponse.json({ error: "missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();
  let evt: ClerkUserEvent;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTs,
      "svix-signature": svixSig,
    }) as ClerkUserEvent;
  } catch (err) {
    console.error("[clerk-webhook] signature verify failed", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const u = evt.data;
    const primary = u.email_addresses?.find(
      (e) => e.id === u.primary_email_address_id,
    );
    const email = primary?.email_address ?? u.email_addresses?.[0]?.email_address ?? null;
    const displayName =
      [u.first_name, u.last_name].filter(Boolean).join(" ").trim() ||
      email ||
      u.id;
    const role = (u.public_metadata?.role as string) ?? "CREW";
    const clientId = (u.public_metadata?.clientId as string | null) ?? null;

    // Forward to portal-api internal upsert endpoint (bearer-secret auth).
    if (!INTERNAL_SECRET) {
      console.warn("[clerk-webhook] INTERNAL_CRON_SECRET not set — skipping upsert");
      return NextResponse.json({ ok: true, skipped: true });
    }

    const r = await fetch(`${API_BASE}/internal/users/upsert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${INTERNAL_SECRET}`,
      },
      body: JSON.stringify({
        clerkUserId: u.id,
        email,
        displayName,
        role,
        clientId,
      }),
    });
    if (!r.ok) {
      const text = await r.text();
      console.error("[clerk-webhook] upsert failed", r.status, text);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
