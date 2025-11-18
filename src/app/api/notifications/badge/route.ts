/**
 * Notification Badge API Endpoint - Jaothui ID-Trace System
 * 
 * GET /api/notifications/badge - Get notification badge count
 * 
 * Features:
 * - Session-based authentication using better-auth
 * - Counts pending and overdue activities
 * - Farm membership verification for security
 * - Returns notification count for badge display
 * - Farm isolation (users can only see their farm's notifications)
 * 
 * Audit: 2025-11-16 - Created missing notifications/badge endpoint per API spec
 * 
 * @framework Next.js 14 App Router
 * @authentication better-auth v1.3.34
 * @database PostgreSQL via Prisma ORM
 * @language TypeScript (strict mode)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUserFarmContext, FarmContextError } from "@/lib/farm-context";

/**
 * Required Next.js configuration for API routes
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications/badge - Get Notification Badge Count
 * 
 * Returns the count of pending and overdue activities for the authenticated user's farm.
 * Used to display notification badges in the UI.
 * 
 * Query Parameters:
 * - farmId: Farm ID (optional, defaults to user's farm)
 * 
 * @returns { success: boolean, data?: { badgeCount, breakdown, farmCounts }, error?: object, timestamp: string }
 * @status 200 | 401 | 404 | 500
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "ต้องเข้าสู่ระบบก่อน",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Step 2: Get user's farm context
    let farmContext;
    try {
      farmContext = await getUserFarmContext(session.user.id);
    } catch (error) {
      if (error instanceof FarmContextError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "NO_FARM_ACCESS",
              message: "ไม่พบฟาร์มของคุณ",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    const { farm } = farmContext;

    // Step 3: Count pending activities (activities that are not completed)
    const pendingCount = await prisma.activity.count({
      where: {
        farmId: farm.id,
        status: 'PENDING',
      },
    });

    // Step 4: Count overdue activities
    const overdueCount = await prisma.activity.count({
      where: {
        farmId: farm.id,
        status: 'OVERDUE',
      },
    });

    // Step 5: Calculate total badge count
    const badgeCount = pendingCount + overdueCount;

    // Step 6: Return badge information
    return NextResponse.json(
      {
        success: true,
        data: {
          badgeCount,
          breakdown: {
            pending: pendingCount,
            overdue: overdueCount,
          },
          farmCounts: [
            {
              farmId: farm.id,
              farmName: farm.name,
              count: badgeCount,
            },
          ],
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Notifications/badge GET error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
