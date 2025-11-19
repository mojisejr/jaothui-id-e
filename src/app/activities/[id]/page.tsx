/**
 * Activity Detail Page - Jaothui ID-Trace System
 *
 * Mobile-first server-side rendered page displaying activity information.
 * Uses ActivityDetailCard component with TopNavigation integration.
 *
 * Features:
 * - Server-side data fetching for optimal performance
 * - TopNavigation integration
 * - Single column vertical layout matching actual design
 * - Full-page component (no external background wrapper)
 * - Thai language translations for all fields
 * - Thai Buddhist Era (BE) calendar dates
 * - Mobile-first responsive design
 * - Accessibility compliant (WCAG 2.1 AA)
 *
 * Design Specifications:
 * - Layout: Single column vertical list (no grid)
 * - Card: Glassmorphic white card with subtle shadow
 * - Fields: Icon + Bold label + Light subtitle pattern
 * - Background: Clean gradient handled by component
 *
 * @route /activities/[id]
 * @component ActivityDetailPage
 */

import * as React from "react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUserFarmContext, FarmContextError } from "@/lib/farm-context";
import ActivityDetailCard from "@/components/activities/ActivityDetailCard";

/**
 * Enhanced loading skeleton component
 */
function ActivityDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-full h-96 bg-muted/30 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced error boundary component
 */
function ActivityDetailError({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
            <h2 className="text-lg font-semibold text-destructive mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Page props interface
 */
interface ActivityPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Enhanced activity page component with server-side data fetching
 */
export default async function ActivityPage({ params }: ActivityPageProps) {
  try {
    // Await params to get the id
    const { id } = await params;

    // Step 1: Authenticate user on server-side
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id) {
      // Redirect to login if not authenticated
      return (
        <ActivityDetailError error="กรุณาเข้าสู่ระบบก่อนดูข้อมูล" />
      );
    }

    // Step 2: Fetch activity data with farm verification
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        animal: {
          select: {
            id: true,
            tagId: true,
            name: true,
            imageUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        completer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Step 3: Check if activity exists
    if (!activity) {
      notFound();
    }

    // Step 4: Get user's farm context using farm context resolver
    let farmContext;
    try {
      farmContext = await getUserFarmContext(session.user.id);
    } catch (error) {
      console.error("Farm context error:", error);
      return <ActivityDetailError error="ไม่พบฟาร์มของคุณ" />;
    }

    const { farm } = farmContext;

    // Step 5: Verify user has access to this activity's farm
    if (farm.id !== activity.farmId) {
      return (
        <ActivityDetailError error={`คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้`} />
      );
    }

    // Step 6: Render page with activity data (component handles its own background)
    return (
      <Suspense fallback={<ActivityDetailSkeleton />}>
        <ActivityDetailCard 
          activity={activity}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Activity page error:", error);
    return <ActivityDetailError error="เกิดข้อผิดพลาดในการโหลดข้อมูล" />;
  }
}
