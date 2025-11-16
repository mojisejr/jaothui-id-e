"use client";

/**
 * MenuGrid Component - Jaothui ID-Trace System
 * 
 * A 3×2 grid menu component optimized for elderly Thai buffalo farmers.
 * Features large icons, dual-language labels, and age-optimized touch targets.
 * 
 * Features:
 * - 3×2 grid layout (6 menu items)
 * - Large 64px icons for better visibility
 * - Dual-language support (Thai primary, English help text)
 * - Age-optimized touch targets (100px × 80px minimum)
 * - Mobile-first responsive design (375px viewport)
 * - Accessibility support (ARIA labels, keyboard navigation)
 * - High contrast colors (WCAG AA compliant)
 * 
 * Design Principles:
 * - Mobile-first (375px minimum width)
 * - Elderly-friendly (large touch targets, high contrast)
 * - Thai language native with English help text
 * - Accessible (WCAG 2.1 AA compliant)
 * 
 * @component MenuGrid
 */

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * MenuItem interface
 * Defines the structure for each menu item in the grid
 */
export interface MenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Icon (emoji or icon component) - 64px size */
  icon: string;
  /** Thai text label - 16px, bold */
  label: string;
  /** English subtitle/help text - 12px */
  helpText: string;
  /** Navigation route */
  href: string;
  /** Accessibility description for screen readers */
  description?: string;
}

/**
 * MenuGridProps interface
 * Props for the MenuGrid component
 */
export interface MenuGridProps {
  /** Array of menu items to display in the grid */
  menuItems: MenuItem[];
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Default menu items for the system
 * Includes all 6 menu options with Thai and English labels
 */
export const defaultMenuItems: MenuItem[] = [
  {
    id: "livestock",
    icon: "🐃",
    label: "เพิ่มสัตว์เลี้ยง",
    helpText: "Add Livestock",
    href: "/animals/create",
    description: "จัดการข้อมูลสัตว์เลี้ยง",
  },
  {
    id: "activities",
    icon: "📋",
    label: "กระบือในฟาร์ม",
    helpText: "Your Livestock",
    href: "/animals",
    description: "กระบือทั้งหมดในฟาร์มของคุณ",
  },
  {
    id: "treatments",
    icon: "💉",
    label: "การรักษา",
    helpText: "Treatments",
    href: "/treatments",
    description: "บันทึกการรักษาและประวัติทางการแพทย์",
  },
  {
    id: "feeding",
    icon: "🌾",
    label: "การเลี้ยงดู",
    helpText: "Feeding",
    href: "/feeding",
    description: "จัดการการให้อาหารและการเลี้ยงดู",
  },
  {
    id: "reports",
    icon: "📊",
    label: "รายงาน",
    helpText: "Reports",
    href: "/reports",
    description: "ดูรายงานและสถิติ",
  },
  {
    id: "settings",
    icon: "⚙️",
    label: "ตั้งค่า",
    helpText: "Settings",
    href: "/settings",
    description: "ตั้งค่าระบบและการใช้งาน",
  },
];

/**
 * MenuGrid Component
 * 
 * Renders a responsive 3×2 grid of menu items with large icons and dual-language labels.
 * Optimized for elderly users with extra-large touch targets and high contrast.
 * 
 * @param {MenuGridProps} props - Component props
 * @returns {React.ReactElement} Rendered MenuGrid component
 * 
 * @example
 * ```tsx
 * <MenuGrid menuItems={defaultMenuItems} />
 * ```
 * 
 * @example
 * ```tsx
 * <MenuGrid 
 *   menuItems={customMenuItems} 
 *   className="mt-4"
 * />
 * ```
 */
export function MenuGrid({ 
  menuItems = defaultMenuItems, 
  className 
}: MenuGridProps): React.ReactElement {
  return (
    <nav
      className={cn(
        "w-full",
        className
      )}
      role="navigation"
      aria-label="หน้าหลักเมนู"
    >
      <div
        className="grid grid-cols-3 gap-3 w-full max-w-2xl mx-auto"
        role="group"
        aria-label="กลุ่มเมนูหลัก"
      >
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              // Base styles
              "flex flex-col items-center justify-center",
              "min-h-[80px] min-w-[100px]",
              "p-3 rounded-xl",
              // Background and border
              "bg-card border border-border",
              "hover:shadow-xs",
              // Interactive states
              "transition-all duration-200",
              "hover: hover:border-accent-foreground/20",
              "focus-visible:outline-hidden focus-visible:ring-2",
              "focus-visible:ring-ring focus-visible:ring-offset-2",
              // Active/pressed state
              "active:scale-95",
              // Accessibility
              "cursor-pointer"
            )}
            aria-label={`${item.label} - ${item.helpText}${item.description ? `: ${item.description}` : ""}`}
            role="link"
            tabIndex={0}
          >
            {/* Icon - 64px size for elderly visibility */}
            <span
              className="text-6xl mb-1"
              role="img"
              aria-hidden="true"
            >
              {item.icon}
            </span>

            {/* Thai Label - 16px, Bold */}
            <span
              className="text-base font-bold text-foreground text-center leading-tight"
              lang="th"
            >
              {item.label}
            </span>

            {/* English Help Text - 12px */}
            <span
              className="text-xs text-muted-foreground text-center mt-0.5"
              lang="en"
            >
              {item.helpText}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/**
 * MenuGridItem Component
 * 
 * Individual menu item component (for custom implementations)
 * Can be used separately if needed for special cases
 * 
 * @param {MenuItem} item - Menu item data
 * @returns {React.ReactElement} Rendered menu item
 */
export function MenuGridItem({ item }: { item: MenuItem }): React.ReactElement {
  return (
    <Link
      href={item.href}
      className={cn(
        // Base styles
        "flex flex-col items-center justify-center",
        "min-h-[80px] min-w-[100px]",
        "p-3 rounded-xl",
        // Background and border
        "bg-card border border-border",
        "shadow-xs hover:shadow-xs",
        // Interactive states
        "transition-all duration-200",
        "hover:bg-accent hover:border-accent-foreground/20",
        "focus-visible:outline-hidden focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2",
        // Active/pressed state
        "active:scale-95",
        // Accessibility
        "cursor-pointer"
      )}
      aria-label={`${item.label} - ${item.helpText}${item.description ? `: ${item.description}` : ""}`}
      role="link"
      tabIndex={0}
    >
      {/* Icon - 64px size */}
      <span
        className="text-6xl mb-1"
        role="img"
        aria-hidden="true"
      >
        {item.icon}
      </span>

      {/* Thai Label - 16px, Bold */}
      <span
        className="text-base font-bold text-foreground text-center leading-tight"
        lang="th"
      >
        {item.label}
      </span>

      {/* English Help Text - 12px */}
      <span
        className="text-xs text-muted-foreground text-center mt-0.5"
        lang="en"
      >
        {item.helpText}
      </span>
    </Link>
  );
}

// Export default for convenience
export default MenuGrid;
