import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isCountryBlocked } from "@/lib/blocked-countries";

export async function middleware(request: NextRequest) {
  // Check for blocked countries
  const countryCode =
    request.headers.get("CloudFront-Viewer-Country") ||
    request.nextUrl.searchParams.get("CloudFront-Viewer-Country");

  if (isCountryBlocked(countryCode)) {
    // Redirect to blocked country page
    return NextResponse.rewrite(new URL("/blocked-country", request.url));
  }

  // Continue with authentication for protected routes
  if (request.nextUrl.pathname.startsWith("/customer")) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return auth(request as any);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
