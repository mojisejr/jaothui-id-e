import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

/**
 * Better Auth Configuration
 * 
 * This configuration uses Prisma adapter for persistent database storage.
 * Features:
 * - LINE OAuth login for farm owners
 * - Email/Password authentication for staff members
 * - Argon2 password hashing (default in better-auth)
 * - Secure session management with 7-day expiration
 * - HTTP-only secure cookies
 * - PostgreSQL database via Supabase with Prisma ORM
 */
export const auth = betterAuth({
  /**
   * Database Configuration
   * Using Prisma adapter for persistent PostgreSQL storage via Supabase
   */
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  /**
   * Base URL for the authentication system
   * Used for OAuth redirects and callback URLs
   */
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  
  /**
   * Secret key for signing JWT tokens and cookies
   * MUST be set in production environment
   * Generate with: openssl rand -base64 32
   */
  secret: process.env.BETTER_AUTH_SECRET || "development-secret-key-change-in-production",

  /**
   * Email and Password Authentication
   * Used for farm staff members
   * Argon2 is used by default for password hashing
   */
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  /**
   * User Model Field Mapping
   * Maps the email field to username field for staff authentication
   * This allows staff to login with username instead of email
   */
  user: {
    fields: {
      email: "username",
    },
  },

  /**
   * Social OAuth Providers Configuration
   * LINE OAuth for farm owners
   */
  socialProviders: {
    line: {
      clientId: process.env.LINE_CLIENT_ID || "",
      clientSecret: process.env.LINE_CLIENT_SECRET || "",
      enabled: !!(process.env.LINE_CLIENT_ID && process.env.LINE_CLIENT_SECRET),
      scopes: ["profile", "openid"],
      mapProfileToUser: (profile) => {
        return {
          name: profile.name || 'LINE User',
          image: profile.picture,
          email: profile.email || `${profile.sub || 'unknown'}@line.placeholder`,
        };
      },
    },
  },

  /**
   * Session Configuration
   * - 7-day session expiration
   * - Update session every 24 hours
   */
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },

  /**
   * Advanced Security Options
   */
  advanced: {
    /**
     * Use secure cookies in production
     * This enables HTTPS-only cookies
     */
    useSecureCookies: process.env.NODE_ENV === "production",
    
    /**
     * Cross subdomain cookies configuration
     */
    crossSubDomainCookies: {
      enabled: false,
    },
    
    /**
     * Default cookie attributes for all auth cookies
     */
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  },

  /**
   * Trusted origins for CSRF protection
   * In production, only allow requests from the configured base URL
   */
  trustedOrigins: process.env.NODE_ENV === "production" 
    ? [process.env.BETTER_AUTH_URL || ""] 
    : ["http://localhost:3000"],
});

/**
 * Export the auth handler for API routes
 * This can be used in Next.js API routes: app/api/auth/[...all]/route.ts
 */
export const { handler } = auth;

/**
 * Export the auth API for client-side usage
 * Access auth methods like: auth.api.signInEmail, auth.api.signInSocial, etc.
 */
export const { api } = auth;

/**
 * Type Definitions for Better Type Safety
 * Use these types throughout your application for session and user data
 */
export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;