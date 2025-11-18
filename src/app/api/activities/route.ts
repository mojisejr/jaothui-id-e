/**
 * Activity Management API Endpoints - Jaothui ID-Trace System
 *
 * This file provides REST API endpoints for activity management operations.
 * Follows existing codebase patterns and implements farm isolation security.
 *
 * Features:
 * - GET /api/activities - List activities with filtering and pagination
 * - POST /api/activities - Create new activity record
 * - Session-based authentication using better-auth
 * - Farm membership verification for security
 * - Comprehensive error handling with Thai messages
 * - Farm isolation (users can only access activities in their own farm)
 *
 * Audit: 2025-11-16 - Created missing activities endpoint per API spec
 *
 * @framework Next.js 14 App Router
 * @authentication better-auth v1.3.34
 * @database PostgreSQL via Prisma ORM
 * @validation Zod schema
 * @language TypeScript (strict mode)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getUserFarmContext, FarmContextError } from "@/lib/farm-context";

/**
 * Required Next.js configuration for API routes
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/activities - List Activities with Filtering
 *
 * Returns a paginated list of activities for the authenticated user's farm.
 * Supports filtering by animal, status, and date range.
 *
 * Query Parameters:
 * - farmId: Farm ID (optional, defaults to user's farm)
 * - animalId: Filter by specific animal (optional)
 * - status: Filter by status (PENDING, COMPLETED, CANCELLED, OVERDUE) (optional)
 * - startDate: Start date for filtering (optional)
 * - endDate: End date for filtering (optional)
 * - page: Page number for pagination (optional, default: 1)
 * - limit: Items per page (optional, default: 20)
 *
 * @returns { success: boolean, data?: { activities, pagination }, error?: object, timestamp: string }
 * @status 200 | 400 | 401 | 404 | 500
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

    // Step 2: Extract query parameters
    const { searchParams } = new URL(request.url);
    const animalId = searchParams.get('animalId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Step 3: Get user's farm context
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

    // Step 4: Build where clause
    const whereClause: any = {
      farmId: farm.id,
    };

    if (animalId) {
      whereClause.animalId = animalId;
    }

    if (status) {
      const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED', 'OVERDUE'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_STATUS",
              message: "สถานะไม่ถูกต้อง",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.activityDate = {};
      if (startDate) {
        whereClause.activityDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.activityDate.lte = new Date(endDate);
      }
    }

    // Step 5: Query activities with pagination
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: whereClause,
        orderBy: { activityDate: 'desc' },
        skip,
        take: limit,
        include: {
          animal: {
            select: {
              id: true,
              tagId: true,
              name: true,
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
      }),
      prisma.activity.count({ where: whereClause }),
    ]);

    // Step 6: Return response with pagination
    return NextResponse.json(
      {
        success: true,
        data: {
          activities,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Activities GET error:", error);
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
 * POST /api/activities - Create New Activity
 *
 * Creates a new activity record for an animal in the authenticated user's farm.
 *
 * Request Body:
 * - animalId (string, required): Animal UUID
 * - title (string, required): Activity title
 * - description (string, optional): Activity description
 * - activityDate (string, required): Activity date (ISO format)
 * - dueDate (string, optional): Due date (ISO format)
 * - status (string, optional): Activity status (default: PENDING)
 *
 * @returns { success: boolean, data?: { activity }, error?: object, timestamp: string }
 * @status 201 | 400 | 401 | 403 | 404 | 500
 */
export async function POST(request: NextRequest) {
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

    // Step 3: Validate input
    const activitySchema = z.object({
      animalId: z.string().uuid("Animal ID ต้องเป็น UUID"),
      title: z.string().min(1, "หัวข้อต้องระบุ").max(255, "หัวข้อต้องไม่เกิน 255 ตัวอักษร"),
      description: z.string().optional().nullable(),
      activityDate: z.coerce.date({ message: "วันที่กิจกรรมต้องระบุ" }),
      dueDate: z.coerce.date().optional().nullable(),
      status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'OVERDUE']).default('PENDING'),
    });

    const validatedData = activitySchema.parse(body);

    // Step 4: Get user's farm context
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
            message: "เกิดข้อผิดพลาดในการสร้างกิจกรรม",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    const { farm } = farmContext;

    // Step 5: Verify animal belongs to user's farm
    const animal = await prisma.animal.findUnique({
      where: { id: validatedData.animalId },
    });

    if (!animal) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ANIMAL_NOT_FOUND",
            message: "ไม่พบข้อมูลกระบือ",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    if (animal.farmId !== farm.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "คุณไม่มีสิทธิ์สร้างกิจกรรมสำหรับกระบือนี้",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Step 6: Create activity
    const activity = await prisma.activity.create({
      data: {
        farmId: farm.id,
        animalId: validatedData.animalId,
        title: validatedData.title,
        description: validatedData.description || null,
        activityDate: validatedData.activityDate,
        dueDate: validatedData.dueDate || null,
        status: validatedData.status,
        createdBy: session.user.id,
      },
      include: {
        animal: {
          select: {
            id: true,
            tagId: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Step 7: Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          activity,
        },
        message: "สร้างกิจกรรมสำเร็จแล้ว",
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
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

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_REFERENCE",
              message: "ข้อมูลอ้างอิงไม่ถูกต้อง",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    console.error("Activities POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "เกิดข้อผิดพลาดในการสร้างกิจกรรม",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
