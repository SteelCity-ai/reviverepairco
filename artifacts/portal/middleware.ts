import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const BASE_PATH = process.env.PORTAL_BASE_PATH ?? "/portal";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/accept-invite(.*)",
  "/api/webhooks/clerk(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isCrewRoute = createRouteMatcher(["/crew(.*)"]);
const isClientRoute = createRouteMatcher(["/client(.*)"]);

function redirectTo(req: Request, path: string) {
  const url = new URL(`${BASE_PATH}${path}`, req.url);
  return NextResponse.redirect(url);
}

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    const url = new URL(req.url);
    const pathname = url.pathname.replace(BASE_PATH, "") || "/";
    if (pathname === "/") return;
    return redirectTo(req, "/sign-in");
  }

  // Try the session claim first (cheap). If absent — Clerk's default
  // session token doesn't include public_metadata — fall back to the
  // Backend API and read it from the user record directly.
  let role =
    (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;
  if (!role) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      role = (user.publicMetadata as { role?: string } | undefined)?.role;
    } catch (err) {
      console.error("[portal-mw] failed to load user metadata", err);
    }
  }
  role = role ?? "CREW";

  const url = new URL(req.url);
  const pathname = url.pathname.replace(BASE_PATH, "") || "/";

  if (pathname === "/") {
    if (role === "ADMIN") return redirectTo(req, "/admin/dashboard");
    if (role === "CREW") return redirectTo(req, "/crew/today");
    return redirectTo(req, "/client/projects");
  }

  if (isAdminRoute(req) && role !== "ADMIN") {
    return redirectTo(req, "/");
  }
  if (isCrewRoute(req) && role !== "CREW" && role !== "ADMIN") {
    return redirectTo(req, "/");
  }
  if (isClientRoute(req) && role !== "CLIENT" && role !== "ADMIN") {
    return redirectTo(req, "/");
  }
});

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).+)",
  ],
};
