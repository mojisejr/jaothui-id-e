/**
 * Animal Management API Endpoints - Jaothui ID-Trace System
 *
 * This file provides REST API endpoints for animal management operations.
 * Follows existing codebase patterns and implements farm isolation security.
 *
 * Features:
 * - POST /api/animals - Create new animal record
 * - Session-based authentication using better-auth
 * - Farm membership verification for security
 * - Zod schema validation for input data
 * - Comprehensive error handling with Thai messages
 * - Duplicate tagId detection per farm
 * - Farm isolation (users can only create animals in their own farm)
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
import { animalSchema } from "@/lib/validations/animal";
import { ZodError } from "zod";
import { getUserFarmContext, FarmContextError } from "@/lib/farm-context";

/**
 * Required Next.js configuration for API routes
 * Based on existing auth route pattern
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/animals - Retrieve Paginated Animals List
 *
 * Returns a paginated list of the authenticated user's animals.
 * Supports cursor pagination, search functionality, and status filtering.
 *
 * Query Parameters:
 * - cursor: ISO timestamp for pagination cursor (optional)
 * - search: Search term for tagId and name fields (optional)
 * - status: AnimalStatus enum value for filtering (optional)
 *
 * @returns { animals: Animal[], nextCursor: string | null, hasMore: boolean, pendingActivitiesCount: number }
 * @status 200 | 401 | 404 | 500
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user using existing codebase pattern
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Validate cursor format if provided
    let cursorDate: Date | undefined;
    if (cursor) {
      cursorDate = new Date(cursor);
      if (isNaN(cursorDate.getTime())) {
        return NextResponse.json({ error: "Invalid cursor format" }, { status: 400 });
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['ACTIVE', 'TRANSFERRED', 'DECEASED', 'SOLD'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({
          error: "Invalid status value. Must be one of: " + validStatuses.join(', ')
        }, { status: 400 });
      }
    }

    // Get user's farm context using farm context resolver
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
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลฟาร์ม",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    const { farm } = farmContext;

    // Build where clause for animal query
    const whereClause: any = {
      farmId: farm.id,
    };

    // Add search functionality for tagId and name fields
    if (search && search.trim()) {
      whereClause.OR = [
        { tagId: { contains: search.trim(), mode: 'insensitive' } },
        { name: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    // Add status filtering
    if (status) {
      whereClause.status = status;
    }

    // Optimized single-query approach using Prisma include with conditional counts
    // This replaces 3 sequential queries with 1 query that includes activity counts
    const animals = await prisma.animal.findMany({
      where: {
        ...whereClause,
        ...(cursorDate && { createdAt: { lt: cursorDate } }),
      },
      orderBy: { createdAt: 'desc' },
      take: 21, // Fetch one extra to determine if there are more records
      include: {
        _count: {
          select: {
            activities: {
              where: {
                status: { in: ['PENDING', 'OVERDUE'] }
              }
            }
          }
        }
      }
    });

    // Determine if there are more records
    const hasMore = animals.length > 20;
    if (hasMore) {
      animals.pop(); // Remove the extra record used to check for more data
    }

    // Get the cursor for the next page (timestamp of the last record)
    const nextCursor = animals.length > 0
      ? animals[animals.length - 1].createdAt.toISOString()
      : null;

    // Count pending activities for TopNavigation notifications
    // This is a separate requirement for the top navigation badge
    const pendingActivitiesCount = await prisma.activity.count({
      where: {
        farmId: farm.id,
        status: 'PENDING',
      },
    });

    // Transform animals to include notificationCount from the included _count
    // Maintaining backward compatibility with existing API response structure
    const animalsWithCounts = animals.map(animal => {
      const { _count, ...animalData } = animal;
      return {
        ...animalData,
        notificationCount: _count.activities,
      };
    });

    return NextResponse.json({
      animals: animalsWithCounts,
      nextCursor,
      hasMore,
      pendingActivitiesCount,
    });
  } catch (error) {
    console.error("Animals GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/animals - Create New Animal
 *
 * Creates a new animal record for the authenticated user's farm.
 * Implements comprehensive validation and security checks:
 * 1. Verifies user authentication
 * 2. Validates user has an active farm
 * 3. Verifies farm membership
 * 4. Validates input data with Zod schema
 * 5. Creates animal with proper defaults
 * 6. Handles duplicate tagId errors
 *
 * @returns { success: boolean, data?: { animal }, error?: object, message?: string, timestamp: string }
 * @status 201 | 400 | 401 | 403 | 404 | 409 | 500
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user using existing codebase pattern
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

    // Step 3: Get user's farm context using farm context resolver
    let farmContext;
    try {
      farmContext = await getUserFarmContext(session.user.id);
    } catch (error) {
      if (error instanceof FarmContextError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FARM_NOT_FOUND",
              message: "ไม่พบฟาร์มของคุณ กรุณาสร้างฟาร์มก่อน",
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
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลฟาร์ม",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    const { farm } = farmContext;

    // Step 4: Auto-populate farmId from session (farm isolation)
    const dataWithFarm = {
      ...body,
      farmId: farm.id,
    };

    // Step 5: Validate input with Zod schema (from Task 1.1)
    const validatedData = animalSchema.parse(dataWithFarm);

    // Step 6: Create animal in database via Prisma
    // Status is auto-set to "ACTIVE" by schema default
    // Timestamps are auto-managed by Prisma
    const animal = await prisma.animal.create({
      data: {
        farmId: validatedData.farmId,
        tagId: validatedData.tagId,
        type: validatedData.type,
        name: validatedData.name || null,
        gender: validatedData.gender || "FEMALE",
        color: validatedData.color || null,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
        weightKg: validatedData.weightKg || null,
        heightCm: validatedData.heightCm || null,
        motherTag: validatedData.motherTag || null,
        fatherTag: validatedData.fatherTag || null,
        genome: validatedData.genome || null,
        // status defaults to ACTIVE via Prisma schema
        // imageUrl defaults to null
      },
    });

    // Step 7: Return success response with created animal
    return NextResponse.json(
      {
        success: true,
        data: {
          animal,
        },
        message: "บันทึกข้อมูลกระบือสำเร็จแล้ว",
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );

  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
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

    // Check for duplicate tagId error (unique constraint)
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('Unique constraint') || errorMessage.includes('duplicate key')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_TAG",
            message: "หมายเลขแท็กนี้มีในระบบแล้ว",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "รูปแบบข้อมูลไม่ถูกต้อง",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Log unexpected errors for debugging
    console.error("Animal POST error:", error);

    // Return generic internal server error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "เกิดข้อผิดพลาดในการบันทึก",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
