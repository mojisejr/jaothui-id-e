/**
 * Farm Type Definitions - Jaothui ID-Trace System
 * 
 * Central type definitions for Farm and related features
 * 
 * @see prisma/schema.prisma - Farm, FarmMember models
 */

/**
 * Role Enum
 * Matches Prisma Role enum
 */
export type Role = 'OWNER' | 'MEMBER';

/**
 * Farm interface matching Prisma schema
 */
export interface Farm {
  id: string;
  name: string;
  ownerId: string;
  province?: string | null;
  code?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * FarmMember interface matching Prisma schema
 */
export interface FarmMember {
  id: string;
  farmId: string;
  userId: string;
  role: Role;
  joinedAt: Date | string;
}
