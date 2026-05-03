import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const BASE_PATH = process.env.PORTAL_BASE_PATH ?? "/portal";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/accept-invite(.*)",
  "/api/webhooks/clerk(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isCrewRoute = createRouteMatcher(["/crew(.*)"]);
const isClientRoute = createRouteMatcher(["/client(.*)"]);

function redirectTo(req: Request, path: string, withRedirect = false) {
  const url = new URL(`${BASE_PATH}${path}`, req.url);
  if (withRedirect) url.searchParams.set("redirect_url", req.url);
  return NextResponse.redirect(url);
}

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return redirectTo(req, "/sign-in", true);
  }

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role ?? "CREW";

  if (isAdminRoute(req) && role !== "ADMIN") {
    return redirectTo(req, "/sign-in");
  }
  if (isCrewRoute(req) && role !== "CREW" && role !== "ADMIN") {
    return redirectTo(req, "/sign-in");
  }
  if (isClientRoute(req) && role !== "CLIENT" && role !== "ADMIN") {
    return redirectTo(req, "/sign-in");
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
