/**
 * Activities Page - Jaothui ID-Trace System
 * 
 * Main activities management page showing all farm activities with filtering and infinite scroll.
 * Replaces MockNotificationsTab with complete activity management interface.
 * 
 * Features:
 * - ActivitiesTab component with full functionality
 * - Protected route (authentication required)
 * - Mobile-first responsive design
 * - Thai language support
 * - Accessibility compliance
 * - Loading states and error handling
 * 
 * @route /activities
 * @component ActivitiesPage
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth-client';
import ActivitiesTab from '@/components/activities/ActivitiesTab';

export default function ActivitiesPage() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();

  /**
   * Redirect to login if not authenticated
   */
  React.useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
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
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive">
            <h2 className="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-sm">ไม่สามารถตรวจสอบการเข้าสู่ระบบได้</p>
          </div>
          <Button
            onClick={() => router.push('/login')}
            className="w-full"
            aria-label="กลับไปหน้าเข้าสู่ระบบ"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </Button>
        </div>
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
   * Handle back navigation
   */
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Top Navigation */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xs border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-10 px-3"
            aria-label="กลับ"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">
            รายการกิจกรรม
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <ActivitiesTab />
      </div>
    </div>
  );
}
