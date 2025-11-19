/**
 * Farm Context Resolver Utility
 *
 * This utility provides centralized farm context resolution for user authorization.
 * It checks both farm ownership and membership to determine proper user access levels.
 *
 * Features:
 * - Ownership check prioritized (for legitimate farm owners)
 * - Membership check fallback (for staff users)
 * - Structured return data: { farm, role, accessLevel }
 * - Edge case handling (no access, multiple farms, etc.)
 * - Complete TypeScript interfaces
 * - Comprehensive error handling
 */

import { prisma } from './prisma';
import type { Farm, FarmMember, Role } from '@/types/farm';

/**
 * Farm Context Result Interface
 * Represents the user's access context to a specific farm
 */
export interface FarmContextResult {
  /** The farm the user has access to */
  farm: Farm;
  /** User's role in the farm (OWNER or MEMBER) */
  role: Role;
  /** Access level based on role */
  accessLevel: 'full' | 'limited';
}

/**
 * Farm Context Options
 * Optional parameters for farm context resolution
 */
export interface FarmContextOptions {
  /** Optional specific farm ID to check access for */
  farmId?: string;
  /** Include membership details in result */
  includeMembership?: boolean;
}

/**
 * Error types for farm context resolution
 */
export class FarmContextError extends Error {
  constructor(
    message: string,
    public code: 'NO_ACCESS' | 'MULTIPLE_FARMS' | 'INVALID_USER' | 'DATABASE_ERROR'
  ) {
    super(message);
    this.name = 'FarmContextError';
  }
}

/**
 * Raw Query Result Interface
 * Represents the result from the optimized farm context query
 */
interface FarmContextQueryResult {
  access_type: 'owner' | 'member';
  id: string;
  farm_name: string;
  farm_code: string | null;
  description: string | null;
  province: string | null;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
  member_role?: string | null;
}

/**
 * Get User Farm Context
 *
 * This is the main utility function that resolves a user's farm context.
 * It performs ownership check first, then membership check if needed.
 * 
 * Performance Optimization: Uses a single optimized SQL query with UNION
 * instead of sequential queries, reducing database round trips by 50%.
 *
 * @param userId - The user ID to check farm access for
 * @param options - Optional configuration for context resolution
 * @returns Promise<FarmContextResult> - User's farm context with access level
 * @throws FarmContextError - When user has no farm access or other errors occur
 *
 * @example
 * ```typescript
 * // Get user's farm context (ownership prioritized)
 * const context = await getUserFarmContext('user-uuid');
 * console.log(context.role); // 'OWNER' or 'MEMBER'
 * console.log(context.accessLevel); // 'full' or 'limited'
 *
 * // Check access for specific farm
 * const specificContext = await getUserFarmContext('user-uuid', {
 *   farmId: 'farm-uuid'
 * });
 *
 * // Include membership details
 * const detailedContext = await getUserFarmContext('user-uuid', {
 *   includeMembership: true
 * });
 * ```
 */
export async function getUserFarmContext(
  userId: string,
  options: FarmContextOptions = {}
): Promise<FarmContextResult> {
  const { farmId: targetFarmId, includeMembership = false } = options;

  try {
    // Validate input
    if (!userId || typeof userId !== 'string') {
      throw new FarmContextError('Invalid user ID provided', 'INVALID_USER');
    }

    // If a specific farm ID is provided, check access to that farm only
    if (targetFarmId) {
      return await getSpecificFarmContext(userId, targetFarmId);
    }

    // Optimized single query: Check both ownership and membership with UNION
    // Ownership results come first (access_type = 'owner'), membership second
    const results = await prisma.$queryRaw<FarmContextQueryResult[]>`
      SELECT 
        'owner' as access_type,
        id,
        farm_name,
        farm_code,
        NULL as description,
        province,
        owner_id,
        created_at,
        updated_at,
        NULL as member_role
      FROM farms 
      WHERE owner_id = ${userId}::uuid

      UNION ALL

      SELECT 
        'member' as access_type,
        f.id,
        f.farm_name,
        f.farm_code,
        NULL as description,
        f.province,
        f.owner_id,
        f.created_at,
        f.updated_at,
        fm.role as member_role
      FROM farms f
      JOIN farm_members fm ON f.id = fm.farm_id
      WHERE fm.user_id = ${userId}::uuid

      ORDER BY access_type DESC
      LIMIT 1
    `;

    // Check if any farm access found
    if (!results || results.length === 0) {
      throw new FarmContextError(
        'User has no access to any farm',
        'NO_ACCESS'
      );
    }

    // Process the first result (ownership takes priority due to ORDER BY)
    const result = results[0];
    
    // Transform raw query result to Farm object
    const farm: Farm = {
      id: result.id,
      name: result.farm_name,
      ownerId: result.owner_id,
      province: result.province,
      code: result.farm_code,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };

    // Determine role and access level based on access type
    if (result.access_type === 'owner') {
      return {
        farm,
        role: 'OWNER' as Role,
        accessLevel: 'full'
      };
    } else {
      // Member access - use the role from farm_members table
      const memberRole = (result.member_role?.toUpperCase() === 'OWNER' ? 'OWNER' : 'MEMBER') as Role;
      return {
        farm,
        role: memberRole,
        accessLevel: memberRole === 'OWNER' ? 'full' : 'limited'
      };
    }

  } catch (error) {
    if (error instanceof FarmContextError) {
      throw error;
    }

    // Handle database errors
    console.error('Database error in getUserFarmContext:', error);
    throw new FarmContextError(
      'Failed to resolve farm context due to database error',
      'DATABASE_ERROR'
    );
  }
}

