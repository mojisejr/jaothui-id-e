/**
 * Staff User Management API Endpoints - Jaothui ID-Trace System
 *
 * This file provides REST API endpoints for staff user management.
 * Follows existing codebase patterns and implements owner-only access control.
 *
 * Features:
 * - POST /api/users/staff - Create new staff account (owner only)
 * - GET /api/users/staff - List staff members (owner only)
 * - Session-based authentication using better-auth
 * - Farm ownership verification for security
 * - Password hashing for staff accounts
 * - Comprehensive error handling with Thai messages
 *
 * Audit: 2025-11-16 - Created missing users/staff endpoint per API spec
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
import argon2 from "argon2";
import { staffSchema, sanitizeEmail } from "@/lib/validations/staff";

/**
 * Required Next.js configuration for API routes
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/users/staff - List Staff Members
 *
 * Returns a list of staff members for the authenticated farm owner.
 * Only farm owners can access this endpoint.
 *
 * Query Parameters:
 * - farmId: Farm ID (optional, defaults to user's farm)
 * - page: Page number for pagination (optional, default: 1)
 * - limit: Items per page (optional, default: 20)
 *
 * @returns { success: boolean, data?: { staff, pagination }, error?: object, timestamp: string }
 * @status 200 | 401 | 403 | 404 | 500
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Step 3: Verify user is farm owner
    const farm = await prisma.farm.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FARM_NOT_FOUND",
            message: "ไม่พบฟาร์มของคุณ",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Step 4: Query staff members with pagination
    const skip = (page - 1) * limit;

    const [memberships, total] = await Promise.all([
      prisma.farmMember.findMany({
        where: {
          farmId: farm.id,
          role: 'MEMBER',
        },
        orderBy: { joinedAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }),
      prisma.farmMember.count({
        where: {
          farmId: farm.id,
          role: 'MEMBER',
        },
      }),
    ]);

    // Step 5: Format response
    const staff = memberships.map((membership) => ({
      id: membership.user.id,
      username: membership.user.username,
      firstName: membership.user.firstName,
      lastName: membership.user.lastName,
      role: membership.role,
      joinedAt: membership.joinedAt,
      createdAt: membership.user.createdAt,
      updatedAt: membership.user.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          staff,
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
    console.error("Users/staff GET error:", error);
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
 * POST /api/users/staff - Create Staff Account
 *
 * Creates a new staff account and assigns them to the farm.
 * Only farm owners can create staff accounts.
 *
 * Request Body:
 * - username (string, required): Username for staff login
 * - password (string, required): Password for staff account
 * - firstName (string, required): Staff first name
 * - lastName (string, required): Staff last name
 *
 * @returns { success: boolean, data?: { user, membership }, error?: object, timestamp: string }
 * @status 201 | 400 | 401 | 403 | 404 | 409 | 500
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

    // Step 3: Validate input using shared staffSchema
    const validatedData = staffSchema.parse(body);

    // Step 4: Verify user is farm owner
    const farm = await prisma.farm.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FARM_NOT_FOUND",
            message: "ไม่พบฟาร์มของคุณ",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Step 5: Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_USERNAME",
            message: "ชื่อผู้ใช้นี้มีในระบบแล้ว",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Step 6: Hash password
    const passwordHash = await argon2.hash(validatedData.password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    // Step 7: Create user and membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user with sanitized email
      const user = await tx.user.create({
        data: {
          username: validatedData.username,
          passwordHash,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          // Ensure email is null if not provided
          email: sanitizeEmail(validatedData.email),
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Create farm membership
      const membership = await tx.farmMember.create({
        data: {
          farmId: farm.id,
          userId: user.id,
          role: 'MEMBER',
        },
      });

      return { user, membership };
    });

    // Step 8: Return success response
    return NextResponse.json(
      {
        success: true,
        data: result,
        message: "สร้างบัญชีพนักงานสำเร็จแล้ว",
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

    console.error("Users/staff POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "เกิดข้อผิดพลาดในการสร้างบัญชี",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

