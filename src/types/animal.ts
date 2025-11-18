/**
 * Animal Type Definitions - Jaothui ID-Trace System
 * 
 * Central type definitions for Animal feature to avoid Prisma client dependencies
 * during build time. These types match the Prisma schema exactly.
 * 
 * @see prisma/schema.prisma - Animal model
 */

/**
 * Animal Type Enum
 * Matches Prisma AnimalType enum
 */
export type AnimalType = 'WATER_BUFFALO' | 'SWAMP_BUFFALO' | 'CATTLE' | 'GOAT' | 'PIG' | 'CHICKEN';

/**
 * Animal Gender Enum
 * Matches Prisma AnimalGender enum
 */
export type AnimalGender = 'MALE' | 'FEMALE' | 'UNKNOWN';

/**
 * Animal Status Enum
 * Matches Prisma AnimalStatus enum
 */
export type AnimalStatus = 'ACTIVE' | 'TRANSFERRED' | 'DECEASED' | 'SOLD';
