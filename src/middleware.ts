/**
 * Route Protection Middleware - Jaothui ID-Trace System
 *
 * FIXED: Using proper better-auth cookie utilities instead of hardcoded cookie names
 *
 * This middleware protects routes that require authentication.
 * It uses better-auth's getSessionCookie utility to properly detect session cookies.
 *
 * Protected Routes:
 * - /profile - User profile page (requires authentication)
 *
 * Public Routes:
 * - / - Home page
 * - /login - Login page
 * - /api/auth/* - Better-auth API routes
 * - /api/* - All other API routes (auth handled internally)
 * - /_next/* - Next.js internal routes
 * - /favicon.ico - Favicon
 *
 * Security Features:
 * - Session cookie validation via better-auth utilities
 * - OAuth callback protection to prevent redirect loops
 * - Automatic redirect to login for unauthenticated users
 * - Preserves redirect URL for post-login navigation
 * - CSRF protection via better-auth
 *
 * @framework Next.js 14 App Router
 * @authentication better-auth v1.3.34
 * @fix Corrected cookie detection using getSessionCookie utility
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * List of paths that require authentication
 * Add any new protected routes here
 */
const PROTECTED_ROUTES = ["/profile"];

/**
 * List of paths that are public (no authentication required)
 * These routes are accessible to everyone
 */
const PUBLIC_ROUTES = ["/", "/login", "/profile-demo"];

/**
 * OAuth callback paths to bypass authentication check
 *
 * These paths are part of the LINE OAuth flow and should not be intercepted
 * by the middleware, even if they're temporarily misclassified as protected.
 */
const OAUTH_CALLBACK_PATHS = [
  "/api/auth/callback/line",
  "/api/auth/sign-in/line",
];

/**
 * Middleware function to protect routes
 *
 * FIXED: Now uses better-auth's getSessionCookie utility and OAuth callback protection
 *
 * This function runs on every request and checks if the route
 * requires authentication. It uses better-auth's official cookie utilities
 * to properly detect session cookies and protects OAuth callbacks from redirect loops.
 *
 * Note: This middleware uses Edge Runtime compatible code only.
 * Session validation is done using better-auth's getSessionCookie utility.
 * Full session verification happens at the component level.
 *
 * @param request - The incoming Next.js request
 * @returns NextResponse - Either continues the request or redirects to login
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  
  // Skip middleware for Next.js internal routes, API routes (except handled OPTIONS), and static files
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // FIXED: Add OAuth callback protection to prevent redirect loops
  // OAuth callbacks should bypass authentication checks entirely
  const isOAuthCallback = OAUTH_CALLBACK_PATHS.some((callbackPath) =>
    pathname === callbackPath || pathname.startsWith(callbackPath + "/")
  );

  if (isOAuthCallback) {
    console.log(`OAuth callback detected: ${pathname}, bypassing auth check`);
    return NextResponse.next();
  }

  // Check if the current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  );

  // If not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // FIXED: For protected routes, verify authentication using better-auth cookie utilities
  try {
    // Use better-auth's getSessionCookie utility instead of hardcoded cookie names
    // Pass the full request object as required by the utility function
    const sessionCookie = getSessionCookie(request);

    // If no session cookie exists, redirect to login
    if (!sessionCookie) {
      console.log(`No session cookie found for protected route: ${pathname}, redirecting to login`);
      const loginUrl = new URL("/login", request.url);

      // Preserve the original URL to redirect back after login
      loginUrl.searchParams.set("redirect", pathname);

      return NextResponse.redirect(loginUrl);
    }

    // FIXED: Session cookie found using better-auth utility, allow access to protected route
    console.log(`Session cookie found for: ${pathname}, allowing access`);

    // Note: Full session validation (expiry, validity) happens at the component level
    // This middleware uses better-auth's cookie detection for reliable session presence
    return NextResponse.next();
  } catch (error) {
    // If there's an error checking the session, redirect to login for safety
    console.error("Middleware authentication error:", error);

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }
}

/**
 * Matcher configuration for the middleware
 * 
 * This tells Next.js which routes should run through the middleware.
 * We match all routes except:
 * - API routes (handled by their own authentication)
 * - Static files (_next/static, images, etc.)
 * - Next.js internal routes
 * 
 * Note: The matcher uses path-to-regexp syntax
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public/*)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
