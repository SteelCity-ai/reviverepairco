import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const BASE_PATH = process.env.PORTAL_BASE_PATH ?? "/portal";

const isPublicRoute = createRouteMatcher([
  "/",
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
    return redirectTo(req, "/sign-in");
  }

  const role =
    (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role ??
    "CREW";

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
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
