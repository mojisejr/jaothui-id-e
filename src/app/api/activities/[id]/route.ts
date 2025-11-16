/**
 * Single Activity API Endpoint - Jaothui ID-Trace System
 * 
 * GET /api/activities/[id] - Retrieve detailed information for a single activity
 * PUT /api/activities/[id] - Update activity status and details
 * 
 * Features:
 * - Session-based authentication using better-auth
 * - Farm membership verification for security
 * - Comprehensive error handling
 * - Returns complete activity data with related information
 * - Farm isolation (users can only access activities in their own farm)
 * 
 * Audit: 2025-11-16 - Created missing activities/[id] endpoint per API spec
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
import { z } from "zod";

/**
 * Required Next.js configuration for API routes
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/activities/[id] - Retrieve Single Activity Details
 * 
 * Returns detailed information for a specific activity identified by its UUID.
 * Verifies user authentication and farm membership before returning data.
 * 
 * Path Parameters:
 * - id: Activity UUID
 * 
 * @returns { success: boolean, data?: { activity }, error?: object, timestamp: string }
 * @status 200 | 401 | 403 | 404 | 500
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Step 2: Get activity by ID
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: {
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
        farm: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
      },
    });

    // Step 3: Check if activity exists
    if (!activity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACTIVITY_NOT_FOUND",
            message: "ไม่พบข้อมูลกิจกรรม",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Step 4: Verify user has access to this activity's farm
    const userFarm = await prisma.farm.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!userFarm || userFarm.id !== activity.farmId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Step 5: Return activity data
    return NextResponse.json(
      {
        success: true,
        data: {
          activity,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Activity GET [id] error:", error);
    
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

/**
 * PUT /api/activities/[id] - Update Activity
 * 
 * Updates activity information, particularly status and completion details.
 * 
 * Path Parameters:
 * - id: Activity UUID
 * 
 * Request Body:
 * - title (string, optional)
 * - description (string, optional)
 * - activityDate (string, optional)
 * - dueDate (string, optional)
 * - status (string, optional)
 * - statusReason (string, optional)
 * 
 * @returns { success: boolean, data?: { activity }, error?: object, timestamp: string }
 * @status 200 | 400 | 401 | 403 | 404 | 500
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Step 2: Parse request body
    const body = await request.json();

    // Step 3: Validate update data
    const updateSchema = z.object({
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional().nullable(),
      activityDate: z.coerce.date().optional(),
      dueDate: z.coerce.date().optional().nullable(),
      status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'OVERDUE']).optional(),
      statusReason: z.string().optional().nullable(),
    });

    const validatedData = updateSchema.parse(body);

    // Step 4: Get activity and verify ownership
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
    });

    if (!activity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACTIVITY_NOT_FOUND",
            message: "ไม่พบข้อมูลกิจกรรม",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Step 5: Verify user has access to this activity's farm
    const userFarm = await prisma.farm.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!userFarm || userFarm.id !== activity.farmId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Step 6: Prepare update data
    const updateData: any = {
      title: validatedData.title,
      description: validatedData.description,
      activityDate: validatedData.activityDate,
      dueDate: validatedData.dueDate,
      status: validatedData.status,
      statusReason: validatedData.statusReason,
    };

    // If status is being changed to COMPLETED, set completion details
    if (validatedData.status === 'COMPLETED' && activity.status !== 'COMPLETED') {
      updateData.completedBy = session.user.id;
      updateData.completedAt = new Date();
    }

    // Step 7: Update activity
    const updatedActivity = await prisma.activity.update({
      where: { id: params.id },
      data: updateData,
      include: {
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

    // Step 8: Return updated activity
    return NextResponse.json(
      {
        success: true,
        data: {
          activity: updatedActivity,
        },
        message: "อัปเดตกิจกรรมสำเร็จแล้ว",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const details = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "ข้อมูลไม่ถูกต้อง",
            details,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.error("Activity PUT [id] error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
