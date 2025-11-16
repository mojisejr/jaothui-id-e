/**
 * Single Animal API Endpoint - Jaothui ID-Trace System
 * 
 * GET /api/animals/[id] - Retrieve detailed information for a single animal
 * 
 * Features:
 * - Session-based authentication using better-auth
 * - Farm membership verification for security
 * - Comprehensive error handling
 * - Returns complete animal data with all fields
 * - Farm isolation (users can only access animals in their own farm)
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
