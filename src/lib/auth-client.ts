/**
 * Better Auth Client for Jaothui ID-Trace System
 * 
 * This file provides the client-side authentication API.
 * Use this in React components and client-side code.
 * 
 * Features:
 * - LINE OAuth login
 * - Email/password authentication
 * - Session management
 * - Type-safe authentication methods
 */

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth Client Instance
 * 
 * This client provides methods for authentication operations:
 * - signIn.social({ provider: "line" }) - LINE OAuth login
 * - signIn.email({ email, password }) - Email/password login
 * - signUp.email({ email, password, name }) - Registration
 * - signOut() - Sign out current session
 * - useSession() - React hook for session state
 */
export const authClient = createAuthClient({
  /**
   * Base URL for authentication API
   * Uses relative path in browser, absolute URL in server-side rendering
   */
  baseURL: typeof window !== "undefined" 
    ? window.location.origin 
    : process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

/**
 * Export authentication methods for easier imports
 */
export const { signIn, signUp, signOut, useSession } = authClient;
