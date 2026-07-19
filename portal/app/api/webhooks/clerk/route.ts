import { createHmac, timingSafeEqual } from "crypto";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, userProfile } from "../../../../../../lib/db";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
  console.warn("[clerk-webhook] CLERK_WEBHOOK_SECRET not set — webhook verification disabled");
}

/**
 * Verify Clerk webhook signature using raw HMAC-SHA256 (no external svix dependency).
 * Clerk uses Svix under the hood, which signs with HMAC-SHA256 over:
 *   `${svix-id}.${svix-timestamp}.${body}`
 */
function verifySignature(body: string, svixId: string, svixTimestamp: string, svixSignature: string): boolean {
  const secret = WEBHOOK_SECRET!;
  // Svix signatures are base64-encoded and split by space (multiple signature versions)
  const sigParts = svixSignature.split(" ");
  const secretBytes = Buffer.from(secret.split("_").pop()!, "base64");

  for (const sigPart of sigParts) {
    const [version, signature] = sigPart.split(",");
    if (!version || !signature) continue;

    const signedContent = `${svixId}.${svixTimestamp}.${body}`;
    const hmac = createHmac("sha256", secretBytes);
    hmac.update(signedContent);
    const expected = hmac.digest("base64");

    try {
      const sigBuf = Buffer.from(signature, "base64");
      const expBuf = Buffer.from(expected, "base64");
      if (sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf)) {
        return true;
      }
    } catch {
      // Buffer comparison failed for this signature part, try next
    }
  }
  return false;
}

/**
 * Clerk webhook handler for user lifecycle sync.
 *
 * Handles:
 * - user.created  → Create user_profile row (if not already created by API auth middleware)
 * - user.updated  → Update displayName, email, role metadata
 * - user.deleted  → Archive user_profile (soft-delete)
 * - session.created / session.ended → Logged for observability only
 */
export async function POST(req: Request) {
  const body = await req.text();

  // ── Verify webhook signature ───────────────────────────────────────────
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  let evt: WebhookEvent;
  if (WEBHOOK_SECRET) {
    if (!verifySignature(body, svixId, svixTimestamp, svixSignature)) {
      console.error("[clerk-webhook] Signature verification failed");
      return new Response("Invalid signature", { status: 400 });
    }
    evt = JSON.parse(body) as WebhookEvent;
  } else {
    // Development mode: parse without verification
    evt = JSON.parse(body) as WebhookEvent;
  }

  const eventType = evt.type;
  console.log(`[clerk-webhook] Received event: ${eventType}`);

  // ── Process events ─────────────────────────────────────────────────────

  try {
    switch (eventType) {
      case "user.created": {
        const { id: clerkUserId, email_addresses, first_name, last_name, username, public_metadata } = evt.data;
        const primaryEmail = email_addresses?.find((e) => e.id === evt.data.primary_email_address_id);
        const displayName = [first_name, last_name].filter(Boolean).join(" ") || username || clerkUserId;
        const email = primaryEmail?.email_address ?? null;
        const role = (public_metadata?.role as string) ?? "CREW";

        // Upsert: create if not exists (race-safe with API auth middleware auto-provisioning)
        const existing = await db.query.userProfile.findFirst({
          where: eq(userProfile.clerkUserId, clerkUserId),
        });

        if (!existing) {
          await db.insert(userProfile).values({
            clerkUserId,
            displayName: String(displayName),
            email,
            role: role as "ADMIN" | "CREW" | "CLIENT",
          });
          console.log(`[clerk-webhook] Created user_profile for ${clerkUserId} (${displayName})`);
        } else {
          console.log(`[clerk-webhook] user_profile already exists for ${clerkUserId}, skipping create`);
        }
        break;
      }

      case "user.updated": {
        const { id: clerkUserId, email_addresses, first_name, last_name, username, public_metadata } = evt.data;
        const primaryEmail = email_addresses?.find((e) => e.id === evt.data.primary_email_address_id);
        const displayName = [first_name, last_name].filter(Boolean).join(" ") || username || clerkUserId;
        const email = primaryEmail?.email_address ?? null;
        const role = (public_metadata?.role as string) ?? "CREW";

        await db
          .update(userProfile)
          .set({
            displayName: String(displayName),
            email,
            role: role as "ADMIN" | "CREW" | "CLIENT",
            updatedAt: new Date(),
          })
          .where(eq(userProfile.clerkUserId, clerkUserId));

        console.log(`[clerk-webhook] Updated user_profile for ${clerkUserId}`);
        break;
      }

      case "user.deleted": {
        const { id: clerkUserId } = evt.data;
        if (!clerkUserId) break;

        // Soft-delete: archive the user_profile
        await db
          .update(userProfile)
          .set({
            archivedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userProfile.clerkUserId, clerkUserId));

        console.log(`[clerk-webhook] Archived user_profile for ${clerkUserId}`);
        break;
      }

      case "session.created":
      case "session.ended":
      case "session.removed":
        // Observability only — Clerk handles session lifecycle
        console.log(`[clerk-webhook] Session event: ${eventType} for ${evt.data?.user_id ?? "unknown"}`);
        break;

      default:
        console.log(`[clerk-webhook] Unhandled event type: ${eventType}`);
    }

    return new Response(JSON.stringify({ received: true, event: eventType }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[clerk-webhook] Error processing ${eventType}:`, error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}