import { NextRequest, NextResponse } from "next/server";
import { brandFromHostname } from "@/lib/brand";

export function middleware(request: NextRequest) {
  const hostHeader =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const brand = brandFromHostname(hostHeader);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-revive-brand", brand);

  const { pathname } = request.nextUrl;

  if (brand === "repair-co" && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/general-contracting";
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|images/|api/|sitemap.xml|robots.txt).*)",
  ],
};
