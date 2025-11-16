"use client";

/**
 * AnimalPanelContent Component - Jaothui ID-Trace System
 * 
 * Client-side component for animal panel with tab navigation.
 * Manages tab state and displays appropriate content based on active tab.
 * 
 * Features:
 * - TopNavigation integration
 * - Tab navigation between Edit Information and Manage Activities
 * - Client-side state management for active tab
 * - Placeholder content areas (to be implemented in future tasks)
 * - Mobile-first responsive design
 * - WCAG 2.1 AA accessibility compliance
 * 
 * Design Specifications:
 * - Layout: Full-screen with TopNavigation
 * - Card: Glassmorphic design with backdrop blur
 * - Tabs: Custom implementation matching requirements
 * - Touch targets: 48px minimum for all interactive elements
 * 
 * @framework Next.js 14 (App Router)
 * @language TypeScript (strict mode)
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import TopNavigation from "@/components/profile/TopNavigation";
import { AnimalType, AnimalGender, AnimalStatus, Prisma } from "@prisma/client";

/**
 * Animal interface matching Prisma schema
 */
export interface Animal {
  id: string;
  farmId: string;
  tagId: string;
  name: string | null;
  type: AnimalType;
  gender: AnimalGender;
  status: AnimalStatus;
  birthDate: string | Date | null;
  color: string | null;
  weightKg: Prisma.Decimal | number | null;
  heightCm: number | null;
  motherTag: string | null;
  fatherTag: string | null;
  genome: string | null;
  imageUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * AnimalPanelContent Props
 */
export interface AnimalPanelContentProps {
  /** Animal information to display */
  animal: Animal;
  /** Notification count for TopNavigation */
  notificationCount?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Tab type definition
 */
type TabType = "edit" | "activities";

/**
 * Tab configuration
 */
interface TabItem {
  id: TabType;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  {
    id: "edit",
    label: "แก้ไขข้อมูล",
    icon: "📋",
  },
  {
    id: "activities",
    label: "จัดการกิจกรรม",
    icon: "🎯",
  },
];

/**
 * AnimalPanelContent Component
 * 
 * @param props - Component props
 * @returns Animal panel with tab navigation
 */
export function AnimalPanelContent({ 
  animal,
  notificationCount = 0,
  className 
}: AnimalPanelContentProps): React.ReactElement {
  const router = useRouter();
  
  // State management for active tab
  const [activeTab, setActiveTab] = React.useState<TabType>("edit");

  // Handle notification click
  const handleNotificationClick = React.useCallback(() => {
    router.push('/animals?tab=notifications');
  }, [router]);

  /**
   * Handle keyboard navigation for tabs
   */
  const handleTabKeyDown = React.useCallback(
    (event: React.KeyboardEvent, tabId: TabType) => {
      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          setActiveTab(tabId);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          event.preventDefault();
          const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
          let nextIndex: number;

          if (event.key === "ArrowLeft") {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : TABS.length - 1;
          } else {
            nextIndex = currentIndex < TABS.length - 1 ? currentIndex + 1 : 0;
          }

          setActiveTab(TABS[nextIndex].id);
          break;
      }
    },
    [activeTab]
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      {/* TopNavigation Integration */}
      <TopNavigation 
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
      />

      {/* Main Content - Centered with padding for TopNavigation */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Tab Navigation */}
          <div
            className={cn(
              // Enhanced minimal container styling following profile page patterns
              "bg-card/80 backdrop-blur-sm shadow-none rounded-lg border p-1",
              "w-full max-w-md mx-auto"
            )}
            role="tablist"
            aria-label="การนำทางแท็บสำหรับจัดการข้อมูลกระบือ"
          >
            <div className="flex gap-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${tab.id}`}
                    aria-label={`${tab.icon} ${tab.label}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
                    className={cn(
                      // Base tab button styling
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      // Mobile-first touch targets (48px minimum)
                      "min-h-[48px]",
                      // Enhanced minimal styling following profile page patterns
                      "shadow-none",

                      // Active state styling - subtle indication
                      isActive
                        ? "bg-background shadow-xs shadow-primary/10 text-primary border border-border/50"
                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground",

                      // Focus states for accessibility
                      "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",

                      // Disabled states
                      "disabled:pointer-events-none disabled:opacity-50"
                    )}
                  >
                    <span className="text-lg" aria-hidden="true">
                      {tab.icon}
                    </span>
                    <span className="truncate text-center">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Areas */}
          <Card 
            className={cn(
              "w-full shadow-xs border-border/50 bg-card/90 backdrop-blur-sm",
              className
            )}
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            <CardContent className="p-6">
              {activeTab === "edit" && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">📋</span>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      แก้ไขข้อมูลกระบือ
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      ฟอร์มแก้ไขข้อมูลสำหรับ: {animal.name || animal.tagId}
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      (ส่วนนี้จะถูกพัฒนาในขั้นตอนถัดไป)
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "activities" && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">🎯</span>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      จัดการกิจกรรม
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      สร้างและจัดการกิจกรรมสำหรับ: {animal.name || animal.tagId}
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      (ส่วนนี้จะถูกพัฒนาในขั้นตอนถัดไป)
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default AnimalPanelContent;
