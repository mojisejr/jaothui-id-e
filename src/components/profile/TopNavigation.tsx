"use client";

/**
 * TopNavigation Component - Jaothui ID-Trace System
 * 
 * Top navigation bar for user profile interface and other pages.
 * 
 * Features:
 * - Brand name (left): "ระบบ ID-Trace" - clickable link to /profile
 * - Notification bell (center): Bell icon with badge displaying notification count
 * - Logo (right): Buffalo/brand icon representing JAOTHUI
 * - Mobile-first responsive design (375px minimum width)
 * - Age-optimized sizing (44px minimum touch targets for elderly users)
 * - High contrast WCAG AA compliant colors
 * - Proper ARIA labels for accessibility
 * - Keyboard navigation support
 * 
 * Design Principles:
 * - Mobile-first (375px minimum viewport)
 * - Elderly-friendly (44px touch targets, high contrast)
 * - Thai language native
 * - Accessible (WCAG 2.1 AA compliant)
 * 
 * @component TopNavigation
 */

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Props interface for TopNavigation component
 */
export interface TopNavigationProps {
  /**
   * Number of notifications to display in badge
   * @default 0
   */
  notificationCount?: number;
  
  /**
   * Callback when brand name is clicked
   */
  onBrandClick?: () => void;
  
  /**
   * Callback when notification bell is clicked
   */
  onNotificationClick?: () => void;
  
  /**
   * Callback when logo is clicked
   */
  onLogoClick?: () => void;
  
  /**
   * Additional CSS classes for customization
   */
  className?: string;
}

/**
 * TopNavigation Component
 * 
 * Displays a fixed top navigation bar with three sections:
 * 1. Brand name (left) - Links to /profile
 * 2. Notification bell (center) - Shows notification count
 * 3. Logo (right) - Brand identity
 * 
 * @example
 * ```tsx
 * <TopNavigation 
 *   notificationCount={2} 
 *   onNotificationClick={() => console.log('Notifications clicked')}
 * />
 * ```
 */
export function TopNavigation({
  notificationCount = 0,
  onBrandClick,
  onNotificationClick,
  onLogoClick,
  className,
}: TopNavigationProps) {
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-background/80 backdrop-blur-xs border-b border-border",
        className
      )}
      aria-label="หน้าหลัก"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Name (Left) */}
          <div className="flex items-center">
            <Link
              href="/profile"
              onClick={onBrandClick}
              className={cn(
                "text-lg font-bold text-foreground",
                "hover:text-primary transition-colors duration-200",
                "focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1",
                "min-h-[44px] flex items-center"
              )}
              aria-label="กลับไปหน้าโปรไฟล์"
            >
              ระบบ ID-Trace
            </Link>
          </div>

          {/* Notification Bell (Center) */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationClick}
              className={cn(
                "relative",
                "min-h-[44px] min-w-[44px]",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
              aria-label={`การแจ้งเตือน ${notificationCount > 0 ? `${notificationCount} รายการ` : 'ไม่มีการแจ้งเตือน'}`}
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {notificationCount > 0 && (
                <span
                  className={cn(
                    "absolute -top-1 -right-1",
                    "min-w-[20px] h-5 px-1",
                    "bg-destructive text-destructive-foreground",
                    "rounded-full text-xs font-semibold",
                    "flex items-center justify-center"
                  )}
                  aria-hidden="true"
                >
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Button>
          </div>

          {/* Logo (Right) */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onLogoClick}
              className={cn(
                "flex items-center justify-center",
                "min-h-[44px] min-w-[44px]",
                "hover:opacity-80 transition-opacity duration-200",
                "focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
              )}
              aria-label="โลโก้ JAOTHUI"
            >
                <img 
                src="/thuiLogo.png" 
                alt="JAOTHUI Logo" 
                className="h-8 w-8 object-contain"
                />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * Export as default for convenience
 */
export default TopNavigation;
