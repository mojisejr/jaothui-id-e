/**
 * Route Protection Middleware - Jaothui ID-Trace System
 * 
 * This middleware protects routes that require authentication.
 * It checks if the user has a valid session using better-auth
 * and redirects to login page if not authenticated.
 * 
 * Protected Routes:
 * - /profile - User profile page (requires authentication)
 * 
 * Public Routes:
 * - / - Home page
 * - /login - Login page
 * - /api/* - All API routes (auth handled internally)
 * - /_next/* - Next.js internal routes
 * - /favicon.ico - Favicon
 * 
 * Security Features:
 * - Session validation using better-auth
 * - Automatic redirect to login for unauthenticated users
 * - Preserves redirect URL for post-login navigation
 * - CSRF protection via better-auth
 * 
 * @framework Next.js 14 App Router
 * @authentication better-auth v1.3.34
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * List of paths that require authentication
 * Add any new protected routes here
 */
const PROTECTED_ROUTES = ["/profile"];

/**
 * List of paths that are public (no authentication required)
 * These routes are accessible to everyone
 */
const PUBLIC_ROUTES = ["/", "/login"];

/**
 * Middleware function to protect routes
 * 
 * This function runs on every request and checks if the route
 * requires authentication. If authentication is required and
 * the user is not authenticated, it redirects to the login page.
 * 
 * @param request - The incoming Next.js request
 * @returns NextResponse - Either continues the request or redirects to login
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for Next.js internal routes, API routes, and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if the current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // If not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // For protected routes, verify authentication
  try {
    // Get the session using better-auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // If no session exists, redirect to login
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      
      // Preserve the original URL to redirect back after login
      loginUrl.searchParams.set("redirect", pathname);
      
      return NextResponse.redirect(loginUrl);
    }

    // Session exists, allow access to protected route
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
