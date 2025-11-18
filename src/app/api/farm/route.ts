/**
 * Farm Management API Endpoints - Jaothui ID-Trace System
 *
 * This file provides REST API endpoints for farm management operations.
 * Follows existing codebase patterns and implements MVP single-farm validation.
 *
 * Features:
 * - GET /api/farm - Retrieve user's farm information
 * - POST /api/farm - Ensure farm exists (create if needed)
 * - PUT /api/farm - Update farm information (name, province)
 * - Session-based authentication using better-auth
 * - Single farm restriction per user
 * - Comprehensive error handling with proper HTTP status codes
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
 * Based on existing auth route pattern
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/farm - Retrieve User's Farm
 *
 * Returns the authenticated user's farm information.
 * If no farm exists, returns 404 error.
 *
 * @returns { farm: Farm } | { error: string }
 * @status 200 | 401 | 404 | 500
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user using existing codebase pattern
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's farm context
    try {
      const farmContext = await getUserFarmContext(session.user.id);
      return NextResponse.json({ farm: farmContext.farm });
    } catch (error) {
      if (error instanceof FarmContextError) {
        return NextResponse.json({ error: "No farm access" }, { status: 403 });
      }
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Farm GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/farm - Ensure Farm Exists
 *
 * Creates a farm for the authenticated user if one doesn't already exist.
 * Implements single-farm restriction by checking for existing farms first.
 * Uses Thai language defaults as specified in database schema.
 *
 * @returns { farm: Farm } | { error: string }
 * @status 200 | 201 | 401 | 500
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has farm context
    try {
      const farmContext = await getUserFarmContext(session.user.id);
      // Farm already exists, return it
      return NextResponse.json({ farm: farmContext.farm });
    } catch (error) {
      // No farm access - proceed to create farm for owners only
      if (!(error instanceof FarmContextError)) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
    }

    // Create new farm using schema defaults
    const farm = await prisma.farm.create({
      data: {
        name: "ฟาร์มของฉัน",  // Schema default
        province: "ไม่ระบุ",    // Schema default
        ownerId: session.user.id,
      },
    });

    return NextResponse.json({ farm }, { status: 201 });
  } catch (error) {
    console.error("Farm POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/farm - Update Farm Information
 *
 * Updates the authenticated user's farm information.
 * Only allows updating name and province fields as specified.
 * Validates that farm exists before updating.
 *
 * @param { name?: string, province?: string } - Update data
 * @returns { farm: Farm } | { error: string }
 * @status 200 | 400 | 401 | 404 | 500
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, province } = body;

    // Validate input - only allow name and province fields
    const allowedFields = { name, province };
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Farm name must be a non-empty string" }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (province !== undefined) {
      if (typeof province !== "string" || province.trim().length === 0) {
        return NextResponse.json({ error: "Province must be a non-empty string" }, { status: 400 });
      }
      updateData.province = province.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Get user's farm context
    try {
      const farmContext = await getUserFarmContext(session.user.id);

      // Update farm
      const updatedFarm = await prisma.farm.update({
        where: { id: farmContext.farm.id },
        data: updateData,
      });

      return NextResponse.json({ farm: updatedFarm });
    } catch (error) {
      if (error instanceof FarmContextError) {
        return NextResponse.json({ error: "No farm access" }, { status: 403 });
      }
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Farm PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}