/**
 * Get Specific Farm Context
 *
 * Checks user's access to a specific farm by ID
 *
 * @param userId - User ID to check access for
 * @param farmId - Farm ID to check access to
 * @returns Promise<FarmContextResult> - User's context for the specific farm
 * @throws FarmContextError - When no access to the specified farm
 */
async function getSpecificFarmContext(
  userId: string,
  farmId: string
): Promise<FarmContextResult> {
  // Check ownership first
  const ownedFarm = await prisma.farm.findFirst({
    where: {
      id: farmId,
      ownerId: userId
    }
  });

  if (ownedFarm) {
    return {
      farm: ownedFarm,
      role: 'OWNER' as Role,
      accessLevel: 'full'
    };
  }

  // Check membership
  const membership = await prisma.farmMember.findFirst({
    where: {
      farmId: farmId,
      userId: userId
    },
    include: {
      farm: true
    }
  });

  if (membership && membership.farm) {
    return {
      farm: membership.farm,
      role: membership.role,
      accessLevel: membership.role === 'OWNER' ? 'full' : 'limited'
    };
  }

  // No access to specified farm
  throw new FarmContextError(
    `User has no access to farm with ID: ${farmId}`,
    'NO_ACCESS'
  );
}

/**
 * Get All User Farm Contexts
 *
 * Returns all farms the user has access to (both owned and member of)
 * This is useful for users with multiple farm access.
 *
 * @param userId - User ID to get all farm contexts for
 * @returns Promise<FarmContextResult[]> - Array of all farm contexts
 * @throws FarmContextError - When user ID is invalid or database error occurs
 */
export async function getAllUserFarmContexts(
  userId: string
): Promise<FarmContextResult[]> {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string') {
      throw new FarmContextError('Invalid user ID provided', 'INVALID_USER');
    }

    // Get owned farms
    const ownedFarms = await prisma.farm.findMany({
      where: {
        ownerId: userId
      }
    });

    // Get farm memberships
    const memberships = await prisma.farmMember.findMany({
      where: {
        userId: userId
      },
      include: {
        farm: true
      }
    });

    // Combine and format results
    const contexts: FarmContextResult[] = [
      ...ownedFarms.map((farm: any) => ({
        farm,
        role: 'OWNER' as Role,
        accessLevel: 'full' as 'full' | 'limited'
      })),
      ...memberships
        .filter((membership: any) => membership.farm) // Ensure farm exists
        .map((membership: any) => ({
          farm: membership.farm!,
          role: membership.role,
          accessLevel: (membership.role === 'OWNER' ? 'full' : 'limited') as 'full' | 'limited'
        }))
    ];

    if (contexts.length === 0) {
      throw new FarmContextError(
        'User has no access to any farm',
        'NO_ACCESS'
      );
    }

    return contexts;

  } catch (error) {
    if (error instanceof FarmContextError) {
      throw error;
    }

    console.error('Database error in getAllUserFarmContexts:', error);
    throw new FarmContextError(
      'Failed to resolve farm contexts due to database error',
      'DATABASE_ERROR'
    );
  }
}

/**
 * Check User Farm Access
 *
 * Simple boolean check for whether a user has access to any farm
 * Useful for conditional rendering or route guards
 *
 * @param userId - User ID to check access for
 * @returns Promise<boolean> - True if user has farm access, false otherwise
 */
export async function checkUserFarmAccess(userId: string): Promise<boolean> {
  try {
    await getUserFarmContext(userId);
    return true;
  } catch (error) {
    if (error instanceof FarmContextError && error.code === 'NO_ACCESS') {
      return false;
    }
    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Farm Context Utilities Export
 *
 * This module provides comprehensive farm context resolution capabilities:
 * - getUserFarmContext() - Main utility for single farm context
 * - getAllUserFarmContexts() - For multi-farm users
 * - checkUserFarmAccess() - Simple boolean access check
 * - FarmContextError - Structured error handling
 *
 * Usage examples are provided in function documentation above.
 */