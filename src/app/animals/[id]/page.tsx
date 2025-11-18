/**
 * Animal Detail Page - Jaothui ID-Trace System
 *
 * Mobile-first server-side rendered page displaying animal information.
 * Uses AnimalDetailCard component with TopNavigation integration.
 *
 * Features:
 * - Server-side data fetching for optimal performance
 * - TopNavigation integration (replaces old header)
 * - Single column vertical layout matching actual design
 * - Full-page component (no external background wrapper)
 * - Notification count from due/overdue activities
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
 * @route /animals/[id]
 * @component AnimalDetailPage
 */

import * as React from "react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUserFarmContext, FarmContextError } from "@/lib/farm-context";
import AnimalDetailCard, { type Animal } from "@/components/animals/AnimalDetailCard";

/**
 * Enhanced loading skeleton component
 */
function AnimalDetailSkeleton() {
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
function AnimalDetailError({ error }: { error: string }) {
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
interface AnimalPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Enhanced animal page component with server-side data fetching
 */
export default async function AnimalPage({ params }: AnimalPageProps) {
  try {
    // Await params to get the id
    const { id } = await params;

    // Step 1: Authenticate user on server-side
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id) {
      // Redirect to login if not authenticated
      return (
        <AnimalDetailError error="กรุณาเข้าสู่ระบบก่อนดูข้อมูล" />
      );
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

    // Step 4: Get user's farm context using farm context resolver
    let farmContext;
    try {
      farmContext = await getUserFarmContext(session.user.id);
    } catch (error) {
      console.error("Farm context error:", error);
      return <AnimalDetailError error="ไม่พบฟาร์มของคุณ" />;
    }

    const { farm } = farmContext;

    // DEBUG: Log farm ID comparison
    console.log("DEBUG - Farm ID Comparison:");
    console.log("- User farm ID:", farm.id);
    console.log("- Animal farm ID:", animal.farmId);
    console.log("- User farm name:", farm.name);
    console.log("- Animal farm name:", animal.farm.name);
    console.log("- Are they equal?", farm.id === animal.farmId);

    // Step 5: Verify user has access to this animal's farm
    if (farm.id !== animal.farmId) {
      return (
        <AnimalDetailError error={`คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้ (Farm ID mismatch: ${farm.id} vs ${animal.farmId})`} />
      );
    }

    // Step 6: Fetch notification count (due/overdue activities)
    const today = new Date();
    const notificationCount = await prisma.activity.count({
      where: {
        farmId: farm.id,
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

    // Step 7: Transform animal data to match interface (convert Decimal to number)
    const animalData = {
      ...animal,
      weightKg: animal.weightKg ? Number(animal.weightKg) : null,
    };

    // Step 8: Render page with animal data (component handles its own background)
    return (
      <Suspense fallback={<AnimalDetailSkeleton />}>
        <AnimalDetailCard 
          animal={animalData}
          notificationCount={notificationCount}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Animal page error:", error);
    return <AnimalDetailError error="เกิดข้อผิดพลาดในการโหลดข้อมูล" />;
  }
}
