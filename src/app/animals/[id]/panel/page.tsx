/**
 * Animal Panel Page - Jaothui ID-Trace System
 *
 * Mobile-first server-side rendered page for managing animal information and activities.
 * Provides tab navigation between Edit Information and Manage Activities sections.
 *
 * Features:
 * - Server-side data fetching for optimal performance
 * - TopNavigation integration (64px height)
 * - Tab navigation with two tabs:
 *   - Tab 1: 📋 แก้ไขข้อมูล (Edit Information)
 *   - Tab 2: 🎯 จัดการกิจกรรม (Manage Activities)
 * - Client-side tab state management
 * - Farm security verification (user can only access their own animals)
 * - Thai language translations throughout
 * - Mobile-first responsive design (320px minimum)
 * - Accessibility compliant (WCAG 2.1 AA)
 *
 * Design Specifications:
 * - Layout: Full-screen with TopNavigation
 * - Card: Glassmorphic design with backdrop blur
 * - Tabs: Minimal design following profile page patterns
 * - Touch targets: 48px minimum for buttons and tabs
 * - Background: Clean gradient matching actual design
 *
 * @route /animals/[id]/panel
 * @component AnimalPanelPage
 */

import * as React from "react";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import AnimalPanelContent from "./AnimalPanelContent";

/**
 * Enhanced loading skeleton component
 */
function AnimalPanelSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Tab navigation skeleton */}
          <div className="w-full h-12 bg-muted/30 rounded-xl animate-pulse" />
          {/* Content skeleton */}
          <div className="w-full h-96 bg-muted/30 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced error boundary component
 */
function AnimalPanelError({ error }: { error: string }) {
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
interface AnimalPanelPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Enhanced animal panel page component with server-side data fetching
 */
export default async function AnimalPanelPage({ params }: AnimalPanelPageProps) {
  try {
    // Await params to get the id
    const { id } = await params;

    // Step 1: Authenticate user on server-side
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id) {
      // Redirect to login if not authenticated
      redirect("/login");
    }

    // Step 2: Fetch animal data with farm verification
    const animal = await prisma.animal.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
      },
    });

    // Step 3: Check if animal exists
    if (!animal) {
      notFound();
    }

    // Step 4: Verify user has access to this animal's farm
    const userFarm = await prisma.farm.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!userFarm || userFarm.id !== animal.farmId) {
      return (
        <AnimalPanelError error="คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" />
      );
    }

    // Step 5: Fetch notification count (due/overdue activities)
    const today = new Date();
    const notificationCount = await prisma.activity.count({
      where: {
        farmId: userFarm.id,
        status: {
          in: ['PENDING', 'OVERDUE']
        },
        OR: [
          {
            dueDate: {
              lte: today
            }
          },
          {
            activityDate: {
              lte: today
            },
            dueDate: null
          }
        ]
      }
    });

    // Step 6: Fetch activities for this animal
    const activities = await prisma.activity.findMany({
      where: {
        animalId: id,
        farmId: userFarm.id,
      },
      include: {
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
      orderBy: {
        activityDate: 'desc',
      },
    });

    // Step 7: Render page with animal data and activities (client component handles tabs and content)
    return (
      <Suspense fallback={<AnimalPanelSkeleton />}>
        <AnimalPanelContent 
          animal={animal}
          activities={activities}
          notificationCount={notificationCount}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Animal panel page error:", error);
    return <AnimalPanelError error="เกิดข้อผิดพลาดในการโหลดข้อมูล" />;
  }
}
