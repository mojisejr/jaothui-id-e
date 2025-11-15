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
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

/**
 * Required Next.js configuration for API routes
 * Based on existing auth route pattern
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    // Step 3: Get user's farm (following existing farm API pattern)
    const farm = await prisma.farm.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FARM_NOT_FOUND",
            message: "ไม่พบฟาร์มของคุณ กรุณาสร้างฟาร์มก่อน",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Step 4: Verify user permissions (owner or member)
    if (farm.ownerId !== session.user.id) {
      // Only check membership for non-owners
      const membership = await prisma.farmMember.findUnique({
        where: {
          farmId_userId: {
            farmId: farm.id,
            userId: session.user.id,
          },
        },
      });

      if (!membership) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "คุณไม่มีสิทธิ์เข้าถึงฟาร์มนี้",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }
    }

    // Step 5: Auto-populate farmId from session (farm isolation)
    const dataWithFarm = {
      ...body,
      farmId: farm.id,
    };

    // Step 6: Validate input with Zod schema (from Task 1.1)
    const validatedData = animalSchema.parse(dataWithFarm);

    // Step 7: Create animal in database via Prisma
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

    // Step 8: Return success response with created animal
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

    // Handle Prisma database errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: Unique constraint violation (duplicate tagId in farm)
      if (error.code === "P2002") {
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

      // P2003: Foreign key constraint violation
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
