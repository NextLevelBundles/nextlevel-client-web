import { NextRequest, NextResponse } from "next/server";
import { isCountryBlocked } from "@/lib/blocked-countries";
import { JWTPayload, decodeJwt } from "jose";

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
    const idTokenCookie = request.cookies.get("id_token");
    
    // If no token, redirect to sign in
    if (!idTokenCookie) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check if token is expired (basic check without full verification)
    try {
      const decoded = decodeJwt(idTokenCookie.value) as JWTPayload;
      const now = Math.floor(Date.now() / 1000);
      
      if (decoded.exp && now >= decoded.exp) {
        // Token is expired, redirect to refresh page
        const refreshUrl = new URL("/auth/refresh-token", request.url);
        refreshUrl.searchParams.set("returnUrl", request.nextUrl.pathname);
        return NextResponse.redirect(refreshUrl);
      }
    } catch (error) {
      // If we can't decode the token, clear it and redirect to sign in
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      const response = NextResponse.redirect(signInUrl);
      response.cookies.delete("id_token");
      return response;
    }

    // Token validation will happen server-side in Server Components
    // This is just a quick check to avoid unnecessary server renders
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
