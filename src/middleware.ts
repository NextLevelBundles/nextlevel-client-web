import { NextRequest, NextResponse } from "next/server";
import { isCountryBlocked } from "@/lib/blocked-countries";
import {
  verifyToken,
  isTokenExpired,
  type DecodedToken,
} from "@/lib/auth/token-validator";

export async function middleware(request: NextRequest) {
  // Check for blocked countries
  const countryCode =
    request.headers.get("CloudFront-Viewer-Country") ||
    request.nextUrl.searchParams.get("CloudFront-Viewer-Country");

  if (isCountryBlocked(countryCode)) {
    // Redirect to blocked country page
    return NextResponse.rewrite(new URL("/blocked-country", request.url));
  }

  // Define route types
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/customer");
  const isOnboardingRoute = request.nextUrl.pathname.startsWith("/onboarding");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  const isRefreshRoute = request.nextUrl.pathname === "/auth/refresh-token";
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isPublicAsset = request.nextUrl.pathname.match(
    /\.(ico|png|jpg|jpeg|svg|css|js|map)$/
  );

  // Skip middleware for API routes and public assets
  if (isApiRoute || isPublicAsset) {
    return NextResponse.next();
  }

  // Allow refresh-token route to always pass through to handle its own logic
  if (isRefreshRoute) {
    return NextResponse.next();
  }

  // Check if user has an auth token
  const idTokenCookie = request.cookies.get("id_token");

  // Handle unauthenticated users
  if (!idTokenCookie) {
    // If trying to access protected routes or onboarding, redirect to sign in
    if (isProtectedRoute || isOnboardingRoute) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
    // Allow access to auth routes and public pages
    return NextResponse.next();
  }

  console.log("Verifying token", idTokenCookie.value);
  // Handle authenticated users - verify token properly
  const decoded = await verifyToken(idTokenCookie.value);

  // If token verification fails (invalid signature, wrong issuer, etc.)
  if (!decoded) {
    console.error("Token verification failed - invalid token");
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    const response = NextResponse.redirect(signInUrl);
    response.cookies.delete("id_token");
    return response;
  }

  // For auth routes, allow them to handle their own logic
  if (isAuthRoute) {
    return NextResponse.next();
  }

  // Check if token is expired
  if (isTokenExpired(decoded)) {
    // Token is expired, attempt to refresh via the refresh-token page
    // This page will try to refresh tokens using Amplify's refresh token
    const refreshUrl = new URL("/auth/refresh-token", request.url);
    refreshUrl.searchParams.set("returnUrl", request.nextUrl.pathname);

    // Clear the expired cookie and redirect to refresh page
    const response = NextResponse.redirect(refreshUrl);
    response.cookies.delete("id_token");
    return response;
  }

  // Check if user has completed profile setup (has customerId)
  const hasCustomerId = !!decoded["custom:customerId"];

  // If user hasn't completed profile
  if (!hasCustomerId) {
    // Allow access to onboarding only
    if (!isOnboardingRoute) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  } else {
    // User has completed profile
    // Prevent access to onboarding
    if (isOnboardingRoute) {
      return NextResponse.redirect(new URL("/customer", request.url));
    }
    // If accessing protected routes, allow
    // If accessing public routes (like /), allow
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
