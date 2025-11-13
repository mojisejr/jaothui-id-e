/**
 * Authentication API Routes for Jaothui ID-Trace System
 * 
 * This file implements the catch-all route handler for better-auth.
 * It handles all authentication-related endpoints including:
 * - LINE OAuth login and callback
 * - Email/password authentication
 * - Session management (login, logout, refresh)
 * - User registration
 * - Password reset
 * 
 * @route /api/auth/*
 * @framework Next.js 14 App Router
 * @authentication better-auth v1.3.34
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better Auth Handler
 * 
 * This converts the better-auth handler to Next.js route handlers.
 * The toNextJsHandler utility automatically creates both GET and POST
 * handlers that work with Next.js 14 App Router.
 * 
 * Supported endpoints:
 * - POST /api/auth/sign-in/email - Email/password sign in
 * - POST /api/auth/sign-up/email - Email/password registration
 * - POST /api/auth/sign-out - Sign out current session
 * - GET  /api/auth/oauth/line - LINE OAuth initiation
 * - GET  /api/auth/oauth/line/callback - LINE OAuth callback
 * - GET  /api/auth/session - Get current session
 * - POST /api/auth/session/refresh - Refresh session
 * 
 * Security features:
 * - Automatic CSRF protection via better-auth
 * - Secure HTTP-only cookies for session management
 * - HTTPS-only cookies in production
 * - Rate limiting (configured in better-auth)
 * - Trusted origins validation
 */
export const { GET, POST } = toNextJsHandler(auth);

/**
 * Route Configuration
 * 
 * This configuration is specific to Next.js App Router and ensures
 * the route behaves correctly with better-auth's requirements.
 */
export const runtime = 'nodejs';  // Use Node.js runtime for better-auth compatibility
export const dynamic = 'force-dynamic';  // Disable static optimization for auth routes
