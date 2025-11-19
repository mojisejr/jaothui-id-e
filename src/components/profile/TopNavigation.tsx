"use client";

/**
 * TopNavigation Component - Jaothui ID-Trace System
 * 
 * Top navigation bar for user profile interface and other pages.
 * 
 * Features:
 * - Brand name (left): "ระบบ ID-Trace" - clickable link to /profile
 * - Notification bell (center): Bell icon with badge displaying notification count from useNotifications hook
 * - Refresh button: Manual refresh for notification count
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
import { useRouter } from "next/navigation";
import { Bell, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";

/**
 * Props interface for TopNavigation component
 */
export interface TopNavigationProps {
  /**
   * Callback when brand name is clicked
   */
  onBrandClick?: () => void;
  
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
 * 2. Notification bell (center) - Shows notification count from useNotifications hook
 * 3. Logo (right) - Brand identity
 * 
 * @example
 * ```tsx
 * <TopNavigation 
 *   onBrandClick={() => console.log('Brand clicked')}
 * />
 * ```
 */
export function TopNavigation({
  onBrandClick,
  onLogoClick,
  className,
}: TopNavigationProps) {
  const router = useRouter();
  const { badgeCount, breakdown, isLoading, error, mutate } = useNotifications();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);

  /**
   * Handle bell icon click - Navigate to activities view with filters
   * Shows loading state during navigation to provide user feedback
   */
  const handleBellClick = () => {
    setIsNavigating(true);
    router.push('/animals?tab=activities&status=pending,overdue');
  };

  /**
   * Handle manual refresh of notification count
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await mutate();
    } catch (err) {
      console.error('Failed to refresh notifications:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Log errors in development
  React.useEffect(() => {
    if (error && process.env.NODE_ENV === 'development') {
      console.error('Notification error:', error);
    }
  }, [error]);

  // Reset navigation loading state on unmount
  React.useEffect(() => {
    return () => {
      setIsNavigating(false);
    };
  }, []);
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBellClick}
              className={cn(
                "relative",
                "min-h-[44px] min-w-[44px]",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
              aria-label={
                isNavigating
                  ? 'กำลังโหลดหน้าการแจ้งเตือน...'
                  : badgeCount > 0
                  ? `การแจ้งเตือน ${badgeCount} รายการ (${breakdown.pending} รอดำเนินการ, ${breakdown.overdue} เกินกำหนด)`
                  : 'ไม่มีการแจ้งเตือน'
              }
              disabled={isLoading || isNavigating}
              aria-busy={isNavigating}
            >
              {isLoading || isNavigating ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <Bell className="h-5 w-5" aria-hidden="true" />
              )}
              {badgeCount > 0 && !isLoading && !isNavigating && (
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
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </Button>

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className={cn(
                "min-h-[44px] min-w-[44px]",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
              aria-label="รีเฟรชการแจ้งเตือน"
              disabled={isLoading || isRefreshing}
            >
              <RefreshCw
                className={cn(
                  "h-5 w-5",
                  isRefreshing && "animate-spin"
                )}
                aria-hidden="true"
              />
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
