"use client";

/**
 * Profile Page - Jaothui ID-Trace System
 *
 * Complete User Profile Interface with integrated components for Thai buffalo farmers.
 *
 * Features:
 * - TopNavigation bar with brand, notifications, and logo
 * - ProfileCard with large avatar and farm information
 * - MenuGrid with 6 main navigation options (3×2 grid)
 * - GhostLogoutButton with better-auth integration
 * - Protected route (authentication required)
 * - Mobile-first responsive design (375px minimum width)
 * - Age-optimized layout for 30+ users
 * - Real API integration for farm information
 * - Session integration for real user authentication and avatar
 * - Loading states and error handling
 * - Accessibility compliance (WCAG 2.1 AA)
 *
 * Design Principles:
 * - Mobile-first (375px minimum viewport)
 * - Elderly-friendly (44px+ touch targets, high contrast)
 * - Thai language native with English help text
 * - Component-based architecture
 * - Real API integration with /api/farm endpoint
 *
 * @route /profile
 * @component ProfilePage
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession, signOut } from "@/lib/auth-client";

// Profile Components Integration
import TopNavigation from "@/components/profile/TopNavigation";
import { ProfileCard, Farm } from "@/components/profile/ProfileCard";
import MenuGrid, { defaultMenuItems, type UserRole } from "@/components/profile/MenuGrid";
import { GhostLogoutButton } from "@/components/profile/GhostLogoutButton";

/**
 * MenuSkeleton Component
 * Loading state for the menu grid during role determination
 */
function MenuSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center min-h-[120px] w-full p-4 rounded-xl bg-card border border-border"
          >
            {/* Icon skeleton */}
            <div className="w-20 h-20 bg-muted rounded-lg mr-4 flex-shrink-0 animate-pulse" />

            {/* Text content skeleton */}
            <div className="flex flex-col flex-grow space-y-2">
              <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();

  // Farm data state management
  const [farm, setFarm] = React.useState<Farm | null>(null);
  const [isLoadingFarm, setIsLoadingFarm] = React.useState(true);
  const [farmError, setFarmError] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);

  /**
   * Redirect to login if not authenticated
   */
  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  /**
   * Create new farm using POST /api/farm
   */
  const createFarm = React.useCallback(async () => {
    try {
      const response = await fetch('/api/farm', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setFarm(data.farm);
      } else {
        const errorData = await response.json();
        setFarmError(errorData.error || 'Failed to create farm');
      }
    } catch (error) {
      console.error('Failed to create farm:', error);
      setFarmError('เกิดข้อผิดพลาดในการสร้างฟาร์ม');
    }
  }, []);

  /**
   * Fetch farm data from /api/farm endpoint
   * If farm doesn't exist (404), create one using POST
   */
  const fetchFarmData = React.useCallback(async () => {
    try {
      setIsLoadingFarm(true);
      setFarmError(null);

      const response = await fetch('/api/farm');

      if (response.ok) {
        const data = await response.json();
        setFarm(data.farm);
      } else if (response.status === 403) {
        // Farm doesn't exist, create one
        await createFarm();
      } else {
        const errorData = await response.json();
        setFarmError(errorData.error || 'Failed to fetch farm data');
      }
    } catch (error) {
      console.error('Failed to fetch farm data:', error);
      setFarmError('เกิดข้อผิดพลาดในการโหลดข้อมูลฟาร์ม');
    } finally {
      setIsLoadingFarm(false);
    }
  }, [createFarm]);

  /**
   * Fetch farm data from API when user is authenticated
   */
  React.useEffect(() => {
    if (session?.user?.id) {
      fetchFarmData();
    }
  }, [session, fetchFarmData]);

  /**
   * Handle farm update from ProfileCard
   */
  const handleFarmUpdate = (updatedFarm: Farm) => {
    setFarm(updatedFarm);
  };

  /**
   * Determine user role based on farm ownership
   */
  React.useEffect(() => {
    if (session?.user?.id && farm) {
      // If user owns the farm, they are OWNER, otherwise MEMBER
      const role: UserRole = farm.ownerId === session.user.id ? 'OWNER' : 'MEMBER';
      setUserRole(role);
    }
  }, [session, farm]);

  /**
   * Loading state while checking authentication
   * Preserves existing loading UI for consistency
   */
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center space-y-4">
          <div
            className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
            aria-label="กำลังโหลด"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              กำลังโหลด...
            </span>
          </div>
          <p className="text-sm text-muted-foreground">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  /**
   * Error state
   * Preserves existing error handling for consistency
   */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-xs max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">เกิดข้อผิดพลาด</CardTitle>
            <CardDescription>
              ไม่สามารถตรวจสอบการเข้าสู่ระบบได้
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/login")}
              className="w-full"
              aria-label="กลับไปหน้าเข้าสู่ระบบ"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * If no session and not loading, return null (redirect will happen via useEffect)
   */
  if (!session) {
    return null;
  }

  /**
   * Handle notification clicks (placeholder for future implementation)
   */
  const handleNotificationClick = () => {
    // Future: Navigate to notifications page or show notification panel
    console.log("Notifications clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Top Navigation Bar - Fixed Position */}
      <TopNavigation
        notificationCount={2} // Mock notification count
        onNotificationClick={handleNotificationClick}
      />

      {/* Main Content Area - with top padding for fixed navigation */}
      <div className="pt-30 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Profile Card Section */}
          <div className="flex justify-center">
            {isLoadingFarm ? (
              <Card className="w-full max-w-md shadow-none">
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status"
                    aria-label="กำลังโหลด"
                  >
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                      กำลังโหลด...
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูลฟาร์ม...</p>
                </div>
              </Card>
            ) : farmError ? (
              <Card className="w-full max-w-md shadow-none border-destructive">
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                  <p className="text-sm text-destructive text-center">{farmError}</p>
                  <Button
                    onClick={fetchFarmData}
                    variant="outline"
                    className="w-full"
                  >
                    ลองใหม่
                  </Button>
                </div>
              </Card>
            ) : farm ? (
              <ProfileCard
                farm={farm}
                userAvatar={session.user?.image || undefined}
                onFarmUpdate={handleFarmUpdate}
                className="w-full max-w-md"
              />
            ) : null}
          </div>

          {/* Add Animal Button - FAB */}
          {/* <div className="flex justify-center mb-6">
            <Link href="/animals/create">
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md min-h-[48px]"
                aria-label="เพิ่มข้อมูลกระบือใหม่"
              >
                <Plus className="w-5 h-5" />
                เพิ่มข้อมูลกระบือ
              </button>
            </Link>
          </div> */}

          {/* Menu Grid Section */}
          <div className="flex justify-center">
            {userRole ? (
              <MenuGrid
                menuItems={defaultMenuItems}
                userRole={userRole}
                className="w-full max-w-md"
              />
            ) : (
              <MenuSkeleton />
            )}
          </div>

          {/* Logout Button Section */}
          <div className="flex justify-center pt-4">
            <GhostLogoutButton className="max-w-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
