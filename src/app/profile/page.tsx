"use client";

/**
 * Profile Page - Jaothui ID-Trace System
 * 
 * Simple profile page with logout functionality for Thai buffalo farmers.
 * 
 * Features:
 * - Display "profile page" text as main content
 * - Show user session information (username/email)
 * - Logout button with better-auth integration
 * - Protected route (authentication required)
 * - Mobile-first responsive design
 * - Loading states and error handling
 * 
 * Design Principles:
 * - Mobile-first (320px minimum width)
 * - Elderly-friendly (44px touch targets, high contrast)
 * - Thai language native
 * - Accessible (WCAG 2.1 AA compliant)
 * 
 * @route /profile
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

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  /**
   * Handle logout action
   * Signs out the user and redirects to login page
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Sign out using better-auth
      await signOut();
      
      // Redirect to login page after successful logout
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
      // Still redirect even if there's an error to ensure user is logged out
      router.push("/login");
    }
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            ระบบ ID-Trace
          </h1>
          <p className="text-sm text-muted-foreground">
            ข้อมูลผู้ใช้งาน
          </p>
        </div>

        {/* Profile Card */}
        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              profile page
            </CardTitle>
            <CardDescription className="text-center">
              ข้อมูลโปรไฟล์ของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Information */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  ข้อมูลผู้ใช้
                </h3>
                <div className="space-y-2">
                  {session.user?.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">อีเมล:</span>
                      <span className="text-sm font-medium text-foreground">
                        {session.user.email}
                      </span>
                    </div>
                  )}
                  {session.user?.name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ชื่อ:</span>
                      <span className="text-sm font-medium text-foreground">
                        {session.user.name}
                      </span>
                    </div>
                  )}
                  {!session.user?.email && !session.user?.name && (
                    <p className="text-sm text-muted-foreground text-center">
                      ไม่มีข้อมูลผู้ใช้
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="destructive"
              className="w-full h-12 text-base font-medium"
              aria-label="ออกจากระบบ"
            >
              {isLoggingOut ? (
                <span className="flex items-center justify-center gap-2">
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
                  กำลังออกจากระบบ...
                </span>
              ) : (
                "ออกจากระบบ"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          powered by JAOTHUI
        </p>
      </div>
    </div>
  );
}
