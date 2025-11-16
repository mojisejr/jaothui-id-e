/**
 * Animal Detail Page - Jaothui ID-Trace System
 *
 * Enhanced server-side rendered page displaying comprehensive animal information.
 * Uses AnimalDetailCard component based on ProfileCard glassmorphic design pattern.
 *
 * Features:
 * - Server-side data fetching for optimal performance
 * - Enhanced glassmorphic card design (bg-card/85 backdrop-blur-md)
 * - 160x160px animal image with improved loading states
 * - 100% database field utilization with three-column responsive layout
 * - Thai language translations for all enum fields
 * - Thai Buddhist Era (BE) calendar dates
 * - Enhanced touch targets (48px minimum)
 * - Improved error handling and loading states
 * - Mobile-first responsive design
 * - Accessibility compliant (WCAG 2.1 AA)
 *
 * Design Specifications:
 * - Card: Enhanced glassmorphic with backdrop-blur-md
 * - Image: 160x160px rounded-xl with blur placeholder
 * - Layout: Three-column responsive grid (grid-cols-1 md:grid-cols-2)
 * - Touch targets: 48px minimum for buttons
 * - Background: Enhanced gradient (from-background via-secondary/10 to-secondary/20)
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
import AnimalDetailCard, { type Animal } from "@/components/animals/AnimalDetailCard";

/**
 * Enhanced loading skeleton component
 */
function AnimalDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-secondary/20">
      <div className="pt-30 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="w-full max-w-md h-96 bg-muted/30 rounded-xl animate-pulse" />
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-secondary/20">
      <div className="pt-30 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
              <h2 className="text-lg font-semibold text-destructive mb-2">เกิดข้อผิดพลาด</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
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

    // Step 4: Verify user has access to this animal's farm
    const userFarm = await prisma.farm.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!userFarm || userFarm.id !== animal.farmId) {
      return (
        <AnimalDetailError error="คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" />
      );
    }

    // Step 5: Render page with animal data
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-secondary/20 transition-colors duration-300">
        <div className="pt-30 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center">
              <Suspense fallback={<AnimalDetailSkeleton />}>
                <AnimalDetailCard 
                  animal={animal} 
                  className="w-full max-w-md"
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Animal page error:", error);
    return <AnimalDetailError error="เกิดข้อผิดพลาดในการโหลดข้อมูล" />;
  }
}
