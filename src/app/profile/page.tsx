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
 * - Mock data integration for farm information
 * - Session integration for real user authentication and avatar
 * - Loading states and error handling
 * - Accessibility compliance (WCAG 2.1 AA)
 *
 * Design Principles:
 * - Mobile-first (375px minimum viewport)
 * - Elderly-friendly (44px+ touch targets, high contrast)
 * - Thai language native with English help text
 * - Component-based architecture
 * - Mock data ready for API integration
 *
 * @route /profile
 * @component ProfilePage
 */

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { ProfileCard } from "@/components/profile/ProfileCard";
import MenuGrid, { defaultMenuItems } from "@/components/profile/MenuGrid";
import { GhostLogoutButton } from "@/components/profile/GhostLogoutButton";

// Mock Data Integration
import { getMockFarmForUser } from "@/lib/mock-data";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();

  /**
   * Redirect to login if not authenticated
   */
  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

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
        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-lg max-w-md w-full">
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
   * Get mock farm data with real user ID integration
   * In production, this would be replaced with actual API calls
   */
  const mockFarm = getMockFarmForUser(session.user?.id || "");

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
      <div className="pt-16 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Profile Card Section */}
          <div className="flex justify-center">
            <ProfileCard
              farm={mockFarm}
              userAvatar={session.user?.image || undefined}
              className="w-full max-w-md"
            />
          </div>

          {/* Menu Grid Section */}
          <div className="flex justify-center">
            <MenuGrid
              menuItems={defaultMenuItems}
              className="w-full max-w-2xl"
            />
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
