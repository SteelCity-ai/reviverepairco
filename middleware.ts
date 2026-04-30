import { NextRequest, NextResponse } from "next/server";
import {
  BRAND_OVERRIDE_COOKIE,
  brandFromHostname,
  isPreviewHost,
  type Brand,
} from "@/lib/brand";

function isBrandValue(v: string | undefined | null): v is Brand {
  return v === "roofing" || v === "repair-co";
}

export function middleware(request: NextRequest) {
  const hostHeader =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const hostBrand = brandFromHostname(hostHeader);
  const preview = isPreviewHost(hostHeader);

  let brand: Brand = hostBrand;
  let setCookie: { value: Brand; clear?: false } | { clear: true } | null = null;

  if (preview) {
    const queryOverride = request.nextUrl.searchParams.get("brand");
    if (queryOverride === "clear") {
      setCookie = { clear: true };
    } else if (isBrandValue(queryOverride)) {
      brand = queryOverride;
      setCookie = { value: queryOverride };
    } else {
      const cookieOverride = request.cookies.get(BRAND_OVERRIDE_COOKIE)?.value;
      if (isBrandValue(cookieOverride)) {
        brand = cookieOverride;
      }
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-revive-brand", brand);

  const { pathname } = request.nextUrl;

  let response: NextResponse;
  if (brand === "repair-co" && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/general-contracting";
    url.searchParams.delete("brand");
    response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  } else {
    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (setCookie) {
    if ("clear" in setCookie) {
      response.cookies.delete(BRAND_OVERRIDE_COOKIE);
    } else {
      response.cookies.set(BRAND_OVERRIDE_COOKIE, setCookie.value, {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|images/|api/|sitemap.xml|robots.txt).*)",
  ],
};
