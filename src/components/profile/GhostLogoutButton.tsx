"use client";

/**
 * Ghost Logout Button Component - Jaothui ID-Trace System
 * 
 * A reusable ghost-styled logout button component for user profile interface.
 * 
 * Features:
 * - Ghost button styling (light border, transparent background)
 * - Better-auth integration with existing signOut() function
 * - Loading states with spinner animation
 * - Error handling with graceful fallback
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Mobile-first responsive design
 * - Age-optimized sizing (100px × 48px touch target for 30+ users)
 * - Thai language native ("ออกจากระบบ")
 * 
 * Design Principles:
 * - Mobile-first (375px minimum width)
 * - Elderly-friendly (48px touch targets, clear typography)
 * - Thai language native
 * - Accessible (WCAG 2.1 AA compliant)
 * 
 * @component
 * @example
 * ```tsx
 * <GhostLogoutButton />
 * <GhostLogoutButton className="mt-4" />
 * <GhostLogoutButton disabled={true} />
 * <GhostLogoutButton onLogout={customLogoutHandler} />
 * ```
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/**
 * Props interface for GhostLogoutButton component
 */
export interface GhostLogoutButtonProps {
  /**
   * Optional custom logout handler
   * If provided, this will be called instead of the default logout logic
   * @default undefined
   */
  onLogout?: () => Promise<void>;

  /**
   * Additional CSS classes to apply to the button
   * @default undefined
   */
  className?: string;

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * Ghost Logout Button Component
 * 
 * Displays a ghost-styled button with Thai text "ออกจากระบบ" (Logout)
 * that integrates with better-auth for session management.
 * 
 * @param props - Component props
 * @returns React component
 */
export function GhostLogoutButton({
  onLogout,
  className,
  disabled = false,
}: GhostLogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  /**
   * Handle logout action
   * Signs out the user using better-auth and redirects to login page
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Use custom logout handler if provided, otherwise use default
      if (onLogout) {
        await onLogout();
      } else {
        // Sign out using better-auth
        await signOut();
      }

      // Redirect to login page after successful logout
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
      // Still redirect even if there's an error to ensure user is logged out
      router.push("/login");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={disabled || isLoggingOut}
      variant="ghost"
      className={cn(
        // Base styles - Ghost button with light border
        "border border-gray-300 bg-transparent text-gray-700",
        // Size - Age-optimized touch target (100px × 48px minimum)
        "min-w-[100px] h-12 px-6",
        // Typography - 16px, medium weight for readability
        "text-base font-medium",
        // Border radius
        "rounded-lg",
        // Hover state - Light gray background
        "hover:bg-gray-50 hover:border-gray-400",
        // Active state - Slightly darker background
        "active:bg-gray-100",
        // Focus state - Ring for keyboard navigation
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
        // Disabled state
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
        // Dark mode support
        "dark:border-gray-600 dark:text-gray-300",
        "dark:hover:bg-gray-800 dark:hover:border-gray-500",
        "dark:active:bg-gray-700",
        // Additional custom classes
        className
      )}
      aria-label="ออกจากระบบ"
      aria-busy={isLoggingOut}
      type="button"
    >
      {isLoggingOut ? (
        <span className="flex items-center justify-center gap-2">
          {/* Loading spinner */}
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>กำลังออกจากระบบ...</span>
        </span>
      ) : (
        "ออกจากระบบ"
      )}
    </Button>
  );
}

// Display name for debugging
GhostLogoutButton.displayName = "GhostLogoutButton";
