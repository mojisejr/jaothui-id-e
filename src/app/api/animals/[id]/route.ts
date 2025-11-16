/**
 * Single Animal API Endpoint - Jaothui ID-Trace System
 * 
 * GET /api/animals/[id] - Retrieve detailed information for a single animal
 * PUT /api/animals/[id] - Update animal information
 * DELETE /api/animals/[id] - Soft delete animal (status change)
 * 
 * Features:
 * - Session-based authentication using better-auth
 * - Farm membership verification for security
 * - Comprehensive error handling
 * - Returns complete animal data with all fields
 * - Farm isolation (users can only access animals in their own farm)
 * 
 * Audit: 2025-11-16 - Added missing PUT and DELETE handlers per API spec
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
import { Prisma } from "@prisma/client";

/**
 * Required Next.js configuration for API routes
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/animals/[id] - Retrieve Single Animal Details
 * 
 * Returns detailed information for a specific animal identified by its UUID.
 * Verifies user authentication and farm membership before returning data.
 * 
 * Path Parameters:
 * - id: Animal UUID
 * 
 * @returns { success: boolean, data?: { animal }, error?: object, timestamp: string }
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

    // Step 2: Get animal by ID
    const animal = await prisma.animal.findUnique({
      where: { id: params.id },
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

    // Step 4: Verify user has access to this animal's farm
    const userFarm = await prisma.farm.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!userFarm || userFarm.id !== animal.farmId) {
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

    // Step 5: Return animal data
    return NextResponse.json(
      {
        success: true,
        data: {
          animal,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Animal GET [id] error:", error);
    
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
 * PUT /api/animals/[id] - Update Animal Information
 * 
 * Updates specific fields of an existing animal record.
 * Allows updating: name, color, weightKg, heightCm, motherTag, fatherTag, genome
 * 
 * Path Parameters:
 * - id: Animal UUID
 * 
 * Request Body:
 * - name (string, optional)
 * - color (string, optional)
 * - weightKg (number, optional)
 * - heightCm (number, optional)
 * - motherTag (string, optional)
 * - fatherTag (string, optional)
 * - genome (string, optional)
 * 
 * @returns { success: boolean, data?: { animal }, error?: object, timestamp: string }
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
      name: z.string().max(255).optional().nullable(),
      color: z.string().max(255).optional().nullable(),
      weightKg: z.number().positive().optional().nullable(),
      heightCm: z.number().int().positive().optional().nullable(),
      motherTag: z.string().max(255).optional().nullable(),
      fatherTag: z.string().max(255).optional().nullable(),
      genome: z.string().optional().nullable(),
    });

    const validatedData = updateSchema.parse(body);

    // Step 4: Get animal and verify ownership
    const animal = await prisma.animal.findUnique({
      where: { id: params.id },
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

    // Step 5: Verify user has access to this animal's farm
    const userFarm = await prisma.farm.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!userFarm || userFarm.id !== animal.farmId) {
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

    // Step 6: Update animal
    const updatedAnimal = await prisma.animal.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        color: validatedData.color,
        weightKg: validatedData.weightKg,
        heightCm: validatedData.heightCm,
        motherTag: validatedData.motherTag,
        fatherTag: validatedData.fatherTag,
        genome: validatedData.genome,
      },
    });

    // Step 7: Return updated animal
    return NextResponse.json(
      {
        success: true,
        data: {
          animal: updatedAnimal,
        },
        message: "อัปเดตข้อมูลกระบือสำเร็จแล้ว",
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

    console.error("Animal PUT [id] error:", error);
    
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

/**
 * DELETE /api/animals/[id] - Soft Delete Animal
 * 
 * Performs soft delete by changing animal status to TRANSFERRED, DECEASED, or SOLD.
 * Does not physically delete the record from the database.
 * 
 * Path Parameters:
 * - id: Animal UUID
 * 
 * Request Body:
 * - status (string, required): New status (TRANSFERRED | DECEASED | SOLD)
 * - reason (string, optional): Reason for status change
 * 
 * @returns { success: boolean, data?: { animal }, error?: object, timestamp: string }
 * @status 200 | 400 | 401 | 403 | 404 | 500
 */
export async function DELETE(
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

    // Step 3: Validate status change
    const deleteSchema = z.object({
      status: z.enum(["TRANSFERRED", "DECEASED", "SOLD"], {
        message: "สถานะต้องเป็น TRANSFERRED, DECEASED, หรือ SOLD",
      }),
      reason: z.string().optional().nullable(),
    });

    const validatedData = deleteSchema.parse(body);

    // Step 4: Get animal and verify ownership
    const animal = await prisma.animal.findUnique({
      where: { id: params.id },
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

    // Step 5: Verify user has access to this animal's farm
    const userFarm = await prisma.farm.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!userFarm || userFarm.id !== animal.farmId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "คุณไม่มีสิทธิ์ลบข้อมูลนี้",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Step 6: Update animal status (soft delete)
    const updatedAnimal = await prisma.animal.update({
      where: { id: params.id },
      data: {
        status: validatedData.status,
      },
    });

    // Step 7: Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          animal: updatedAnimal,
        },
        message: `เปลี่ยนสถานะกระบือเป็น ${validatedData.status} สำเร็จแล้ว`,
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

    console.error("Animal DELETE [id] error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "เกิดข้อผิดพลาดในการลบข้อมูล",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
