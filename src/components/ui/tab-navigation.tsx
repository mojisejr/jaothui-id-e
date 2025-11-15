"use client";

/**
 * TabNavigation Component - Jaothui ID-Trace System
 *
 * Mobile-first tab navigation with glassmorphic design and enhanced minimal styling.
 * Designed to work seamlessly with TopNavigation component for Thai buffalo farmers.
 *
 * Features:
 * - Mobile-first responsive design (44px minimum tap targets)
 * - Enhanced minimal styling with shadow-none patterns
 * - Glassmorphic design with backdrop-blur effects
 * - Two-tab navigation: "กระบือปัจจุบัน" and "รายการแจ้งเตือน"
 * - Smooth transitions with proper accessibility
 * - TypeScript interfaces with complete type definitions
 * - ARIA attributes and keyboard navigation support
 * - Thai language support with proper font rendering
 * - Navigation compatibility with TopNavigation component
 *
 * Design Principles:
 * - Enhanced minimal styling following profile page patterns
 * - Mobile-first (320px minimum width for LINE WebView)
 * - Elderly-friendly (44px+ touch targets, high contrast)
 * - Glassmorphic effects with backdrop-blur and semi-transparent backgrounds
 * - Clean design with no heavy shadows or overly decorative elements
 *
 * @component TabNavigation
 * @example
 * ```tsx
 * <TabNavigation
 *   activeTab="current"
 *   onTabChange={(tab) => setActiveTab(tab)}
 *   animalCount={5}
 * />
 * ```
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Tab navigation type definitions
 */
export type TabType = "current" | "notifications";

export interface TabItem {
  id: TabType;
  label: string;
  badge?: number;
}

export interface TabNavigationProps {
  /** Currently active tab */
  activeTab: TabType;
  /** Callback function when tab changes */
  onTabChange: (tab: TabType) => void;
  /** Optional badge count for current animals tab */
  animalCount?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Tab configuration with Thai labels
 */
const DEFAULT_TABS: TabItem[] = [
  {
    id: "current",
    label: "กระบือปัจจุบัน",
  },
  {
    id: "notifications",
    label: "รายการแจ้งเตือน",
  },
];

/**
 * Enhanced minimal tab navigation with glassmorphic design
 */
const TabNavigation = React.forwardRef<HTMLDivElement, TabNavigationProps>(
  ({ activeTab, onTabChange, animalCount, className, ...props }, ref) => {
    // Enhanced tab configuration with dynamic badge
    const tabs = React.useMemo(() => {
      return DEFAULT_TABS.map(tab => ({
        ...tab,
        badge: tab.id === "current" ? animalCount : undefined,
      }));
    }, [animalCount]);

    /**
     * Handle keyboard navigation
     */
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent, tabId: TabType) => {
        switch (event.key) {
          case "Enter":
          case " ":
            event.preventDefault();
            onTabChange(tabId);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            event.preventDefault();
            const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
            let nextIndex: number;

            if (event.key === "ArrowLeft") {
              nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            } else {
              nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            }

            onTabChange(tabs[nextIndex].id);
            break;
        }
      },
      [activeTab, tabs, onTabChange]
    );

    return (
      <div
        ref={ref}
        className={cn(
          // Enhanced minimal container styling following profile page patterns
          "bg-card/80 backdrop-blur-sm shadow-none rounded-lg border p-1",
          // Mobile-first responsive design
          "w-full max-w-md mx-auto",
          className
        )}
        role="tablist"
        aria-label="การนำทางแท็บ"
        {...props}
      >
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                aria-label={`${tab.label}${tab.badge ? ` (${tab.badge})` : ""}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(event) => handleKeyDown(event, tab.id)}
                className={cn(
                  // Base tab button styling
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  // Mobile-first touch targets (44px minimum)
                  "min-h-[44px]",
                  // Enhanced minimal styling following profile page patterns
                  "shadow-none",

                  // Active state styling - subtle indication
                  isActive
                    ? "bg-background shadow-sm shadow-primary/10 text-primary border border-border/50"
                    : "hover:bg-accent/50 text-muted-foreground hover:text-foreground",

                  // Focus states for accessibility
                  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",

                  // Disabled states
                  "disabled:pointer-events-none disabled:opacity-50"
                )}
              >
                <span className="truncate text-center">
                  {tab.label}
                </span>

                {/* Optional badge display */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full",
                      // Badge styling that adapts to active state
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                    aria-label={`จำนวน ${tab.badge} รายการ`}
                  >
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

TabNavigation.displayName = "TabNavigation";

export default TabNavigation;