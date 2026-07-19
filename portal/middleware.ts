import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/accept-invite(.*)",
  "/api/webhooks/clerk(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isCrewRoute = createRouteMatcher(["/crew(.*)"]);
const isClientRoute = createRouteMatcher(["/client(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, sessionClaims } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role ?? "CREW";

  if (isAdminRoute(req) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  if (isCrewRoute(req) && role !== "CREW" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  if (isClientRoute(req) && role !== "CLIENT" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
