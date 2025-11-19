"use client";

/**
 * AnimalPanelContent Component - Jaothui ID-Trace System
 * 
 * Client-side component for animal panel with tab navigation.
 * Manages tab state and displays appropriate content based on active tab.
 * Integrates EditAnimalForm and CreateActivityForm components with proper data flow.
 * 
 * Features:
 * - TopNavigation integration
 * - Tab navigation between Edit Information and Manage Activities
 * - EditAnimalForm integration with data refresh
 * - CreateActivityForm integration with activity list
 * - ActivityList with StatusBadge display
 * - Client-side state management for active tab, animal data, and activities
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
import { EditAnimalForm } from "@/components/animals/EditAnimalForm";
import { CreateActivityForm } from "@/components/activities/CreateActivityForm";
import { StatusBadge } from "@/components/ui/status-badge";
import { AnimalType, AnimalGender, AnimalStatus } from "@/types/animal";
import { ActivityStatus } from "@/types/activity";

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
  weightKg: number | null;
  heightCm: number | null;
  motherTag: string | null;
  fatherTag: string | null;
  genome: string | null;
  imageUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Activity interface for activity list
 */
export interface Activity {
  id: string;
  farmId: string;
  animalId: string;
  title: string;
  description: string | null;
  activityDate: string | Date;
  dueDate: string | Date | null;
  status: ActivityStatus;
  statusReason: string | null;
  createdBy: string;
  completedBy: string | null;
  completedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  creator?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  completer?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

/**
 * AnimalPanelContent Props
 */
export interface AnimalPanelContentProps {
  /** Animal information to display */
  animal: Animal;
  /** Activities for this animal */
  activities?: Activity[];
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
  animal: initialAnimal,
  activities: initialActivities = [],
  className 
}: AnimalPanelContentProps): React.ReactElement {
  const router = useRouter();
  
  // State management for active tab
  const [activeTab, setActiveTab] = React.useState<TabType>("edit");
  
  // State management for animal data (for updates from EditAnimalForm)
  const [animalData, setAnimalData] = React.useState<Animal>(initialAnimal);
  
  // State management for activities (for updates from CreateActivityForm)
  const [activities, setActivities] = React.useState<Activity[]>(initialActivities);
  
  // State for success messages
  const [successMessage, setSuccessMessage] = React.useState<string>("");

  /**
   * Handle animal update success
   * Updates the local animal data state
   */
  const handleAnimalUpdateSuccess = React.useCallback((updatedAnimal: any) => {
    setAnimalData(updatedAnimal);
    setSuccessMessage("บันทึกข้อมูลกระบือสำเร็จ");
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
    
    // Refresh the page to get updated data
    router.refresh();
  }, [router]);

  /**
   * Handle activity creation success
   * Adds the new activity to the list
   */
  const handleActivityCreateSuccess = React.useCallback((newActivity: any) => {
    setActivities((prevActivities) => [newActivity, ...prevActivities]);
    setSuccessMessage("เพิ่มกิจกรรมสำเร็จ");
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
    
    // Refresh the page to get updated data
    router.refresh();
  }, [router]);

  /**
   * Format Thai date for display
   */
  const formatThaiDate = React.useCallback((date: string | Date | null): string => {
    if (!date) return "ไม่ระบุ";
    
    const d = typeof date === 'string' ? new Date(date) : date;
    const buddhistYear = d.getFullYear() + 543;
    
    const thaiMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    
    return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${buddhistYear}`;
  }, []);

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
      <TopNavigation />

      {/* Main Content - Centered with padding for TopNavigation */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div
              className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm text-center animate-in fade-in slide-in-from-top-2"
              role="alert"
              aria-live="polite"
            >
              {successMessage}
            </div>
          )}

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
          <div 
            className={cn("w-full", className)}
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            {activeTab === "edit" && (
              <EditAnimalForm
                animal={animalData}
                onSuccess={handleAnimalUpdateSuccess}
              />
            )}

            {activeTab === "activities" && (
              <div className="space-y-6">
                {/* Create Activity Form */}
                <CreateActivityForm
                  animalId={animalData.id}
                  onSuccess={handleActivityCreateSuccess}
                />

                {/* Activity List */}
                <Card className="w-full max-w-2xl mx-auto border-border bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      รายการกิจกรรม
                    </h3>

                    {activities.length === 0 ? (
                      <div className="text-center py-8">
                        <span className="text-4xl mb-4 block">📝</span>
                        <p className="text-muted-foreground">
                          ยังไม่มีกิจกรรมที่บันทึกไว้
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="p-4 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors"
                          >
                            {/* Activity Header */}
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className="font-semibold text-foreground flex-1">
                                {activity.title}
                              </h4>
                              <StatusBadge status={activity.status} size="sm" />
                            </div>

                            {/* Activity Description */}
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {activity.description}
                              </p>
                            )}

                            {/* Activity Details */}
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <span>📅 วันที่กิจกรรม:</span>
                                <span>{formatThaiDate(activity.activityDate)}</span>
                              </div>
                              
                              {activity.dueDate && (
                                <div className="flex items-center gap-2">
                                  <span>⏰ วันครบกำหนด:</span>
                                  <span>{formatThaiDate(activity.dueDate)}</span>
                                </div>
                              )}

                              {activity.creator && (
                                <div className="flex items-center gap-2">
                                  <span>👤 สร้างโดย:</span>
                                  <span>
                                    {activity.creator.firstName} {activity.creator.lastName}
                                  </span>
                                </div>
                              )}

                              {activity.status === "COMPLETED" && activity.completer && (
                                <div className="flex items-center gap-2">
                                  <span>✅ ดำเนินการโดย:</span>
                                  <span>
                                    {activity.completer.firstName} {activity.completer.lastName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AnimalPanelContent;
